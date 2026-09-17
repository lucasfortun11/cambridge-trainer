type ReadinessBarProps = {
  percent: number;
  label?: string;
};

export function ReadinessBar({ percent, label = "Exam Readiness" }: ReadinessBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-semibold text-primary">{clamped}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Estimación interna de la aplicación, no una puntuación oficial de Cambridge.
      </p>
    </div>
  );
}
