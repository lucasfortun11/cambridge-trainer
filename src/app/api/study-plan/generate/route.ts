import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { getSkillAccuracy } from "@/lib/skills";

const bodySchema = z.object({
  examDate: z.string().nullable().optional(),
  dailyMinutes: z.number().int().min(5).max(300),
  daysPerWeek: z.number().int().min(1).max(7),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { examDate, dailyMinutes, daysPerWeek } = parsed.data;

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  const targetLevel = profile?.targetLevel ?? "C1";
  const skillAccuracy = await getSkillAccuracy(user.id);
  const weakSkills = [...skillAccuracy].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3).map((s) => s.skill);

  const ai = getAIProvider();
  const plan = await ai.generateStudyPlan({
    examDate: examDate ? new Date(examDate) : undefined,
    dailyMinutes,
    daysPerWeek,
    currentLevel: profile?.overallLevel ?? "B2",
    targetLevel,
    weakSkills,
  });

  await prisma.studyPlan.updateMany({ where: { userId: user.id, active: true }, data: { active: false } });

  const created = await prisma.studyPlan.create({
    data: {
      userId: user.id,
      examDate: examDate ? new Date(examDate) : null,
      targetLevel,
      dailyMinutes,
      daysPerWeek,
      weeks: JSON.stringify(plan.weeks),
      active: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, dailyMinutesAvailable: dailyMinutes, studyDaysPerWeek: daysPerWeek },
    update: { dailyMinutesAvailable: dailyMinutes, studyDaysPerWeek: daysPerWeek },
  });

  return NextResponse.json({ id: created.id, weeks: plan.weeks });
}
