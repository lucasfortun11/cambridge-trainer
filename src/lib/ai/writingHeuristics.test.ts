import { describe, expect, it } from "vitest";
import { analyzeWriting } from "./writingHeuristics";

function words(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
}

describe("analyzeWriting — Content score against the task's real word range", () => {
  const range = { min: 20, max: 35 }; // e.g. an A2 Key postcard

  it("scores far below the minimum as a task-achievement failure (1), not a style note", () => {
    expect(analyzeWriting(words(5), false, range).scoreContent).toBe(1);
  });

  it("scores under the minimum but not drastically so as mediocre (3)", () => {
    expect(analyzeWriting(words(15), false, range).scoreContent).toBe(3);
  });

  it("scores squarely within the target range as full marks (5)", () => {
    expect(analyzeWriting(words(28), false, range).scoreContent).toBe(5);
  });

  it("scores moderately over the maximum as good but not perfect (4)", () => {
    expect(analyzeWriting(words(40), false, range).scoreContent).toBe(4);
  });

  it("scores far over the maximum as losing task control (3)", () => {
    expect(analyzeWriting(words(60), false, range).scoreContent).toBe(3);
  });

  it("falls back to a generic C1-essay-shaped band when no range is given", () => {
    expect(analyzeWriting(words(100), false).scoreContent).toBe(2);
    expect(analyzeWriting(words(250), false).scoreContent).toBe(5);
  });

  it("does not penalise a correctly short A2-length answer just for being short", () => {
    // Without knowing the real 20-35 word target, the old hardcoded band
    // would score this as a weak C1 essay (2/5) even though 28 words is a
    // perfect length for this task.
    const withRange = analyzeWriting(words(28), false, range).scoreContent;
    const withoutRange = analyzeWriting(words(28), false).scoreContent;
    expect(withRange).toBeGreaterThan(withoutRange);
  });
});
