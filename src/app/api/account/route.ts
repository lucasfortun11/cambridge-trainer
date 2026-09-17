import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, clearSessionCookie } from "@/lib/auth";

// Deletes the user and everything that references them (attempts, errors,
// vocabulary reviews, writings, speaking attempts, sessions, mock exams,
// progress, plans, chat history) via cascading foreign keys — see schema.prisma.
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: user.id } });
  await clearSessionCookie();

  return NextResponse.json({ ok: true });
}
