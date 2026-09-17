import { describe, expect, it } from "vitest";
import { getOfficialWordlist, sampleUnusedOfficialWords } from "./official-wordlists";

describe("getOfficialWordlist", () => {
  it("returns a substantial word list for A2 and B1", () => {
    expect(getOfficialWordlist("A2").length).toBeGreaterThan(100);
    expect(getOfficialWordlist("B1").length).toBeGreaterThan(100);
  });

  it("falls back A1 to the A2 list (no standalone A1 exam/wordlist exists)", () => {
    expect(getOfficialWordlist("A1")).toEqual(getOfficialWordlist("A2"));
  });

  it("returns an empty list for levels with no published Cambridge wordlist", () => {
    expect(getOfficialWordlist("B2")).toEqual([]);
    expect(getOfficialWordlist("C1")).toEqual([]);
    expect(getOfficialWordlist("C2")).toEqual([]);
  });

  it("every entry has a non-empty word and part-of-speech", () => {
    for (const entry of getOfficialWordlist("A2")) {
      expect(entry.word.length).toBeGreaterThan(0);
      expect(entry.pos.length).toBeGreaterThan(0);
    }
  });
});

describe("sampleUnusedOfficialWords", () => {
  it("never returns an already-excluded word", () => {
    const all = getOfficialWordlist("A2");
    const excluded = new Set(all.slice(0, 50).map((e) => e.word.toLowerCase()));
    const sample = sampleUnusedOfficialWords("A2", excluded, 30);
    for (const entry of sample) {
      expect(excluded.has(entry.word.toLowerCase())).toBe(false);
    }
  });

  it("returns at most `count` entries", () => {
    const sample = sampleUnusedOfficialWords("B1", new Set(), 10);
    expect(sample.length).toBeLessThanOrEqual(10);
  });

  it("returns an empty array for a level with no wordlist", () => {
    expect(sampleUnusedOfficialWords("C1", new Set(), 10)).toEqual([]);
  });
});
