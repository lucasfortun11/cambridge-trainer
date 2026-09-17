import { notFound } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getExerciseForPlayer } from "@/lib/exercises";
import { CATEGORY_EXPLANATIONS } from "@/content/error-category-explanations";
import { ExercisePlayer } from "@/components/exercises/ExercisePlayer";

export default async function MiniLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOnboardedUser();
  const { id } = await params;

  const [exercise, firstQuestion] = await Promise.all([
    getExerciseForPlayer(id),
    prisma.question.findFirst({ where: { exerciseId: id }, select: { grammarCategory: true } }),
  ]);
  if (!exercise || !firstQuestion?.grammarCategory) notFound();

  const info = CATEGORY_EXPLANATIONS[firstQuestion.grammarCategory];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/my-errors" className="text-xs text-muted-foreground hover:text-primary">
          ← Volver a Mis errores
        </Link>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          Mini-lección: {info.title}
        </h1>
        <p className="text-sm text-muted-foreground">{info.summary}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Explicación</p>
        <div className="space-y-2 text-sm text-foreground">
          {info.explanation.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {info.examples.length > 0 && (
          <>
            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ejemplos
            </p>
            <ul className="space-y-1.5">
              {info.examples.map((ex, i) => (
                <li key={i} className="rounded-lg bg-surface-muted px-3 py-2 text-sm">
                  <span className="text-foreground">{ex.correct}</span>
                  {ex.note && <span className="block text-xs text-muted-foreground">{ex.note}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <ExercisePlayer exercise={exercise} backHref="/my-errors" />
    </div>
  );
}
