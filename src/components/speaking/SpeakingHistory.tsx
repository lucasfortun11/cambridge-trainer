"use client";

import { useEffect, useState } from "react";
import { Trash2, History } from "lucide-react";

type Attempt = { id: string; part: string; prompt: string; overallScore: number | null; createdAt: string };

export function SpeakingHistory() {
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);

  useEffect(() => {
    fetch("/api/speaking")
      .then((r) => r.json())
      .then((data) => setAttempts(data.attempts));
  }, []);

  async function remove(id: string) {
    await fetch(`/api/speaking/${id}`, { method: "DELETE" });
    setAttempts((prev) => prev?.filter((a) => a.id !== id) ?? null);
  }

  if (!attempts || attempts.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
        <History className="h-3.5 w-3.5" /> Historial
      </p>
      <ul className="space-y-1.5">
        {attempts.map((a) => (
          <li key={a.id} className="flex items-center justify-between text-sm">
            <span className="text-foreground">{a.prompt}</span>
            <span className="flex items-center gap-3">
              <span className="font-medium text-primary">{a.overallScore ?? "—"}/5</span>
              <button
                onClick={() => remove(a.id)}
                aria-label="Eliminar grabación"
                className="text-muted-foreground hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
