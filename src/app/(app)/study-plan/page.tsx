import { CalendarDays } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudyPlanGenerator } from "@/components/study-plan/StudyPlanGenerator";
import { SKILL_LABELS } from "@/lib/dashboard-labels";

type WeekPlan = {
  week: number;
  grammar: string[];
  vocabulary: string[];
  reading: string[];
  writing: string[];
  listening: string[];
  speaking: string[];
};

export default async function StudyPlanPage() {
  const user = await requireOnboardedUser();

  const plan = await prisma.studyPlan.findFirst({
    where: { userId: user.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  const weeks: WeekPlan[] = plan ? JSON.parse(plan.weeks) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <CalendarDays className="h-5 w-5 text-primary" />
          Plan de estudio
        </h1>
        <p className="text-sm text-muted-foreground">
          Un calendario semanal generado a partir de tus puntos débiles. Se actualiza cada vez
          que lo regeneras.
        </p>
      </div>

      <StudyPlanGenerator
        initialExamDate={plan?.examDate ? plan.examDate.toISOString().slice(0, 10) : null}
        initialDailyMinutes={plan?.dailyMinutes ?? 60}
        initialDaysPerWeek={plan?.daysPerWeek ?? 5}
      />

      {weeks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no tienes un plan generado. Rellena el formulario de arriba para crear uno.
        </p>
      ) : (
        <div className="space-y-3">
          {weeks.map((w) => (
            <div key={w.week} className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-2 text-sm font-semibold text-foreground">Semana {w.week}</p>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <WeekBlock label={SKILL_LABELS.GRAMMAR} items={w.grammar} />
                <WeekBlock label={SKILL_LABELS.VOCABULARY} items={w.vocabulary} />
                <WeekBlock label={SKILL_LABELS.READING} items={w.reading} />
                <WeekBlock label={SKILL_LABELS.WRITING} items={w.writing} />
                <WeekBlock label={SKILL_LABELS.LISTENING} items={w.listening} />
                <WeekBlock label={SKILL_LABELS.SPEAKING} items={w.speaking} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeekBlock({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium text-primary">{label}</p>
      <ul className="text-muted-foreground">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
