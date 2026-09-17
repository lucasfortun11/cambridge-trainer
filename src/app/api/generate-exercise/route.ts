import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { AiRateLimitError, recordAiUsageOrThrow } from "@/lib/ai/rateLimit";
import { typicalPartQuestionCount } from "@/content/exam-format-specs";
import type { ExamPart, Skill } from "@prisma/client";

const bodySchema = z.object({
  skill: z.enum(["READING", "USE_OF_ENGLISH", "LISTENING", "GRAMMAR"]),
  count: z.number().int().min(3).max(10).optional(),
  topic: z.string().min(1).max(80).optional(),
  topicTitle: z.string().min(1).max(200).optional(),
});

const TYPE_FOR_SKILL: Record<string, ExamPart> = {
  READING: "RUE_PART5_MULTIPLE_CHOICE_READING",
  USE_OF_ENGLISH: "RUE_PART1_MULTIPLE_CHOICE_CLOZE",
  LISTENING: "LISTENING_PART1_MULTIPLE_CHOICE",
  GRAMMAR: "GRAMMAR_DRILL",
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { skill, count, topic, topicTitle } = parsed.data;
  const level = user.profile?.targetLevel ?? "C1";

  try {
    await recordAiUsageOrThrow(user.id, "exercise");
  } catch (err) {
    if (err instanceof AiRateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  const defaultCount =
    skill === "GRAMMAR" ? 6 : typicalPartQuestionCount(level, skill as "READING" | "USE_OF_ENGLISH" | "LISTENING");

  const ai = getAIProvider();
  const generated = await ai.generateExercise({
    skill: skill as Skill,
    level,
    count: count ?? defaultCount,
    topicHint: topicTitle,
  });

  const content: Record<string, unknown> =
    skill === "LISTENING"
      ? { transcript: generated.passage, audioPending: true }
      : generated.passage
        ? { passage: generated.passage }
        : {};

  const exercise = await prisma.exercise.create({
    data: {
      slug: `generated-${skill.toLowerCase()}-${Date.now()}`,
      type: TYPE_FOR_SKILL[skill],
      skill: skill as Skill,
      level,
      title: generated.title,
      topic: topic ?? "ai-generated",
      instructions: generated.instructions,
      content: JSON.stringify(content),
      questions: {
        create: generated.questions.map((q) => ({
          order: q.order,
          questionType: q.questionType,
          prompt: q.prompt,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          distractorExplanations: q.distractorExplanations
            ? JSON.stringify(q.distractorExplanations)
            : null,
          grammarCategory: q.grammarCategory ?? null,
        })),
      },
    },
  });

  return NextResponse.json({ id: exercise.id });
}
