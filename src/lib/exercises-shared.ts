// Pure, server/client-safe helpers for exercise content. Deliberately has NO
// dependency on Prisma — importing the generated client here would drag
// Node built-ins (node:process, node:module...) into client bundles that
// import this module (e.g. ExercisePlayer), breaking Turbopack's browser
// chunking. Server-only data fetching lives in src/lib/exercises.ts instead.

export type PlayerQuestion = {
  id: string;
  order: number;
  questionType: string;
  prompt: string;
  options: string[] | null;
};

export type PlayerExercise = {
  id: string;
  slug: string;
  title: string;
  type: string;
  skill: string;
  level: string;
  topic: string | null;
  instructions: string;
  content: Record<string, unknown>;
  audioUrl: string | null;
  questions: PlayerQuestion[];
};

/** Derives a shared option set (e.g. A-F) for matching-style questions that don't carry per-question options. */
export function getSharedOptionsFromContent(content: Record<string, unknown>): string[] {
  if (content.sentences && typeof content.sentences === "object") {
    return Object.keys(content.sentences as object);
  }
  if (content.options && typeof content.options === "object") {
    return Object.keys(content.options as object);
  }
  if (Array.isArray(content.passages)) {
    return (content.passages as { label: string }[]).map((p) => p.label);
  }
  return [];
}
