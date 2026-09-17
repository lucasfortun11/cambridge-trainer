import { redirect } from "next/navigation";
import { AlertTriangle, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { ERROR_CATEGORY_LABELS } from "@/lib/dashboard-labels";
import { ErrorFrequencyList } from "@/components/dashboard/ErrorFrequencyList";
import { GenerateMiniLessonButton } from "@/components/shared/GenerateMiniLessonButton";
import { ErrorDnaCard } from "@/components/dashboard/ErrorDnaCard";

const SOURCE_LABELS: Record<string, string> = {
  READING_USE_OF_ENGLISH: "Reading / Use of English",
  LISTENING: "Listening",
  WRITING: "Writing",
  SPEAKING: "Speaking",
  GRAMMAR_DRILL: "Grammar",
  VOCABULARY_DRILL: "Vocabulary",
};

export default async function MyErrorsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const errors = await prisma.errorLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const ai = getAIProvider();
  const analysis = await ai.analyzeErrors({
    errors: errors.map((e) => ({ category: e.category, createdAt: e.createdAt })),
  });

  const categoryCounts = new Map<string, number>();
  for (const e of errors) {
    categoryCounts.set(e.category, (categoryCounts.get(e.category) ?? 0) + 1);
  }
  const categoryData = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ label: ERROR_CATEGORY_LABELS[category as keyof typeof ERROR_CATEGORY_LABELS], count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <AlertTriangle className="h-5 w-5 text-danger" />
          Mis errores
        </h1>
        <p className="text-sm text-muted-foreground">
          Cada error que cometes en ejercicios, writing o speaking queda registrado aquí y se
          usa para personalizar tus próximas sesiones.
        </p>
      </div>

      {errors.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Todavía no tienes errores registrados. En cuanto empieces a practicar, este panel
          detectará patrones automáticamente — por ejemplo: &ldquo;Has cometido 12 errores
          relacionados con preposiciones en los últimos 7 días&rdquo;.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-primary/20 bg-surface-muted p-4 text-sm text-foreground">
            {analysis.recommendation}
          </div>

          {analysis.weakestCategories.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Practica tus puntos débiles
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.weakestCategories.map((category) => (
                  <GenerateMiniLessonButton
                    key={category}
                    category={category}
                    label={`Mini-lección: ${ERROR_CATEGORY_LABELS[category]}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Genera al instante 15 preguntas (5 fáciles, 5 intermedias, 5 avanzadas, a tu
                nivel) sobre el tema que más te cuesta.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Por categoría</h2>
              <ErrorFrequencyList data={categoryData} />
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Historial reciente
              </h2>
              <ul className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                {errors.slice(0, 20).map((e) => (
                  <li key={e.id} className="border-b border-border pb-3 last:border-0">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{ERROR_CATEGORY_LABELS[e.category]}</span>
                      <span>{SOURCE_LABELS[e.source]}</span>
                    </div>
                    {e.questionText && (
                      <p className="text-sm text-foreground">{e.questionText}</p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-x-4 text-xs">
                      {e.userAnswer && (
                        <span className="text-danger">Tu respuesta: {e.userAnswer}</span>
                      )}
                      {e.correctAnswer && (
                        <span className="text-success">Correcta: {e.correctAnswer}</span>
                      )}
                    </div>
                    {e.explanation && (
                      <p className="mt-1 text-xs text-muted-foreground">{e.explanation}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ErrorDnaCard />
        </>
      )}
    </div>
  );
}
