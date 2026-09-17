import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { sampleUnusedOfficialWords } from "@/content/official-wordlists";

const DAILY_NEW_WORDS = 10;
const SESSION_LIMIT = 20;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const now = new Date();
  const level = user.profile?.targetLevel ?? "C1";

  const dueReviews = await prisma.vocabularyReview.findMany({
    where: { userId: user.id, nextReviewDate: { lte: now } },
    include: { word: true },
    orderBy: { nextReviewDate: "asc" },
    take: SESSION_LIMIT,
  });

  let queue = dueReviews;

  if (queue.length < SESSION_LIMIT) {
    const reviewedWordIds = (
      await prisma.vocabularyReview.findMany({
        where: { userId: user.id },
        select: { wordId: true },
      })
    ).map((r) => r.wordId);

    let freshWords = await prisma.vocabularyWord.findMany({
      where: { id: { notIn: reviewedWordIds }, cefrLevel: level },
      take: DAILY_NEW_WORDS,
    });

    // Not enough words at this level in the catalog yet — generate more with
    // AI and add them to the shared catalog (helps every future user too).
    if (freshWords.length < DAILY_NEW_WORDS) {
      const needed = DAILY_NEW_WORDS - freshWords.length;
      try {
        const existingWords = await prisma.vocabularyWord.findMany({
          where: { cefrLevel: level },
          select: { word: true },
        });
        const candidateWords = sampleUnusedOfficialWords(
          level,
          new Set(existingWords.map((w) => w.word.toLowerCase())),
          needed
        );

        const ai = getAIProvider();
        const generated = await ai.generateVocabulary({ level, count: needed, candidateWords });
        const created = await Promise.all(
          generated.map((w) =>
            prisma.vocabularyWord.create({
              data: {
                word: w.word,
                definition: w.definition,
                translation: w.translation,
                exampleSentence: w.exampleSentence,
                synonyms: JSON.stringify(w.synonyms ?? []),
                antonyms: JSON.stringify(w.antonyms ?? []),
                collocations: JSON.stringify(w.collocations ?? []),
                phrasalVerbs: JSON.stringify(w.phrasalVerbs ?? []),
                pronunciationIPA: w.pronunciationIPA,
                category: w.category,
                cefrLevel: w.cefrLevel,
              },
            })
          )
        );
        freshWords = [...freshWords, ...created];
      } catch (err) {
        console.error("[vocabulary/due] AI top-up failed, continuing with what's available:", err);
      }
    }

    const newReviews = await Promise.all(
      freshWords.map((word) =>
        prisma.vocabularyReview.create({
          data: { userId: user.id, wordId: word.id, status: "NEW" },
          include: { word: true },
        })
      )
    );

    queue = [...queue, ...newReviews].slice(0, SESSION_LIMIT);
  }

  return NextResponse.json({
    cards: queue.map((r) => ({
      reviewId: r.id,
      word: {
        id: r.word.id,
        word: r.word.word,
        definition: r.word.definition,
        translation: r.word.translation,
        exampleSentence: r.word.exampleSentence,
        synonyms: r.word.synonyms ? JSON.parse(r.word.synonyms) : [],
        antonyms: r.word.antonyms ? JSON.parse(r.word.antonyms) : [],
        collocations: r.word.collocations ? JSON.parse(r.word.collocations) : [],
        phrasalVerbs: r.word.phrasalVerbs ? JSON.parse(r.word.phrasalVerbs) : [],
        pronunciationIPA: r.word.pronunciationIPA,
        category: r.word.category,
        cefrLevel: r.word.cefrLevel,
        grammarNote: r.word.grammarNote,
      },
      status: r.status,
    })),
  });
}
