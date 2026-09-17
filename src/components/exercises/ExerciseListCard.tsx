import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  RUE_PART1_MULTIPLE_CHOICE_CLOZE: "Part 1 — Multiple-choice cloze",
  RUE_PART2_OPEN_CLOZE: "Part 2 — Open cloze",
  RUE_PART3_WORD_FORMATION: "Part 3 — Word formation",
  RUE_PART4_KEY_WORD_TRANSFORMATION: "Part 4 — Key word transformation",
  RUE_PART5_MULTIPLE_CHOICE_READING: "Part 5 — Multiple choice reading",
  RUE_PART6_CROSS_TEXT_MULTIPLE_MATCHING: "Part 6 — Cross-text multiple matching",
  RUE_PART7_GAPPED_TEXT: "Part 7 — Gapped text",
  RUE_PART8_MULTIPLE_MATCHING: "Part 8 — Multiple matching",
  LISTENING_PART1_MULTIPLE_CHOICE: "Part 1 — Multiple choice",
  LISTENING_PART2_SENTENCE_COMPLETION: "Part 2 — Sentence completion",
  LISTENING_PART3_MULTIPLE_CHOICE: "Part 3 — Multiple choice",
  LISTENING_PART4_MULTIPLE_MATCHING: "Part 4 — Multiple matching",
  GRAMMAR_DRILL: "Grammar drill",
  VOCABULARY_DRILL: "Vocabulary drill",
};

export function ExerciseListCard({
  href,
  title,
  type,
  level,
  questionCount,
  lastScore,
}: {
  href: string;
  title: string;
  type: string;
  level: string;
  questionCount: number;
  lastScore: number | null;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
    >
      <div>
        <p className="text-xs font-medium text-primary">{TYPE_LABELS[type] ?? type}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {level} · {questionCount} preguntas
        </p>
      </div>
      <div className="flex items-center gap-3">
        {lastScore !== null && (
          <span className="flex items-center gap-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {lastScore}%
          </span>
        )}
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
