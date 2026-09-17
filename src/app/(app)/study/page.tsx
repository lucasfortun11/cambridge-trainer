import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SKILL_LABELS } from "@/lib/dashboard-labels";
import { SKILL_ROUTES } from "@/lib/skill-routes";
import type { Skill } from "@/generated/prisma/client";

type Task = { skill: Skill; label: string; minutes: number };

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { session: sessionId } = await searchParams;

  const session = sessionId
    ? await prisma.studySession.findFirst({
        where: { id: sessionId, userId: user.id },
      })
    : await prisma.studySession.findFirst({
        where: { userId: user.id },
        orderBy: { date: "desc" },
      });

  const tasks: Task[] = session ? JSON.parse(session.tasks) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Tu sesión de estudio</h1>
        <p className="text-sm text-muted-foreground">
          {session
            ? `Generada automáticamente — ${session.plannedMinutes} minutos en total.`
            : "Genera una sesión desde el Dashboard para empezar."}
        </p>
      </div>

      {!session && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Todavía no has generado ninguna sesión de estudio.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Ir al Dashboard
          </Link>
        </div>
      )}

      {session && (
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <Link
              key={i}
              href={SKILL_ROUTES[task.skill]}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {SKILL_LABELS[task.skill] ?? task.label}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {task.minutes} minutos
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
