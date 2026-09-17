import { describe, expect, it } from "vitest";
import { isOverDailyLimit } from "./rateLimit";

describe("isOverDailyLimit", () => {
  it("allows usage that lands exactly on the limit", () => {
    expect(isOverDailyLimit(0, 80, 80)).toBe(false);
    expect(isOverDailyLimit(79, 1, 80)).toBe(false);
  });

  it("blocks usage that would exceed the limit", () => {
    expect(isOverDailyLimit(80, 1, 80)).toBe(true);
    expect(isOverDailyLimit(75, 6, 80)).toBe(true);
  });

  it("supports a single call heavier than 1 (e.g. Mock Exam's weight of 6)", () => {
    expect(isOverDailyLimit(0, 6, 80)).toBe(false);
    expect(isOverDailyLimit(76, 6, 80)).toBe(true);
  });
});
