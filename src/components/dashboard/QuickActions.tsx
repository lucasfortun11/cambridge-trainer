"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Sparkles, Loader2 } from "lucide-react";

type QuickActionsProps = {
  recommendation: string;
  dailyMinutes: number;
};

const DURATIONS = [15, 30, 60, 90];

export function QuickActions({ recommendation, dailyMinutes }: QuickActionsProps) {
  const router = useRouter();
  const [loadingMinutes, setLoadingMinutes] = useState<number | null>(null);

  async function startSession(minutes: number) {
    setLoadingMinutes(minutes);
    try {
      const res = await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes }),
      });
      if (!res.ok) return;
      const data = await res.json();
      router.push(`/study?session=${data.id}`);
    } finally {
      setLoadingMinutes(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">¿No sabes qué estudiar?</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{recommendation}</p>

      <button
        onClick={() => startSession(dailyMinutes)}
        disabled={loadingMinutes !== null}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {loadingMinutes === dailyMinutes ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Generar sesión de hoy ({dailyMinutes} min)
      </button>

      <p className="mb-2 text-xs font-medium text-muted-foreground">
        O elige cuánto tiempo tienes:
      </p>
      <div className="grid grid-cols-4 gap-2">
        {DURATIONS.map((m) => (
          <button
            key={m}
            onClick={() => startSession(m)}
            disabled={loadingMinutes !== null}
            className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background px-2 py-2 text-xs font-medium text-foreground hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {loadingMinutes === m ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            {m} min
          </button>
        ))}
      </div>
    </div>
  );
}
