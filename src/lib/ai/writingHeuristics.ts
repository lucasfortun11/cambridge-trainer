// Heuristic (non-LLM) writing analysis used by the mock AI provider. It's
// genuinely data-driven — it reads the user's actual text — rather than
// canned output, so the Writing module is useful even with no API key
// configured. A real provider (see mockProvider.ts / provider.ts) can
// replace this wholesale without touching the rest of the app.

import type { WritingFeedback } from "./types";
import { estimateLevelFromScore } from "@/lib/cambridge-exams";
import type { CEFRLevel } from "@/generated/prisma/client";

const INFORMAL_MARKERS = [
  "gonna", "wanna", "gotta", "kinda", "yeah", "hey", "cool", "awesome",
  "can't wait", "u ", " ur ", "lol", "!!",
];

const CONTRACTIONS = /\b(can't|don't|won't|isn't|aren't|didn't|couldn't|shouldn't|wouldn't|I'm|it's|that's|there's|he's|she's|we're|they're|I've|I'll)\b/gi;

const LINKING_WORDS = [
  "however", "moreover", "furthermore", "nevertheless", "in addition",
  "on the other hand", "therefore", "consequently", "although", "despite",
  "whereas", "provided that", "in spite of", "as a result",
];

const OVERUSED_WORDS: Record<string, { alternatives: string[]; reason: string }> = {
  "very good": { alternatives: ["excellent", "outstanding", "exceptional"], reason: "'Very good' is vague and repetitive at C1 level — a more precise adjective is stronger." },
  "very important": { alternatives: ["crucial", "essential", "paramount"], reason: "'Very + adjective' is a simple intensifier pattern; a single stronger adjective reads as more advanced." },
  "very bad": { alternatives: ["poor", "inadequate", "unsatisfactory"], reason: "'Very bad' is informal and imprecise for this register." },
  "a lot of": { alternatives: ["a substantial number of", "numerous", "a considerable amount of"], reason: "'A lot of' is conversational; a more formal quantifier fits written register better." },
  "get": { alternatives: ["obtain", "acquire", "receive"], reason: "'Get' is very informal/general — a more specific verb is more precise." },
  "things": { alternatives: ["factors", "aspects", "elements"], reason: "'Things' is vague — naming the specific concept is more precise and formal." },
  "nice": { alternatives: ["pleasant", "enjoyable", "appealing"], reason: "'Nice' is a very basic adjective; a more precise one shows a wider range of vocabulary." },
  "i think": { alternatives: ["from my perspective", "it could be argued that", "in my view"], reason: "Repeating 'I think' undersells your range — vary how you introduce opinions." },
};

const SPELLING_FIXES: Record<string, string> = {
  definately: "definitely",
  recieve: "receive",
  occured: "occurred",
  seperate: "separate",
  goverment: "government",
  wich: "which",
  becuase: "because",
  enviroment: "environment",
  alot: "a lot",
};

function countOccurrences(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

export function analyzeWriting(
  text: string,
  formal: boolean,
  wordRange?: { min: number; max: number },
  level: CEFRLevel = "C1"
): WritingFeedback {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;

  // --- Content: proximity to the task's actual target word count. Being
  // well under the minimum is a real task-achievement failure (missing
  // required content), not just a minor style note. Falls back to a
  // C1-essay-shaped band when the caller doesn't know the task's real range.
  const scoreContent = wordRange
    ? wordCount < wordRange.min * 0.7
      ? 1
      : wordCount < wordRange.min
        ? 3
        : wordCount <= wordRange.max
          ? 5
          : wordCount <= wordRange.max * 1.3
            ? 4
            : 3
    : wordCount < 120
      ? 2
      : wordCount < 180
        ? 3
        : wordCount <= 320
          ? 5
          : wordCount <= 400
            ? 4
            : 3;

  // --- Register ---
  const lowerText = text.toLowerCase();
  const informalHits = INFORMAL_MARKERS.filter((m) => lowerText.includes(m));
  const contractionCount = countOccurrences(text, CONTRACTIONS);
  const registerIssues: string[] = [];
  if (formal && contractionCount > 0) {
    registerIssues.push(`Usas ${contractionCount} contracción(es) (p. ej. "don't", "it's"); en un registro formal es mejor escribir las formas completas ("do not", "it is").`);
  }
  if (formal && informalHits.length > 0) {
    registerIssues.push(`Expresiones informales detectadas: ${informalHits.join(", ")}. No encajan en un texto formal.`);
  }
  const register = formal
    ? registerIssues.length > 0
      ? "Demasiado informal para el registro requerido."
      : "Registro formal apropiado."
    : "Registro semi-formal/neutral apropiado para este tipo de texto.";

  // --- Cohesion: presence of linking devices ---
  const linkingUsed = LINKING_WORDS.filter((w) => lowerText.includes(w));
  const cohesionIssues: string[] = [];
  if (linkingUsed.length === 0) {
    cohesionIssues.push(
      "No se detectan conectores avanzados (however, moreover, nevertheless...). Añadir 2-3 mejoraría la cohesión notablemente."
    );
  }
  if (sentences.length >= 3 && avgSentenceLength < 8) {
    cohesionIssues.push(
      "Las frases son muy cortas y simples de media — combina algunas con conectores o cláusulas relativas para mostrar un rango sintáctico más amplio."
    );
  }

  // --- Vocabulary improvements: scan for overused/simple words ---
  const vocabularyImprovements: WritingFeedback["vocabularyImprovements"] = [];
  for (const [phrase, { alternatives, reason }] of Object.entries(OVERUSED_WORDS)) {
    const re = new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`, "gi");
    if (re.test(text)) {
      vocabularyImprovements.push({
        original: phrase,
        suggestion: alternatives[0],
        reason: `${reason} Alternativas: ${alternatives.join(", ")}.`,
      });
    }
  }

  // --- Grammar/spelling: simple regex-detectable issues ---
  const grammarErrors: WritingFeedback["grammarErrors"] = [];
  const repeatedWordMatch = text.match(/\b(\w+)\s+\1\b/gi);
  if (repeatedWordMatch) {
    for (const m of repeatedWordMatch.slice(0, 3)) {
      grammarErrors.push({
        original: m,
        correction: m.split(/\s+/)[0],
        explanation: "Palabra repetida por error (typo).",
      });
    }
  }
  for (const [wrong, right] of Object.entries(SPELLING_FIXES)) {
    if (new RegExp(`\\b${wrong}\\b`, "i").test(text)) {
      grammarErrors.push({
        original: wrong,
        correction: right,
        explanation: `Error ortográfico común: "${wrong}" → "${right}".`,
      });
    }
  }

  // --- Structure ---
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const structureIssues: string[] = [];
  if (paragraphs.length < 3) {
    structureIssues.push(
      "Se detectan menos de 3 párrafos. Una introducción, 1-2 párrafos de desarrollo y una conclusión suelen dar mejor estructura."
    );
  }

  const scoreLanguage = Math.max(
    2,
    5 - Math.min(3, grammarErrors.length) - (registerIssues.length > 0 ? 1 : 0)
  );
  const scoreOrganisation = Math.max(2, 5 - structureIssues.length - (cohesionIssues.length > 0 ? 1 : 0));
  const scoreCommunicativeAchievement = Math.round((scoreContent + scoreOrganisation) / 2);
  const overallScore = Math.round(
    (scoreContent + scoreCommunicativeAchievement + scoreOrganisation + scoreLanguage) / 4
  );

  // --- Improved version: apply the suggested word-level substitutions ---
  let improvedVersion = text;
  for (const [phrase, { alternatives }] of Object.entries(OVERUSED_WORDS)) {
    const re = new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`, "i");
    improvedVersion = improvedVersion.replace(re, alternatives[0]);
  }
  for (const [wrong, right] of Object.entries(SPELLING_FIXES)) {
    improvedVersion = improvedVersion.replace(new RegExp(`\\b${wrong}\\b`, "gi"), right);
  }

  const recommendations: string[] = [];
  const minRecommended = wordRange?.min ?? 180;
  if (wordCount < minRecommended) recommendations.push("Amplía el texto — está por debajo del recuento de palabras recomendado.");
  if (linkingUsed.length === 0) recommendations.push("Incorpora conectores avanzados para mejorar la cohesión.");
  if (registerIssues.length > 0) recommendations.push("Revisa el registro: evita contracciones y expresiones informales.");
  if (vocabularyImprovements.length > 0) recommendations.push("Sustituye el vocabulario básico señalado por alternativas más precisas.");
  if (recommendations.length === 0) recommendations.push("Buen nivel general — sigue variando estructuras y vocabulario para llegar a C1 alto.");

  const { level: estimatedLevel, sublevel: estimatedSublevel } = estimateLevelFromScore(level, overallScore);

  return {
    scoreContent,
    scoreCommunicativeAchievement,
    scoreOrganisation,
    scoreLanguage,
    overallScore,
    grammarErrors,
    vocabularyImprovements,
    structureIssues,
    cohesionIssues: [...cohesionIssues, ...registerIssues],
    register,
    recommendations,
    improvedVersion,
    estimatedLevel,
    estimatedSublevel,
  };
}
