import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { awardXpAndStreak, checkAndUnlockAchievements } from "@/lib/gamification";

const bodySchema = z.object({
  type: z.enum(["ESSAY", "PROPOSAL", "REPORT", "REVIEW", "EMAIL_LETTER"]),
  prompt: z.string().min(1),
  text: z.string().min(20, "El texto es demasiado corto"),
  minWords: z.number().int().min(1).optional(),
  maxWords: z.number().int().min(1).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const writings = await prisma.writing.findMany({
    where: { userId: user.id },
    orderBy: { submittedAt: "desc" },
    select: { id: true, type: true, prompt: true, wordCount: true, overallScore: true, submittedAt: true },
  });

  return NextResponse.json({ writings });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const { type, prompt, text, minWords, maxWords } = parsed.data;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const ai = getAIProvider();
  const feedback = await ai.evaluateWriting({
    type,
    prompt,
    text,
    level: user.profile?.targetLevel ?? "C1",
    minWords,
    maxWords,
  });

  const writing = await prisma.writing.create({
    data: {
      userId: user.id,
      type,
      prompt,
      userText: text,
      wordCount,
      scoreContent: feedback.scoreContent,
      scoreCommunicativeAchievement: feedback.scoreCommunicativeAchievement,
      scoreOrganisation: feedback.scoreOrganisation,
      scoreLanguage: feedback.scoreLanguage,
      overallScore: feedback.overallScore,
      estimatedLevel: feedback.estimatedLevel,
      estimatedSublevel: feedback.estimatedSublevel,
      feedback: JSON.stringify(feedback),
      improvedVersion: feedback.improvedVersion,
    },
  });

  await prisma.progress.create({
    data: {
      userId: user.id,
      skill: "WRITING",
      accuracyPercent: Math.round((feedback.overallScore / 5) * 100),
      exercisesCompleted: 1,
      minutesStudied: Math.max(5, Math.round(wordCount / 30)),
    },
  });

  await awardXpAndStreak(user.id, 40);
  const newAchievements = await checkAndUnlockAchievements(user.id);

  return NextResponse.json({ id: writing.id, feedback, newAchievements });
}
