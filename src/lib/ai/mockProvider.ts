import type { AIProvider } from "./provider";
import { analyzeWriting } from "./writingHeuristics";
import { analyzeSpeaking } from "./speakingHeuristics";
import { generateQuestions } from "./exerciseGeneration";
import { CATEGORY_EXPLANATIONS } from "@/content/error-category-explanations";
import type { ErrorCategory, WritingType } from "@prisma/client";
import type {
  AnalyzeErrorsInput,
  AnalyzeErrorsResult,
  ChatWithTutorInput,
  ErrorDnaResult,
  ErrorSummary,
  EvaluateSpeakingInput,
  EvaluateWritingInput,
  ExplainGrammarInput,
  ExplainWordInput,
  GenerateErrorDnaInput,
  GenerateExerciseFromMaterialInput,
  GenerateExerciseInput,
  GenerateGrammarTopicsInput,
  GenerateStudyPlanInput,
  GenerateVocabularyInput,
  GenerateWritingPromptsInput,
  GeneratedExercise,
  GeneratedGrammarTopicItem,
  GeneratedQuestion,
  GeneratedStudyPlan,
  GeneratedVocabularyWord,
  GeneratedWritingPromptItem,
  GrammarExplanation,
  SpeakingFeedback,
  StudyPlanWeek,
  TranslateTextInput,
  TranslateTextResult,
  TutorReply,
  WritingFeedback,
} from "./types";

const CATEGORY_LABEL: Record<string, string> = {
  ARTICLES: "articles",
  PREPOSITIONS: "prepositions",
  TENSES: "tenses",
  CONDITIONALS: "conditionals",
  MODAL_VERBS: "modal verbs",
  RELATIVE_CLAUSES: "relative clauses",
  INVERSION: "inversion",
  PASSIVE_VOICE: "the passive voice",
  REPORTED_SPEECH: "reported speech",
  GERUNDS_INFINITIVES: "gerunds and infinitives",
  COLLOCATIONS: "collocations",
  PHRASAL_VERBS: "phrasal verbs",
  WORD_FORMATION: "word formation",
  VOCABULARY: "vocabulary",
  SPELLING: "spelling",
  WORD_CHOICE: "word choice",
  REGISTER: "register",
  PRONUNCIATION: "pronunciation",
  COHESION: "cohesion",
  OTHER: "general errors",
};

const CATEGORY_KEYWORDS: [ErrorCategory, RegExp][] = [
  ["INVERSION", /inversion|never have i|no sooner|hardly.*when/i],
  ["REPORTED_SPEECH", /reported speech|indirect speech|backshift/i],
  ["CONDITIONALS", /conditional|if clause|if i had|mixed conditional/i],
  ["MODAL_VERBS", /modal verb|must have|should have|can't have|needn't have/i],
  ["PASSIVE_VOICE", /passive voice|passive structure/i],
  ["RELATIVE_CLAUSES", /relative clause|who\/which|defining clause/i],
  ["GERUNDS_INFINITIVES", /gerund|infinitive|-ing form/i],
  ["PHRASAL_VERBS", /phrasal verb/i],
  ["COLLOCATIONS", /collocation/i],
  ["WORD_FORMATION", /word formation|suffix|prefix/i],
  ["ARTICLES", /\barticles?\b|a\/an|when to use the/i],
  ["PREPOSITIONS", /preposition/i],
  ["TENSES", /\btense\b|present perfect|past perfect|continuous/i],
  ["SPELLING", /spelling|spelled|misspell/i],
  ["REGISTER", /register|formal english|informal english/i],
  ["PRONUNCIATION", /pronunciation|pronounce|word stress/i],
  ["COHESION", /cohesion|linking word|connector|linker/i],
  ["VOCABULARY", /vocabulary|synonym|word choice/i],
];

function detectCategory(text: string): ErrorCategory | null {
  for (const [category, pattern] of CATEGORY_KEYWORDS) {
    if (pattern.test(text)) return category;
  }
  return null;
}

function daysAgo(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Mock AI provider: deterministic, offline, zero-cost. It implements real
 * analysis logic for analyzeErrors() (pure statistics over the user's error
 * log) and returns realistic, template-based content for the generative
 * functions so every screen in the app is fully usable before a real LLM
 * backend is wired in via AI_PROVIDER=anthropic (see src/lib/ai/index.ts).
 */
export class MockAIProvider implements AIProvider {
  async generateExercise(input: GenerateExerciseInput): Promise<GeneratedExercise> {
    const count = input.count ?? 5;
    const categories: ErrorCategory[] =
      input.focusCategories && input.focusCategories.length > 0
        ? input.focusCategories
        : (Object.keys(CATEGORY_EXPLANATIONS) as ErrorCategory[]).slice(0, 4);

    const questions = await generateQuestions(categories, count);

    const label = categories.map((c) => CATEGORY_EXPLANATIONS[c]?.title ?? c).join(", ");

    return {
      title: `${label} practice (${input.level})`,
      instructions: `For questions 1-${count}, choose the option that best completes each sentence.`,
      questions,
    };
  }

  async evaluateWriting(input: EvaluateWritingInput): Promise<WritingFeedback> {
    const formal = input.type === "EMAIL_LETTER" || input.type === "PROPOSAL" || input.type === "REPORT";
    const wordRange =
      input.minWords !== undefined && input.maxWords !== undefined
        ? { min: input.minWords, max: input.maxWords }
        : undefined;
    return analyzeWriting(input.text, formal, wordRange, input.level ?? "C1");
  }

  async evaluateSpeaking(input: EvaluateSpeakingInput): Promise<SpeakingFeedback> {
    return analyzeSpeaking(input.transcript, input.durationSeconds, input.level ?? "C1");
  }

  async explainGrammar(input: ExplainGrammarInput): Promise<GrammarExplanation> {
    const category = detectCategory(input.question);

    if (category) {
      const info = CATEGORY_EXPLANATIONS[category];
      const relatedExercises = await generateQuestions([category], 3);
      return {
        explanation: `${info.title}: ${info.summary}\n\n${info.explanation.join(" ")}`,
        examples: info.examples.map((e) => e.correct + (e.note ? ` (${e.note})` : "")),
        relatedExercises,
      };
    }

    return {
      explanation:
        `I don't have a specific rule matched for "${input.question}" yet, but here's a general tip: ` +
        "break the sentence down, identify the grammatical function of the word/phrase in question, and check it against the categories in the Grammar module for a full explanation.",
      examples: [],
      relatedExercises: [],
    };
  }

  async generateVocabulary(
    input: GenerateVocabularyInput
  ): Promise<GeneratedVocabularyWord[]> {
    const count = input.count ?? 5;
    return Array.from({ length: count }).map((_, i) => ({
      word: input.candidateWords?.[i]?.word ?? `word-${i + 1}`,
      definition: "Placeholder definition — connect a real AI provider.",
      exampleSentence: "This is a placeholder example sentence.",
      synonyms: [],
      antonyms: [],
      collocations: [],
      phrasalVerbs: [],
      category: input.topic,
      cefrLevel: input.level,
    }));
  }

  async generateStudyPlan(input: GenerateStudyPlanInput): Promise<GeneratedStudyPlan> {
    const weeksUntilExam = input.examDate
      ? Math.max(1, Math.ceil((input.examDate.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
      : 8;

    const grammarPool = [
      "Advanced tenses", "Inversion", "Conditionals & mixed conditionals", "Modal verbs (incl. past)",
      "Passive structures", "Reported speech", "Relative clauses", "Participle clauses",
      "Gerunds and infinitives", "Cleft sentences", "Determiners and articles", "Prepositions", "Linking devices",
    ];
    const vocabPool = ["education", "work", "environment", "technology", "relationships", "media", "health", "travel"];
    const readingPool = [
      "Part 5: multiple choice reading", "Part 6: cross-text multiple matching",
      "Part 7: gapped text", "Part 8: multiple matching",
    ];
    const uoePool = [
      "Part 1: multiple-choice cloze", "Part 2: open cloze", "Part 3: word formation", "Part 4: key word transformation",
    ];
    const writingPool = ["Essay", "Proposal", "Report", "Review", "Email/Letter"];
    const listeningPool = [
      "Part 1: multiple choice", "Part 2: sentence completion", "Part 3: multiple choice", "Part 4: multiple matching",
    ];
    const speakingPool = ["Part 1: interview", "Part 2: long turn", "Part 3: collaborative task", "Part 4: discussion"];

    const pick = (pool: string[], week: number, count: number) =>
      Array.from({ length: count }).map((_, i) => pool[(week + i) % pool.length]);

    const weeks: StudyPlanWeek[] = Array.from({ length: Math.min(weeksUntilExam, 12) }).map((_, i) => {
      const week = i + 1;
      const extraGrammar = input.weakSkills.includes("GRAMMAR") ? 1 : 0;
      const extraReading = input.weakSkills.includes("READING") ? 1 : 0;
      const extraListening = input.weakSkills.includes("LISTENING") ? 1 : 0;
      const extraUoe = input.weakSkills.includes("USE_OF_ENGLISH") ? 1 : 0;

      return {
        week,
        grammar: pick(grammarPool, i, 1 + extraGrammar),
        vocabulary: pick(vocabPool, i, 2).map((t) => `Topic: ${t}`),
        reading: [...pick(readingPool, i, 1 + extraReading), ...pick(uoePool, i, 1 + extraUoe)],
        writing: pick(writingPool, i, 1),
        listening: pick(listeningPool, i, 1 + extraListening),
        speaking: pick(speakingPool, i, 1),
      };
    });

    return { weeks };
  }

  async analyzeErrors(input: AnalyzeErrorsInput): Promise<AnalyzeErrorsResult> {
    const byCategory = new Map<string, { total: number; last7: number; prev7: number }>();

    for (const err of input.errors) {
      const key = err.category;
      const entry = byCategory.get(key) ?? { total: 0, last7: 0, prev7: 0 };
      entry.total += 1;
      const age = daysAgo(err.createdAt);
      if (age <= 7) entry.last7 += 1;
      else if (age <= 14) entry.prev7 += 1;
      byCategory.set(key, entry);
    }

    const summary: ErrorSummary[] = Array.from(byCategory.entries())
      .map(([category, stats]) => ({
        category: category as ErrorSummary["category"],
        count: stats.total,
        lastSevenDays: stats.last7,
        trend: (stats.last7 > stats.prev7
          ? "up"
          : stats.last7 < stats.prev7
            ? "down"
            : "flat") as ErrorSummary["trend"],
      }))
      .sort((a, b) => b.count - a.count);

    const weakestCategories = summary.slice(0, 3).map((s) => s.category);

    const top = summary[0];
    const recommendation = top
      ? `You've made ${top.lastSevenDays} errors related to ${CATEGORY_LABEL[top.category] ?? top.category} in the last 7 days. Focus today's session on this area.`
      : "No errors logged yet — complete some exercises to get a personalised recommendation.";

    return { summary, weakestCategories, recommendation };
  }

  async chatWithTutor(input: ChatWithTutorInput): Promise<TutorReply> {
    const category = detectCategory(input.message);

    if (category) {
      const info = CATEGORY_EXPLANATIONS[category];
      const example = info.examples[0];
      const reply =
        `${info.explanation[0]}${info.explanation[1] ? " " + info.explanation[1] : ""}` +
        (example ? `\n\nFor example: "${example.correct}"` : "") +
        "\n\nHere are 3 quick questions to check you've got it:";
      const suggestedExercises = await generateQuestions([category], 3);
      return { reply, suggestedExercises };
    }

    const wantsCorrection = /correct|fix|check my|is this right|is this correct/i.test(input.message);
    if (wantsCorrection) {
      return {
        reply:
          "I can give proper feedback on longer pieces of writing in the Writing module (with scores per criterion and a rewritten version) — " +
          "paste it there for a full analysis. For a single sentence, tell me which specific grammar point you're unsure about and I'll explain it.",
        suggestedExercises: [],
      };
    }

    return {
      reply:
        `That's a good question about "${input.message.slice(0, 80)}". ` +
        "I can give a detailed explanation if you mention a specific grammar point (e.g. \"inversion\", \"reported speech\", \"prepositions\") — " +
        "or ask me to check a sentence you're unsure about.",
      suggestedExercises: [],
    };
  }

  async generateGrammarTopics(input: GenerateGrammarTopicsInput): Promise<GeneratedGrammarTopicItem[]> {
    return Array.from({ length: input.count }).map((_, i) => ({
      slug: `${input.level.toLowerCase()}-topic-${i + 1}`,
      title: `${input.level} grammar topic ${i + 1}`,
      summary: "Placeholder summary — connect a real AI provider for genuine level-specific topics.",
      explanation: ["Placeholder explanation — connect a real AI provider."],
      examples: [{ correct: "Placeholder example sentence." }],
    }));
  }

  async generateWritingPrompts(input: GenerateWritingPromptsInput): Promise<GeneratedWritingPromptItem[]> {
    const types: WritingType[] = ["ESSAY", "EMAIL_LETTER", "REVIEW", "REPORT", "PROPOSAL"];
    return Array.from({ length: input.count }).map((_, i) => ({
      slug: `${input.level.toLowerCase()}-writing-${i + 1}`,
      type: types[i % types.length],
      title: `${input.level} writing task ${i + 1}`,
      brief: "Placeholder writing prompt — connect a real AI provider for genuine level-specific tasks.",
      minWords: 20,
      maxWords: 60,
    }));
  }

  async explainWord(input: ExplainWordInput): Promise<GeneratedVocabularyWord> {
    const isPhrase = input.word.trim().split(/\s+/).length > 1;
    return {
      word: input.word,
      definition: "Placeholder definition — connect a real AI provider to look up real words.",
      exampleSentence: input.context ?? "This is a placeholder example sentence.",
      synonyms: [],
      antonyms: [],
      collocations: [],
      phrasalVerbs: [],
      cefrLevel: input.level,
      grammarNote: isPhrase
        ? "Placeholder grammar note — connect a real AI provider for a real structure/tense breakdown."
        : undefined,
    };
  }

  async translateText(input: TranslateTextInput): Promise<TranslateTextResult> {
    return { translation: `[traducción no disponible — conecta un proveedor de IA real] ${input.text}` };
  }

  async generateErrorDnaReport(input: GenerateErrorDnaInput): Promise<ErrorDnaResult> {
    const top = input.errorSummary[0];
    const topLabel = top ? CATEGORY_LABEL[top.category] ?? top.category : "ningún área concreta todavía";
    return {
      headline: top
        ? `Tu punto débil más repetido ahora mismo: ${topLabel}.`
        : "Todavía no hay suficientes errores registrados para un diagnóstico.",
      narrative:
        "Conecta un proveedor de IA real (AI_PROVIDER=deepseek) para un diagnóstico narrativo genuino de " +
        "por qué cometes estos errores concretos, no solo un recuento.",
      focusAreas: input.errorSummary.slice(0, 3).map((s) => CATEGORY_LABEL[s.category] ?? s.category),
    };
  }

  async generateExerciseFromMaterial(input: GenerateExerciseFromMaterialInput): Promise<GeneratedExercise> {
    const count = input.count ?? 5;
    const sentences = input.materialText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.split(/\s+/).length >= 6 && s.length <= 220);

    const questions: GeneratedQuestion[] = [];
    for (let i = 0; i < sentences.length && questions.length < count; i++) {
      const sentence = sentences[i];
      const words = sentence.split(/\s+/);
      // Blank out a content-ish word: prefer a longer word, skip the first/last.
      const candidates = words
        .map((w, idx) => ({ w: w.replace(/[.,!?;:]+$/, ""), idx }))
        .filter((c) => c.idx > 0 && c.idx < words.length - 1 && c.w.length >= 5);
      const target = candidates[i % Math.max(candidates.length, 1)];
      if (!target) continue;

      const blanked = words
        .map((w, idx) => (idx === target.idx ? "_____" : w))
        .join(" ");

      questions.push({
        order: questions.length + 1,
        prompt: blanked,
        questionType: "OPEN_CLOZE",
        correctAnswer: target.w,
        explanation:
          `Según "${input.materialTitle}": la frase original es "${sentence}". ` +
          `La palabra que falta es "${target.w}".`,
      });
    }

    return {
      title: `Ejercicio: ${input.materialTitle}`,
      instructions:
        "Completa cada hueco con la palabra que falta, según el material de clase proporcionado." +
        (input.focusInstructions ? ` (${input.focusInstructions})` : ""),
      questions,
    };
  }
}
