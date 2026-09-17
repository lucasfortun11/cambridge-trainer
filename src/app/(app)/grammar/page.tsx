import Link from "next/link";
import { ListChecks, ArrowRight } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { getGrammarTopicsForLevel } from "@/lib/grammar-topics";
import { prisma } from "@/lib/prisma";

export default async function GrammarPage() {
  const user = await requireOnboardedUser();
  const level = user.profile?.targetLevel ?? "C1";
  const GRAMMAR_TOPICS = await getGrammarTopicsForLevel(level);

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id, completedAt: { not: null }, exercise: { skill: "GRAMMAR" } },
    select: { scorePercent: true, exercise: { select: { topic: true } } },
    orderBy: { completedAt: "desc" },
  });
  const scoreByTopic = new Map<string, number>();
  for (const a of attempts) {
    if (a.exercise.topic && !scoreByTopic.has(a.exercise.topic)) {
      scoreByTopic.set(a.exercise.topic, a.scorePercent ?? 0);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <ListChecks className="h-5 w-5 text-primary" />
          Grammar
        </h1>
        <p className="text-sm text-muted-foreground">
          Explicación clara + ejemplos, seguida de ejercicios progresivos para cada tema.
        </p>
      </div>

      <div className="space-y-3">
        {GRAMMAR_TOPICS.map((topic) => {
          const score = scoreByTopic.get(topic.slug);
          return (
            <Link
              key={topic.slug}
              href={`/grammar/${topic.slug}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
            >
              <div>
                <p className="text-xs font-medium text-primary">{topic.level}</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">{topic.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{topic.summary}</p>
              </div>
              <div className="flex items-center gap-3">
                {score !== undefined && (
                  <span className="text-xs font-medium text-success">{score}%</span>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
