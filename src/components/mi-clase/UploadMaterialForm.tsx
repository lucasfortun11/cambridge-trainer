"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";

export function UploadMaterialForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/class/materials", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      if (res.ok) {
        formRef.current?.reset();
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo subir el material.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-border bg-surface p-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Título</label>
        <input
          name="title"
          required
          maxLength={200}
          placeholder="Ej: Unidad 3 — Present Perfect"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Archivo (.txt, .pdf, .docx)
        </label>
        <input
          name="file"
          type="file"
          accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary"
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        o pega el texto
        <span className="h-px flex-1 bg-border" />
      </div>

      <textarea
        name="text"
        rows={5}
        placeholder="Pega aquí la teoría, apuntes o ejercicios de tu clase o academia..."
        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
      />

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {loading ? "Subiendo..." : "Subir material"}
      </button>
      {error && <p className="text-center text-xs text-danger">{error}</p>}
    </form>
  );
}
