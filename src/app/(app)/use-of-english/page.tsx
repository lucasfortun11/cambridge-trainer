import { SpellCheck2 } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { listExercisesForUser } from "@/lib/exercises";
import { ExerciseListCard } from "@/components/exercises/ExerciseListCard";
import { GenerateExerciseButton } from "@/components/shared/GenerateExerciseButton";

export default async function UseOfEnglishPage() {
  const user = await requireOnboardedUser();
  const level = user.profile?.targetLevel ?? "C1";
  const exercises = await listExercisesForUser(user.id, { skill: "USE_OF_ENGLISH", level });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <SpellCheck2 className="h-5 w-5 text-primary" />
          Use of English
        </h1>
        <p className="text-sm text-muted-foreground">
          Gramática y vocabulario en contexto, nivel {level}.
        </p>
      </div>

      <GenerateExerciseButton skill="USE_OF_ENGLISH" basePath="/use-of-english" />

      <div className="space-y-3">
        {exercises.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Todavía no hay ejercicios guardados para tu nivel ({level}). Genera el primero con
            el botón de arriba.
          </p>
        )}
        {exercises.map((e) => (
          <ExerciseListCard
            key={e.id}
            href={`/use-of-english/${e.id}`}
            title={e.title}
            type={e.type}
            level={e.level}
            questionCount={e.questionCount}
            lastScore={e.lastScore}
          />
        ))}
      </div>
    </div>
  );
}
