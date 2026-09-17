import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { MockExamDetails } from "@/lib/mock-exam";

export async function GET(
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

  const details = JSON.parse(exam.details) as MockExamDetails;

  const [rueExercises, listeningExercises, completedAttempts, writingCount, speakingCount] = await Promise.all([
    prisma.exercise.findMany({
      where: { id: { in: details.rueExerciseIds } },
      select: { id: true, title: true, type: true },
    }),
    prisma.exercise.findMany({
      where: { id: { in: details.listeningExerciseIds } },
      select: { id: true, title: true, type: true },
    }),
    prisma.attempt.findMany({
      where: {
        userId: user.id,
        exerciseId: { in: [...details.rueExerciseIds, ...details.listeningExerciseIds] },
        completedAt: { gte: exam.startedAt },
      },
      select: { exerciseId: true, scorePercent: true },
    }),
    prisma.writing.count({ where: { userId: user.id, submittedAt: { gte: exam.startedAt } } }),
    prisma.speakingAttempt.count({ where: { userId: user.id, createdAt: { gte: exam.startedAt } } }),
  ]);

  const completedExerciseIds = new Set(completedAttempts.map((a) => a.exerciseId));

  return NextResponse.json({
    exam: { id: exam.id, startedAt: exam.startedAt, completedAt: exam.completedAt },
    rueExercises: rueExercises.map((e) => ({ ...e, done: completedExerciseIds.has(e.id) })),
    listeningExercises: listeningExercises.map((e) => ({ ...e, done: completedExerciseIds.has(e.id) })),
    writingDone: writingCount > 0,
    speakingDoneCount: speakingCount,
    speakingTotal: details.speakingPromptSlugs.length,
    writingPromptSlug: details.writingPromptSlug,
    speakingPromptSlugs: details.speakingPromptSlugs,
  });
}
