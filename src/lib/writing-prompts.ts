// Writing prompt content: the 10 hand-authored C1-style tasks (Essay,
// Proposal, Report, Review, Email/Letter — ~220-260 words each) are used
// as-is for C1-targeting users (see src/content/writing-prompts.ts). Every
// other level gets genuinely level-appropriate tasks generated with AI —
// e.g. a short guided message of 20-35 words for A2 Key, not a CAE essay —
// persisted as a shared catalog per level and reused across all users at
// that level, the same assemble-from-bank pattern used for VocabularyWord.

import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { WRITING_PROMPTS, type WritingPrompt } from "@/content/writing-prompts";
import type { CEFRLevel } from "@/generated/prisma/client";

const TARGET_PROMPT_COUNT = 6;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "prompt"
  );
}

export async function getWritingPromptsForLevel(level: CEFRLevel): Promise<WritingPrompt[]> {
  if (level === "C1") {
    return WRITING_PROMPTS;
  }

  const existing = await prisma.generatedWritingPrompt.findMany({
    where: { level },
    orderBy: { createdAt: "asc" },
  });

  if (existing.length >= TARGET_PROMPT_COUNT) {
    return existing.map(mapRow);
  }

  try {
    const ai = getAIProvider();
    const generated = await ai.generateWritingPrompts({
      level,
      count: TARGET_PROMPT_COUNT - existing.length,
    });

    const existingSlugs = new Set(existing.map((p) => p.slug));
    const created = [];
    for (const p of generated) {
      let slug = slugify(p.slug || p.title);
      if (existingSlugs.has(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      existingSlugs.add(slug);
      try {
        const row = await prisma.generatedWritingPrompt.create({
          data: {
            level,
            slug,
            type: p.type,
            title: p.title,
            brief: p.brief,
            notes: p.notes ? JSON.stringify(p.notes) : null,
            minWords: p.minWords,
            maxWords: p.maxWords,
          },
        });
        created.push(row);
      } catch {
        // Unique constraint race with a concurrent request — skip.
      }
    }
    return [...existing.map(mapRow), ...created.map(mapRow)];
  } catch (err) {
    console.error("[writing-prompts] generation failed, returning what's cached:", err);
    return existing.map(mapRow);
  }
}

export async function getWritingPromptBySlug(
  level: CEFRLevel,
  slug: string
): Promise<WritingPrompt | null> {
  if (level === "C1") {
    return WRITING_PROMPTS.find((p) => p.slug === slug) ?? null;
  }

  const row = await prisma.generatedWritingPrompt.findUnique({ where: { slug } });
  return row ? mapRow(row) : null;
}

function mapRow(row: {
  slug: string;
  type: WritingPrompt["type"];
  title: string;
  brief: string;
  notes: string | null;
  minWords: number;
  maxWords: number;
}): WritingPrompt {
  return {
    slug: row.slug,
    type: row.type,
    title: row.title,
    brief: row.brief,
    notes: row.notes ? (JSON.parse(row.notes) as string[]) : undefined,
    minWords: row.minWords,
    maxWords: row.maxWords,
  };
}
