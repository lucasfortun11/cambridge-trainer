import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const exams = await prisma.mockExam.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json({ exams });
}
