// Shared types for the AIProvider abstraction (see provider.ts).
// Keeping these independent from Prisma's generated types means the AI layer
// can be swapped (mock -> real LLM) without the rest of the app changing.

import type { CEFRLevel, ErrorCategory, Skill, Sublevel, WritingType, SpeakingPart } from "@prisma/client";

export type GenerateExerciseInput = {
  skill: Skill;
  level: CEFRLevel;
  focusCategories?: ErrorCategory[];
  count?: number;
  // Free-text grammar point to focus on (e.g. "Present simple: he/she/it"),
  // used instead of focusCategories when the topic doesn't map to a fixed
  // ErrorCategory — e.g. AI-generated per-level grammar topics.
  topicHint?: string;
};

export type GeneratedQuestion = {
  order: number;
  prompt: string;
  questionType:
    | "MULTIPLE_CHOICE"
    | "OPEN_CLOZE"
    | "WORD_FORMATION"
    | "KEY_WORD_TRANSFORMATION"
    | "GAPPED_TEXT"
    | "MULTIPLE_MATCHING"
    | "SENTENCE_COMPLETION";
  options?: string[];
  correctAnswer: string;
  explanation: string;
  distractorExplanations?: Record<string, string>;
  grammarCategory?: ErrorCategory;
};

export type GeneratedExercise = {
  title: string;
  instructions: string;
  passage?: string;
  questions: GeneratedQuestion[];
};

export type EvaluateWritingInput = {
  type: WritingType;
  prompt: string;
  text: string;
  level?: CEFRLevel;
  minWords?: number;
  maxWords?: number;
};

export type WritingFeedback = {
  scoreContent: number;
  scoreCommunicativeAchievement: number;
  scoreOrganisation: number;
  scoreLanguage: number;
  overallScore: number;
  grammarErrors: { original: string; correction: string; explanation: string }[];
  vocabularyImprovements: { original: string; suggestion: string; reason: string }[];
  structureIssues: string[];
  cohesionIssues: string[];
  register: string;
  recommendations: string[];
  improvedVersion: string;
  // Independent CEFR placement for THIS piece of writing — separate from
  // how it scores against the target level's rubric above. A C1-targeting
  // candidate whose writing actually reads as B2 (or as C2) should be told
  // that plainly, the way a real Cambridge result can report an adjacent
  // level.
  estimatedLevel: CEFRLevel;
  estimatedSublevel: Sublevel;
};

export type EvaluateSpeakingInput = {
  part: SpeakingPart;
  prompt: string;
  transcript: string;
  durationSeconds?: number;
  level?: CEFRLevel;
};

export type SpeakingFeedback = {
  scoreFluency: number;
  scoreGrammar: number;
  scoreVocabulary: number;
  scoreCoherence: number;
  scorePronunciation: number;
  overallScore: number;
  repeatedWords: { word: string; count: number }[];
  alternatives: { overused: string; alternatives: string[] }[];
  hesitationNotes: string[];
  feedback: string[];
  // Independent CEFR placement for THIS spoken performance — see the same
  // field on WritingFeedback for why it's separate from the target-level score.
  estimatedLevel: CEFRLevel;
  estimatedSublevel: Sublevel;
};

export type ExplainGrammarInput = {
  question: string;
  level?: CEFRLevel;
};

export type GrammarExplanation = {
  explanation: string;
  examples: string[];
  relatedExercises: GeneratedQuestion[];
};

export type GenerateVocabularyInput = {
  topic?: string;
  level: CEFRLevel;
  count?: number;
  // Real Cambridge-wordlist candidates to prefer picking from (A2/B1 only —
  // see src/content/official-wordlists.ts). When present, generated words
  // should come from this pool rather than being invented freely.
  candidateWords?: { word: string; pos: string }[];
};

export type GeneratedVocabularyWord = {
  word: string;
  definition: string;
  translation?: string;
  exampleSentence: string;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  phrasalVerbs: string[];
  pronunciationIPA?: string;
  category?: string;
  cefrLevel: CEFRLevel;
  // For a multi-word entry (a phrase, not a single word): a breakdown of
  // its grammatical structure and verb tense, e.g. why "would have gone"
  // is a third conditional. Omitted for single words.
  grammarNote?: string;
};

export type ExplainWordInput = {
  // The exact word or short phrase the user selected somewhere in the app.
  word: string;
  // The sentence/paragraph it was selected from, if available — helps pick
  // the right sense of an ambiguous word (e.g. "book" a hotel vs. a novel).
  context?: string;
  level: CEFRLevel;
};

export type TranslateTextInput = {
  // The exact word or short phrase the user selected somewhere in the app.
  text: string;
  // The sentence/paragraph it was selected from, if available — helps
  // disambiguate.
  context?: string;
};

export type TranslateTextResult = {
  translation: string;
};

export type ErrorSummary = {
  category: ErrorCategory;
  count: number;
  lastSevenDays: number;
  trend: "up" | "down" | "flat";
};

export type AnalyzeErrorsInput = {
  errors: { category: ErrorCategory; createdAt: Date }[];
};

export type AnalyzeErrorsResult = {
  summary: ErrorSummary[];
  weakestCategories: ErrorCategory[];
  recommendation: string;
};

export type ErrorDnaSample = {
  category: ErrorCategory;
  questionText?: string;
  userAnswer?: string;
  correctAnswer?: string;
};

export type GenerateErrorDnaInput = {
  errorSummary: ErrorSummary[];
  // A handful of concrete recent mistakes (from the top few categories) to
  // ground the diagnosis in real evidence instead of abstract counts.
  samples: ErrorDnaSample[];
  level: CEFRLevel;
};

export type ErrorDnaResult = {
  // One punchy sentence naming the core pattern.
  headline: string;
  // 2-4 paragraphs explaining WHY these specific errors likely happen —
  // e.g. L1 (Spanish) interference, a specific rule being over/under-
  // generalised — not just restating the error counts.
  narrative: string;
  // 3-5 concrete, prioritised things to focus on next.
  focusAreas: string[];
};

export type GenerateStudyPlanInput = {
  examDate?: Date;
  dailyMinutes: number;
  daysPerWeek: number;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel;
  weakSkills: Skill[];
};

export type StudyPlanWeek = {
  week: number;
  grammar: string[];
  vocabulary: string[];
  reading: string[];
  writing: string[];
  listening: string[];
  speaking: string[];
};

export type GeneratedStudyPlan = {
  weeks: StudyPlanWeek[];
};

export type ChatWithTutorInput = {
  history: { role: "USER" | "TUTOR"; content: string }[];
  message: string;
  level?: CEFRLevel;
};

export type TutorReply = {
  reply: string;
  suggestedExercises?: GeneratedQuestion[];
};

export type DailySessionTask = {
  skill: Skill;
  minutes: number;
  reason: string;
};

export type GenerateGrammarTopicsInput = {
  level: CEFRLevel;
  count: number;
};

export type GeneratedGrammarTopicItem = {
  slug: string;
  title: string;
  summary: string;
  explanation: string[];
  examples: { correct: string; note?: string }[];
};

export type GenerateWritingPromptsInput = {
  level: CEFRLevel;
  count: number;
};

// "Mi Clase" — independent from Cambridge exam content. Exercises here must
// be generated ONLY from materialText (the user's own class/academy
// material), never from Cambridge exam knowledge or invented content.
export type GenerateExerciseFromMaterialInput = {
  materialText: string;
  materialTitle: string;
  count?: number;
  // Optional free-text steer from the user, e.g. "céntrate en el vocabulario
  // de la unidad 3" — never a Cambridge skill/level like GenerateExerciseInput.
  focusInstructions?: string;
};

export type GeneratedWritingPromptItem = {
  slug: string;
  type: WritingType;
  title: string;
  brief: string;
  notes?: string[];
  minWords: number;
  maxWords: number;
};
