import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { WRITING_PROMPTS } from "@/content/writing-prompts";
import { SPEAKING_PROMPTS } from "@/content/speaking-prompts";
import { examInfo } from "@/lib/cambridge-exams";
import { typicalPartQuestionCount } from "@/content/exam-format-specs";
import type { CEFRLevel } from "@prisma/client";

const RUE_SLUGS = [
  "rue-p1-remote-work",
  "rue-p2-urban-green-spaces",
  "rue-p3-artificial-intelligence",
  "rue-p4-transformations-1",
  "rue-p5-the-last-bookshop",
  "rue-p6-four-opinions-social-media",
  "rue-p7-the-apprenticeship",
  "rue-p8-five-freelancers",
];

const LISTENING_SLUGS = [
  "listening-p1-short-extracts",
  "listening-p2-sustainable-architecture",
  "listening-p3-multiple-choice-interview",
  "listening-p4-five-speakers-work",
];

export type MockExamDetails = {
  rueExerciseIds: string[];
  listeningExerciseIds: string[];
  writingPromptSlug: string;
  speakingPromptSlugs: string[];
};

async function generateExercisePersisted(
  skill: "READING" | "USE_OF_ENGLISH" | "LISTENING",
  level: CEFRLevel
): Promise<string> {
  const ai = getAIProvider();
  const generated = await ai.generateExercise({ skill, level, count: typicalPartQuestionCount(level, skill) });
  const content =
    skill === "LISTENING"
      ? { transcript: generated.passage, audioPending: true }
      : generated.passage
        ? { passage: generated.passage }
        : {};
  const type =
    skill === "READING"
      ? "RUE_PART5_MULTIPLE_CHOICE_READING"
      : skill === "USE_OF_ENGLISH"
        ? "RUE_PART1_MULTIPLE_CHOICE_CLOZE"
        : "LISTENING_PART1_MULTIPLE_CHOICE";

  const exercise = await prisma.exercise.create({
    data: {
      slug: `mock-${skill.toLowerCase()}-${level.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      skill,
      level,
      title: generated.title,
      topic: "ai-generated",
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
  return exercise.id;
}

export async function buildMockExamDetails(level: CEFRLevel): Promise<MockExamDetails> {
  const writingPrompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
  const speakingPromptSlugs = ["INTERVIEW", "LONG_TURN", "COLLABORATIVE_TASK", "DISCUSSION"].map((part) => {
    const options = SPEAKING_PROMPTS.filter((p) => p.part === part);
    return options[Math.floor(Math.random() * options.length)].slug;
  });

  if (level === "C1") {
    // The hand-authored C1 content library is rich enough to use directly.
    const exercises = await prisma.exercise.findMany({
      where: { slug: { in: [...RUE_SLUGS, ...LISTENING_SLUGS] } },
      select: { id: true, slug: true },
    });
    const bySlug = new Map(exercises.map((e) => [e.slug, e.id]));
    return {
      rueExerciseIds: RUE_SLUGS.map((s) => bySlug.get(s)).filter((x): x is string => Boolean(x)),
      listeningExerciseIds: LISTENING_SLUGS.map((s) => bySlug.get(s)).filter((x): x is string => Boolean(x)),
      writingPromptSlug: writingPrompt.slug,
      speakingPromptSlugs,
    };
  }

  // Other levels: generate a fresh, level-appropriate exam with AI (also
  // grows the shared exercise catalog at that level for future users).
  const [reading1, reading2, uoe1, uoe2, listening1, listening2] = await Promise.all([
    generateExercisePersisted("READING", level),
    generateExercisePersisted("READING", level),
    generateExercisePersisted("USE_OF_ENGLISH", level),
    generateExercisePersisted("USE_OF_ENGLISH", level),
    generateExercisePersisted("LISTENING", level),
    generateExercisePersisted("LISTENING", level),
  ]);

  return {
    rueExerciseIds: [reading1, reading2, uoe1, uoe2],
    listeningExerciseIds: [listening1, listening2],
    writingPromptSlug: writingPrompt.slug,
    speakingPromptSlugs,
  };
}

export function estimateGrade(level: CEFRLevel, overallScore: number): string {
  const { scoreMax, passScore } = examInfo(level);
  const topBand = passScore + (scoreMax - passScore) * 0.6;
  if (overallScore >= topBand) return `Grade A (${level} alto)`;
  if (overallScore >= passScore) return `Grade B/C (${level})`;
  return `Cerca de ${level}`;
}
