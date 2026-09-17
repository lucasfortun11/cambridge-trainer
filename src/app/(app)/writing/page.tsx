import Link from "next/link";
import { PenLine, ArrowRight, History } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWritingPromptsForLevel } from "@/lib/writing-prompts";

const TYPE_LABELS: Record<string, string> = {
  ESSAY: "Essay",
  PROPOSAL: "Proposal",
  REPORT: "Report",
  REVIEW: "Review",
  EMAIL_LETTER: "Email/Letter",
};

export default async function WritingPage() {
  const user = await requireOnboardedUser();
  const level = user.profile?.targetLevel ?? "C1";
  const WRITING_PROMPTS = await getWritingPromptsForLevel(level);

  const past = await prisma.writing.findMany({
    where: { userId: user.id },
    orderBy: { submittedAt: "desc" },
    take: 5,
    select: { id: true, prompt: true, type: true, overallScore: true, submittedAt: true },
  });

  const grouped = WRITING_PROMPTS.reduce<Record<string, typeof WRITING_PROMPTS>>((acc, p) => {
    (acc[p.type] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <PenLine className="h-5 w-5 text-primary" />
          Writing
        </h1>
        <p className="text-sm text-muted-foreground">
          Elige un tipo de texto, escribe tu respuesta y recibe corrección detallada al instante.
        </p>
      </div>

      {past.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
            <History className="h-3.5 w-3.5" /> Tus últimos textos
          </p>
          <ul className="space-y-1.5 text-sm">
            {past.map((w) => (
              <li key={w.id} className="flex items-center justify-between">
                <span className="text-foreground">
                  {TYPE_LABELS[w.type]} — {w.prompt.slice(0, 50)}...
                </span>
                <span className="font-medium text-primary">{w.overallScore ?? "—"}/5</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Object.entries(grouped).map(([type, prompts]) => (
        <div key={type}>
          <h2 className="mb-2 text-sm font-semibold text-foreground">{TYPE_LABELS[type]}</h2>
          <div className="space-y-2">
            {prompts.map((p) => (
              <Link
                key={p.slug}
                href={`/writing/${p.slug}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
              >
                <p className="text-sm text-foreground">{p.title}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
