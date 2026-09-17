import { TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { formatLevel } from "@/lib/placement";
import { CEFR_LEVELS } from "@/lib/cambridge-exams";
import type { CEFRLevel, Sublevel } from "@/generated/prisma/client";

/**
 * Shows where THIS specific piece of work (independently of its score
 * against the target level's rubric) actually lands on the full CEFR
 * scale — a real Cambridge result can report an adjacent level, so the app
 * is equally upfront about it instead of only ever grading against the
 * level the user picked in Settings.
 */
export function EstimatedLevelBanner({
  targetLevel,
  estimatedLevel,
  estimatedSublevel,
}: {
  targetLevel: CEFRLevel;
  estimatedLevel: CEFRLevel;
  estimatedSublevel: Sublevel;
}) {
  const targetIdx = CEFR_LEVELS.indexOf(targetLevel);
  const estimatedIdx = CEFR_LEVELS.indexOf(estimatedLevel);
  const diff = estimatedIdx - targetIdx;

  const { Icon, tone, message } =
    diff > 0
      ? {
          Icon: TrendingUp,
          tone: "success" as const,
          message: `Por encima de tu objetivo (${targetLevel}) — este texto ya demuestra un nivel propio de ${estimatedLevel}.`,
        }
      : diff < 0
        ? {
            Icon: TrendingDown,
            tone: "warning" as const,
            message: `Por debajo de tu objetivo (${targetLevel}) — de momento este texto se sitúa más cerca de ${estimatedLevel}.`,
          }
        : {
            Icon: CheckCircle2,
            tone: "primary" as const,
            message: `En línea con tu objetivo (${targetLevel}).`,
          };

  const toneClasses = {
    success: "border-success/30 bg-success-bg text-success",
    warning: "border-warning/30 bg-warning-bg text-warning",
    primary: "border-primary/30 bg-primary/5 text-primary",
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClasses}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" />
        <p className="text-sm font-semibold">Nivel estimado de este texto: {formatLevel(estimatedLevel, estimatedSublevel)}</p>
      </div>
      <p className="mt-1 text-xs opacity-90">{message}</p>
      <p className="mt-1 text-xs opacity-70">
        Estimación independiente de la IA, separada de la puntuación de arriba — no es una certificación oficial de Cambridge.
      </p>
    </div>
  );
}
