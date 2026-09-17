"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";

type ExerciseStatus = { id: string; title: string; type: string; done: boolean };

type Status = {
  exam: { id: string; startedAt: string; completedAt: string | null };
  rueExercises: ExerciseStatus[];
  listeningExercises: ExerciseStatus[];
  writingDone: boolean;
  speakingDoneCount: number;
  speakingTotal: number;
  writingPromptSlug: string;
  speakingPromptSlugs: string[];
};

type CompletedExam = {
  readingUseOfEnglishScore: number | null;
  listeningScore: number | null;
  writingScore: number | null;
  speakingScore: number | null;
  overallScore: number | null;
  estimatedGrade: string | null;
};

function useElapsed(startedAt: string) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`;
}

export function MockExamRunner({ examId }: { examId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [result, setResult] = useState<CompletedExam | null>(null);

  useEffect(() => {
    fetch(`/api/mock-exam/${examId}/status`)
      .then((r) => r.json())
      .then(setStatus);
  }, [examId]);

  const elapsed = useElapsed(status?.exam.startedAt ?? new Date().toISOString());

  async function finish() {
    setFinishing(true);
    try {
      const res = await fetch(`/api/mock-exam/${examId}/complete`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setResult(data.exam);
      }
    } finally {
      setFinishing(false);
    }
  }

  if (!status) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="rounded-xl border border-primary/30 bg-surface-muted p-6 text-center">
        <p className="text-3xl font-semibold text-foreground">{result.overallScore}</p>
        <p className="text-sm text-muted-foreground">{result.estimatedGrade}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
          <ScoreTile label="Reading & UoE" value={result.readingUseOfEnglishScore} />
          <ScoreTile label="Writing" value={result.writingScore} />
          <ScoreTile label="Listening" value={result.listeningScore} />
          <ScoreTile label="Speaking" value={result.speakingScore} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Estimación interna de la aplicación, no una puntuación oficial de Cambridge.
        </p>
        <Link
          href="/mock-exam"
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Volver a Mock Exam
        </Link>
      </div>
    );
  }

  const rueDoneCount = status.rueExercises.filter((e) => e.done).length;
  const listeningDoneCount = status.listeningExercises.filter((e) => e.done).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface p-3 text-sm text-foreground">
        <Clock className="h-4 w-4 text-primary" />
        Tiempo transcurrido: {elapsed}
      </div>

      <Section title={`Reading & Use of English (${rueDoneCount}/${status.rueExercises.length})`}>
        {status.rueExercises.map((e) => (
          <ExerciseRow key={e.id} href={`/reading/${e.id}`} title={e.title} done={e.done} />
        ))}
      </Section>

      <Section title="Writing (1 tarea)">
        <ExerciseRow
          href={`/writing/${status.writingPromptSlug}`}
          title="Completa tu tarea de Writing"
          done={status.writingDone}
        />
      </Section>

      <Section title={`Listening (${listeningDoneCount}/${status.listeningExercises.length})`}>
        {status.listeningExercises.map((e) => (
          <ExerciseRow key={e.id} href={`/listening/${e.id}`} title={e.title} done={e.done} />
        ))}
      </Section>

      <Section title={`Speaking (${status.speakingDoneCount}/${status.speakingTotal})`}>
        {status.speakingPromptSlugs.map((slug, i) => (
          <ExerciseRow
            key={slug}
            href={`/speaking/${slug}`}
            title={`Parte ${i + 1}`}
            done={status.speakingDoneCount > i}
          />
        ))}
      </Section>

      <button
        onClick={finish}
        disabled={finishing}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {finishing ? "Calculando resultados..." : "Finalizar y calcular resultados"}
      </button>
      <button
        onClick={() => router.refresh()}
        className="w-full text-center text-xs text-muted-foreground hover:text-primary"
      >
        Actualizar progreso
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ExerciseRow({ href, title, done }: { href: string; title: string; done: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-surface-muted"
    >
      <span className="text-foreground">{title}</span>
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-success" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground" />
      )}
    </Link>
  );
}

function ScoreTile({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg bg-surface p-2 text-center">
      <p className="text-lg font-semibold text-foreground">{value ?? "—"}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
