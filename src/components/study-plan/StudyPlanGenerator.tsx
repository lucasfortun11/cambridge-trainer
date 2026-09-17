"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

export function StudyPlanGenerator({
  initialExamDate,
  initialDailyMinutes,
  initialDaysPerWeek,
}: {
  initialExamDate: string | null;
  initialDailyMinutes: number;
  initialDaysPerWeek: number;
}) {
  const router = useRouter();
  const [examDate, setExamDate] = useState(initialExamDate ?? "");
  const [dailyMinutes, setDailyMinutes] = useState(initialDailyMinutes);
  const [daysPerWeek, setDaysPerWeek] = useState(initialDaysPerWeek);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      await fetch("/api/study-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examDate: examDate || null, dailyMinutes, daysPerWeek }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="mb-4 text-sm font-semibold text-foreground">Genera o actualiza tu plan</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Fecha del examen</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Minutos al día</label>
          <input
            type="number"
            min={5}
            max={300}
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Días por semana</label>
          <input
            type="number"
            min={1}
            max={7}
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <button
        onClick={generate}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generar plan de estudio
      </button>
    </div>
  );
}
