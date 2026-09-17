import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { estimateGrade } from "@/lib/mock-exam";
import type { MockExamDetails } from "@/lib/mock-exam";
import { scoreOnExamScale } from "@/lib/cambridge-exams";
import type { CEFRLevel } from "@/generated/prisma/client";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const exam = await prisma.mockExam.findFirst({ where: { id, userId: user.id } });
  if (!exam || !exam.details) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const level: CEFRLevel = user.profile?.targetLevel ?? "C1";
  const toScale = (pct: number | null) => (pct === null ? null : scoreOnExamScale(level, pct));

  const details = JSON.parse(exam.details) as MockExamDetails;
  const now = new Date();

  const [rueAttempts, listeningAttempts, writings, speakingAttempts] = await Promise.all([
    prisma.attempt.findMany({
      where: { userId: user.id, exerciseId: { in: details.rueExerciseIds }, completedAt: { gte: exam.startedAt } },
      select: { scorePercent: true },
    }),
    prisma.attempt.findMany({
      where: { userId: user.id, exerciseId: { in: details.listeningExerciseIds }, completedAt: { gte: exam.startedAt } },
      select: { scorePercent: true },
    }),
    prisma.writing.findMany({
      where: { userId: user.id, submittedAt: { gte: exam.startedAt } },
      select: { overallScore: true },
    }),
    prisma.speakingAttempt.findMany({
      where: { userId: user.id, createdAt: { gte: exam.startedAt } },
      select: { overallScore: true },
    }),
  ]);

  const avg = (nums: number[]) => (nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null);

  const ruePct = avg(rueAttempts.map((a) => a.scorePercent ?? 0));
  const listeningPct = avg(listeningAttempts.map((a) => a.scorePercent ?? 0));
  const writingPct = avg(writings.map((w) => ((w.overallScore ?? 0) / 5) * 100));
  const speakingPct = avg(speakingAttempts.map((s) => ((s.overallScore ?? 0) / 5) * 100));

  const sectionPcts = [ruePct, listeningPct, writingPct, speakingPct].filter(
    (p): p is number => p !== null
  );
  const overallPct = sectionPcts.length > 0 ? sectionPcts.reduce((a, b) => a + b, 0) / sectionPcts.length : 0;
  const overallScore = toScale(overallPct) ?? toScale(0)!;

  const updated = await prisma.mockExam.update({
    where: { id },
    data: {
      completedAt: now,
      readingUseOfEnglishScore: toScale(ruePct),
      listeningScore: toScale(listeningPct),
      writingScore: toScale(writingPct),
      speakingScore: toScale(speakingPct),
      overallScore,
      estimatedGrade: estimateGrade(level, overallScore),
    },
  });

  return NextResponse.json({ exam: updated });
}
