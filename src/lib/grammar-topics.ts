// Grammar topic content: the 13 hand-authored B2/C1 topics are used as-is
// for C1-targeting users (see src/content/grammar-topics.ts); every other
// level gets a genuinely level-appropriate topic list generated with AI and
// persisted as a shared catalog per level, reused across all users at that
// level — the same assemble-from-bank pattern used for VocabularyWord.

import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { GRAMMAR_TOPICS } from "@/content/grammar-topics";
import type { CEFRLevel } from "@prisma/client";

const TARGET_TOPIC_COUNT = 8;

export type GrammarTopicView = {
  slug: string;
  title: string;
  level: string;
  summary: string;
  explanation: string[];
  examples: { correct: string; note?: string }[];
};

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "topic"
  );
}

export async function getGrammarTopicsForLevel(level: CEFRLevel): Promise<GrammarTopicView[]> {
  if (level === "C1") {
    return GRAMMAR_TOPICS.map((t) => ({ ...t }));
  }

  const existing = await prisma.generatedGrammarTopic.findMany({
    where: { level },
    orderBy: { createdAt: "asc" },
  });

  if (existing.length >= TARGET_TOPIC_COUNT) {
    return existing.map(mapRow);
  }

  try {
    const ai = getAIProvider();
    const generated = await ai.generateGrammarTopics({
      level,
      count: TARGET_TOPIC_COUNT - existing.length,
    });

    const existingSlugs = new Set(existing.map((t) => t.slug));
    const created = [];
    for (const t of generated) {
      let slug = slugify(t.slug || t.title);
      if (existingSlugs.has(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      existingSlugs.add(slug);
      try {
        const row = await prisma.generatedGrammarTopic.create({
          data: {
            level,
            slug,
            title: t.title,
            summary: t.summary,
            explanation: JSON.stringify(t.explanation),
            examples: JSON.stringify(t.examples),
          },
        });
        created.push(row);
      } catch {
        // Unique constraint race with a concurrent request — skip, the
        // other request's row already covers this slot.
      }
    }
    return [...existing.map(mapRow), ...created.map(mapRow)];
  } catch (err) {
    console.error("[grammar-topics] generation failed, returning what's cached:", err);
    return existing.map(mapRow);
  }
}

export async function getGrammarTopicBySlug(
  level: CEFRLevel,
  slug: string
): Promise<GrammarTopicView | null> {
  if (level === "C1") {
    const topic = GRAMMAR_TOPICS.find((t) => t.slug === slug);
    return topic ? { ...topic } : null;
  }

  const row = await prisma.generatedGrammarTopic.findUnique({ where: { slug } });
  return row ? mapRow(row) : null;
}

function mapRow(row: {
  slug: string;
  title: string;
  level: CEFRLevel;
  summary: string;
  explanation: string;
  examples: string;
}): GrammarTopicView {
  return {
    slug: row.slug,
    title: row.title,
    level: row.level,
    summary: row.summary,
    explanation: JSON.parse(row.explanation) as string[],
    examples: JSON.parse(row.examples) as { correct: string; note?: string }[],
  };
}
