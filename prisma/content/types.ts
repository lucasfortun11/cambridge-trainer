// Shared shape for statically-authored exercise content, consumed by
// prisma/seed.ts. All content here is original — written for this app, not
// copied from any copyrighted exam material — but mirrors the task types,
// structure and difficulty of Cambridge C1 Advanced.

export type QuestionSeed = {
  order: number;
  questionType:
    | "MULTIPLE_CHOICE"
    | "OPEN_CLOZE"
    | "WORD_FORMATION"
    | "KEY_WORD_TRANSFORMATION"
    | "GAPPED_TEXT"
    | "MULTIPLE_MATCHING"
    | "SENTENCE_COMPLETION";
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  distractorExplanations?: Record<string, string>;
  grammarCategory?: string;
};

export type ExerciseSeed = {
  slug: string;
  type: string;
  skill: string;
  level: string;
  title: string;
  topic?: string;
  instructions: string;
  content: Record<string, unknown>;
  audioUrl?: string;
  questions: QuestionSeed[];
};
