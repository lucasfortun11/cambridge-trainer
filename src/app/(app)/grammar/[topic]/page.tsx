import { notFound } from "next/navigation";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { getGrammarTopicBySlug } from "@/lib/grammar-topics";
import { CATEGORY_EXPLANATIONS } from "@/content/error-category-explanations";
import { prisma } from "@/lib/prisma";
import { getExerciseForPlayer } from "@/lib/exercises";
import { ExercisePlayer } from "@/components/exercises/ExercisePlayer";
import { GenerateMiniLessonButton } from "@/components/shared/GenerateMiniLessonButton";
import { GenerateExerciseButton } from "@/components/shared/GenerateExerciseButton";

const CATEGORY_FOR_TOPIC = Object.fromEntries(
  Object.entries(CATEGORY_EXPLANATIONS)
    .filter(([, info]) => info.grammarTopicSlug)
    .map(([category, info]) => [info.grammarTopicSlug as string, category])
);

export default async function GrammarTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const user = await requireOnboardedUser();
  const { topic: topicSlug } = await params;
  const level = user.profile?.targetLevel ?? "C1";

  const topic = await getGrammarTopicBySlug(level, topicSlug);
  if (!topic) notFound();

  const exerciseRow = await prisma.exercise.findFirst({ where: { topic: topicSlug } });
  const exercise = exerciseRow ? await getExerciseForPlayer(exerciseRow.id) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/grammar" className="text-xs text-muted-foreground hover:text-primary">
          ← Volver a Grammar
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{topic.title}</h1>
        <p className="text-sm text-muted-foreground">{topic.summary}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Lightbulb className="h-4 w-4 text-primary" />
          Explicación
        </p>
        <div className="space-y-2 text-sm text-foreground">
          {topic.explanation.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ejemplos
        </p>
        <ul className="space-y-1.5">
          {topic.examples.map((ex, i) => (
            <li key={i} className="rounded-lg bg-surface-muted px-3 py-2 text-sm">
              <span className="text-foreground">{ex.correct}</span>
              {ex.note && <span className="block text-xs text-muted-foreground">{ex.note}</span>}
            </li>
          ))}
        </ul>
      </div>

      {exercise ? (
        <ExercisePlayer exercise={exercise} backHref="/grammar" />
      ) : level === "C1" ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay ejercicios de práctica para este tema.
        </p>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Aún no hay ejercicios de práctica para este tema a tu nivel.
          </p>
          <GenerateExerciseButton
            skill="GRAMMAR"
            basePath="/grammar"
            label="Generar ejercicio de práctica (IA)"
            topic={topicSlug}
            topicTitle={topic.title}
            refreshInPlace
          />
        </div>
      )}

      {CATEGORY_FOR_TOPIC[topicSlug] && (
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="mb-2 text-sm text-muted-foreground">
            ¿Quieres seguir practicando este tema?
          </p>
          <GenerateMiniLessonButton
            category={CATEGORY_FOR_TOPIC[topicSlug]}
            label="Generar 15 preguntas más"
            className="mx-auto flex w-fit items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          />
        </div>
      )}
    </div>
  );
}
