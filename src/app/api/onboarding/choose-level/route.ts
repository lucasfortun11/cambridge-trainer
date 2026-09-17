import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";

const bodySchema = z.object({
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});

// Alternative to the placement test: the user picks their own CEFR level
// instead of taking the 40-question test. Sets the same
// onboardingCompleted gate as the real test, but leaves
// hasCompletedPlacementTest false (and the per-skill breakdown empty) since
// no actual assessment happened.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { level } = parsed.data;

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      targetLevel: level,
      overallLevel: level,
      overallSublevel: "MID",
      onboardingCompleted: true,
      hasCompletedPlacementTest: false,
    },
    update: {
      targetLevel: level,
      overallLevel: level,
      overallSublevel: "MID",
      onboardingCompleted: true,
    },
  });

  // Give them a usable Study Plan from day one, same as the placement-test
  // path — just without weak-skill targeting, since there's no test data.
  try {
    const ai = getAIProvider();
    const plan = await ai.generateStudyPlan({
      dailyMinutes: 60,
      daysPerWeek: 5,
      currentLevel: level,
      targetLevel: level,
      weakSkills: [],
    });
    await prisma.studyPlan.create({
      data: {
        userId: user.id,
        targetLevel: level,
        dailyMinutes: 60,
        daysPerWeek: 5,
        weeks: JSON.stringify(plan.weeks),
        active: true,
      },
    });
  } catch {
    // Non-fatal — the user can still generate a plan later from Study Plan.
  }

  return NextResponse.json({ ok: true });
}
