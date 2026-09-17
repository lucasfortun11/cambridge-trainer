import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { ExamPart, Skill } from "@prisma/client";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const skill = req.nextUrl.searchParams.get("skill") as Skill | null;
  const type = req.nextUrl.searchParams.get("type") as ExamPart | null;
  const topic = req.nextUrl.searchParams.get("topic");

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(skill ? { skill } : {}),
      ...(type ? { type } : {}),
      ...(topic ? { topic } : {}),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      skill: true,
      level: true,
      topic: true,
      _count: { select: { questions: true } },
      attempts: {
        where: { userId: user.id, completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 1,
        select: { scorePercent: true, completedAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    exercises: exercises.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      type: e.type,
      skill: e.skill,
      level: e.level,
      topic: e.topic,
      questionCount: e._count.questions,
      lastAttempt: e.attempts[0] ?? null,
    })),
  });
}
