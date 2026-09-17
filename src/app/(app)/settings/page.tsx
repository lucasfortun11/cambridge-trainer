import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings as SettingsIcon, CreditCard, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getPlanStatus } from "@/lib/billing";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const status = getPlanStatus(user.profile);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <SettingsIcon className="h-5 w-5 text-primary" />
          Ajustes
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tu plan de estudio, tu cuenta y tu privacidad.
        </p>
      </div>

      <Link
        href="/pricing"
        className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
      >
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Plan y facturación</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {status.isPaid
                ? `Plan ${status.tier === "ANNUAL" ? "Anual" : "Mensual"} activo`
                : status.isTrialActive
                  ? `Prueba gratuita — quedan ${status.trialDaysLeft} día${status.trialDaysLeft === 1 ? "" : "s"}`
                  : "Prueba gratuita caducada — sin plan activo"}
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Link>

      <SettingsForm
        email={user.email}
        name={user.name}
        targetExamDate={
          user.profile?.targetExamDate
            ? user.profile.targetExamDate.toISOString().slice(0, 10)
            : null
        }
        dailyMinutesAvailable={user.profile?.dailyMinutesAvailable ?? null}
        studyDaysPerWeek={user.profile?.studyDaysPerWeek ?? null}
        targetLevel={user.profile?.targetLevel ?? "C1"}
      />
    </div>
  );
}
