import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { AiRateLimitError, recordAiUsageOrThrow } from "@/lib/ai/rateLimit";
import { CATEGORY_EXPLANATIONS } from "@/content/error-category-explanations";
import type { ErrorCategory, Skill } from "@prisma/client";

const bodySchema = z.object({
  category: z.enum(Object.keys(CATEGORY_EXPLANATIONS) as [ErrorCategory, ...ErrorCategory[]]),
});

const VOCAB_CATEGORIES: ErrorCategory[] = ["VOCABULARY", "COLLOCATIONS", "PHRASAL_VERBS", "WORD_FORMATION", "SPELLING"];
const GRAMMAR_CATEGORIES: ErrorCategory[] = [
  "ARTICLES", "PREPOSITIONS", "TENSES", "CONDITIONALS", "MODAL_VERBS",
  "RELATIVE_CLAUSES", "INVERSION", "PASSIVE_VOICE", "REPORTED_SPEECH", "GERUNDS_INFINITIVES",
];

function skillForCategory(category: ErrorCategory): Skill {
  if (GRAMMAR_CATEGORIES.includes(category)) return "GRAMMAR";
  if (VOCAB_CATEGORIES.includes(category)) return "VOCABULARY";
  return "USE_OF_ENGLISH";
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
  }

  const { category } = parsed.data;
  const info = CATEGORY_EXPLANATIONS[category];
  const level = user.profile?.targetLevel ?? "C1";

  try {
    await recordAiUsageOrThrow(user.id, "mini-lesson");
  } catch (err) {
    if (err instanceof AiRateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  const ai = getAIProvider();
  const generated = await ai.generateExercise({
    skill: skillForCategory(category),
    level,
    focusCategories: [category],
    count: 15,
  });
  const questions = generated.questions;

  const exercise = await prisma.exercise.create({
    data: {
      slug: `mini-${category.toLowerCase()}-${Date.now()}`,
      type: "GRAMMAR_DRILL",
      skill: skillForCategory(category),
      level,
      title: `Mini-lección: ${info.title}`,
      topic: `mini-lesson-${category.toLowerCase()}`,
      instructions: `5 preguntas fáciles, 5 intermedias y 5 avanzadas (nivel ${level}) sobre este tema — de fácil a difícil.`,
      content: JSON.stringify({}),
      questions: {
        create: questions.map((q) => ({
          order: q.order,
          questionType: q.questionType,
          prompt: q.prompt,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          distractorExplanations: q.distractorExplanations ? JSON.stringify(q.distractorExplanations) : null,
          grammarCategory: category,
        })),
      },
    },
  });

  return NextResponse.json({ id: exercise.id });
}
