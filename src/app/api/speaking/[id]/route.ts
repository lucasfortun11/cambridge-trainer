import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id } = await params;
  const attempt = await prisma.speakingAttempt.findFirst({ where: { id, userId: user.id } });
  if (!attempt) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({
    attempt: { ...attempt, feedback: attempt.feedback ? JSON.parse(attempt.feedback) : null },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id } = await params;
  const attempt = await prisma.speakingAttempt.findFirst({ where: { id, userId: user.id } });
  if (!attempt) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.speakingAttempt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
