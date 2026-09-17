import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/auth";
import { getExerciseForPlayer } from "@/lib/exercises";
import { ExercisePlayer } from "@/components/exercises/ExercisePlayer";

export default async function ListeningExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOnboardedUser();
  const { id } = await params;
  const exercise = await getExerciseForPlayer(id);
  if (!exercise) notFound();

  return <ExercisePlayer exercise={exercise} backHref="/listening" />;
}
