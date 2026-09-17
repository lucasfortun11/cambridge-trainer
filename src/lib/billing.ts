// Billing/plan status — pure derivation from UserProfile fields, no writes
// here. No real payment processor is wired up yet: POST /api/billing/subscribe
// just flips these fields directly. Swapping in a real gateway (Stripe...)
// later means replacing that route's body with a real checkout session and
// webhook handler; nothing that reads getPlanStatus() needs to change.

import type { PlanTier } from "@/generated/prisma/client";

const TRIAL_DAYS = 7;

export type PlanStatus = {
  tier: PlanTier;
  isPaid: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isActive: boolean;
  trialDaysLeft: number;
};

type ProfileBillingFields = {
  planTier: PlanTier;
  trialEndsAt: Date | null;
  subscriptionCancelledAt: Date | null;
} | null | undefined;

export function getPlanStatus(profile: ProfileBillingFields): PlanStatus {
  const tier = profile?.planTier ?? "TRIAL";
  const isPaid = (tier === "MONTHLY" || tier === "ANNUAL") && !profile?.subscriptionCancelledAt;

  if (isPaid) {
    return { tier, isPaid: true, isTrialActive: false, isTrialExpired: false, isActive: true, trialDaysLeft: 0 };
  }

  const trialEndsAt = profile?.trialEndsAt ?? null;
  const isTrialActive = !!trialEndsAt && trialEndsAt.getTime() > Date.now();
  const trialDaysLeft = isTrialActive
    ? Math.max(1, Math.ceil((trialEndsAt!.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  return {
    tier: "TRIAL",
    isPaid: false,
    isTrialActive,
    isTrialExpired: !!trialEndsAt && !isTrialActive,
    isActive: isTrialActive,
    trialDaysLeft,
  };
}

export function trialEndDate(from: Date = new Date()): Date {
  const end = new Date(from);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
}

export type PlanDefinition = {
  id: "MONTHLY" | "ANNUAL";
  name: string;
  priceLabel: string;
  period: string;
  priceCents: number;
  perMonthLabel?: string;
  badge?: string;
  description: string;
  features: string[];
};

// Prices are placeholders picked to be a reasonable, typical SaaS range for
// this kind of tool — meant to be reviewed and changed by the user before
// any real payment processor is connected.
export const PLANS: PlanDefinition[] = [
  {
    id: "MONTHLY",
    name: "Mensual",
    priceLabel: "9,99 €",
    period: "/mes",
    priceCents: 999,
    description: "Flexible, cancela cuando quieras.",
    features: [
      "Acceso ilimitado a las 5 destrezas (Reading, Writing, Listening, Speaking, Use of English)",
      "Corrección de Writing y Speaking con IA",
      "Generación ilimitada de ejercicios con IA (dentro del uso razonable diario)",
      "Mi Clase: sube tu propio material de profesor/academia",
      "Mock Exams, Study Plan adaptativo y seguimiento de errores",
    ],
  },
  {
    id: "ANNUAL",
    name: "Anual",
    priceLabel: "79,99 €",
    period: "/año",
    priceCents: 7999,
    perMonthLabel: "Equivale a 6,67 €/mes",
    badge: "Ahorra 33%",
    description: "El mejor precio si vas en serio con el examen.",
    features: [
      "Todo lo del plan mensual",
      "2 meses gratis frente al plan mensual",
      "Precio bloqueado durante 12 meses",
    ],
  },
];

export function planById(id: "MONTHLY" | "ANNUAL"): PlanDefinition {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}
