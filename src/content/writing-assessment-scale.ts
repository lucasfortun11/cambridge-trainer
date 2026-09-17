// Official Cambridge English Writing assessment scale (CEFR-referenced),
// paraphrased from the publicly available teacher handbooks (e.g. the B2
// First Handbook, "Writing Assessment" chapter). This is the actual rubric
// language examiners use — reproduced here as structural/factual assessment
// criteria (not exam questions or passages) to ground the app's AI Writing
// evaluator in the real standard instead of an approximation of it.
//
// Content is a single scale shared across every level; Communicative
// Achievement, Organisation and Language have separate descriptors per
// CEFR level. A1 has no standalone Cambridge qualification, so it reuses
// the A2 descriptor with a note to expect simpler language.

import type { CEFRLevel } from "@/generated/prisma/client";

export const WRITING_CONTENT_SCALE = [
  { band: 5, descriptor: "All content is relevant to the task. The target reader is fully informed." },
  {
    band: 3,
    descriptor:
      "Minor irrelevances and/or omissions may be present. The target reader is on the whole informed.",
  },
  {
    band: 1,
    descriptor:
      "Irrelevances and misinterpretation of the task may be present. The target reader is minimally informed.",
  },
  { band: 0, descriptor: "Content is totally irrelevant. The target reader is not informed." },
];

export type WritingLevelDescriptor = {
  communicativeAchievement: string;
  organisation: string;
  language: string;
};

export const WRITING_LEVEL_DESCRIPTORS: Record<CEFRLevel, WritingLevelDescriptor> = {
  A1: {
    // No standalone Cambridge exam at A1 — same shape as A2, calibrated down.
    communicativeAchievement:
      "Produces text that communicates very simple, isolated ideas, using highly basic conventions of the task.",
    organisation: "Text uses only the most basic linking words (and, but), if any at all.",
    language:
      "Uses a very small range of basic vocabulary and simple grammatical forms with limited control. Errors frequently impede meaning.",
  },
  A2: {
    communicativeAchievement: "Produces text that communicates simple ideas in simple ways.",
    organisation: "Text is connected using basic, high-frequency linking words.",
    language:
      "Uses basic vocabulary reasonably appropriately. Uses simple grammatical forms with some degree of control. Errors may impede meaning at times.",
  },
  B1: {
    communicativeAchievement:
      "Uses the conventions of the communicative task in generally appropriate ways to communicate straightforward ideas.",
    organisation:
      "Text is connected and coherent, using basic linking words and a limited number of cohesive devices.",
    language:
      "Uses everyday vocabulary generally appropriately, while occasionally overusing certain lexis. Uses simple grammatical forms with a good degree of control. While errors are noticeable, meaning can still be determined.",
  },
  B2: {
    communicativeAchievement:
      "Uses the conventions of the communicative task to hold the target reader's attention and communicate straightforward ideas.",
    organisation:
      "Text is generally well organised and coherent, using a variety of linking words and cohesive devices.",
    language:
      "Uses a range of everyday vocabulary appropriately, with occasional inappropriate use of less common lexis. Uses a range of simple and some complex grammatical forms with a good degree of control. Errors do not impede communication.",
  },
  C1: {
    communicativeAchievement:
      "Uses the conventions of the communicative task effectively to hold the target reader's attention and communicate straightforward and complex ideas, as appropriate.",
    organisation:
      "Text is well organised and coherent, using a variety of cohesive devices and organisational patterns to generally good effect.",
    language:
      "Uses a range of vocabulary, including less common lexis, appropriately. Uses a range of simple and complex grammatical forms with control and flexibility. Occasional errors may be present but do not impede communication.",
  },
  C2: {
    communicativeAchievement:
      "Uses the conventions of the communicative task with sufficient flexibility to communicate complex ideas in an effective way, holding the target reader's attention with ease, fulfilling all communicative purposes.",
    organisation:
      "Text is a well-organised, coherent whole, using a variety of cohesive devices and organisational patterns with flexibility.",
    language:
      "Uses a range of vocabulary, including less common lexis, effectively and precisely. Uses a wide range of simple and complex grammatical forms with full control, flexibility and sophistication. Errors, if present, are related to less common words and structures, or occur as slips.",
  },
};

/**
 * Renders every level's top-band descriptor compactly, for placing a piece
 * of writing independently of whatever level it was actually judged against
 * — e.g. a C1-targeting candidate whose writing genuinely reads as B2 (or
 * as C2) should be told that, not just scored against the C1 rubric.
 */
export function formatAllWritingLevelsForPrompt(): string {
  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return levels
    .map((l) => {
      const d = WRITING_LEVEL_DESCRIPTORS[l];
      return `${l}: ${d.communicativeAchievement} ${d.organisation} ${d.language}`;
    })
    .join("\n");
}

/** Renders the level's official band descriptor as compact prompt text for the AI examiner. */
export function formatWritingScaleForPrompt(level: CEFRLevel): string {
  const d = WRITING_LEVEL_DESCRIPTORS[level];
  const contentBands = WRITING_CONTENT_SCALE.map((c) => `${c.band}: ${c.descriptor}`).join(" | ");
  return (
    `Official Cambridge Writing assessment scale for ${level} (use this exact standard, do not invent your own):\n` +
    `Content (0-5, shared across all levels): ${contentBands}\n` +
    `Communicative Achievement (top band, 5): ${d.communicativeAchievement}\n` +
    `Organisation (top band, 5): ${d.organisation}\n` +
    `Language (top band, 5): ${d.language}\n` +
    `Scale down proportionally for weaker performances — a script that falls well short of this description on a ` +
    `subscale should score well below 5 on it, and a script with serious task/content/language failures should score ` +
    `1-2, not a softened 3.`
  );
}
