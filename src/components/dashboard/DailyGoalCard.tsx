import { Target, CheckCircle2 } from "lucide-react";

export function DailyGoalCard({ completed, target }: { completed: number; target: number }) {
  const done = completed >= target;
  const percent = Math.round((completed / target) * 100);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Target className="h-4 w-4 text-primary" />
          Objetivo diario
        </span>
        {done && <CheckCircle2 className="h-4 w-4 text-success" />}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {completed} / {target} actividades hoy
      </p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full transition-all ${done ? "bg-success" : "bg-primary"}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      {done && <p className="mt-1.5 text-xs font-medium text-success">¡Objetivo completado!</p>}
    </div>
  );
}
