import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import type { ErrorCategory } from "@prisma/client";
import { SKILL_LABELS, ERROR_CATEGORY_LABELS } from "@/lib/dashboard-labels";
import { getSkillAccuracy, allocateSessionMinutes } from "@/lib/skills";
import { scoreOnExamScale, examInfo } from "@/lib/cambridge-exams";

export { SKILL_LABELS, ERROR_CATEGORY_LABELS };

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as first day
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function weekLabel(d: Date): string {
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
}

const DAILY_GOAL_TARGET = 5;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardData(userId: string) {
  const todayStart = startOfToday();

  const [
    profile,
    progressEntries,
    errors,
    studySessions,
    mockExams,
    exercisesCompleted,
    skillAccuracy,
    exercisesToday,
    writingsToday,
    speakingToday,
    reviewsToday,
  ] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.progress.findMany({ where: { userId }, orderBy: { date: "asc" } }),
    prisma.errorLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 60,
    }),
    prisma.mockExam.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { startedAt: "asc" },
    }),
    prisma.attempt.count({ where: { userId, completedAt: { not: null } } }),
    getSkillAccuracy(userId),
    prisma.attempt.count({ where: { userId, completedAt: { gte: todayStart } } }),
    prisma.writing.count({ where: { userId, submittedAt: { gte: todayStart } } }),
    prisma.speakingAttempt.count({ where: { userId, createdAt: { gte: todayStart } } }),
    prisma.vocabularyReview.count({ where: { userId, lastReviewedAt: { gte: todayStart } } }),
  ]);

  const dailyGoal = {
    completed: Math.min(
      DAILY_GOAL_TARGET,
      exercisesToday + writingsToday + speakingToday + reviewsToday
    ),
    target: DAILY_GOAL_TARGET,
  };

  const skillsWithData = skillAccuracy.filter((s) => s.hasData);
  const overallAccuracy = skillsWithData.length
    ? Math.round(
        skillsWithData.reduce((sum, s) => sum + s.accuracy, 0) / skillsWithData.length
      )
    : 0;

  // --- weekly evolution (avg accuracy per ISO week, last 8 weeks with data) ---
  const byWeek = new Map<string, { label: string; total: number; count: number }>();
  for (const p of progressEntries) {
    const wStart = startOfWeek(p.date);
    const key = wStart.toISOString();
    const entry = byWeek.get(key) ?? { label: weekLabel(wStart), total: 0, count: 0 };
    entry.total += p.accuracyPercent;
    entry.count += 1;
    byWeek.set(key, entry);
  }
  const weeklyEvolution = Array.from(byWeek.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([, v]) => ({ week: v.label, accuracy: Math.round(v.total / v.count) }));

  // --- error categories (frequency) ---
  const errorCounts = new Map<ErrorCategory, number>();
  for (const e of errors) {
    errorCounts.set(e.category, (errorCounts.get(e.category) ?? 0) + 1);
  }
  const topErrorCategories = Array.from(errorCounts.entries())
    .map(([category, count]) => ({
      category,
      label: ERROR_CATEGORY_LABELS[category],
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // --- study time & streak ---
  const minutesStudied = studySessions.reduce(
    (sum, s) => sum + (s.actualMinutes ?? 0),
    0
  );

  // --- mock exam evolution ---
  const mockExamEvolution = mockExams.map((m, i) => ({
    label: `Mock ${i + 1}`,
    score: m.overallScore ?? 0,
    date: m.startedAt,
  }));

  // --- weak / strong points ---
  const weakPoints = [...skillsWithData]
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .filter((s) => s.accuracy < 80);
  const strongPoints = [...skillsWithData]
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3)
    .filter((s) => s.accuracy >= 80);

  // --- AI-assisted error analysis + recommendation ---
  const ai = getAIProvider();
  const analysis = await ai.analyzeErrors({
    errors: errors.map((e) => ({ category: e.category, createdAt: e.createdAt })),
  });

  // --- today's recommended session (simple weakest-skills time allocation) ---
  const dailyMinutes = profile?.dailyMinutesAvailable ?? 60;
  const todaysSession = allocateSessionMinutes(skillAccuracy, dailyMinutes);

  const targetLevel = profile?.targetLevel ?? "C1";
  const estimatedCambridgeScore =
    profile?.estimatedCambridgeScore ??
    (overallAccuracy > 0 ? scoreOnExamScale(targetLevel, overallAccuracy) : null);

  const examReadinessPercent =
    profile?.examReadinessPercent && profile.examReadinessPercent > 0
      ? profile.examReadinessPercent
      : overallAccuracy;

  return {
    profile,
    targetLevel,
    exam: examInfo(targetLevel),
    overallAccuracy,
    skillAccuracy,
    weeklyEvolution,
    topErrorCategories,
    minutesStudied,
    exercisesCompleted,
    currentStreak: profile?.currentStreak ?? 0,
    longestStreak: profile?.longestStreak ?? 0,
    mockExamEvolution,
    weakPoints,
    strongPoints,
    recommendation: analysis.recommendation,
    weakestCategories: analysis.weakestCategories.map((c) => ERROR_CATEGORY_LABELS[c]),
    todaysSession,
    dailyMinutes,
    estimatedCambridgeScore,
    examReadinessPercent,
    hasAnyData: progressEntries.length > 0,
    dailyGoal,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
