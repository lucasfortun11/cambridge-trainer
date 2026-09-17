import { Headphones } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { listExercisesForUser } from "@/lib/exercises";
import { ExerciseListCard } from "@/components/exercises/ExerciseListCard";
import { GenerateExerciseButton } from "@/components/shared/GenerateExerciseButton";

export default async function ListeningPage() {
  const user = await requireOnboardedUser();
  const level = user.profile?.targetLevel ?? "C1";
  const exercises = await listExercisesForUser(user.id, { skill: "LISTENING", level });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Headphones className="h-5 w-5 text-primary" />
          Listening
        </h1>
        <p className="text-sm text-muted-foreground">
          Nivel {level}. Sin audios con copyright: cada ejercicio incluye transcripción y un
          botón de voz sintética mientras se suben grabaciones propias.
        </p>
      </div>

      <GenerateExerciseButton skill="LISTENING" basePath="/listening" />

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
            href={`/listening/${e.id}`}
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
