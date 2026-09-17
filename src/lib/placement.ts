import { PLACEMENT_TEST } from "@/content/placement-test";
import type { CEFRLevel, Sublevel, Skill } from "@/generated/prisma/client";
import { scoreOnExamScale } from "@/lib/cambridge-exams";

// The placement test itself only contains B1-C1 difficulty items (see
// src/content/placement-test.ts), so it can't precisely distinguish A1 from
// A2, or C1 from C2 — but a very low or very high score is still a reasonable
// signal to place someone below or above the tested range, so the full
// A1-C2 scale is used for the final estimate.
export function levelFromPercent(pct: number): { level: CEFRLevel; sublevel: Sublevel } {
  const bands: { max: number; level: CEFRLevel }[] = [
    { max: 15, level: "A1" },
    { max: 30, level: "A2" },
    { max: 48, level: "B1" },
    { max: 66, level: "B2" },
    { max: 84, level: "C1" },
    { max: 101, level: "C2" },
  ];
  const bandIndex = bands.findIndex((b) => pct < b.max);
  const band = bands[bandIndex === -1 ? bands.length - 1 : bandIndex];
  const prevMax = bandIndex > 0 ? bands[bandIndex - 1].max : 0;
  const within = (pct - prevMax) / (band.max - prevMax);
  const sublevel: Sublevel = within < 0.34 ? "LOW" : within < 0.67 ? "MID" : "HIGH";
  return { level: band.level, sublevel };
}

export function formatLevel(level: CEFRLevel, sublevel: Sublevel): string {
  const suffix = sublevel === "LOW" ? "bajo" : sublevel === "HIGH" ? "alto" : "medio";
  return `${level} ${suffix}`;
}

const SKILL_MAP: Record<string, Skill> = {
  GRAMMAR: "GRAMMAR",
  VOCABULARY: "VOCABULARY",
  READING: "READING",
  USE_OF_ENGLISH: "USE_OF_ENGLISH",
  LISTENING: "LISTENING",
};

export type PlacementAnswer = { questionId: string; selected: string };

export type PlacementSkillResult = {
  skill: Skill;
  correct: number;
  total: number;
  percent: number;
  level: CEFRLevel;
  sublevel: Sublevel;
};

export type PlacementResult = {
  bySkill: PlacementSkillResult[];
  overallPercent: number;
  overallLevel: CEFRLevel;
  overallSublevel: Sublevel;
  estimatedCambridgeScore: number;
  weakestSkills: Skill[];
  wrongAnswers: {
    questionId: string;
    skill: Skill;
    category?: string;
    prompt: string;
    correctAnswer: string;
    userAnswer: string;
  }[];
};

export function scorePlacementTest(answers: PlacementAnswer[]): PlacementResult {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selected]));

  const bySkillRaw = new Map<Skill, { correct: number; total: number }>();
  const wrongAnswers: PlacementResult["wrongAnswers"] = [];

  for (const q of PLACEMENT_TEST) {
    const skill = SKILL_MAP[q.skill];
    const entry = bySkillRaw.get(skill) ?? { correct: 0, total: 0 };
    entry.total += 1;

    const userAnswer = answerMap.get(q.id) ?? "";
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) {
      entry.correct += 1;
    } else {
      wrongAnswers.push({
        questionId: q.id,
        skill,
        category: q.category,
        prompt: q.prompt,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer || "(sin respuesta)",
      });
    }
    bySkillRaw.set(skill, entry);
  }

  const bySkill: PlacementSkillResult[] = Array.from(bySkillRaw.entries()).map(
    ([skill, { correct, total }]) => {
      const percent = Math.round((correct / total) * 100);
      const { level, sublevel } = levelFromPercent(percent);
      return { skill, correct, total, percent, level, sublevel };
    }
  );

  const overallPercent = Math.round(
    bySkill.reduce((sum, s) => sum + s.percent, 0) / bySkill.length
  );
  const { level: overallLevel, sublevel: overallSublevel } = levelFromPercent(overallPercent);
  const estimatedCambridgeScore = scoreOnExamScale(overallLevel, overallPercent);

  const weakestSkills = [...bySkill].sort((a, b) => a.percent - b.percent).slice(0, 3).map((s) => s.skill);

  return {
    bySkill,
    overallPercent,
    overallLevel,
    overallSublevel,
    estimatedCambridgeScore,
    weakestSkills,
    wrongAnswers,
  };
}
