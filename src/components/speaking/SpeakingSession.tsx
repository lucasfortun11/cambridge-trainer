"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, Square, Loader2, Play, RotateCcw } from "lucide-react";
import type { SpeakingPrompt } from "@/content/speaking-prompts";
import { EstimatedLevelBanner } from "@/components/shared/EstimatedLevelBanner";
import type { CEFRLevel, Sublevel } from "@/generated/prisma/client";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
};

type SpeakingFeedback = {
  scoreFluency: number;
  scoreGrammar: number;
  scoreVocabulary: number;
  scoreCoherence: number;
  scorePronunciation: number;
  overallScore: number;
  repeatedWords: { word: string; count: number }[];
  alternatives: { overused: string; alternatives: string[] }[];
  hesitationNotes: string[];
  feedback: string[];
  estimatedLevel: CEFRLevel;
  estimatedSublevel: Sublevel;
};

type Phase = "idle" | "prep" | "recording" | "review" | "submitting" | "done";

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function SpeakingSession({ prompt, targetLevel }: { prompt: SpeakingPrompt; targetLevel: CEFRLevel }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [prepLeft, setPrepLeft] = useState(prompt.prepSeconds);
  const [recordLeft, setRecordLeft] = useState(prompt.speakSeconds);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [speechSupported] = useState(() => getSpeechRecognitionCtor() !== null);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    if (phase !== "prep") return;
    if (prepLeft <= 0) {
      startRecording();
      return;
    }
    const t = setTimeout(() => setPrepLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, prepLeft]);

  useEffect(() => {
    if (phase !== "recording") return;
    if (recordLeft <= 0) {
      stopRecording();
      return;
    }
    const t = setTimeout(() => setRecordLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
     
  }, [phase, recordLeft]);

  async function handleStart() {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch {
      setMicError("No se pudo acceder al micrófono. Revisa los permisos del navegador.");
      return;
    }

    if (prompt.prepSeconds > 0) {
      setPhase("prep");
    } else {
      startRecording();
    }
  }

  function startRecording() {
    finalTranscriptRef.current = "";
    setTranscript("");
    chunksRef.current = [];

    const stream = streamRef.current;
    if (stream) {
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.start();
      mediaRecorderRef.current = recorder;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (Ctor) {
      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscriptRef.current += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }
        setTranscript(finalTranscriptRef.current + interim);
      };
      recognition.onerror = () => {};
      recognition.start();
      recognitionRef.current = recognition;
    }

    startedAtRef.current = Date.now();
    setRecordLeft(prompt.speakSeconds);
    setPhase("recording");
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setTranscript(finalTranscriptRef.current.trim());
    setPhase("review");
  }

  function reset() {
    setPhase("idle");
    setTranscript("");
    setAudioUrl(null);
    setFeedback(null);
    setPrepLeft(prompt.prepSeconds);
    setRecordLeft(prompt.speakSeconds);
  }

  async function submit() {
    setPhase("submitting");
    try {
      const res = await fetch("/api/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part: prompt.part,
          prompt: prompt.title,
          transcript,
          durationSeconds: Math.round((Date.now() - startedAtRef.current) / 1000),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
        setPhase("done");
      } else {
        setPhase("review");
      }
    } catch {
      setPhase("review");
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="mb-2 text-sm text-muted-foreground">{prompt.instructions}</p>
        <ul className="space-y-1 text-sm text-foreground">
          {prompt.questions.map((q) => (
            <li key={q}>• {q}</li>
          ))}
        </ul>
      </div>

      {!speechSupported && (
        <p className="rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
          Tu navegador no soporta reconocimiento de voz automático. Podrás grabar y escribir la
          transcripción manualmente.
        </p>
      )}
      {micError && <p className="rounded-lg bg-danger-bg px-3 py-2 text-xs text-danger">{micError}</p>}

      {phase === "idle" && (
        <button
          onClick={handleStart}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <Mic className="h-4 w-4" />
          Empezar
        </button>
      )}

      {phase === "prep" && (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">Prepárate...</p>
          <p className="text-4xl font-semibold text-foreground">{prepLeft}s</p>
        </div>
      )}

      {phase === "recording" && (
        <div className="rounded-xl border border-danger/40 bg-danger-bg p-6 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-danger">
            <span className="h-2 w-2 animate-pulse rounded-full bg-danger" /> Grabando — {recordLeft}s
          </p>
          <p className="mt-3 min-h-[3rem] text-sm text-foreground">{transcript || "..."}</p>
          <button
            onClick={stopRecording}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Square className="h-4 w-4" />
            Parar
          </button>
        </div>
      )}

      {(phase === "review" || phase === "submitting") && (
        <div className="space-y-3 rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-foreground">Transcripción (puedes editarla)</p>
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full">
              <track kind="captions" />
            </audio>
          )}
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:border-primary"
            >
              <RotateCcw className="h-4 w-4" />
              Grabar de nuevo
            </button>
            <button
              onClick={submit}
              disabled={phase === "submitting" || transcript.trim().length < 5}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {phase === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Analizar
            </button>
          </div>
        </div>
      )}

      {phase === "done" && feedback && (
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/30 bg-surface-muted p-5 text-center">
            <p className="text-2xl font-semibold text-foreground">{feedback.overallScore} / 5</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-left sm:grid-cols-5">
              <ScoreTile label="Fluency" value={feedback.scoreFluency} />
              <ScoreTile label="Grammar" value={feedback.scoreGrammar} />
              <ScoreTile label="Vocabulary" value={feedback.scoreVocabulary} />
              <ScoreTile label="Coherence" value={feedback.scoreCoherence} />
              <ScoreTile label="Pronunciation" value={feedback.scorePronunciation} />
            </div>
          </div>

          <EstimatedLevelBanner
            targetLevel={targetLevel}
            estimatedLevel={feedback.estimatedLevel}
            estimatedSublevel={feedback.estimatedSublevel}
          />

          {feedback.repeatedWords.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="mb-2 text-sm font-semibold text-foreground">Palabras repetidas</p>
              {feedback.repeatedWords.map((r) => (
                <p key={r.word} className="text-sm text-muted-foreground">
                  You used &ldquo;{r.word}&rdquo; {r.count} times.
                </p>
              ))}
            </div>
          )}

          {feedback.alternatives.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="mb-2 text-sm font-semibold text-foreground">Alternativas sugeridas</p>
              {feedback.alternatives.map((a) => (
                <p key={a.overused} className="text-sm text-muted-foreground">
                  En vez de &ldquo;{a.overused}&rdquo;: {a.alternatives.join(", ")}
                </p>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-2 text-sm font-semibold text-foreground">Comentarios</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {feedback.feedback.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
              {feedback.hesitationNotes.map((f, i) => (
                <li key={`h-${i}`}>• {f}</li>
              ))}
            </ul>
          </div>

          <Link
            href="/speaking"
            className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Volver a Speaking
          </Link>
        </div>
      )}
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
