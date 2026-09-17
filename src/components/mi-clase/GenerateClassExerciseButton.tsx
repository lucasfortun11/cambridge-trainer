"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export function GenerateClassExerciseButton({ materialId }: { materialId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusInstructions, setFocusInstructions] = useState("");

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/class/materials/${materialId}/generate-exercise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusInstructions: focusInstructions.trim() || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/mi-clase/${materialId}/${data.id}`);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo generar el ejercicio. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        value={focusInstructions}
        onChange={(e) => setFocusInstructions(e.target.value)}
        placeholder="Instrucción opcional (ej: céntrate en el vocabulario)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        onClick={generate}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Generando..." : "Generar nuevo ejercicio (IA)"}
      </button>
      {error && <p className="text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
