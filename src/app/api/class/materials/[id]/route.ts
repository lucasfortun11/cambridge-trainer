import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteClassMaterial } from "@/lib/class-exercises";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  await deleteClassMaterial(user.id, id);
  return NextResponse.json({ ok: true });
}
