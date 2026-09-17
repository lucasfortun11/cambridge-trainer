import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { AiRateLimitError, recordAiUsageOrThrow } from "@/lib/ai/rateLimit";

const bodySchema = z.object({
  word: z.string().trim().min(1).max(280),
  context: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Selección inválida" }, { status: 400 });
  }

  const { word, context } = parsed.data;
  const level = user.profile?.targetLevel ?? "C1";
  // Words are shared across users at the app's usual "assemble from bank"
  // pattern, matched case-insensitively-ish by lowercasing — good enough at
  // this catalog's scale, occasional near-duplicates aren't a real problem.
  const normalized = word.toLowerCase();

  let wordRow = await prisma.vocabularyWord.findFirst({ where: { word: normalized } });

  if (!wordRow) {
    try {
      await recordAiUsageOrThrow(user.id, "vocabulary-word");
    } catch (err) {
      if (err instanceof AiRateLimitError) {
        return NextResponse.json({ error: err.message }, { status: 429 });
      }
      throw err;
    }

    const ai = getAIProvider();
    const generated = await ai.explainWord({ word: normalized, context, level });

    wordRow = await prisma.vocabularyWord.create({
      data: {
        word: generated.word,
        definition: generated.definition,
        translation: generated.translation,
        exampleSentence: generated.exampleSentence,
        synonyms: JSON.stringify(generated.synonyms ?? []),
        antonyms: JSON.stringify(generated.antonyms ?? []),
        collocations: JSON.stringify(generated.collocations ?? []),
        phrasalVerbs: JSON.stringify(generated.phrasalVerbs ?? []),
        pronunciationIPA: generated.pronunciationIPA,
        category: generated.category,
        cefrLevel: generated.cefrLevel,
        sourceContext: context ?? null,
        grammarNote: generated.grammarNote ?? null,
      },
    });
  }

  await prisma.vocabularyReview.upsert({
    where: { userId_wordId: { userId: user.id, wordId: wordRow.id } },
    create: { userId: user.id, wordId: wordRow.id, status: "NEW", addedManually: true },
    update: { addedManually: true },
  });

  return NextResponse.json({
    word: {
      id: wordRow.id,
      word: wordRow.word,
      definition: wordRow.definition,
      translation: wordRow.translation,
      cefrLevel: wordRow.cefrLevel,
      grammarNote: wordRow.grammarNote,
    },
  });
}
