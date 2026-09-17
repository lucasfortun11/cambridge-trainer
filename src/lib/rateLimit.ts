// Lightweight in-memory rate limiter for public, unauthenticated endpoints
// (login, register) — a first line of defense against credential-stuffing
// and signup spam once this is reachable from the open internet. Per-
// instance only (resets on cold start, isn't shared across serverless
// instances) — good enough for a single small deployment; swap for a
// durable store (e.g. Upstash Redis) if it needs to hold under sustained
// distributed abuse.

const MAX_BUCKETS = 5000;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    if (buckets.size >= MAX_BUCKETS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey !== undefined) buckets.delete(oldestKey);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

/** Best-effort client IP from proxy headers (Vercel/most hosts set x-forwarded-for). */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
