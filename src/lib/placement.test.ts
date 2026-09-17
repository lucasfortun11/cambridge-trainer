import { describe, expect, it } from "vitest";
import { levelFromPercent, scorePlacementTest } from "./placement";
import { PLACEMENT_TEST } from "@/content/placement-test";

describe("levelFromPercent", () => {
  it("places 0% at A1 low", () => {
    expect(levelFromPercent(0)).toEqual({ level: "A1", sublevel: "LOW" });
  });

  it("places 100% at C2 high", () => {
    expect(levelFromPercent(100)).toEqual({ level: "C2", sublevel: "HIGH" });
  });

  it("respects the documented band boundaries", () => {
    expect(levelFromPercent(14)).toMatchObject({ level: "A1" });
    expect(levelFromPercent(15)).toMatchObject({ level: "A2" });
    expect(levelFromPercent(47)).toMatchObject({ level: "B1" });
    expect(levelFromPercent(48)).toMatchObject({ level: "B2" });
    expect(levelFromPercent(83)).toMatchObject({ level: "C1" });
    expect(levelFromPercent(84)).toMatchObject({ level: "C2" });
  });

  it("never returns a sublevel outside LOW/MID/HIGH", () => {
    for (let pct = 0; pct <= 100; pct += 5) {
      expect(["LOW", "MID", "HIGH"]).toContain(levelFromPercent(pct).sublevel);
    }
  });
});

describe("scorePlacementTest", () => {
  it("scores 100% when every answer is correct", () => {
    const answers = PLACEMENT_TEST.map((q) => ({ questionId: q.id, selected: q.correctAnswer }));
    const result = scorePlacementTest(answers);
    expect(result.overallPercent).toBe(100);
    expect(result.overallLevel).toBe("C2");
    expect(result.wrongAnswers).toHaveLength(0);
  });

  it("scores 0% and records every question as wrong when nothing is answered", () => {
    const result = scorePlacementTest([]);
    expect(result.overallPercent).toBe(0);
    expect(result.overallLevel).toBe("A1");
    expect(result.wrongAnswers).toHaveLength(PLACEMENT_TEST.length);
  });

  it("covers all five skills and every CEFR level A1-C2 in the question bank", () => {
    const skills = new Set(PLACEMENT_TEST.map((q) => q.skill));
    expect(skills).toEqual(
      new Set(["GRAMMAR", "VOCABULARY", "READING", "USE_OF_ENGLISH", "LISTENING"])
    );
    const levels = new Set(PLACEMENT_TEST.map((q) => q.level));
    expect(levels).toEqual(new Set(["A1", "A2", "B1", "B2", "C1", "C2"]));
  });

  it("identifies the weakest skills from a partial attempt", () => {
    // Answer every Grammar question wrong, everything else correct.
    const answers = PLACEMENT_TEST.map((q) => ({
      questionId: q.id,
      selected: q.skill === "GRAMMAR" ? "wrong" : q.correctAnswer,
    }));
    const result = scorePlacementTest(answers);
    expect(result.weakestSkills[0]).toBe("GRAMMAR");
  });
});
