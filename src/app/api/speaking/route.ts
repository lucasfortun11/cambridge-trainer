import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { awardXpAndStreak, checkAndUnlockAchievements } from "@/lib/gamification";

const bodySchema = z.object({
  part: z.enum(["INTERVIEW", "LONG_TURN", "COLLABORATIVE_TASK", "DISCUSSION"]),
  prompt: z.string().min(1),
  transcript: z.string().min(5, "La transcripción es demasiado corta"),
  durationSeconds: z.number().int().min(0).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const attempts = await prisma.speakingAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, part: true, prompt: true, overallScore: true, createdAt: true },
  });

  return NextResponse.json({ attempts });
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

  const { part, prompt, transcript, durationSeconds } = parsed.data;

  const ai = getAIProvider();
  const feedback = await ai.evaluateSpeaking({
    part,
    prompt,
    transcript,
    durationSeconds,
    level: user.profile?.targetLevel ?? "C1",
  });

  const attempt = await prisma.speakingAttempt.create({
    data: {
      userId: user.id,
      part,
      prompt,
      transcript,
      audioRetained: false, // recordings are never uploaded — see README privacy notes
      durationSeconds,
      scoreFluency: feedback.scoreFluency,
      scoreGrammar: feedback.scoreGrammar,
      scoreVocabulary: feedback.scoreVocabulary,
      scoreCoherence: feedback.scoreCoherence,
      scorePronunciation: feedback.scorePronunciation,
      overallScore: feedback.overallScore,
      estimatedLevel: feedback.estimatedLevel,
      estimatedSublevel: feedback.estimatedSublevel,
      repeatedWords: JSON.stringify(feedback.repeatedWords),
      feedback: JSON.stringify(feedback),
    },
  });

  await prisma.progress.create({
    data: {
      userId: user.id,
      skill: "SPEAKING",
      accuracyPercent: Math.round((feedback.overallScore / 5) * 100),
      exercisesCompleted: 1,
      minutesStudied: durationSeconds ? Math.max(1, Math.round(durationSeconds / 60)) : 3,
    },
  });

  await awardXpAndStreak(user.id, 40);
  const newAchievements = await checkAndUnlockAchievements(user.id);

  return NextResponse.json({ id: attempt.id, feedback, newAchievements });
}
