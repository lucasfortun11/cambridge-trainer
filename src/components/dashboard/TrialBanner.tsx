import Link from "next/link";
import { AlertTriangle, Gift, ArrowRight } from "lucide-react";
import type { PlanStatus } from "@/lib/billing";

export function TrialBanner({ planStatus }: { planStatus: PlanStatus }) {
  if (planStatus.isPaid) return null;
  if (planStatus.isTrialActive && planStatus.trialDaysLeft > 2) return null;

  const expired = !planStatus.isTrialActive;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
        expired ? "border-danger/30 bg-danger-bg/40" : "border-warning/30 bg-warning-bg/40"
      }`}
    >
      <div className="flex items-start gap-3">
        {expired ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        ) : (
          <Gift className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">
            {expired
              ? "Tu prueba gratuita ha terminado"
              : `Te quedan ${planStatus.trialDaysLeft} día${planStatus.trialDaysLeft === 1 ? "" : "s"} de prueba gratuita`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {expired
              ? "Elige un plan para seguir usando la app sin interrupciones."
              : "Elige un plan cuando quieras para no perder tu progreso."}
          </p>
        </div>
      </div>
      <Link
        href="/pricing"
        className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
      >
        Ver planes <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
