import type { UserProfile, CEFRLevel, Sublevel } from "@/generated/prisma/client";
import { formatLevel } from "@/lib/placement";

type Row = { label: string; level: CEFRLevel | null; sublevel: Sublevel | null };

export function SkillLevelBreakdown({ profile }: { profile: UserProfile }) {
  const rows: Row[] = [
    { label: "Grammar", level: profile.grammarLevel, sublevel: profile.grammarSublevel },
    { label: "Vocabulary", level: profile.vocabularyLevel, sublevel: profile.vocabularySublevel },
    { label: "Reading", level: profile.readingLevel, sublevel: profile.readingSublevel },
    { label: "Use of English", level: profile.useOfEnglishLevel, sublevel: profile.useOfEnglishSublevel },
    { label: "Listening", level: profile.listeningLevel, sublevel: profile.listeningSublevel },
    { label: "Writing", level: profile.writingLevel, sublevel: profile.writingSublevel },
    { label: "Speaking", level: profile.speakingLevel, sublevel: profile.speakingSublevel },
  ];

  const withData = rows.filter((r) => r.level);
  if (withData.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-1 text-sm font-semibold text-foreground">Nivel detallado por destreza</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Basado en tu test de nivel y tu actividad reciente — estimación interna, no oficial de Cambridge.
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="text-xs text-muted-foreground">{r.label}</p>
            <p className="text-sm font-semibold text-foreground">
              {r.level && r.sublevel ? formatLevel(r.level, r.sublevel) : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
