import { describe, expect, it } from "vitest";
import { isRateLimited, clientIp } from "./rateLimit";

describe("isRateLimited", () => {
  it("allows requests up to the limit, then blocks", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(isRateLimited(key, 3, 60_000)).toBe(false);
    }
    expect(isRateLimited(key, 3, 60_000)).toBe(true);
  });

  it("tracks different keys independently", () => {
    const a = `test-a-${Math.random()}`;
    const b = `test-b-${Math.random()}`;
    expect(isRateLimited(a, 1, 60_000)).toBe(false);
    expect(isRateLimited(b, 1, 60_000)).toBe(false);
    expect(isRateLimited(a, 1, 60_000)).toBe(true);
    expect(isRateLimited(b, 1, 60_000)).toBe(true);
  });

  it("resets once the window has passed", () => {
    const key = `test-window-${Math.random()}`;
    expect(isRateLimited(key, 1, 10)).toBe(false);
    expect(isRateLimited(key, 1, 10)).toBe(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(isRateLimited(key, 1, 10)).toBe(false);
        resolve(undefined);
      }, 20);
    });
  });
});

describe("clientIp", () => {
  it("prefers x-forwarded-for, taking the first hop", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip, then unknown", () => {
    const withRealIp = new Request("http://localhost", { headers: { "x-real-ip": "9.9.9.9" } });
    expect(clientIp(withRealIp)).toBe("9.9.9.9");

    const withNeither = new Request("http://localhost");
    expect(clientIp(withNeither)).toBe("unknown");
  });
});
