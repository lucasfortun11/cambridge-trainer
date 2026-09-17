import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingChoice } from "@/components/onboarding/OnboardingChoice";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.profile?.onboardingCompleted) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">¿Cómo quieres empezar?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Puedes hacer el test de nivel para una estimación precisa, o elegir tu nivel tú
          mismo y empezar a practicar ahora mismo.
        </p>
      </div>
      <OnboardingChoice />
    </div>
  );
}
