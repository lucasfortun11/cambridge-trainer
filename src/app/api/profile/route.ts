import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CEFR_LEVELS } from "@/lib/cambridge-exams";

const bodySchema = z.object({
  targetExamDate: z.string().nullable().optional(),
  dailyMinutesAvailable: z.number().int().min(5).max(300).nullable().optional(),
  studyDaysPerWeek: z.number().int().min(1).max(7).nullable().optional(),
  targetLevel: z.enum(CEFR_LEVELS as [string, ...string[]]).optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { targetExamDate, dailyMinutesAvailable, studyDaysPerWeek, targetLevel } = parsed.data;

  // A score/readiness estimate computed on one exam's scale (e.g. C1's
  // 160-210) is meaningless on another (e.g. B1's 120-170) — clear it when
  // the target level actually changes so the dashboard recomputes it fresh
  // from raw accuracy the next time it loads, instead of showing a stale,
  // out-of-range number.
  let clearStaleScore = false;
  if (targetLevel) {
    const existing = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { targetLevel: true },
    });
    clearStaleScore = Boolean(existing) && existing!.targetLevel !== targetLevel;
  }

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      targetExamDate: targetExamDate ? new Date(targetExamDate) : undefined,
      dailyMinutesAvailable: dailyMinutesAvailable ?? undefined,
      studyDaysPerWeek: studyDaysPerWeek ?? undefined,
      targetLevel: (targetLevel as never) ?? undefined,
    },
    update: {
      targetExamDate:
        targetExamDate === undefined
          ? undefined
          : targetExamDate
            ? new Date(targetExamDate)
            : null,
      dailyMinutesAvailable: dailyMinutesAvailable ?? undefined,
      studyDaysPerWeek: studyDaysPerWeek ?? undefined,
      targetLevel: (targetLevel as never) ?? undefined,
      ...(clearStaleScore ? { estimatedCambridgeScore: null, examReadinessPercent: 0 } : {}),
    },
  });

  return NextResponse.json({ profile });
}
