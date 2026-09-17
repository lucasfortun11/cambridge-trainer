"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import type { PlanDefinition } from "@/lib/billing";

type Props = {
  plans: PlanDefinition[];
  currentTier: "TRIAL" | "MONTHLY" | "ANNUAL";
  isPaid: boolean;
  hasRealSubscription: boolean;
};

export function PricingPlans({ plans, currentTier, isPaid, hasRealSubscription }: Props) {
  const router = useRouter();
  const [checkoutPlan, setCheckoutPlan] = useState<PlanDefinition | null>(null);
  const [startingCheckout, setStartingCheckout] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function choosePlan(plan: PlanDefinition) {
    setStartingCheckout(plan.id);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "No se pudo iniciar el pago. Inténtalo de nuevo.");
        return;
      }
      if (data?.url) {
        // Real Stripe Checkout — the browser leaves this page; card details
        // are entered on Stripe's own hosted page, never on ours.
        window.location.assign(data.url);
        return;
      }
      // Stripe isn't configured — fall back to the demo checkout panel below.
      setCheckoutPlan(plan);
    } finally {
      setStartingCheckout(null);
    }
  }

  async function manageOrCancel() {
    if (hasRealSubscription) {
      setCancelling(true);
      try {
        const res = await fetch("/api/billing/portal", { method: "POST" });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.url) {
          window.location.assign(data.url);
        } else {
          setCancelling(false);
        }
      } catch {
        setCancelling(false);
      }
      return;
    }
    await cancelSubscription();
  }

  async function confirmSubscribe() {
    if (!checkoutPlan) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: checkoutPlan.id }),
      });
      if (res.ok) {
        setSuccess(true);
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo activar el plan. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function cancelSubscription() {
    if (!confirm("¿Cancelar tu suscripción? Perderás el acceso a las funciones de pago.")) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setCancelling(false);
    }
  }

  if (success && checkoutPlan) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-success/30 bg-success-bg/40 p-6 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-success" />
        <p className="mt-2 text-sm font-semibold text-foreground">
          ¡Listo! Ya tienes el plan {checkoutPlan.name}.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Esto es una activación simulada — no se ha realizado ningún cargo real.
        </p>
      </div>
    );
  }

  if (checkoutPlan) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <button
          onClick={() => setCheckoutPlan(null)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a los planes
        </button>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Plan {checkoutPlan.name}</p>
              <p className="text-xs text-muted-foreground">{checkoutPlan.description}</p>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {checkoutPlan.priceLabel}
              <span className="text-xs font-normal text-muted-foreground">{checkoutPlan.period}</span>
            </p>
          </div>

          <div className="mb-3 flex items-center gap-2 rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Pago simulado — modo demo, no se conecta a ninguna pasarela real ni se procesa
            ningún cargo.
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Número de tarjeta (demo)
              </label>
              <input
                disabled
                placeholder="4242 4242 4242 4242"
                className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Caducidad
                </label>
                <input
                  disabled
                  placeholder="12/30"
                  className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">CVC</label>
                <input
                  disabled
                  placeholder="123"
                  className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {error && <p className="mt-3 text-center text-xs text-danger">{error}</p>}

          <button
            onClick={confirmSubscribe}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Activando..." : `Confirmar suscripción — ${checkoutPlan.priceLabel}${checkoutPlan.period}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = isPaid && currentTier === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border p-5 ${
                plan.badge ? "border-primary bg-primary/5" : "border-border bg-surface"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                  {plan.badge}
                </span>
              )}
              <p className="text-sm font-semibold text-foreground">{plan.name}</p>
              <p className="mt-2">
                <span className="text-2xl font-bold text-foreground">{plan.priceLabel}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </p>
              {plan.perMonthLabel && (
                <p className="mt-0.5 text-xs text-muted-foreground">{plan.perMonthLabel}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{plan.description}</p>

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => choosePlan(plan)}
                disabled={isCurrent || startingCheckout === plan.id}
                className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                {startingCheckout === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCurrent ? "Tu plan actual" : startingCheckout === plan.id ? "Redirigiendo..." : `Elegir ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {isPaid && (
        <div className="text-center">
          <button
            onClick={manageOrCancel}
            disabled={cancelling}
            className="text-xs text-muted-foreground underline hover:text-danger disabled:opacity-50"
          >
            {cancelling
              ? "Un momento..."
              : hasRealSubscription
                ? "Gestionar o cancelar suscripción"
                : "Cancelar suscripción"}
          </button>
        </div>
      )}
    </div>
  );
}
