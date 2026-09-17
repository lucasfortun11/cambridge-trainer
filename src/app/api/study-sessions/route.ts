import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getSkillAccuracy, allocateSessionMinutes } from "@/lib/skills";

const bodySchema = z.object({
  minutes: z.number().int().min(5).max(240),
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

  const { minutes } = parsed.data;
  const skillAccuracy = await getSkillAccuracy(user.id);
  const tasks = allocateSessionMinutes(skillAccuracy, minutes);

  const session = await prisma.studySession.create({
    data: {
      userId: user.id,
      plannedMinutes: minutes,
      tasks: JSON.stringify(tasks),
    },
  });

  return NextResponse.json({ id: session.id, tasks });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  const session = id
    ? await prisma.studySession.findFirst({ where: { id, userId: user.id } })
    : await prisma.studySession.findFirst({
        where: { userId: user.id },
        orderBy: { date: "desc" },
      });

  if (!session) {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({
    session: { ...session, tasks: JSON.parse(session.tasks) },
  });
}
