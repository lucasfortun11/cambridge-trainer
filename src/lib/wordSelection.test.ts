import { describe, expect, it } from "vitest";
import { isValidWordSelection } from "./wordSelection";

describe("isValidWordSelection", () => {
  it("accepts a single word", () => {
    expect(isValidWordSelection("substantial")).toBe(true);
  });

  it("accepts a short phrasal verb or fixed phrase", () => {
    expect(isValidWordSelection("look forward to")).toBe(true);
    expect(isValidWordSelection("at the same time")).toBe(true);
  });

  it("accepts hyphenated and apostrophe'd words", () => {
    expect(isValidWordSelection("well-known")).toBe(true);
    expect(isValidWordSelection("don't")).toBe(true);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isValidWordSelection("  word  ")).toBe(true);
  });

  it("rejects an empty or whitespace-only selection", () => {
    expect(isValidWordSelection("")).toBe(false);
    expect(isValidWordSelection("   ")).toBe(false);
  });

  it("accepts a full sentence with normal punctuation", () => {
    expect(isValidWordSelection("This is a much longer sentence, with a comma.")).toBe(true);
    expect(isValidWordSelection("Hello, world!")).toBe(true);
    expect(isValidWordSelection('She said: "I\'ll be there by nine."')).toBe(true);
  });

  it("rejects a selection over the length cap (roughly a paragraph)", () => {
    const tooLong = "word ".repeat(60).trim();
    expect(tooLong.length).toBeGreaterThan(280);
    expect(isValidWordSelection(tooLong)).toBe(false);
  });

  it("rejects selections containing digits or code/markup symbols", () => {
    expect(isValidWordSelection("2024")).toBe(false);
    expect(isValidWordSelection("const x = 5;")).toBe(false);
    expect(isValidWordSelection("visit https://example.com")).toBe(false);
    expect(isValidWordSelection("a #hashtag")).toBe(false);
  });

  it("rejects a selection with no letters at all", () => {
    expect(isValidWordSelection("...")).toBe(false);
    expect(isValidWordSelection("!?")).toBe(false);
  });

  it("accepts accented characters", () => {
    expect(isValidWordSelection("comunicación")).toBe(true);
  });
});
