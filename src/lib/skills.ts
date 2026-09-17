import { prisma } from "@/lib/prisma";
import type { Skill } from "@prisma/client";
import { SKILL_LABELS } from "@/lib/dashboard-labels";

export type SkillAccuracy = {
  skill: Skill;
  label: string;
  accuracy: number;
  hasData: boolean;
};

export async function getSkillAccuracy(userId: string): Promise<SkillAccuracy[]> {
  const progressEntries = await prisma.progress.findMany({
    where: { userId },
    select: { skill: true, accuracyPercent: true },
  });

  const bySkill = new Map<Skill, { total: number; count: number }>();
  for (const p of progressEntries) {
    const entry = bySkill.get(p.skill) ?? { total: 0, count: 0 };
    entry.total += p.accuracyPercent;
    entry.count += 1;
    bySkill.set(p.skill, entry);
  }

  return (Object.keys(SKILL_LABELS) as Skill[]).map((skill) => {
    const entry = bySkill.get(skill);
    return {
      skill,
      label: SKILL_LABELS[skill],
      accuracy: entry ? Math.round(entry.total / entry.count) : 0,
      hasData: Boolean(entry),
    };
  });
}

/** Allocates `minutes` across the weakest skills, giving more time to weaker ones. */
export function allocateSessionMinutes(
  skillAccuracy: SkillAccuracy[],
  minutes: number,
  maxSkills = 4
) {
  const weakest = [...skillAccuracy].sort((a, b) => a.accuracy - b.accuracy).slice(0, maxSkills);
  const totalWeight = weakest.reduce((sum, s) => sum + (100 - s.accuracy + 10), 0);

  return weakest
    .map((s) => {
      const weight = 100 - s.accuracy + 10;
      const raw = (weight / totalWeight) * minutes;
      const rounded = Math.max(5, Math.round(raw / 5) * 5);
      return { skill: s.skill, label: s.label, minutes: rounded };
    })
    .filter((t) => t.minutes > 0);
}
