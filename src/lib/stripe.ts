// Stripe integration — entirely optional. Every function here returns null
// / a clear "not configured" signal when STRIPE_SECRET_KEY isn't set, so the
// app keeps working in demo-billing mode (see src/app/api/billing/subscribe)
// out of the box, and upgrades to real payments the moment real keys are
// added — no code changes needed, only env vars.

import Stripe from "stripe";

let cached: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  cached = secretKey ? new Stripe(secretKey) : null;
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_ID_MONTHLY &&
      process.env.STRIPE_PRICE_ID_ANNUAL
  );
}

export function stripePriceId(plan: "MONTHLY" | "ANNUAL"): string {
  const id = plan === "MONTHLY" ? process.env.STRIPE_PRICE_ID_MONTHLY : process.env.STRIPE_PRICE_ID_ANNUAL;
  if (!id) throw new Error(`STRIPE_PRICE_ID_${plan} is not set`);
  return id;
}

export function appUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}
