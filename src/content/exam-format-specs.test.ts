import { describe, expect, it } from "vitest";
import { EXAM_FORMAT, typicalPartQuestionCount } from "./exam-format-specs";
import { CEFR_LEVELS } from "@/lib/cambridge-exams";

describe("EXAM_FORMAT", () => {
  it("has all four papers for every CEFR level", () => {
    for (const level of CEFR_LEVELS) {
      const format = EXAM_FORMAT[level];
      expect(format.readingUseOfEnglish.parts.length).toBeGreaterThan(0);
      expect(format.writing.parts.length).toBeGreaterThan(0);
      expect(format.listening.parts.length).toBeGreaterThan(0);
      expect(format.speaking.parts.length).toBeGreaterThan(0);
    }
  });

  it("sums Listening part questions to the paper's stated total where given", () => {
    for (const level of CEFR_LEVELS) {
      const listening = EXAM_FORMAT[level].listening;
      if (listening.totalQuestions) {
        const sum = listening.parts.reduce((s, p) => s + p.questions, 0);
        expect(sum).toBe(listening.totalQuestions);
      }
    }
  });

  it("matches the app's existing hand-authored C1 Writing word counts (220-260)", () => {
    // Sanity cross-check against src/content/writing-prompts.ts, written
    // independently before this data was extracted from the official handbook.
    const c1Writing = EXAM_FORMAT.C1.writing;
    expect(c1Writing.parts[0].description).toContain("220-260");
  });
});

describe("typicalPartQuestionCount", () => {
  it("returns a positive, realistic count for every level and skill", () => {
    for (const level of CEFR_LEVELS) {
      for (const skill of ["READING", "USE_OF_ENGLISH", "LISTENING"] as const) {
        const count = typicalPartQuestionCount(level, skill);
        expect(count).toBeGreaterThanOrEqual(4);
        expect(count).toBeLessThanOrEqual(10);
      }
    }
  });
});
