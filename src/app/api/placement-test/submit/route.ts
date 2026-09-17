import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { scorePlacementTest, formatLevel } from "@/lib/placement";
import { getAIProvider } from "@/lib/ai";
import type { ErrorCategory, ErrorSource, Skill } from "@/generated/prisma/client";

const bodySchema = z.object({
  answers: z.array(z.object({ questionId: z.string(), selected: z.string() })),
});

const SKILL_PROFILE_FIELD: Record<Skill, { level: string; sublevel: string }> = {
  READING: { level: "readingLevel", sublevel: "readingSublevel" },
  USE_OF_ENGLISH: { level: "useOfEnglishLevel", sublevel: "useOfEnglishSublevel" },
  WRITING: { level: "writingLevel", sublevel: "writingSublevel" },
  LISTENING: { level: "listeningLevel", sublevel: "listeningSublevel" },
  SPEAKING: { level: "speakingLevel", sublevel: "speakingSublevel" },
  GRAMMAR: { level: "grammarLevel", sublevel: "grammarSublevel" },
  VOCABULARY: { level: "vocabularyLevel", sublevel: "vocabularySublevel" },
};

const SKILL_ERROR_SOURCE: Record<Skill, ErrorSource> = {
  READING: "READING_USE_OF_ENGLISH",
  USE_OF_ENGLISH: "READING_USE_OF_ENGLISH",
  WRITING: "WRITING",
  LISTENING: "LISTENING",
  SPEAKING: "SPEAKING",
  GRAMMAR: "GRAMMAR_DRILL",
  VOCABULARY: "VOCABULARY_DRILL",
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const result = scorePlacementTest(parsed.data.answers);

  // Update the profile with a detailed per-skill breakdown, not just one label.
  const profileUpdate: Record<string, unknown> = {
    overallLevel: result.overallLevel,
    overallSublevel: result.overallSublevel,
    estimatedCambridgeScore: result.estimatedCambridgeScore,
    examReadinessPercent: result.overallPercent,
    hasCompletedPlacementTest: true,
    onboardingCompleted: true,
    lastStudyDate: new Date(),
    currentStreak: 1,
    longestStreak: 1,
  };
  for (const s of result.bySkill) {
    const fields = SKILL_PROFILE_FIELD[s.skill];
    profileUpdate[fields.level] = s.level;
    profileUpdate[fields.sublevel] = s.sublevel;
  }

  // `increment` is only valid against an existing row, so create/update need
  // separate xp values — a brand-new profile just starts at the flat bonus.
  // targetLevel also only gets a sensible default on first creation — a
  // retake shouldn't silently override a target level the user chose later.
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, xp: 50, targetLevel: result.overallLevel, ...profileUpdate },
    update: { xp: { increment: 50 }, ...profileUpdate },
  });

  // Seed initial Progress rows so dashboard charts have a starting point.
  await prisma.progress.createMany({
    data: result.bySkill.map((s) => ({
      userId: user.id,
      skill: s.skill,
      accuracyPercent: s.percent,
      exercisesCompleted: s.total,
      minutesStudied: 20,
    })),
  });

  // Log every wrong answer so "Mis errores" has data from day one.
  if (result.wrongAnswers.length > 0) {
    await prisma.errorLog.createMany({
      data: result.wrongAnswers.map((w) => ({
        userId: user.id,
        source: SKILL_ERROR_SOURCE[w.skill],
        category: (w.category as ErrorCategory) ?? "OTHER",
        questionText: w.prompt,
        correctAnswer: w.correctAnswer,
        userAnswer: w.userAnswer,
        explanation: `Respuesta correcta: ${w.correctAnswer}`,
      })),
    });
  }

  // Generate an initial study plan targeting the weakest skills. The user's
  // detected level also becomes their default target exam (set above), so
  // reuse it here for consistency.
  const ai = getAIProvider();
  const plan = await ai.generateStudyPlan({
    dailyMinutes: 60,
    daysPerWeek: 5,
    currentLevel: result.overallLevel,
    targetLevel: result.overallLevel,
    weakSkills: result.weakestSkills,
  });

  await prisma.studyPlan.create({
    data: {
      userId: user.id,
      targetLevel: result.overallLevel,
      dailyMinutes: 60,
      daysPerWeek: 5,
      weeks: JSON.stringify(plan.weeks),
      active: true,
    },
  });

  return NextResponse.json({
    ...result,
    summary: result.bySkill.map((s) => ({
      skill: s.skill,
      label: formatLevel(s.level, s.sublevel),
      percent: s.percent,
    })),
  });
}
