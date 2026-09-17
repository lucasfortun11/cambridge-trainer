import { redirect } from "next/navigation";
import { TrendingUp, Compass } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { getRealLevelHistory } from "@/lib/level-history";
import { SkillAccuracyChart } from "@/components/dashboard/SkillAccuracyChart";
import { WeeklyEvolutionChart } from "@/components/dashboard/WeeklyEvolutionChart";
import { MockExamChart } from "@/components/dashboard/MockExamChart";
import { ReadinessBar } from "@/components/dashboard/ReadinessBar";
import { RealLevelChart } from "@/components/dashboard/RealLevelChart";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDashboardData(user.id);
  const levelHistory = await getRealLevelHistory(user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <TrendingUp className="h-5 w-5 text-primary" />
          Progreso
        </h1>
        <p className="text-sm text-muted-foreground">
          Vista detallada de tu evolución hacia el {data.exam.examName}.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <ReadinessBar percent={data.examReadinessPercent} label={`${data.exam.shortName} Readiness`} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Compass className="h-4 w-4 text-primary" />
          Tu nivel real en el tiempo
        </h2>
        <p className="mb-2 text-xs text-muted-foreground">
          A diferencia del % de arriba (cuánto te acercas a tu objetivo), esto es el nivel CEFR
          que tu Writing y Speaking demuestran de verdad en cada intento — independiente del
          examen al que apuntas.
        </p>
        <RealLevelChart data={levelHistory} targetLevel={data.exam.level} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Evolución semanal</h2>
        <WeeklyEvolutionChart data={data.weeklyEvolution} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Aciertos por destreza</h2>
        <SkillAccuracyChart data={data.skillAccuracy} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Simulacros de examen</h2>
        <MockExamChart data={data.mockExamEvolution} exam={data.exam} />
      </div>
    </div>
  );
}
