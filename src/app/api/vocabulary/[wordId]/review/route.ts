import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { applyReview } from "@/lib/spaced-repetition";
import { awardXpAndStreak, checkAndUnlockAchievements } from "@/lib/gamification";

const bodySchema = z.object({ quality: z.number().int().min(0).max(5) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ wordId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { wordId } = await params;

  const existing = await prisma.vocabularyReview.findUnique({
    where: { userId_wordId: { userId: user.id, wordId } },
  });

  const state = existing
    ? { easeFactor: existing.easeFactor, intervalDays: existing.intervalDays, repetitions: existing.repetitions }
    : { easeFactor: 2.5, intervalDays: 1, repetitions: 0 };

  const result = applyReview(state, parsed.data.quality);

  const review = await prisma.vocabularyReview.upsert({
    where: { userId_wordId: { userId: user.id, wordId } },
    create: {
      userId: user.id,
      wordId,
      easeFactor: result.easeFactor,
      intervalDays: result.intervalDays,
      repetitions: result.repetitions,
      nextReviewDate: result.nextReviewDate,
      lastReviewedAt: new Date(),
      status: result.status,
    },
    update: {
      easeFactor: result.easeFactor,
      intervalDays: result.intervalDays,
      repetitions: result.repetitions,
      nextReviewDate: result.nextReviewDate,
      lastReviewedAt: new Date(),
      status: result.status,
    },
  });

  await awardXpAndStreak(user.id, parsed.data.quality >= 3 ? 5 : 2);
  const newAchievements = await checkAndUnlockAchievements(user.id);

  return NextResponse.json({ review, newAchievements });
}
