import { FileSpreadsheet } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { examInfo } from "@/lib/cambridge-exams";
import { EXAM_FORMAT, type PaperSpec } from "@/content/exam-format-specs";

function Paper({ paper }: { paper: PaperSpec }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground">{paper.name}</h3>
        <span className="text-xs text-muted-foreground">{paper.timing}</span>
      </div>
      {paper.notes && <p className="mb-3 text-xs text-muted-foreground">{paper.notes}</p>}
      <div className="space-y-2">
        {paper.parts.map((p) => (
          <div key={p.part} className="flex items-start gap-3 rounded-lg bg-surface-muted p-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {p.part}
            </span>
            <div>
              <p className="font-medium text-foreground">
                {p.taskType}
                {p.questions > 1 && <span className="ml-1.5 text-xs text-muted-foreground">({p.questions} preguntas)</span>}
              </p>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
      {paper.totalQuestions && (
        <p className="mt-3 text-right text-xs font-medium text-muted-foreground">
          Total: {paper.totalQuestions} preguntas
        </p>
      )}
    </div>
  );
}

export default async function ExamFormatPage() {
  const user = await requireOnboardedUser();
  const level = user.profile?.targetLevel ?? "C1";
  const exam = examInfo(level);
  const format = EXAM_FORMAT[level];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Formato del examen — {exam.examName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Estructura exacta de cada prueba (partes, número de preguntas y timing), según la
          especificación oficial de Cambridge English para tu nivel objetivo. Cambia tu nivel en{" "}
          <span className="font-medium text-foreground">Ajustes</span> para ver el formato de otro examen.
        </p>
      </div>

      {level === "A1" && (
        <div className="rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
          No existe un examen de Cambridge independiente para A1 — se muestra el formato de A2 Key
          como referencia más cercana.
        </div>
      )}

      <Paper paper={format.readingUseOfEnglish} />
      <Paper paper={format.writing} />
      <Paper paper={format.listening} />
      <Paper paper={format.speaking} />
    </div>
  );
}
