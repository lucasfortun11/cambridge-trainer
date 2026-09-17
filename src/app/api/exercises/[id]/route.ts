import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getExerciseForPlayer } from "@/lib/exercises";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const exercise = await getExerciseForPlayer(id);
  if (!exercise) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ exercise });
}
