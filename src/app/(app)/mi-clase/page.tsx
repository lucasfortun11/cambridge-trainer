import Link from "next/link";
import { GraduationCap, ArrowRight, FileText } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { listClassMaterials } from "@/lib/class-exercises";
import { UploadMaterialForm } from "@/components/mi-clase/UploadMaterialForm";

export default async function MiClasePage() {
  const user = await requireOnboardedUser();
  const materials = await listClassMaterials(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <GraduationCap className="h-5 w-5 text-primary" />
          Mi Clase
        </h1>
        <p className="text-sm text-muted-foreground">
          Sube la teoría, apuntes o ejercicios de tu profesor o academia. La IA generará y corregirá
          ejercicios basados únicamente en ese material — completamente separado del contenido de Cambridge.
        </p>
      </div>

      <UploadMaterialForm />

      <div className="space-y-3">
        {materials.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Todavía no has subido ningún material.
          </p>
        )}
        {materials.map((m) => (
          <Link
            key={m.id}
            href={`/mi-clase/${m.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
          >
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{m.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {m._count.exercises} ejercicio{m._count.exercises === 1 ? "" : "s"}
                  {m.truncated ? " · texto recortado por longitud" : ""}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
