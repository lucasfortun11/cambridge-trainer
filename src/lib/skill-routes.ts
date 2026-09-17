import type { Skill } from "@prisma/client";

export const SKILL_ROUTES: Record<Skill, string> = {
  READING: "/reading",
  USE_OF_ENGLISH: "/use-of-english",
  WRITING: "/writing",
  LISTENING: "/listening",
  SPEAKING: "/speaking",
  GRAMMAR: "/grammar",
  VOCABULARY: "/vocabulary",
};
