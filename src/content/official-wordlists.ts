// Bare headword + part-of-speech seed lists extracted from Cambridge
// English's official public A2 Key / B1 Preliminary Vocabulary Lists
// (© UCLES). Only the words themselves are kept — no definitions, example
// sentences or translations from the source PDFs, since those are original
// copyrighted prose. The app uses these purely as a seed pool so AI-
// generated vocabulary content for A2/B1 users draws from real Cambridge-
// endorsed words; every definition, translation and example sentence shown
// to users is still freshly generated, original content (see
// src/lib/ai/deepseekProvider.ts generateVocabulary()).

import a2Raw from "./official-wordlists/a2-words.json";
import b1Raw from "./official-wordlists/b1-words.json";
import type { CEFRLevel } from "@/generated/prisma/client";

export type OfficialWordEntry = { word: string; pos: string; level: string };

const A2_WORDS = a2Raw as OfficialWordEntry[];
const B1_WORDS = b1Raw as OfficialWordEntry[];

const BY_LEVEL: Partial<Record<CEFRLevel, OfficialWordEntry[]>> = {
  A1: A2_WORDS, // no standalone A1 list; A2's is the closest reference and gets filtered down by the AI prompt
  A2: A2_WORDS,
  B1: B1_WORDS,
};

/** Official Cambridge wordlist for a level, or an empty array where none is available (B2-C2 don't publish one — vocabulary there is open-ended by design). */
export function getOfficialWordlist(level: CEFRLevel): OfficialWordEntry[] {
  return BY_LEVEL[level] ?? [];
}

/** A random sample of words not already in `excludeWords`, for seeding a generation prompt. */
export function sampleUnusedOfficialWords(
  level: CEFRLevel,
  excludeWords: Set<string>,
  count: number
): OfficialWordEntry[] {
  const pool = getOfficialWordlist(level).filter((e) => !excludeWords.has(e.word.toLowerCase()));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
