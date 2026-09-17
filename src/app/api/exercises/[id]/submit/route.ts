import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { completeExerciseAttempt } from "@/lib/exercise-completion";

const bodySchema = z.object({
  answers: z.array(z.object({ questionId: z.string(), userAnswer: z.string() })),
  timeSpentSeconds: z.number().int().min(0).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const result = await completeExerciseAttempt(
      user.id,
      id,
      parsed.data.answers,
      parsed.data.timeSpentSeconds
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "No se pudo corregir el ejercicio" }, { status: 500 });
  }
}
