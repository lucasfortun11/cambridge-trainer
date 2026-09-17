"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { PLACEMENT_TEST } from "@/content/placement-test";

const SKILL_LABELS: Record<string, string> = {
  GRAMMAR: "Grammar",
  VOCABULARY: "Vocabulary",
  READING: "Reading",
  USE_OF_ENGLISH: "Use of English",
  LISTENING: "Listening",
};

type SkillSummary = { skill: string; label: string; percent: number };
type ApiResult = {
  summary: SkillSummary[];
  overallPercent: number;
  overallLevel: string;
  overallSublevel: string;
  estimatedCambridgeScore: number;
  weakestSkills: string[];
};

export function PlacementTestRunner() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  const question = PLACEMENT_TEST[index];
  const isLast = index === PLACEMENT_TEST.length - 1;
  const selected = answers[question?.id];

  function selectAnswer(option: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  }

  async function next() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/placement-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, selected]) => ({ questionId, selected })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <PlacementResults result={result} onFinish={() => { router.push("/dashboard"); router.refresh(); }} />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{SKILL_LABELS[question.skill]}</span>
          <span>{index + 1} / {PLACEMENT_TEST.length}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index + 1) / PLACEMENT_TEST.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        {question.passage && (
          <p className="mb-4 rounded-lg bg-surface-muted p-3 text-sm text-muted-foreground">
            {question.passage}
          </p>
        )}
        <p className="mb-4 text-base font-medium text-foreground">{question.prompt}</p>

        <div className="space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => selectAnswer(opt)}
              className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                selected === opt
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-foreground hover:border-primary/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <button
          onClick={next}
          disabled={!selected || submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Calculando resultados..." : isLast ? "Finalizar test" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}

function PlacementResults({ result, onFinish }: { result: ApiResult; onFinish: () => void }) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Tus resultados</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Nivel estimado global:{" "}
          <span className="font-semibold text-primary">
            {result.overallLevel} {result.overallSublevel === "LOW" ? "bajo" : result.overallSublevel === "HIGH" ? "alto" : "medio"}
          </span>{" "}
          — Puntuación Cambridge estimada: <span className="font-semibold">{result.estimatedCambridgeScore}</span>
        </p>

        <div className="mb-6 space-y-3">
          {result.summary.map((s) => (
            <div key={s.skill}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-foreground">{SKILL_LABELS[s.skill] ?? s.skill}</span>
                <span className="font-medium text-foreground">{s.label}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${s.percent}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-lg bg-surface-muted p-4 text-sm">
          <p className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
            <XCircle className="h-4 w-4 text-danger" /> Puntos a reforzar
          </p>
          <p className="text-muted-foreground">
            {result.weakestSkills.map((s) => SKILL_LABELS[s] ?? s).join(", ")} — hemos creado un plan
            de estudio priorizando estas áreas.
          </p>
          <p className="mt-3 flex items-center gap-1.5 font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" /> Siguiente paso
          </p>
          <p className="text-muted-foreground">
            Revisa tu plan en <Link href="/study-plan" className="text-primary hover:underline">Plan de estudio</Link> o
            empieza directamente con tu sesión de hoy desde el Dashboard.
          </p>
        </div>

        <button
          onClick={onFinish}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Ir al Dashboard
        </button>
      </div>
    </div>
  );
}
