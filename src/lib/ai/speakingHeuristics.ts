import type { SpeakingFeedback } from "./types";
import { estimateLevelFromScore } from "@/lib/cambridge-exams";
import type { CEFRLevel } from "@/generated/prisma/client";

const FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "actually", "i mean"];

const OVERUSED_OPINION_PHRASES: Record<string, string[]> = {
  "i think": ["From my perspective...", "It could be argued that...", "I would say that...", "In my view..."],
  "in my opinion": ["From where I stand...", "As I see it...", "To my mind..."],
  "for example": ["For instance...", "A case in point is...", "To illustrate..."],
};

function wordFrequency(text: string): Map<string, number> {
  const words = text
    .toLowerCase()
    .replace(/[^a-zà-ÿ'\s]/gi, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return freq;
}

export function analyzeSpeaking(
  transcript: string,
  durationSeconds?: number,
  level: CEFRLevel = "C1"
): SpeakingFeedback {
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  const lower = transcript.toLowerCase();

  // --- Repeated words (content words used 4+ times) ---
  const freq = wordFrequency(transcript);
  const repeatedWords = Array.from(freq.entries())
    .filter(([, count]) => count >= 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  // --- Overused opinion phrases with alternatives ---
  const alternatives: SpeakingFeedback["alternatives"] = [];
  for (const [phrase, alts] of Object.entries(OVERUSED_OPINION_PHRASES)) {
    const count = (lower.match(new RegExp(phrase, "g")) ?? []).length;
    if (count >= 2) {
      alternatives.push({ overused: phrase, alternatives: alts });
    }
  }

  // --- Hesitation / fluency markers ---
  const fillerCount = FILLER_WORDS.reduce(
    (sum, f) => sum + (lower.match(new RegExp(`\\b${f}\\b`, "g")) ?? []).length,
    0
  );
  const hesitationNotes: string[] = [];
  if (fillerCount > 5) {
    hesitationNotes.push(`Se detectan ${fillerCount} muletillas ("um", "like"...). Practica pausas silenciosas en lugar de rellenarlas.`);
  }

  const wordsPerMinute = durationSeconds ? Math.round((wordCount / durationSeconds) * 60) : null;
  if (wordsPerMinute !== null && wordsPerMinute < 90) {
    hesitationNotes.push("Tu ritmo es algo lento para un C1 — intenta hablar con más fluidez, aunque cometas algún error.");
  }

  // --- Vocabulary range: unique words / total words ---
  const uniqueRatio = wordCount > 0 ? new Set(lower.split(/\s+/)).size / wordCount : 0;
  const scoreVocabulary = Math.round(Math.min(5, Math.max(2, uniqueRatio * 8)));

  const scoreFluency = Math.max(2, 5 - Math.min(2, Math.floor(fillerCount / 4)) - (wordsPerMinute !== null && wordsPerMinute < 90 ? 1 : 0));
  const scoreCoherence = Math.max(2, Math.min(5, Math.round(wordCount / 40)));
  const scoreGrammar = 4; // heuristic mock can't reliably grammar-check spoken transcripts
  const scorePronunciation = 4; // requires real audio analysis — placeholder until a real provider is wired in

  const overallScore = Math.round(
    (scoreFluency + scoreGrammar + scoreVocabulary + scoreCoherence + scorePronunciation) / 5
  );

  const feedback: string[] = [];
  if (repeatedWords.length > 0) {
    feedback.push(
      `Repites bastante la palabra "${repeatedWords[0].word}" (${repeatedWords[0].count} veces) — usa sinónimos para variar.`
    );
  }
  if (alternatives.length > 0) {
    feedback.push(`Usaste "${alternatives[0].overused}" varias veces. Prueba: ${alternatives[0].alternatives.join(", ")}.`);
  }
  if (feedback.length === 0) {
    feedback.push("Buen rango de vocabulario y sin repeticiones destacables en esta grabación.");
  }

  const { level: estimatedLevel, sublevel: estimatedSublevel } = estimateLevelFromScore(level, overallScore);

  return {
    scoreFluency,
    scoreGrammar,
    scoreVocabulary,
    scoreCoherence,
    scorePronunciation,
    overallScore,
    repeatedWords,
    alternatives,
    hesitationNotes,
    feedback,
    estimatedLevel,
    estimatedSublevel,
  };
}
