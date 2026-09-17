import { CheckCircle2, CreditCard } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPlanStatus, PLANS } from "@/lib/billing";
import { isStripeConfigured } from "@/lib/stripe";
import { PricingPlans } from "@/components/billing/PricingPlans";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { success } = await searchParams;
  const status = getPlanStatus(user.profile);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="flex items-center justify-center gap-2 text-xl font-semibold text-foreground">
          <CreditCard className="h-5 w-5 text-primary" />
          Planes y precios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {status.isPaid
            ? `Tienes el plan ${status.tier === "ANNUAL" ? "Anual" : "Mensual"} activo.`
            : status.isTrialActive
              ? `Te quedan ${status.trialDaysLeft} día${status.trialDaysLeft === 1 ? "" : "s"} de prueba gratuita.`
              : "Tu prueba gratuita ha terminado. Elige un plan para seguir usando la app."}
        </p>
      </div>

      {success === "1" && (
        <div className="mx-auto flex max-w-md items-center gap-2 rounded-lg bg-success-bg px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          ¡Pago completado! Si tu plan tarda unos segundos en reflejarse, recarga la página.
        </div>
      )}

      <PricingPlans
        plans={PLANS}
        currentTier={status.tier}
        isPaid={status.isPaid}
        hasRealSubscription={isStripeConfigured() && Boolean(user.profile?.stripeCustomerId)}
      />
    </div>
  );
}
