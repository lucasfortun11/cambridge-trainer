import { prisma } from "@/lib/prisma";
import { isAnswerCorrect } from "@/lib/grading";
import { awardXpAndStreak, checkAndUnlockAchievements, XP_PER_CORRECT_ANSWER, XP_COMPLETION_BONUS } from "@/lib/gamification";
import type { ErrorSource, Skill } from "@prisma/client";

const SKILL_ERROR_SOURCE: Partial<Record<Skill, ErrorSource>> = {
  READING: "READING_USE_OF_ENGLISH",
  USE_OF_ENGLISH: "READING_USE_OF_ENGLISH",
  LISTENING: "LISTENING",
  GRAMMAR: "GRAMMAR_DRILL",
  VOCABULARY: "VOCABULARY_DRILL",
};

export type SubmittedAnswer = { questionId: string; userAnswer: string };

export type GradedQuestion = {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  distractorExplanations: Record<string, string> | null;
};

export async function completeExerciseAttempt(
  userId: string,
  exerciseId: string,
  submitted: SubmittedAnswer[],
  timeSpentSeconds?: number
) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!exercise) {
    throw new Error("Exercise not found");
  }

  const submittedMap = new Map(submitted.map((s) => [s.questionId, s.userAnswer]));

  const graded: GradedQuestion[] = exercise.questions.map((q) => {
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

  const attempt = await prisma.attempt.create({
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

  const errorSource = SKILL_ERROR_SOURCE[exercise.skill];
  if (errorSource) {
    const wrongOnes = exercise.questions.filter((q) => {
      const g = graded.find((x) => x.questionId === q.id);
      return g && !g.isCorrect;
    });
    if (wrongOnes.length > 0) {
      await prisma.errorLog.createMany({
        data: wrongOnes.map((q) => {
          const g = graded.find((x) => x.questionId === q.id)!;
          return {
            userId,
            questionId: q.id,
            source: errorSource,
            category: q.grammarCategory ?? "OTHER",
            questionText: q.prompt,
            correctAnswer: q.correctAnswer,
            userAnswer: g.userAnswer || "(sin respuesta)",
            explanation: q.explanation,
          };
        }),
      });
    }
  }

  await prisma.progress.create({
    data: {
      userId,
      skill: exercise.skill,
      accuracyPercent: scorePercent,
      exercisesCompleted: 1,
      minutesStudied: timeSpentSeconds ? Math.max(1, Math.round(timeSpentSeconds / 60)) : 5,
    },
  });

  const xpEarned = correctCount * XP_PER_CORRECT_ANSWER + XP_COMPLETION_BONUS;
  await awardXpAndStreak(userId, xpEarned);
  const newAchievements = await checkAndUnlockAchievements(userId);

  return { attemptId: attempt.id, graded, correctCount, totalQuestions, scorePercent, xpEarned, newAchievements };
}
