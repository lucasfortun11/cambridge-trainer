import { Trophy, Flame, Star, Lock } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { levelFromXp } from "@/lib/gamification";

export default async function AchievementsPage() {
  const user = await requireOnboardedUser();

  const [achievements, unlocked] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      select: { achievementId: true, unlockedAt: true },
    }),
  ]);

  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));
  const profile = user.profile;
  const xp = profile?.xp ?? 0;
  const level = levelFromXp(xp);
  const xpIntoLevel = xp % 500;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Trophy className="h-5 w-5 text-primary" />
          Logros
        </h1>
        <p className="text-sm text-muted-foreground">
          Tu progreso de gamificación — no sustituye al estudio, solo lo hace más motivador.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <Star className="mx-auto mb-1 h-5 w-5 text-primary" />
          <p className="text-lg font-semibold text-foreground">Nivel {level}</p>
          <p className="text-xs text-muted-foreground">{xp} XP total</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(xpIntoLevel / 500) * 100}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <Flame className="mx-auto mb-1 h-5 w-5 text-warning" />
          <p className="text-lg font-semibold text-foreground">{profile?.currentStreak ?? 0} días</p>
          <p className="text-xs text-muted-foreground">Racha actual</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <Trophy className="mx-auto mb-1 h-5 w-5 text-success" />
          <p className="text-lg font-semibold text-foreground">{unlocked.length}/{achievements.length}</p>
          <p className="text-xs text-muted-foreground">Logros desbloqueados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {achievements.map((a) => {
          const isUnlocked = unlockedMap.has(a.id);
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-xl border p-4 ${
                isUnlocked ? "border-primary/30 bg-surface" : "border-border bg-surface-muted opacity-60"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xl">
                {isUnlocked ? a.icon : <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
