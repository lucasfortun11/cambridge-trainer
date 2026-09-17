"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Headphones, Volume2, Square } from "lucide-react";
import type { PlayerExercise } from "@/lib/exercises-shared";
import { getSharedOptionsFromContent } from "@/lib/exercises-shared";
import { bestVoicePool, getEnglishVoices, pickVoice, splitDialogue } from "@/lib/ttsVoices";

type GradedQuestion = {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  distractorExplanations: Record<string, string> | null;
};

type SubmitResult = {
  graded: GradedQuestion[];
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  // Omitted by "Mi Clase" submissions, which award no XP/achievements.
  xpEarned?: number;
  newAchievements?: string[];
};

type ContentPassage = { label: string; name?: string; text: string };

export function ExercisePlayer({
  exercise,
  backHref,
  submitUrl,
}: {
  exercise: PlayerExercise;
  backHref: string;
  submitUrl?: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [startTime] = useState(() => Date.now());
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    getEnglishVoices().then(setVoices);
  }, []);

  const MAX_PLAYS = 3;
  // Real Listening papers are audio-only — showing the transcript up front
  // would let the student just read the answers instead of listening for
  // them, so it stays hidden until after grading.
  const isBlindListening = exercise.skill === "LISTENING" && !result;

  function speak(id: string, text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    if (isBlindListening && (playCounts[id] ?? 0) >= MAX_PLAYS) return;
    window.speechSynthesis.cancel();

    // Dialogue-style transcripts ("Emma: ...", "Jack: ...") get a distinct,
    // consistent voice per speaker instead of the browser's single default
    // voice reading both parts identically; a single-speaker passage still
    // gets its own voice (varying exercise to exercise) instead of always
    // the same default.
    const segments = splitDialogue(text);
    const pool = bestVoicePool(voices);
    const fallbackVoice = pickVoice(pool, id);
    const speakerVoices = new Map<string, SpeechSynthesisVoice | undefined>();

    const utterances = segments.map(({ speaker, line }) => {
      const utterance = new SpeechSynthesisUtterance(line);
      utterance.lang = "en-US";
      if (speaker) {
        if (!speakerVoices.has(speaker)) {
          speakerVoices.set(speaker, pickVoice(pool, `${id}:${speaker}`));
        }
        const voice = speakerVoices.get(speaker);
        if (voice) utterance.voice = voice;
      } else if (fallbackVoice) {
        utterance.voice = fallbackVoice;
      }
      utterance.onerror = () => setSpeakingId(null);
      return utterance;
    });
    utterances[utterances.length - 1].onend = () => setSpeakingId(null);

    setSpeakingId(id);
    if (isBlindListening) {
      setPlayCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    }
    // speechSynthesis queues utterances and plays them in order, so a
    // multi-line dialogue plays as one continuous sequence.
    utterances.forEach((u) => window.speechSynthesis.speak(u));
  }

  const sharedOptions = useMemo(() => getSharedOptionsFromContent(exercise.content), [exercise.content]);

  const gradedByQuestion = useMemo(() => {
    if (!result) return null;
    return new Map(result.graded.map((g) => [g.questionId, g]));
  }, [result]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(submitUrl ?? `/api/exercises/${exercise.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, userAnswer]) => ({ questionId, userAnswer })),
          timeSpentSeconds: Math.round((Date.now() - startTime) / 1000),
        }),
      });
      if (res.ok) {
        setResult(await res.json());
      }
    } finally {
      setSubmitting(false);
    }
  }

  const passage = typeof exercise.content.passage === "string" ? exercise.content.passage : null;
  const transcript = typeof exercise.content.transcript === "string" ? exercise.content.transcript : null;
  const transcripts = Array.isArray(exercise.content.transcripts)
    ? (exercise.content.transcripts as ContentPassage[])
    : null;
  const passages = Array.isArray(exercise.content.passages)
    ? (exercise.content.passages as ContentPassage[])
    : null;
  const sentences = exercise.content.sentences as Record<string, string> | undefined;
  const optionsBank = exercise.content.options as Record<string, string> | undefined;
  const audioPending = Boolean(exercise.content.audioPending);

  const answeredCount = Object.values(answers).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={backHref} className="text-xs text-muted-foreground hover:text-primary">
          ← Volver
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{exercise.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{exercise.instructions}</p>
      </div>

      {audioPending && (
        <div className="flex items-center gap-2 rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
          <Headphones className="h-4 w-4 shrink-0" />
          {isBlindListening
            ? `Sin archivo de audio propio todavía — usa el botón "Escuchar" (voz sintética del navegador). Puedes reproducirlo hasta ${MAX_PLAYS} veces, como en el examen real; la transcripción se revela al corregir.`
            : 'Sin archivo de audio propio todavía — usa el botón "Escuchar" (voz sintética del navegador) o lee la transcripción.'}
        </div>
      )}

      {passage && (
        <div className="whitespace-pre-line rounded-xl border border-border bg-surface p-5 text-sm leading-relaxed text-foreground">
          {passage}
        </div>
      )}

      {transcript && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <button
            onClick={() => speak("transcript", transcript)}
            disabled={isBlindListening && (playCounts["transcript"] ?? 0) >= MAX_PLAYS && speakingId !== "transcript"}
            className="mb-3 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {speakingId === "transcript" ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {speakingId === "transcript" ? "Detener" : "Escuchar"}
            {isBlindListening && ` (${playCounts["transcript"] ?? 0}/${MAX_PLAYS})`}
          </button>
          {isBlindListening ? (
            <p className="text-sm italic text-muted-foreground">
              Transcripción oculta — escucha el audio para responder. Se mostrará al corregir.
            </p>
          ) : (
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{transcript}</p>
          )}
        </div>
      )}

      {transcripts && (
        <div className="space-y-3">
          {transcripts.map((t) => (
            <div key={t.label} className="rounded-xl border border-border bg-surface p-4 text-sm">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-semibold text-foreground">{t.label}</p>
                <button
                  onClick={() => speak(t.label, t.text)}
                  disabled={isBlindListening && (playCounts[t.label] ?? 0) >= MAX_PLAYS && speakingId !== t.label}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {speakingId === t.label ? (
                    <Square className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                  {speakingId === t.label ? "Detener" : "Escuchar"}
                  {isBlindListening && ` (${playCounts[t.label] ?? 0}/${MAX_PLAYS})`}
                </button>
              </div>
              {isBlindListening ? (
                <p className="italic text-muted-foreground">
                  Transcripción oculta — escucha el audio para responder. Se mostrará al corregir.
                </p>
              ) : (
                <p className="text-muted-foreground">{t.text}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {passages && (
        <div className="space-y-3">
          {passages.map((p) => (
            <div key={p.label} className="rounded-xl border border-border bg-surface p-4 text-sm">
              <p className="mb-1 font-semibold text-foreground">
                {p.label}
                {p.name ? ` — ${p.name}` : ""}
              </p>
              <p className="text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      )}

      {sentences && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Banco de frases
          </p>
          <ul className="space-y-1.5 text-sm text-foreground">
            {Object.entries(sentences).map(([key, text]) => (
              <li key={key}>
                <span className="font-semibold">{key}.</span> {text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {optionsBank && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Opciones
          </p>
          <ul className="space-y-1.5 text-sm text-foreground">
            {Object.entries(optionsBank).map(([key, text]) => (
              <li key={key}>
                <span className="font-semibold">{key}.</span> {text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {exercise.questions.map((q, i) => {
          const graded = gradedByQuestion?.get(q.id);
          const optionsForQuestion =
            q.options && q.options.length > 0 ? q.options : sharedOptions.length > 0 ? sharedOptions : null;

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-4 ${
                graded
                  ? graded.isCorrect
                    ? "border-success/40 bg-success-bg/40"
                    : "border-danger/40 bg-danger-bg/40"
                  : "border-border bg-surface"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {i + 1}. {q.prompt}
                </p>
                {graded && (
                  graded.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-danger" />
                  )
                )}
              </div>

              {optionsForQuestion ? (
                <div className="flex flex-wrap gap-2">
                  {optionsForQuestion.map((opt) => (
                    <button
                      key={opt}
                      disabled={!!result}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:cursor-default ${
                        answers[q.id] === opt
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  disabled={!!result}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Tu respuesta..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-70"
                />
              )}

              {graded && (
                <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                  {!graded.isCorrect && (
                    <p className="text-foreground">
                      <span className="font-medium">Respuesta correcta:</span> {graded.correctAnswer}
                    </p>
                  )}
                  <p className="text-muted-foreground">{graded.explanation}</p>
                  {!graded.isCorrect &&
                    graded.distractorExplanations?.[graded.userAnswer] && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Por qué tu respuesta no es correcta: </span>
                        {graded.distractorExplanations[graded.userAnswer]}
                      </p>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!result ? (
        <button
          onClick={handleSubmit}
          disabled={submitting || answeredCount === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Corregir ({answeredCount}/{exercise.questions.length} respondidas)
        </button>
      ) : (
        <div className="rounded-xl border border-primary/30 bg-surface-muted p-5 text-center">
          <p className="text-lg font-semibold text-foreground">
            {result.correctCount} / {result.totalQuestions} correctas ({result.scorePercent}%)
          </p>
          {result.xpEarned !== undefined && (
            <p className="mt-1 text-sm text-muted-foreground">+{result.xpEarned} XP</p>
          )}
          {result.newAchievements && result.newAchievements.length > 0 && (
            <p className="mt-2 text-sm text-primary">🏆 ¡Nuevo logro desbloqueado!</p>
          )}
          <Link
            href={backHref}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Volver al listado
          </Link>
        </div>
      )}
    </div>
  );
}
