import { prisma } from "@/lib/prisma";

// Applies only to the repeatable, unbounded "generate me something new"
// actions a user can click as many times as they like (each one is a real
// DeepSeek call that isn't capped by a shared catalog check the way
// vocabulary/grammar-topic/writing-prompt generation is — see
// src/lib/grammar-topics.ts and src/lib/writing-prompts.ts, which are
// self-limiting once a level's shared catalog is stocked). Evaluating the
// user's own writing/speaking or chatting with the tutor is left uncapped
// since it's inherently bounded by how much a person can type/speak/ask.
const DAILY_LIMIT = 80;

export type AiGenerationKind =
  | "exercise"
  | "mini-lesson"
  | "mock-exam"
  | "vocabulary-word"
  | "translate"
  | "error-dna"
  | "class-exercise";

export class AiRateLimitError extends Error {
  constructor() {
    super(`Has alcanzado el límite diario de generación con IA (${DAILY_LIMIT}). Inténtalo de nuevo mañana.`);
    this.name = "AiRateLimitError";
  }
}

/** Pure threshold check, kept separate from the DB call so it's unit-testable without Prisma. */
export function isOverDailyLimit(usedWeight: number, weight: number, limit = DAILY_LIMIT): boolean {
  return usedWeight + weight > limit;
}

/**
 * Throws AiRateLimitError if recording this call would exceed the user's
 * daily AI-generation budget, otherwise logs it and lets the caller proceed.
 * `weight` lets a single action that fans out into several AI calls (e.g.
 * starting a Mock Exam, which generates up to 6 exercises) count for more
 * than a single click.
 */
export async function recordAiUsageOrThrow(userId: string, kind: AiGenerationKind, weight = 1): Promise<void> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const usage = await prisma.aiGenerationLog.aggregate({
    where: { userId, createdAt: { gte: since } },
    _sum: { weight: true },
  });
  const usedWeight = usage._sum.weight ?? 0;

  if (isOverDailyLimit(usedWeight, weight)) {
    throw new AiRateLimitError();
  }

  await prisma.aiGenerationLog.create({ data: { userId, kind, weight } });
}
