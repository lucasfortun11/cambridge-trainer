import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StartMockExamButton } from "@/components/mock-exam/StartMockExamButton";
import { examInfo } from "@/lib/cambridge-exams";

export default async function MockExamPage() {
  const user = await requireOnboardedUser();
  const exam = examInfo(user.profile?.targetLevel ?? "C1");

  const exams = await prisma.mockExam.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <ClipboardList className="h-5 w-5 text-primary" />
          Mock Exam — {exam.examName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Simulacro completo: Reading & Use of English, Writing, Listening y Speaking. A tu
          ritmo, con cronómetro de referencia.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <StartMockExamButton />
      </div>

      {exams.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Historial</h2>
          {exams.map((e, i) => (
            <Link
              key={e.id}
              href={`/mock-exam/${e.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  Mock {exams.length - i} — {new Date(e.startedAt).toLocaleDateString("es-ES")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {e.completedAt ? e.estimatedGrade ?? "Completado" : "En progreso"}
                </p>
              </div>
              {e.overallScore && (
                <span className="text-sm font-semibold text-primary">{e.overallScore}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
