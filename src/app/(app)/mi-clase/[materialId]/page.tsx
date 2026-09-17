import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardList } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { getClassMaterialWithExercises } from "@/lib/class-exercises";
import { GenerateClassExerciseButton } from "@/components/mi-clase/GenerateClassExerciseButton";
import { DeleteMaterialButton } from "@/components/mi-clase/DeleteMaterialButton";

export default async function MiClaseMaterialPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const user = await requireOnboardedUser();
  const { materialId } = await params;
  const material = await getClassMaterialWithExercises(user.id, materialId);
  if (!material) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/mi-clase" className="text-xs text-muted-foreground hover:text-primary">
          ← Mi Clase
        </Link>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-foreground">{material.title}</h1>
          <DeleteMaterialButton materialId={material.id} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {material.charCount.toLocaleString("es-ES")} caracteres
          {material.truncated ? " (recortado por longitud)" : ""}
        </p>
      </div>

      <GenerateClassExerciseButton materialId={material.id} />

      <div className="space-y-3">
        {material.exercises.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Todavía no has generado ningún ejercicio para este material.
          </p>
        )}
        {material.exercises.map((ex) => (
          <Link
            key={ex.id}
            href={`/mi-clase/${material.id}/${ex.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
          >
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{ex.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{ex._count.questions} preguntas</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
