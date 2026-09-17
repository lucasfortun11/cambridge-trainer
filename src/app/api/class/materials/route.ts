import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { extractTextFromFile, extractTextFromPaste } from "@/lib/class-materials";
import { listClassMaterials } from "@/lib/class-exercises";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const materials = await listClassMaterials(user.id);
  return NextResponse.json({ materials });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const title = String(form.get("title") ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  const file = form.get("file");
  const pastedText = String(form.get("text") ?? "").trim();

  try {
    let extracted: { text: string; truncated: boolean; fileType: string };
    if (file instanceof File && file.size > 0) {
      extracted = await extractTextFromFile(file);
    } else if (pastedText) {
      const { text, truncated } = extractTextFromPaste(pastedText);
      extracted = { text, truncated, fileType: "text" };
    } else {
      return NextResponse.json({ error: "Sube un archivo o pega el texto del material" }, { status: 400 });
    }

    if (!extracted.text) {
      return NextResponse.json({ error: "No se encontró texto en el material" }, { status: 400 });
    }

    const material = await prisma.classMaterial.create({
      data: {
        userId: user.id,
        title,
        fileName: file instanceof File && file.size > 0 ? file.name : null,
        fileType: extracted.fileType,
        extractedText: extracted.text,
        charCount: extracted.text.length,
        truncated: extracted.truncated,
      },
    });

    return NextResponse.json({ material });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo procesar el material";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
