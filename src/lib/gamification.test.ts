import { describe, expect, it } from "vitest";
import { levelFromXp } from "./gamification";

describe("levelFromXp", () => {
  it("starts at level 1 with zero XP", () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it("advances a level every 500 XP", () => {
    expect(levelFromXp(499)).toBe(1);
    expect(levelFromXp(500)).toBe(2);
    expect(levelFromXp(999)).toBe(2);
    expect(levelFromXp(1000)).toBe(3);
  });
});
