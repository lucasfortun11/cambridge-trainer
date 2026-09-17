// Maps each CEFR level to its corresponding Cambridge English Qualification.
// Score ranges approximate the public Cambridge English Scale bands for each
// exam — used only for the app's internal "readiness" estimate, never
// presented as an official score (see disclaimers throughout the UI).

import type { CEFRLevel, Sublevel } from "@prisma/client";

export type CambridgeExamInfo = {
  level: CEFRLevel;
  examName: string; // full name, e.g. "B2 First (FCE)"
  shortName: string; // e.g. "B2 First"
  scoreMin: number;
  scoreMax: number;
  passScore: number; // minimum score generally considered a pass for this exam
  description: string;
};

export const CAMBRIDGE_EXAMS: Record<CEFRLevel, CambridgeExamInfo> = {
  A1: {
    level: "A1",
    examName: "A1 (nivel inicial)",
    shortName: "A1",
    scoreMin: 80,
    scoreMax: 129,
    passScore: 100,
    description: "Comprensión y uso de expresiones cotidianas muy básicas.",
  },
  A2: {
    level: "A2",
    examName: "A2 Key (KET)",
    shortName: "A2 Key",
    scoreMin: 100,
    scoreMax: 150,
    passScore: 120,
    description: "Comunicación en situaciones simples y cotidianas.",
  },
  B1: {
    level: "B1",
    examName: "B1 Preliminary (PET)",
    shortName: "B1 Preliminary",
    scoreMin: 120,
    scoreMax: 170,
    passScore: 140,
    description: "Comunicación independiente en la mayoría de situaciones habituales.",
  },
  B2: {
    level: "B2",
    examName: "B2 First (FCE)",
    shortName: "B2 First",
    scoreMin: 140,
    scoreMax: 190,
    passScore: 160,
    description: "Uso del inglés con fluidez en contextos académicos y profesionales.",
  },
  C1: {
    level: "C1",
    examName: "C1 Advanced (CAE)",
    shortName: "C1 Advanced",
    scoreMin: 160,
    scoreMax: 210,
    passScore: 180,
    description: "Dominio operativo eficaz del inglés en entornos exigentes.",
  },
  C2: {
    level: "C2",
    examName: "C2 Proficiency (CPE)",
    shortName: "C2 Proficiency",
    scoreMin: 180,
    scoreMax: 230,
    passScore: 200,
    description: "Dominio del inglés prácticamente al nivel de un hablante nativo culto.",
  },
};

export const CEFR_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function examInfo(level: CEFRLevel): CambridgeExamInfo {
  return CAMBRIDGE_EXAMS[level];
}

/** Converts a 0-100 accuracy percentage into the target exam's own score scale. */
export function scoreOnExamScale(level: CEFRLevel, percent: number): number {
  const { scoreMin, scoreMax } = CAMBRIDGE_EXAMS[level];
  return Math.round(scoreMin + (Math.max(0, Math.min(100, percent)) / 100) * (scoreMax - scoreMin));
}

/**
 * Deterministic fallback for the independent CEFR placement (see
 * WritingFeedback.estimatedLevel) when there's no real AI provider to judge
 * it qualitatively — derives a level+sublevel purely from how a 0-5 score
 * against the target level compares to that level itself, shifting one
 * level up/down at the extremes (clamped to A1-C2) the same way a strong or
 * weak real exam performance can report an adjacent level.
 */
export function estimateLevelFromScore(
  targetLevel: CEFRLevel,
  score0to5: number
): { level: CEFRLevel; sublevel: Sublevel } {
  const idx = CEFR_LEVELS.indexOf(targetLevel);
  if (score0to5 >= 4.5) {
    const level = CEFR_LEVELS[Math.min(idx + 1, CEFR_LEVELS.length - 1)];
    return { level, sublevel: level === targetLevel ? "HIGH" : "LOW" };
  }
  if (score0to5 >= 3.5) return { level: targetLevel, sublevel: "HIGH" };
  if (score0to5 >= 2.5) return { level: targetLevel, sublevel: "MID" };
  if (score0to5 >= 1.5) return { level: targetLevel, sublevel: "LOW" };
  const level = CEFR_LEVELS[Math.max(idx - 1, 0)];
  return { level, sublevel: level === targetLevel ? "LOW" : "HIGH" };
}

const SUBLEVEL_FRACTION: Record<Sublevel, number> = { LOW: 0, MID: 0.33, HIGH: 0.67 };

/** Maps a level+sublevel onto a continuous 1.0 (A1 low) - 6.67 (C2 high) scale, for plotting CEFR progress on a chart. */
export function levelToNumeric(level: CEFRLevel, sublevel: Sublevel): number {
  return CEFR_LEVELS.indexOf(level) + 1 + SUBLEVEL_FRACTION[sublevel];
}

/** Inverse of levelToNumeric, for labelling a chart axis — always returns the bare level (A1-C2), not a sublevel. */
export function numericToLevel(value: number): CEFRLevel {
  const idx = Math.min(CEFR_LEVELS.length - 1, Math.max(0, Math.floor(value - 1)));
  return CEFR_LEVELS[idx];
}

export function gradeLabel(level: CEFRLevel, score: number): string {
  const { scoreMax, passScore } = CAMBRIDGE_EXAMS[level];
  const topBand = passScore + (scoreMax - passScore) * 0.6;
  if (score >= topBand) return `Grade A (${level} alto)`;
  if (score >= passScore) return `Grade B/C (${level})`;
  const nearMiss = passScore - (scoreMax - passScore) * 0.3;
  if (score >= nearMiss) return `Cerca de ${level}`;
  return "Por debajo del nivel objetivo";
}
