import { describe, expect, it } from "vitest";
import { isAnswerCorrect } from "./grading";

describe("isAnswerCorrect", () => {
  it("matches identical answers", () => {
    expect(isAnswerCorrect("B) went", "B) went")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isAnswerCorrect("b) went", "B) Went")).toBe(true);
  });

  it("ignores leading/trailing whitespace and collapses internal whitespace", () => {
    expect(isAnswerCorrect("  B)   went ", "B) went")).toBe(true);
  });

  it("ignores trailing punctuation", () => {
    expect(isAnswerCorrect("B) went.", "B) went")).toBe(true);
  });

  it("rejects a genuinely different answer", () => {
    expect(isAnswerCorrect("A) go", "B) went")).toBe(false);
  });

  it("treats an empty answer as incorrect", () => {
    expect(isAnswerCorrect("", "B) went")).toBe(false);
  });
});
