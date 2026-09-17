import { describe, expect, it } from "vitest";
import { estimateLevelFromScore } from "./cambridge-exams";

describe("estimateLevelFromScore", () => {
  it("stays at the target level with HIGH sublevel for a strong-but-not-perfect score", () => {
    expect(estimateLevelFromScore("B2", 4)).toEqual({ level: "B2", sublevel: "HIGH" });
  });

  it("stays at the target level with MID sublevel for a middling score", () => {
    expect(estimateLevelFromScore("C1", 3)).toEqual({ level: "C1", sublevel: "MID" });
  });

  it("stays at the target level with LOW sublevel for a weak-but-passable score", () => {
    expect(estimateLevelFromScore("B1", 2)).toEqual({ level: "B1", sublevel: "LOW" });
  });

  it("bumps to the next level up (LOW) for a near-perfect score", () => {
    expect(estimateLevelFromScore("B2", 5)).toEqual({ level: "C1", sublevel: "LOW" });
    expect(estimateLevelFromScore("B1", 4.5)).toEqual({ level: "B2", sublevel: "LOW" });
  });

  it("drops to the level below (HIGH) for a very poor score", () => {
    expect(estimateLevelFromScore("C1", 1)).toEqual({ level: "B2", sublevel: "HIGH" });
    expect(estimateLevelFromScore("B2", 0)).toEqual({ level: "B1", sublevel: "HIGH" });
  });

  it("clamps at C2 instead of going out of range for a top score at the highest level", () => {
    expect(estimateLevelFromScore("C2", 5)).toEqual({ level: "C2", sublevel: "HIGH" });
  });

  it("clamps at A1 instead of going out of range for a very poor score at the lowest level", () => {
    expect(estimateLevelFromScore("A1", 0)).toEqual({ level: "A1", sublevel: "LOW" });
  });
});
