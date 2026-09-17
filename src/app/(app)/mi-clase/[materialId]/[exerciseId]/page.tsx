import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { getClassExerciseForPlayer } from "@/lib/class-exercises";
import { ExercisePlayer } from "@/components/exercises/ExercisePlayer";

export default async function MiClaseExercisePage({
  params,
}: {
  params: Promise<{ materialId: string; exerciseId: string }>;
}) {
  const user = await requireOnboardedUser();
  const { materialId, exerciseId } = await params;
  const exercise = await getClassExerciseForPlayer(user.id, exerciseId);
  if (!exercise) notFound();

  return (
    <ExercisePlayer
      exercise={exercise}
      backHref={`/mi-clase/${materialId}`}
      submitUrl={`/api/class/exercises/${exercise.id}/submit`}
    />
  );
}
