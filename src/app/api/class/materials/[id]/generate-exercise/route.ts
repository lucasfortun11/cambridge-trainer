import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { generateClassExercise } from "@/lib/class-exercises";
import { AiRateLimitError, recordAiUsageOrThrow } from "@/lib/ai/rateLimit";

const bodySchema = z.object({
  focusInstructions: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    await recordAiUsageOrThrow(user.id, "class-exercise");
  } catch (err) {
    if (err instanceof AiRateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  const { id } = await params;

  try {
    const exercise = await generateClassExercise(user.id, id, parsed.data.focusInstructions);
    return NextResponse.json({ id: exercise.id });
  } catch {
    return NextResponse.json({ error: "No se pudo generar el ejercicio" }, { status: 500 });
  }
}
