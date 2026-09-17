import type { Skill, ErrorCategory } from "@/generated/prisma/client";

export const SKILL_LABELS: Record<Skill, string> = {
  READING: "Reading",
  USE_OF_ENGLISH: "Use of English",
  WRITING: "Writing",
  LISTENING: "Listening",
  SPEAKING: "Speaking",
  GRAMMAR: "Grammar",
  VOCABULARY: "Vocabulary",
};

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  ARTICLES: "Articles",
  PREPOSITIONS: "Prepositions",
  TENSES: "Tenses",
  CONDITIONALS: "Conditionals",
  MODAL_VERBS: "Modal verbs",
  RELATIVE_CLAUSES: "Relative clauses",
  INVERSION: "Inversion",
  PASSIVE_VOICE: "Passive voice",
  REPORTED_SPEECH: "Reported speech",
  GERUNDS_INFINITIVES: "Gerunds/infinitives",
  COLLOCATIONS: "Collocations",
  PHRASAL_VERBS: "Phrasal verbs",
  WORD_FORMATION: "Word formation",
  VOCABULARY: "Vocabulary",
  SPELLING: "Spelling",
  WORD_CHOICE: "Word choice",
  REGISTER: "Register",
  PRONUNCIATION: "Pronunciation",
  COHESION: "Cohesion",
  OTHER: "Other",
};
