import { prisma } from "@/lib/prisma";

export const XP_PER_CORRECT_ANSWER = 10;
export const XP_COMPLETION_BONUS = 20;

export function levelFromXp(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function isYesterday(date: Date, reference: Date): boolean {
  const yesterday = new Date(reference);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

/** Awards XP and updates the daily streak. Call once per completed activity (exercise, writing, speaking, session). */
export async function awardXpAndStreak(userId: string, xpEarned: number) {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const now = new Date();

  let currentStreak = profile?.currentStreak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;

  if (!profile?.lastStudyDate) {
    currentStreak = 1;
  } else if (isSameDay(profile.lastStudyDate, now)) {
    // already studied today — streak unchanged
  } else if (isYesterday(profile.lastStudyDate, now)) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  const newXp = (profile?.xp ?? 0) + xpEarned;

  await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      xp: newXp,
      level: levelFromXp(newXp),
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastStudyDate: now,
    },
    update: {
      xp: newXp,
      level: levelFromXp(newXp),
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastStudyDate: now,
    },
  });
}

type AchievementCheck = {
  code: string;
  isUnlocked: (userId: string) => Promise<boolean>;
};

const ACHIEVEMENT_CHECKS: AchievementCheck[] = [
  {
    code: "STREAK_7",
    isUnlocked: async (userId) => {
      const profile = await prisma.userProfile.findUnique({ where: { userId } });
      return (profile?.currentStreak ?? 0) >= 7;
    },
  },
  {
    code: "VOCAB_100",
    isUnlocked: async (userId) => {
      const count = await prisma.vocabularyReview.count({ where: { userId } });
      return count >= 100;
    },
  },
  {
    code: "UOE_50",
    isUnlocked: async (userId) => {
      const count = await prisma.attempt.count({
        where: { userId, exercise: { skill: "USE_OF_ENGLISH" }, completedAt: { not: null } },
      });
      return count >= 50;
    },
  },
  {
    code: "FIRST_MOCK",
    isUnlocked: async (userId) => {
      const count = await prisma.mockExam.count({ where: { userId, completedAt: { not: null } } });
      return count >= 1;
    },
  },
  {
    code: "GRAMMAR_MASTER",
    isUnlocked: async (userId) => {
      const recent = await prisma.progress.findMany({
        where: { userId, skill: "GRAMMAR" },
        orderBy: { date: "desc" },
        take: 5,
      });
      if (recent.length < 5) return false;
      return recent.every((r) => r.accuracyPercent >= 90);
    },
  },
];

/** Checks all achievement conditions and unlocks any newly-earned ones. Returns newly unlocked achievement codes. */
export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const alreadyUnlocked = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievement: { select: { code: true } } },
  });
  const unlockedCodes = new Set(alreadyUnlocked.map((a) => a.achievement.code));

  const newlyUnlocked: string[] = [];

  for (const check of ACHIEVEMENT_CHECKS) {
    if (unlockedCodes.has(check.code)) continue;
    if (await check.isUnlocked(userId)) {
      const achievement = await prisma.achievement.findUnique({ where: { code: check.code } });
      if (achievement) {
        await prisma.userAchievement.create({
          data: { userId, achievementId: achievement.id },
        });
        newlyUnlocked.push(check.code);
      }
    }
  }

  return newlyUnlocked;
}
