// Mirrors src/lib/exercise-completion.ts's grading logic, but for "Mi Clase"
// exercises. Deliberately does NOT write to ErrorLog, Progress, XP or streaks
// — this section stays fully independent from Cambridge/gamification.

import { prisma } from "@/lib/prisma";
import { isAnswerCorrect } from "@/lib/grading";

export type SubmittedAnswer = { questionId: string; userAnswer: string };

export type GradedClassQuestion = {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  distractorExplanations: Record<string, string> | null;
};

export async function completeClassExerciseAttempt(
  userId: string,
  exerciseId: string,
  submitted: SubmittedAnswer[],
  timeSpentSeconds?: number
) {
  const exercise = await prisma.classExercise.findFirst({
    where: { id: exerciseId, userId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!exercise) {
    throw new Error("Exercise not found");
  }

  const submittedMap = new Map(submitted.map((s) => [s.questionId, s.userAnswer]));

  const graded: GradedClassQuestion[] = exercise.questions.map((q) => {
    const userAnswer = submittedMap.get(q.id) ?? "";
    const correct = isAnswerCorrect(userAnswer, q.correctAnswer);
    return {
      questionId: q.id,
      isCorrect: correct,
      userAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      distractorExplanations: q.distractorExplanations
        ? (JSON.parse(q.distractorExplanations) as Record<string, string>)
        : null,
    };
  });

  const correctCount = graded.filter((g) => g.isCorrect).length;
  const totalQuestions = exercise.questions.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const attempt = await prisma.classAttempt.create({
    data: {
      userId,
      exerciseId,
      completedAt: new Date(),
      totalQuestions,
      correctCount,
      scorePercent,
      timeSpentSeconds,
      answers: {
        create: graded.map((g) => ({
          questionId: g.questionId,
          userAnswer: g.userAnswer,
          isCorrect: g.isCorrect,
        })),
      },
    },
  });

  return { attemptId: attempt.id, graded, correctCount, totalQuestions, scorePercent };
}
