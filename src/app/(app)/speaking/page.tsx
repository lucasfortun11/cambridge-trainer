import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { SPEAKING_PROMPTS } from "@/content/speaking-prompts";
import { SpeakingHistory } from "@/components/speaking/SpeakingHistory";

const PART_LABELS: Record<string, string> = {
  INTERVIEW: "Part 1 — Interview",
  LONG_TURN: "Part 2 — Long Turn",
  COLLABORATIVE_TASK: "Part 3 — Collaborative Task",
  DISCUSSION: "Part 4 — Discussion",
};

export default async function SpeakingPage() {
  await requireOnboardedUser();

  const grouped = SPEAKING_PROMPTS.reduce<Record<string, typeof SPEAKING_PROMPTS>>((acc, p) => {
    (acc[p.part] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Mic className="h-5 w-5 text-primary" />
          Speaking
        </h1>
        <p className="text-sm text-muted-foreground">
          Graba tu respuesta con el micrófono — se transcribe automáticamente y se analiza al
          instante. El audio nunca se sube al servidor, solo la transcripción.
        </p>
      </div>

      {Object.entries(grouped).map(([part, prompts]) => (
        <div key={part}>
          <h2 className="mb-2 text-sm font-semibold text-foreground">{PART_LABELS[part]}</h2>
          <div className="space-y-2">
            {prompts.map((p) => (
              <Link
                key={p.slug}
                href={`/speaking/${p.slug}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
              >
                <p className="text-sm text-foreground">{p.title}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      <SpeakingHistory />
    </div>
  );
}
