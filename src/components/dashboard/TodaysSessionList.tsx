import { Clock } from "lucide-react";

type TodaysSessionListProps = {
  tasks: { label: string; minutes: number }[];
};

export function TodaysSessionList({ tasks }: TodaysSessionListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Completa algunos ejercicios para que podamos personalizar tu sesión diaria.
      </p>
    );
  }

  const total = tasks.reduce((sum, t) => sum + t.minutes, 0);

  return (
    <div>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li
            key={t.label}
            className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-sm"
          >
            <span className="text-foreground">{t.label}</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t.minutes} min
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Total: {total} minutos</p>
    </div>
  );
}
