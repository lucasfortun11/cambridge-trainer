// Official exam format specifications, transcribed from Cambridge English's
// publicly available teacher handbooks (A2 Key, B1 Preliminary, B2 First,
// C1 Advanced, C2 Proficiency — "Content overview" tables). This is
// factual/structural exam-blueprint information (part counts, question
// counts, timing, task types) rather than exam content itself, so it's
// used both to ground exercise generation in the real question counts per
// part and to show candidates an accurate picture of what they'll actually
// face — none of it is a real exam question, passage or transcript.

import type { CEFRLevel } from "@prisma/client";

export type ExamPartSpec = {
  part: number;
  taskType: string;
  questions: number;
  description: string;
};

export type PaperSpec = {
  name: string;
  timing: string;
  parts: ExamPartSpec[];
  totalQuestions?: number;
  notes?: string;
};

export type LevelExamFormat = {
  readingUseOfEnglish: PaperSpec;
  writing: PaperSpec;
  listening: PaperSpec;
  speaking: PaperSpec;
};

const A2_FORMAT: LevelExamFormat = {
  readingUseOfEnglish: {
    name: "Reading",
    timing: "1 hour (shared with Writing)",
    totalQuestions: 30,
    parts: [
      { part: 1, taskType: "3-option multiple choice", questions: 6, description: "Read six short real-world texts (notices, signs, messages) for the main message." },
      { part: 2, taskType: "3-option multiple matching", questions: 7, description: "Match seven questions to three short texts on the same topic." },
      { part: 3, taskType: "3-option multiple choice", questions: 5, description: "Read one long text for detailed understanding and main ideas." },
      { part: 4, taskType: "3-option multiple-choice cloze", questions: 6, description: "Read a factual text and choose the correct vocabulary for each gap." },
      { part: 5, taskType: "Open cloze", questions: 6, description: "Complete gaps in an email (and sometimes a reply) using one word each." },
    ],
  },
  writing: {
    name: "Writing",
    timing: "included in the 1-hour Reading and Writing paper",
    parts: [
      { part: 6, taskType: "Guided writing", questions: 1, description: "Write a short email or note, 25 words or more." },
      { part: 7, taskType: "Picture story", questions: 1, description: "Write a short story, 35 words or more, based on three picture prompts." },
    ],
  },
  listening: {
    name: "Listening",
    timing: "~30 minutes",
    totalQuestions: 25,
    notes: "Each recording is heard twice.",
    parts: [
      { part: 1, taskType: "3-option multiple choice", questions: 5, description: "Identify key information in five short dialogues and choose the correct visual." },
      { part: 2, taskType: "Gap fill", questions: 5, description: "Listen to a monologue and complete gaps in a page of notes." },
      { part: 3, taskType: "3-option multiple choice", questions: 5, description: "Listen to a dialogue for key information." },
      { part: 4, taskType: "3-option multiple choice", questions: 5, description: "Identify the main idea/message/gist in five short monologues or dialogues." },
      { part: 5, taskType: "Matching", questions: 5, description: "Listen to a dialogue for key information and match five items." },
    ],
  },
  speaking: {
    name: "Speaking",
    timing: "8-10 minutes (pairs), 13-15 minutes (groups of three)",
    parts: [
      { part: 1, taskType: "Interview", questions: 1, description: "Respond to the interlocutor's questions, giving factual or personal information (3-4 min)." },
      { part: 2, taskType: "Discussion with visual stimulus", questions: 1, description: "Candidates discuss likes, dislikes and give reasons (5-6 min)." },
    ],
  },
};

const B1_FORMAT: LevelExamFormat = {
  readingUseOfEnglish: {
    name: "Reading",
    timing: "45 minutes",
    totalQuestions: 32,
    parts: [
      { part: 1, taskType: "3-option multiple choice", questions: 5, description: "Read five real-world notices/messages for the main message." },
      { part: 2, taskType: "Matching", questions: 5, description: "Match five descriptions of people to eight short texts on a topic." },
      { part: 3, taskType: "4-option multiple choice", questions: 5, description: "Read a longer text for detailed comprehension, gist, inference, writer's attitude." },
      { part: 4, taskType: "Gapped text", questions: 5, description: "Read a longer text with five sentences removed; restore coherence." },
      { part: 5, taskType: "4-option multiple-choice cloze", questions: 6, description: "Choose the correct vocabulary for each gap in a shorter text." },
      { part: 6, taskType: "Open cloze", questions: 6, description: "Complete six gaps using one word each, testing grammar/phrasal verbs/fixed phrases." },
    ],
  },
  writing: {
    name: "Writing",
    timing: "45 minutes",
    totalQuestions: 2,
    parts: [
      { part: 1, taskType: "An email", questions: 1, description: "Write about 100 words answering an email and notes provided." },
      { part: 2, taskType: "Article or story (choice)", questions: 1, description: "Write about 100 words on a question of the candidate's choosing." },
    ],
  },
  listening: {
    name: "Listening",
    timing: "~30 minutes",
    totalQuestions: 25,
    notes: "Each recording is heard twice.",
    parts: [
      { part: 1, taskType: "3-option multiple choice", questions: 7, description: "Identify key information in seven short monologues/dialogues; choose the correct visual." },
      { part: 2, taskType: "3-option multiple choice", questions: 6, description: "Listen to six short dialogues and understand the gist of each." },
      { part: 3, taskType: "Gap fill", questions: 6, description: "Listen to a monologue and complete six gaps." },
      { part: 4, taskType: "3-option multiple choice", questions: 6, description: "Listen to an interview for detailed meaning, attitudes and opinions." },
    ],
  },
  speaking: {
    name: "Speaking",
    timing: "10-12 minutes (pairs), 15-17 minutes (groups of three)",
    parts: [
      { part: 1, taskType: "Interview", questions: 1, description: "Respond to the interlocutor's questions (2 min)." },
      { part: 2, taskType: "Extended turn", questions: 1, description: "Describe one colour photograph, talking for about 1 minute (3 min)." },
      { part: 3, taskType: "Discussion with visual stimulus", questions: 1, description: "Make/respond to suggestions, discuss alternatives, negotiate agreement (4 min)." },
      { part: 4, taskType: "General conversation", questions: 1, description: "Discuss likes, dislikes, experiences, opinions, habits (3 min)." },
    ],
  },
};

const B2_FORMAT: LevelExamFormat = {
  readingUseOfEnglish: {
    name: "Reading and Use of English",
    timing: "1 hour 15 minutes",
    totalQuestions: 52,
    parts: [
      { part: 1, taskType: "4-option multiple-choice cloze", questions: 8, description: "Vocabulary focus: idioms, collocations, fixed phrases, phrasal verbs." },
      { part: 2, taskType: "Open cloze", questions: 8, description: "Grammar and vocabulary awareness." },
      { part: 3, taskType: "Word formation", questions: 8, description: "Change a given stem word to fit each gap (affixation, compounding)." },
      { part: 4, taskType: "Key word transformation", questions: 6, description: "Complete a second sentence in 2-5 words using a given key word." },
      { part: 5, taskType: "4-option multiple choice", questions: 6, description: "A text followed by questions on detail, opinion, attitude, tone, main idea." },
      { part: 6, taskType: "Gapped text", questions: 6, description: "Restore six removed sentences to a text, testing cohesion/coherence." },
      { part: 7, taskType: "Multiple matching", questions: 10, description: "Match prompts to elements across one long or several short texts." },
    ],
  },
  writing: {
    name: "Writing",
    timing: "1 hour 20 minutes",
    parts: [
      { part: 1, taskType: "Essay (compulsory)", questions: 1, description: "140-190 words. Agree/disagree with a statement, giving reasons and a conclusion." },
      { part: 2, taskType: "Article/email/letter/review/report (choice of 3)", questions: 1, description: "140-190 words on a situational writing task." },
    ],
  },
  listening: {
    name: "Listening",
    timing: "~40 minutes",
    totalQuestions: 30,
    notes: "Each recording is heard twice.",
    parts: [
      { part: 1, taskType: "3-option multiple choice", questions: 8, description: "Eight short unrelated extracts (~30s each); one question per extract." },
      { part: 2, taskType: "Sentence completion", questions: 10, description: "A 3-4 minute monologue; complete sentences with information heard." },
      { part: 3, taskType: "Multiple matching", questions: 5, description: "Five short related monologues (~30s each); select from a list of 8 options." },
      { part: 4, taskType: "3-option multiple choice", questions: 7, description: "An interview/exchange (3-4 min) for opinion, attitude, detail, gist." },
    ],
  },
  speaking: {
    name: "Speaking",
    timing: "14 minutes (pairs), 20 minutes (groups of three)",
    parts: [
      { part: 1, taskType: "Interview", questions: 1, description: "General interactional/social language with the interlocutor (2 min)." },
      { part: 2, taskType: "Long turn", questions: 1, description: "1-minute long turn per candidate comparing two photographs, plus a 30s response (4 min total)." },
      { part: 3, taskType: "Collaborative task", questions: 1, description: "2-minute discussion plus a 1-minute decision-making task (4 min total)." },
      { part: 4, taskType: "Discussion", questions: 1, description: "Discussion on topics related to the collaborative task (4 min)." },
    ],
  },
};

const C1_FORMAT: LevelExamFormat = {
  readingUseOfEnglish: {
    name: "Reading and Use of English",
    timing: "1 hour 30 minutes",
    totalQuestions: 56,
    parts: [
      { part: 1, taskType: "4-option multiple-choice cloze", questions: 8, description: "Vocabulary focus: idioms, collocations, fixed phrases, phrasal verbs." },
      { part: 2, taskType: "Open cloze", questions: 8, description: "Grammar and vocabulary awareness." },
      { part: 3, taskType: "Word formation", questions: 8, description: "Change a given stem word to fit each gap." },
      { part: 4, taskType: "Key word transformation", questions: 6, description: "Complete a second sentence in 3-6 words using a given key word." },
      { part: 5, taskType: "4-option multiple choice", questions: 6, description: "A text followed by questions on detail, opinion, attitude, implication." },
      { part: 6, taskType: "Cross-text multiple matching", questions: 4, description: "Compare opinions/attitudes across four short texts." },
      { part: 7, taskType: "Gapped text", questions: 6, description: "Restore removed paragraphs to a text." },
      { part: 8, taskType: "Multiple matching", questions: 10, description: "Match prompts to elements across one long or several short texts." },
    ],
  },
  writing: {
    name: "Writing",
    timing: "1 hour 30 minutes",
    parts: [
      { part: 1, taskType: "Essay (compulsory)", questions: 1, description: "220-260 words. Discursive essay comparing two given points, with the candidate's own opinion." },
      { part: 2, taskType: "Letter/email/proposal/report/review (choice of 3)", questions: 1, description: "220-260 words on a contextualised writing task." },
    ],
  },
  listening: {
    name: "Listening",
    timing: "~40 minutes",
    totalQuestions: 30,
    notes: "Each recording is heard twice.",
    parts: [
      { part: 1, taskType: "3-option multiple choice", questions: 6, description: "Three short extracts, two questions each." },
      { part: 2, taskType: "Sentence completion", questions: 8, description: "A ~3-minute monologue; complete sentences with information heard." },
      { part: 3, taskType: "4-option multiple choice", questions: 6, description: "A ~4-minute conversation between two or more speakers." },
      { part: 4, taskType: "Multiple matching", questions: 10, description: "Five short themed monologues (~30s each); select from a list of 8." },
    ],
  },
  speaking: {
    name: "Speaking",
    timing: "15 minutes (pairs), 23 minutes (groups of three)",
    parts: [
      { part: 1, taskType: "Interview", questions: 1, description: "General interactional/social language with the interlocutor (2 min)." },
      { part: 2, taskType: "Long turn", questions: 1, description: "1-minute long turn per candidate on 2 of 3 given photographs, plus a 30s response (4 min total)." },
      { part: 3, taskType: "Collaborative task", questions: 1, description: "2-minute discussion plus a 1-minute decision-making task (4 min total)." },
      { part: 4, taskType: "Discussion", questions: 1, description: "Discussion on topics related to the collaborative task (5 min)." },
    ],
  },
};

const C2_FORMAT: LevelExamFormat = {
  readingUseOfEnglish: {
    name: "Reading and Use of English",
    timing: "1 hour 30 minutes",
    totalQuestions: 53,
    parts: [
      { part: 1, taskType: "4-option multiple-choice cloze", questions: 8, description: "Vocabulary focus: idioms, collocations, fixed phrases, phrasal verbs." },
      { part: 2, taskType: "Open cloze", questions: 8, description: "Grammar and vocabulary awareness." },
      { part: 3, taskType: "Word formation", questions: 8, description: "Change a given stem word to fit each gap." },
      { part: 4, taskType: "Key word transformation", questions: 6, description: "Complete a second sentence in 3-8 words using a given key word." },
      { part: 5, taskType: "4-option multiple choice", questions: 6, description: "A text followed by questions on detail, opinion, implication, text organisation." },
      { part: 6, taskType: "Gapped text", questions: 7, description: "Restore removed paragraphs to a text." },
      { part: 7, taskType: "Multiple matching", questions: 10, description: "Match prompts to elements across one long or several short texts." },
    ],
  },
  writing: {
    name: "Writing",
    timing: "1 hour 30 minutes",
    parts: [
      { part: 1, taskType: "Essay (compulsory)", questions: 1, description: "240-280 words. Summarise and evaluate the key ideas in two ~100-word input texts." },
      { part: 2, taskType: "Article/letter/report/review (choice of 3)", questions: 1, description: "280-320 words on a contextualised writing task." },
    ],
  },
  listening: {
    name: "Listening",
    timing: "~40 minutes",
    totalQuestions: 30,
    notes: "Each recording is heard twice.",
    parts: [
      { part: 1, taskType: "3-option multiple choice", questions: 6, description: "Three short unrelated texts (~1 min each), two questions each." },
      { part: 2, taskType: "Sentence completion", questions: 9, description: "A 3-4 minute monologue; complete sentences with information heard." },
      { part: 3, taskType: "4-option multiple choice", questions: 5, description: "A 3-4 minute text with interacting speakers." },
      { part: 4, taskType: "Multiple matching", questions: 10, description: "Five short themed monologues (~35s each); two multiple-matching tasks." },
    ],
  },
  speaking: {
    name: "Speaking",
    timing: "16 minutes (pairs)",
    parts: [
      { part: 1, taskType: "Interview", questions: 1, description: "General interactional/social language with the interlocutor (2 min)." },
      { part: 2, taskType: "Collaborative task", questions: 1, description: "A two-way decision-making conversation with written/visual stimuli (4 min)." },
      { part: 3, taskType: "Long turn + discussion", questions: 1, description: "A 2-minute long turn per candidate, followed by a related discussion (10 min total)." },
    ],
  },
};

export const EXAM_FORMAT: Record<CEFRLevel, LevelExamFormat> = {
  // No standalone Cambridge exam at A1 — reuses A2's shape as the closest
  // real reference point (see cambridge-exams.ts for the same convention).
  A1: A2_FORMAT,
  A2: A2_FORMAT,
  B1: B1_FORMAT,
  B2: B2_FORMAT,
  C1: C1_FORMAT,
  C2: C2_FORMAT,
};

/** A representative single-part question count for a skill, used to size a single generated exercise realistically for the level (a full paper has several parts of varying length — this picks the paper's typical part). */
export function typicalPartQuestionCount(level: CEFRLevel, skill: "READING" | "USE_OF_ENGLISH" | "LISTENING"): number {
  const format = EXAM_FORMAT[level];
  if (skill === "LISTENING") {
    const parts = format.listening.parts;
    return parts[Math.floor(parts.length / 2)]?.questions ?? 6;
  }
  // Reading and Use of English share one paper pre-B2; use a middling MCQ-style part as the representative size.
  const parts = format.readingUseOfEnglish.parts;
  const midOrMcq = parts.find((p) => p.taskType.includes("multiple choice") && p.questions <= 6) ?? parts[Math.floor(parts.length / 2)];
  return midOrMcq?.questions ?? 6;
}
