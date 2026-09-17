import { prisma } from "@/lib/prisma";
import { formatLevel } from "@/lib/placement";
import { levelToNumeric } from "@/lib/cambridge-exams";

export type RealLevelChartPoint = {
  label: string;
  date: string; // ISO, kept for sorting/debugging
  writingValue?: number;
  writingLabel?: string;
  speakingValue?: number;
  speakingLabel?: string;
};

const DATE_FORMAT = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });

/**
 * Builds "Tu nivel real en el tiempo": every Writing/Speaking attempt's
 * independent CEFR placement (estimatedLevel/estimatedSublevel — see
 * evaluateWriting/evaluateSpeaking), charted chronologically. Unlike
 * examReadinessPercent (how close you are to your chosen target exam),
 * this tracks what level your actual output demonstrates over time,
 * regardless of which exam you're aiming for.
 */
export async function getRealLevelHistory(userId: string): Promise<RealLevelChartPoint[]> {
  const [writings, speakingAttempts] = await Promise.all([
    prisma.writing.findMany({
      where: { userId, estimatedLevel: { not: null } },
      select: { submittedAt: true, estimatedLevel: true, estimatedSublevel: true },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.speakingAttempt.findMany({
      where: { userId, estimatedLevel: { not: null } },
      select: { createdAt: true, estimatedLevel: true, estimatedSublevel: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  type Row = { date: Date; source: "WRITING" | "SPEAKING"; value: number; label: string };

  const rows: Row[] = [
    ...writings.map((w) => ({
      date: w.submittedAt,
      source: "WRITING" as const,
      value: levelToNumeric(w.estimatedLevel!, w.estimatedSublevel!),
      label: formatLevel(w.estimatedLevel!, w.estimatedSublevel!),
    })),
    ...speakingAttempts.map((s) => ({
      date: s.createdAt,
      source: "SPEAKING" as const,
      value: levelToNumeric(s.estimatedLevel!, s.estimatedSublevel!),
      label: formatLevel(s.estimatedLevel!, s.estimatedSublevel!),
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return rows.map((r) => ({
    label: DATE_FORMAT.format(r.date),
    date: r.date.toISOString(),
    writingValue: r.source === "WRITING" ? r.value : undefined,
    writingLabel: r.source === "WRITING" ? r.label : undefined,
    speakingValue: r.source === "SPEAKING" ? r.value : undefined,
    speakingLabel: r.source === "SPEAKING" ? r.label : undefined,
  }));
}
