"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export function GenerateExerciseButton({
  skill,
  basePath,
  label = "Generar nuevo ejercicio (IA)",
  topic,
  topicTitle,
  refreshInPlace,
}: {
  skill: "READING" | "USE_OF_ENGLISH" | "LISTENING" | "GRAMMAR";
  basePath: string;
  label?: string;
  topic?: string;
  topicTitle?: string;
  /** Refresh the current page instead of navigating to the new exercise (e.g. a topic page whose exercise lookup is keyed by `topic`, not by exercise id). */
  refreshInPlace?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill, topic, topicTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        if (refreshInPlace) {
          router.refresh();
        } else {
          router.push(`${basePath}/${data.id}`);
        }
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo generar el ejercicio. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={generate}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Generando..." : label}
      </button>
      {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
