import { describe, expect, it } from "vitest";
import {
  CAMBRIDGE_EXAMS,
  CEFR_LEVELS,
  gradeLabel,
  levelToNumeric,
  numericToLevel,
  scoreOnExamScale,
} from "./cambridge-exams";

describe("scoreOnExamScale", () => {
  it("maps 0% to the level's scoreMin and 100% to scoreMax", () => {
    for (const level of CEFR_LEVELS) {
      const { scoreMin, scoreMax } = CAMBRIDGE_EXAMS[level];
      expect(scoreOnExamScale(level, 0)).toBe(scoreMin);
      expect(scoreOnExamScale(level, 100)).toBe(scoreMax);
    }
  });

  it("never returns a score outside [scoreMin, scoreMax], even for out-of-range percentages", () => {
    for (const level of CEFR_LEVELS) {
      const { scoreMin, scoreMax } = CAMBRIDGE_EXAMS[level];
      expect(scoreOnExamScale(level, -20)).toBe(scoreMin);
      expect(scoreOnExamScale(level, 150)).toBe(scoreMax);
    }
  });

  it("is monotonically non-decreasing as percent increases", () => {
    for (const level of CEFR_LEVELS) {
      let prev = scoreOnExamScale(level, 0);
      for (let pct = 10; pct <= 100; pct += 10) {
        const score = scoreOnExamScale(level, pct);
        expect(score).toBeGreaterThanOrEqual(prev);
        prev = score;
      }
    }
  });
});

describe("gradeLabel", () => {
  it("grades a score at scoreMax as a top band pass", () => {
    for (const level of CEFR_LEVELS) {
      const { scoreMax } = CAMBRIDGE_EXAMS[level];
      expect(gradeLabel(level, scoreMax)).toContain("Grade A");
    }
  });

  it("grades a score well below passScore as below target level", () => {
    for (const level of CEFR_LEVELS) {
      const { scoreMin } = CAMBRIDGE_EXAMS[level];
      expect(gradeLabel(level, scoreMin)).toBe("Por debajo del nivel objetivo");
    }
  });
});

describe("CAMBRIDGE_EXAMS", () => {
  it("has a strictly increasing scoreMin across A1-C2", () => {
    const mins = CEFR_LEVELS.map((l) => CAMBRIDGE_EXAMS[l].scoreMin);
    for (let i = 1; i < mins.length; i++) {
      expect(mins[i]).toBeGreaterThan(mins[i - 1]);
    }
  });

  it("keeps passScore strictly between scoreMin and scoreMax for every level", () => {
    for (const level of CEFR_LEVELS) {
      const { scoreMin, scoreMax, passScore } = CAMBRIDGE_EXAMS[level];
      expect(passScore).toBeGreaterThan(scoreMin);
      expect(passScore).toBeLessThan(scoreMax);
    }
  });
});

describe("levelToNumeric / numericToLevel", () => {
  it("places A1 low at 1.0 and C2 high just under 7", () => {
    expect(levelToNumeric("A1", "LOW")).toBe(1);
    expect(levelToNumeric("C2", "HIGH")).toBeCloseTo(6.67, 2);
  });

  it("is strictly increasing across the full A1-C2 x LOW-MID-HIGH scale", () => {
    const sublevels = ["LOW", "MID", "HIGH"] as const;
    let prev = 0;
    for (const level of CEFR_LEVELS) {
      for (const sublevel of sublevels) {
        const value = levelToNumeric(level, sublevel);
        expect(value).toBeGreaterThan(prev);
        prev = value;
      }
    }
  });

  it("round-trips back to the right bare level for every sublevel", () => {
    for (const level of CEFR_LEVELS) {
      for (const sublevel of ["LOW", "MID", "HIGH"] as const) {
        expect(numericToLevel(levelToNumeric(level, sublevel))).toBe(level);
      }
    }
  });
});
