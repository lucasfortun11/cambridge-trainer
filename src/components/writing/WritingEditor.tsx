"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Send } from "lucide-react";
import type { WritingPrompt } from "@/content/writing-prompts";
import { EstimatedLevelBanner } from "@/components/shared/EstimatedLevelBanner";
import type { CEFRLevel, Sublevel } from "@prisma/client";

type WritingFeedback = {
  scoreContent: number;
  scoreCommunicativeAchievement: number;
  scoreOrganisation: number;
  scoreLanguage: number;
  overallScore: number;
  grammarErrors: { original: string; correction: string; explanation: string }[];
  vocabularyImprovements: { original: string; suggestion: string; reason: string }[];
  structureIssues: string[];
  cohesionIssues: string[];
  register: string;
  recommendations: string[];
  improvedVersion: string;
  estimatedLevel: CEFRLevel;
  estimatedSublevel: Sublevel;
};

export function WritingEditor({ prompt, targetLevel }: { prompt: WritingPrompt; targetLevel: CEFRLevel }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: prompt.type,
          prompt: prompt.brief,
          text,
          minWords: prompt.minWords,
          maxWords: prompt.maxWords,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (feedback) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-primary/30 bg-surface-muted p-5 text-center">
          <p className="text-2xl font-semibold text-foreground">{feedback.overallScore} / 5</p>
          <p className="text-sm text-muted-foreground">Puntuación estimada global</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
            <ScoreTile label="Content" value={feedback.scoreContent} />
            <ScoreTile label="Comm. Achievement" value={feedback.scoreCommunicativeAchievement} />
            <ScoreTile label="Organisation" value={feedback.scoreOrganisation} />
            <ScoreTile label="Language" value={feedback.scoreLanguage} />
          </div>
        </div>

        <EstimatedLevelBanner
          targetLevel={targetLevel}
          estimatedLevel={feedback.estimatedLevel}
          estimatedSublevel={feedback.estimatedSublevel}
        />

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="mb-2 text-sm font-semibold text-foreground">Registro</p>
          <p className="text-sm text-muted-foreground">{feedback.register}</p>
        </div>

        {feedback.vocabularyImprovements.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">Vocabulario mejorable</p>
            <div className="space-y-3">
              {feedback.vocabularyImprovements.map((v, i) => (
                <p key={i} className="text-sm">
                  Has utilizado <span className="font-medium text-danger">&ldquo;{v.original}&rdquo;</span>. En
                  este contexto sería más natural utilizar{" "}
                  <span className="font-medium text-success">&ldquo;{v.suggestion}&rdquo;</span> porque {v.reason}
                </p>
              ))}
            </div>
          </div>
        )}

        {feedback.grammarErrors.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">Errores gramaticales/ortográficos</p>
            <div className="space-y-2">
              {feedback.grammarErrors.map((g, i) => (
                <p key={i} className="text-sm">
                  <span className="text-danger line-through">{g.original}</span> →{" "}
                  <span className="text-success">{g.correction}</span>
                  <span className="block text-xs text-muted-foreground">{g.explanation}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {(feedback.cohesionIssues.length > 0 || feedback.structureIssues.length > 0) && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">Cohesión y estructura</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[...feedback.cohesionIssues, ...feedback.structureIssues].map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Recomendaciones</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {feedback.recommendations.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Comparar con versión mejorada</p>
            <button
              onClick={() => setShowComparison((s) => !s)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {showComparison ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {showComparison && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Tu texto</p>
                <p className="whitespace-pre-line rounded-lg bg-surface-muted p-3 text-sm text-foreground">{text}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Versión mejorada</p>
                <p className="whitespace-pre-line rounded-lg bg-success-bg p-3 text-sm text-foreground">
                  {feedback.improvedVersion}
                </p>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/writing"
          className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Volver a Writing
        </Link>
      </div>
    );
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={16}
        placeholder="Escribe tu respuesta aquí..."
        className="w-full rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {wordCount} palabras (recomendado: {prompt.minWords}-{prompt.maxWords})
        </span>
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitting || wordCount < Math.min(20, prompt.minWords)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? "Analizando..." : "Enviar para corrección"}
      </button>
    </div>
  );
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface p-2 text-center">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
