import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // ?mine=1 restricts the catalog browse to only the words this user
  // personally selected and added via "Mi diccionario" (WordCapture),
  // instead of the full shared catalog.
  const mineOnly = req.nextUrl.searchParams.get("mine") === "1";

  const words = await prisma.vocabularyWord.findMany({
    where: mineOnly ? { reviews: { some: { userId: user.id, addedManually: true } } } : undefined,
    orderBy: { word: "asc" },
    include: { reviews: { where: { userId: user.id } } },
  });

  return NextResponse.json({
    words: words.map((w) => ({
      id: w.id,
      word: w.word,
      definition: w.definition,
      translation: w.translation,
      category: w.category,
      cefrLevel: w.cefrLevel,
      status: w.reviews[0]?.status ?? null,
      grammarNote: w.grammarNote,
    })),
  });
}
