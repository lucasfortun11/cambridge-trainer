import {
  BookCheck,
  Clock,
  Flame,
  Target,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { getPlanStatus } from "@/lib/billing";
import { getDashboardData } from "@/lib/dashboard";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { ReadinessBar } from "@/components/dashboard/ReadinessBar";
import { SkillAccuracyChart } from "@/components/dashboard/SkillAccuracyChart";
import { WeeklyEvolutionChart } from "@/components/dashboard/WeeklyEvolutionChart";
import { MockExamChart } from "@/components/dashboard/MockExamChart";
import { ErrorFrequencyList } from "@/components/dashboard/ErrorFrequencyList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TodaysSessionList } from "@/components/dashboard/TodaysSessionList";
import { EmptyStateBanner } from "@/components/dashboard/EmptyStateBanner";
import { SkillLevelBreakdown } from "@/components/dashboard/SkillLevelBreakdown";
import { DailyGoalCard } from "@/components/dashboard/DailyGoalCard";

export default async function DashboardPage() {
  const user = await requireOnboardedUser();

  const data = await getDashboardData(user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Hola, {user.name ?? user.email.split("@")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Este es tu progreso hacia el {data.exam.examName}.
        </p>
      </div>

      <TrialBanner planStatus={getPlanStatus(user.profile)} />

      {!data.hasAnyData && <EmptyStateBanner />}

      {/* Top summary row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 lg:col-span-2">
          <ReadinessBar percent={data.examReadinessPercent} label={`${data.exam.shortName} Readiness`} />
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Ejercicios"
              value={String(data.exercisesCompleted)}
              icon={BookCheck}
            />
            <StatCard
              label="Min. estudiados"
              value={String(data.minutesStudied)}
              icon={Clock}
            />
            <StatCard
              label="Racha"
              value={`${data.currentStreak} días`}
              sublabel={`Récord: ${data.longestStreak}`}
              icon={Flame}
            />
            <StatCard
              label="Puntuación estimada"
              value={data.estimatedCambridgeScore ? String(data.estimatedCambridgeScore) : "—"}
              sublabel={`Escala interna ${data.exam.scoreMin}-${data.exam.scoreMax}`}
              icon={Target}
            />
          </div>
        </div>

        <div className="space-y-4">
          <DailyGoalCard completed={data.dailyGoal.completed} target={data.dailyGoal.target} />
          <QuickActions
            recommendation={data.recommendation}
            dailyMinutes={data.dailyMinutes}
          />
        </div>
      </div>

      {user.profile && <SkillLevelBreakdown profile={user.profile} />}

      {/* Skill breakdown + weekly evolution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-1 text-sm font-semibold text-foreground">
            Aciertos por destreza
          </h2>
          <p className="mb-2 text-xs text-muted-foreground">
            Porcentaje medio de aciertos en cada área
          </p>
          <SkillAccuracyChart data={data.skillAccuracy} />
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-1 text-sm font-semibold text-foreground">
            Evolución semanal
          </h2>
          <p className="mb-2 text-xs text-muted-foreground">
            Precisión media por semana (últimas 8 semanas con datos)
          </p>
          <WeeklyEvolutionChart data={data.weeklyEvolution} />
        </div>
      </div>

      {/* Errors + weak/strong points + mock exams */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Errores más frecuentes
          </h2>
          <ErrorFrequencyList data={data.topErrorCategories} />
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Puntos débiles y fuertes
          </h2>
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
                <TrendingDown className="h-3.5 w-3.5" /> A reforzar
              </p>
              {data.weakPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos suficientes todavía.</p>
              ) : (
                <ul className="space-y-1">
                  {data.weakPoints.map((s) => (
                    <li key={s.skill} className="text-sm text-foreground">
                      {s.label} — {s.accuracy}%
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-success">
                <TrendingUp className="h-3.5 w-3.5" /> Puntos fuertes
              </p>
              {data.strongPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos suficientes todavía.</p>
              ) : (
                <ul className="space-y-1">
                  {data.strongPoints.map((s) => (
                    <li key={s.skill} className="text-sm text-foreground">
                      {s.label} — {s.accuracy}%
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-1 text-sm font-semibold text-foreground">
            Evolución en simulacros
          </h2>
          <p className="mb-2 text-xs text-muted-foreground">
            Puntuación estimada ({data.exam.scoreMin}-{data.exam.scoreMax})
          </p>
          <MockExamChart data={data.mockExamEvolution} exam={data.exam} />
        </div>
      </div>

      {/* Today's session */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Qué deberías estudiar hoy</h2>
        <TodaysSessionList tasks={data.todaysSession} />
      </div>
    </div>
  );
}
