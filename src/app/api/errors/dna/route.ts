import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { AiRateLimitError, recordAiUsageOrThrow } from "@/lib/ai/rateLimit";
import type { ErrorDnaSample, ErrorSummary } from "@/lib/ai";

const SAMPLES_PER_CATEGORY = 2;
const TOP_CATEGORIES_FOR_SAMPLES = 3;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const [latest, errorCount] = await Promise.all([
    prisma.errorDnaReport.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.errorLog.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({
    report: latest
      ? {
          headline: latest.headline,
          narrative: latest.narrative,
          focusAreas: JSON.parse(latest.focusAreas) as string[],
          createdAt: latest.createdAt,
          errorCountAtGeneration: latest.errorCountAtGeneration,
        }
      : null,
    currentErrorCount: errorCount,
  });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const errors = await prisma.errorLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  if (errors.length === 0) {
    return NextResponse.json(
      { error: "Todavía no tienes errores registrados para analizar." },
      { status: 400 }
    );
  }

  try {
    await recordAiUsageOrThrow(user.id, "error-dna");
  } catch (err) {
    if (err instanceof AiRateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  const byCategory = new Map<string, { total: number; last7: number; prev7: number }>();
  const now = Date.now();
  for (const e of errors) {
    const entry = byCategory.get(e.category) ?? { total: 0, last7: 0, prev7: 0 };
    entry.total += 1;
    const ageDays = (now - e.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 7) entry.last7 += 1;
    else if (ageDays <= 14) entry.prev7 += 1;
    byCategory.set(e.category, entry);
  }

  const errorSummary: ErrorSummary[] = Array.from(byCategory.entries())
    .map(([category, stats]) => ({
      category: category as ErrorSummary["category"],
      count: stats.total,
      lastSevenDays: stats.last7,
      trend: (stats.last7 > stats.prev7 ? "up" : stats.last7 < stats.prev7 ? "down" : "flat") as ErrorSummary["trend"],
    }))
    .sort((a, b) => b.count - a.count);

  const topCategories = new Set(errorSummary.slice(0, TOP_CATEGORIES_FOR_SAMPLES).map((s) => s.category));
  const samples: ErrorDnaSample[] = [];
  for (const category of topCategories) {
    const examples = errors.filter((e) => e.category === category).slice(0, SAMPLES_PER_CATEGORY);
    for (const e of examples) {
      samples.push({
        category: e.category,
        questionText: e.questionText ?? undefined,
        userAnswer: e.userAnswer ?? undefined,
        correctAnswer: e.correctAnswer ?? undefined,
      });
    }
  }

  const level = user.profile?.targetLevel ?? "C1";
  const ai = getAIProvider();
  const result = await ai.generateErrorDnaReport({ errorSummary, samples, level });

  const report = await prisma.errorDnaReport.create({
    data: {
      userId: user.id,
      headline: result.headline,
      narrative: result.narrative,
      focusAreas: JSON.stringify(result.focusAreas),
      errorCountAtGeneration: errors.length,
    },
  });

  return NextResponse.json({
    report: {
      headline: report.headline,
      narrative: report.narrative,
      focusAreas: result.focusAreas,
      createdAt: report.createdAt,
      errorCountAtGeneration: report.errorCountAtGeneration,
    },
    currentErrorCount: errors.length,
  });
}
