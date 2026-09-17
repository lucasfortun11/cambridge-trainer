import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
  }

  const { message } = parsed.data;

  const history = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  await prisma.chatMessage.create({
    data: { userId: user.id, role: "USER", content: message },
  });

  const ai = getAIProvider();
  const result = await ai.chatWithTutor({
    history: history.map((h) => ({ role: h.role, content: h.content })),
    message,
    level: user.profile?.targetLevel ?? "C1",
  });

  const tutorMessage = await prisma.chatMessage.create({
    data: { userId: user.id, role: "TUTOR", content: result.reply },
  });

  // Suggested exercises are ephemeral (shown once, right after this reply) —
  // not persisted, so chat history stays plain text on reload.
  return NextResponse.json({ message: tutorMessage, suggestedExercises: result.suggestedExercises ?? [] });
}
