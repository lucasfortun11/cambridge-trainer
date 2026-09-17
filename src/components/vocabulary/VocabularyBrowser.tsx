"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type WordSummary = {
  id: string;
  word: string;
  definition: string;
  translation: string | null;
  category: string | null;
  cefrLevel: string;
  status: string | null;
  grammarNote: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "Nuevo",
  LEARNING: "Aprendiendo",
  REVIEWING: "Repasando",
  MASTERED: "Dominado",
};

const STATUS_COLOR: Record<string, string> = {
  NEW: "text-muted-foreground",
  LEARNING: "text-warning",
  REVIEWING: "text-primary",
  MASTERED: "text-success",
};

export function VocabularyBrowser({ mine = false }: { mine?: boolean }) {
  const [words, setWords] = useState<WordSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(mine ? "/api/vocabulary?mine=1" : "/api/vocabulary")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setWords(data.words);
      });
    return () => {
      cancelled = true;
    };
  }, [mine]);

  if (!words) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (mine && words.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
        Aún no has añadido palabras. Selecciona cualquier palabra que no entiendas en cualquier
        parte de la app y pulsa &ldquo;Añadir a mi diccionario&rdquo;.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {words.map((w) => (
        <div key={w.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{w.word}</p>
            <span className="text-xs text-muted-foreground">{w.cefrLevel}</span>
          </div>
          <p className="text-sm text-muted-foreground">{w.definition}</p>
          {w.translation && <p className="mt-1 text-xs text-muted-foreground">{w.translation}</p>}
          {w.grammarNote && (
            <p className="mt-2 rounded-lg bg-primary/5 p-2 text-xs text-foreground">
              <span className="font-medium text-primary">Estructura/tiempo verbal: </span>
              {w.grammarNote}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-muted-foreground">
              {w.category ?? "general"}
            </span>
            <span className={`font-medium ${STATUS_COLOR[w.status ?? "NEW"]}`}>
              {w.status ? STATUS_LABEL[w.status] : "Sin empezar"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
