"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, Loader2 } from "lucide-react";
import { CAMBRIDGE_EXAMS, CEFR_LEVELS } from "@/lib/cambridge-exams";
import type { CEFRLevel } from "@prisma/client";

type SettingsFormProps = {
  email: string;
  name: string | null;
  targetExamDate: string | null;
  dailyMinutesAvailable: number | null;
  studyDaysPerWeek: number | null;
  targetLevel: CEFRLevel;
};

export function SettingsForm({
  email,
  name,
  targetExamDate,
  dailyMinutesAvailable,
  studyDaysPerWeek,
  targetLevel,
}: SettingsFormProps) {
  const router = useRouter();
  const [examDate, setExamDate] = useState(targetExamDate ?? "");
  const [minutes, setMinutes] = useState(dailyMinutesAvailable ?? 60);
  const [days, setDays] = useState(studyDaysPerWeek ?? 5);
  const [level, setLevel] = useState<CEFRLevel>(targetLevel);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetExamDate: examDate || null,
          dailyMinutesAvailable: minutes,
          studyDaysPerWeek: days,
          targetLevel: level,
        }),
      });
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await fetch("/api/account", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Cuenta</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-foreground">{email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Nombre</dt>
            <dd className="text-foreground">{name ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSave} className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Plan de estudio</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Examen objetivo
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as CEFRLevel)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            >
              {CEFR_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {CAMBRIDGE_EXAMS[lvl].examName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              {CAMBRIDGE_EXAMS[level].description}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Fecha del examen
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Minutos disponibles al día
            </label>
            <input
              type="number"
              min={5}
              max={300}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Días de estudio por semana
            </label>
            <input
              type="number"
              min={1}
              max={7}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar
        </button>
        {saved && <span className="ml-3 text-sm text-success">Guardado</span>}
      </form>

      <div className="rounded-xl border border-danger/30 bg-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-danger">Zona de peligro</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Elimina tu cuenta y todos tus datos (intentos, errores, vocabulario, writings,
          speaking, simulacros y progreso). Esta acción no se puede deshacer.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 rounded-lg border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger-bg disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {confirmDelete ? "Confirmar eliminación permanente" : "Eliminar todos mis datos"}
        </button>
      </div>
    </div>
  );
}
