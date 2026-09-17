import { prisma } from "@/lib/prisma";
import type { Skill, ExamPart, CEFRLevel } from "@prisma/client";
import type { PlayerExercise } from "@/lib/exercises-shared";

export async function getExerciseForPlayer(id: string): Promise<PlayerExercise | null> {
  const exercise = await prisma.exercise.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!exercise) return null;

  return {
    id: exercise.id,
    slug: exercise.slug,
    title: exercise.title,
    type: exercise.type,
    skill: exercise.skill,
    level: exercise.level,
    topic: exercise.topic,
    instructions: exercise.instructions,
    content: JSON.parse(exercise.content) as Record<string, unknown>,
    audioUrl: exercise.audioUrl,
    questions: exercise.questions.map((q) => ({
      id: q.id,
      order: q.order,
      questionType: q.questionType,
      prompt: q.prompt,
      options: q.options ? (JSON.parse(q.options) as string[]) : null,
    })),
  };
}

export async function listExercisesForUser(
  userId: string,
  filter: { skill?: Skill; type?: ExamPart; topic?: string; level?: CEFRLevel } = {}
) {
  const exercises = await prisma.exercise.findMany({
    where: filter,
    select: {
      id: true,
      title: true,
      type: true,
      skill: true,
      level: true,
      topic: true,
      _count: { select: { questions: true } },
      attempts: {
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 1,
        select: { scorePercent: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return exercises.map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    skill: e.skill,
    level: e.level,
    topic: e.topic,
    questionCount: e._count.questions,
    lastScore: e.attempts[0]?.scorePercent ?? null,
  }));
}
