"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, ListChecks, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { CEFR_LEVELS, CAMBRIDGE_EXAMS } from "@/lib/cambridge-exams";
import type { CEFRLevel } from "@/generated/prisma/client";

export function OnboardingChoice() {
  const router = useRouter();
  const [mode, setMode] = useState<"pick" | "level">("pick");
  const [selected, setSelected] = useState<CEFRLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmLevel() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/choose-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: selected }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo guardar tu nivel. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (mode === "level") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setMode("pick")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </button>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CEFR_LEVELS.map((level) => {
            const info = CAMBRIDGE_EXAMS[level];
            const isSelected = selected === level;
            return (
              <button
                key={level}
                onClick={() => setSelected(level)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface hover:border-primary/50"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{info.examName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{info.description}</p>
              </button>
            );
          })}
        </div>

        {error && <p className="text-center text-sm text-danger">{error}</p>}

        <button
          onClick={confirmLevel}
          disabled={!selected || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? "Guardando..." : selected ? `Empezar en ${selected}` : "Elige un nivel"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Link
        href="/placement-test"
        className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary"
      >
        <ClipboardCheck className="h-6 w-6 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">Hacer el test de nivel</p>
          <p className="mt-1 text-xs text-muted-foreground">
            40 preguntas (~20 min). La forma más precisa de empezar: te da un desglose
            real por destreza y un plan de estudio a medida.
          </p>
        </div>
        <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
          Empezar test <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>

      <button
        onClick={() => setMode("level")}
        className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-5 text-left transition-colors hover:border-primary"
      >
        <ListChecks className="h-6 w-6 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">Elegir mi nivel yo mismo</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Si ya sabes tu nivel (por ejemplo, de un curso o examen anterior), sáltate el
            test y empieza a practicar ahora mismo. Podrás cambiarlo luego en Ajustes.
          </p>
        </div>
        <span className="mt-auto flex items-center gap-1 text-xs font-medium text-primary">
          Elegir nivel <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </button>
    </div>
  );
}
