"use client";

import { useEffect, useState } from "react";
import { Dna, Loader2, RefreshCw } from "lucide-react";

type Report = {
  headline: string;
  narrative: string;
  focusAreas: string[];
  createdAt: string;
  errorCountAtGeneration: number;
};

const STALE_THRESHOLD = 8;

export function ErrorDnaCard() {
  const [report, setReport] = useState<Report | null | undefined>(undefined);
  const [currentErrorCount, setCurrentErrorCount] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/errors/dna")
      .then((r) => r.json())
      .then((data) => {
        setReport(data.report);
        setCurrentErrorCount(data.currentErrorCount);
      });
  }, []);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/errors/dna", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setReport(data.report);
        setCurrentErrorCount(data.currentErrorCount);
      } else {
        setError(data.error ?? "No se pudo generar el informe.");
      }
    } catch {
      setError("No se pudo generar el informe.");
    } finally {
      setGenerating(false);
    }
  }

  if (report === undefined) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const isStale = report !== null && currentErrorCount - report.errorCountAtGeneration >= STALE_THRESHOLD;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Dna className="h-4 w-4 text-primary" />
        Tu ADN de errores
      </h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Un diagnóstico escrito por IA de por qué cometes tus errores más repetidos — no solo un
        recuento, sino el patrón real detrás (por ejemplo, interferencia de tu idioma nativo).
      </p>

      {!report && (
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dna className="h-4 w-4" />}
          {generating ? "Analizando tus errores..." : "Generar mi ADN de errores"}
        </button>
      )}

      {report && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">{report.headline}</p>
          <div className="space-y-2 text-sm text-foreground">
            {report.narrative.split(/\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {report.focusAreas.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Prioriza esto
              </p>
              <ul className="space-y-1 text-sm text-foreground">
                {report.focusAreas.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Generado el {new Date(report.createdAt).toLocaleDateString("es-ES")} con{" "}
              {report.errorCountAtGeneration} errores registrados.
              {isStale && (
                <span className="ml-1 text-warning">
                  Tienes {currentErrorCount - report.errorCountAtGeneration} errores nuevos desde entonces.
                </span>
              )}
            </p>
            <button
              onClick={generate}
              disabled={generating}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Actualizar
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
