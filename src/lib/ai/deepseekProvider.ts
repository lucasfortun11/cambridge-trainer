import type { AIProvider } from "./provider";
import { MockAIProvider } from "./mockProvider";
import { callDeepSeekJson } from "./deepseekClient";
import { formatAllWritingLevelsForPrompt, formatWritingScaleForPrompt } from "@/content/writing-assessment-scale";
import { formatSpeakingScaleForPrompt } from "@/content/speaking-assessment-scale";
import type {
  AnalyzeErrorsInput,
  AnalyzeErrorsResult,
  ChatWithTutorInput,
  ErrorDnaResult,
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
  GeneratedStudyPlan,
  GeneratedVocabularyWord,
  GeneratedWritingPromptItem,
  GrammarExplanation,
  SpeakingFeedback,
  TranslateTextInput,
  TranslateTextResult,
  TutorReply,
  WritingFeedback,
} from "./types";

const TUTOR_PERSONA =
  "You are an expert, encouraging Cambridge English teacher who prepares students for any " +
  "Cambridge English Qualification from A1 up to C2 Proficiency (CPE) — always calibrating your " +
  "language, vocabulary and explanations to the specific CEFR level given in each request, never " +
  "defaulting to C1/C2 complexity for a lower-level student. You never invent Cambridge exam " +
  "questions verbatim — all content you produce is original. Always reply with a single valid " +
  "JSON object and nothing else (no markdown fences, no commentary outside the JSON).";

// Used only for Writing/Speaking evaluation — the two places whose whole
// point is to tell a real exam candidate where they actually stand. An
// "encouraging" persona is right for the tutor chat, but here it would bias
// scores upward and undermine the tool's purpose: this app exists so people
// can sit the real exam, so the score has to be as honest as a real
// examiner's, even when that means low marks or blunt criticism.
const EXAMINER_PERSONA =
  "You are a strict, experienced official Cambridge English examiner grading under real exam " +
  "conditions, using the genuine Cambridge assessment scales. You are fair, but your job is exam-" +
  "accurate marking, not encouragement — an inflated score is actively harmful because it gives the " +
  "candidate false confidence before the real exam. Reserve the top of the scale for work that is " +
  "genuinely excellent and shows full control at the target level; most realistic attempts, including " +
  "competent ones, should land in the middle of the range; weak or incomplete work must receive low " +
  "scores, not a diplomatically softened middling one. Never round a score up to be kind. Every " +
  "criticism must be specific and evidence-based (quote the exact words/phrases), and the written " +
  "comments should still be clear and constructive about what to fix — rigor in the score, not a harsh " +
  "tone in the prose. Always reply with a single valid JSON object and nothing else (no markdown " +
  "fences, no commentary outside the JSON).";

// Used only by generateExerciseFromMaterial ("Mi Clase"). Deliberately NOT
// the Cambridge-exam TUTOR_PERSONA: this section must never frame content as
// a Cambridge exam or pull in outside exam knowledge — everything has to
// come from the student's own uploaded material.
const CLASS_MATERIAL_PERSONA =
  "You are a private tutor helping a student study material given to them by their own teacher or academy " +
  "(NOT a Cambridge English exam). You must base every question, answer and explanation STRICTLY on the " +
  "material text provided — never invent facts, vocabulary or grammar points that aren't in it, and never " +
  "reframe the content as a Cambridge exam task or reference Cambridge exam parts/format. If the material is " +
  "too short or unsuitable to produce the requested number of good questions, produce fewer rather than " +
  "inventing content not grounded in the text. Always reply with a single valid JSON object and nothing else " +
  "(no markdown fences, no commentary outside the JSON).";

/**
 * Real AIProvider backed by the DeepSeek API (OpenAI-compatible). Every
 * method falls back to the deterministic mock provider if the API call
 * fails (missing/invalid key, network error, rate limit, malformed
 * response) so a bad API day never breaks the app for the user.
 */
export class DeepSeekAIProvider implements AIProvider {
  private fallback = new MockAIProvider();

  private async safe<T>(label: string, fn: () => Promise<T>, fallbackFn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      console.error(`[DeepSeekAIProvider] ${label} failed, falling back to mock:`, err);
      return fallbackFn();
    }
  }

  async generateExercise(input: GenerateExerciseInput): Promise<GeneratedExercise> {
    return this.safe(
      "generateExercise",
      async () => {
        const count = input.count ?? 5;
        const categories =
          input.topicHint ??
          input.focusCategories?.join(", ") ??
          "general " + input.skill.replace(/_/g, " ").toLowerCase();
        const needsPassage = input.skill === "READING" || input.skill === "LISTENING";
        const passageInstruction =
          input.skill === "READING"
            ? `First write an original 150-300 word passage appropriate for CEFR level ${input.level}, then base every question on it.`
            : input.skill === "LISTENING"
              ? `First write an original 120-220 word transcript of natural spoken English (a monologue or short dialogue) appropriate for CEFR level ${input.level}, then base every question on it as if the student heard it.`
              : "";
        return callDeepSeekJson<GeneratedExercise>(
          TUTOR_PERSONA,
          `Create an original exercise in the style of the Cambridge English exam for CEFR level ${input.level} ` +
            `(the skill being tested is "${input.skill}"), focused on: ${categories}. ${passageInstruction} ` +
            `Produce exactly ${count} multiple-choice questions, each with 4 options labelled "A) ...", "B) ...", ` +
            `"C) ...", "D) ...". Order questions from easier to harder. Language complexity, sentence length and ` +
            `vocabulary in both the passage/transcript and the questions must genuinely match CEFR ${input.level} — ` +
            `not simplified C1 content and not overly advanced content for a lower level.\n\n` +
            `Reply with JSON: { "title": string, "instructions": string${needsPassage ? ', "passage": string' : ""}, ` +
            `"questions": [ { "order": number, "prompt": string, "questionType": "MULTIPLE_CHOICE", "options": string[4], ` +
            `"correctAnswer": string (must exactly match one of the options), "explanation": string (why the correct ` +
            `answer is right), "distractorExplanations": { [option: string]: string } (why each wrong option is wrong) } ] }`
        );
      },
      () => this.fallback.generateExercise(input)
    );
  }

  async evaluateWriting(input: EvaluateWritingInput): Promise<WritingFeedback> {
    return this.safe(
      "evaluateWriting",
      async () => {
        const level = input.level ?? "C1";
        const wordCount = input.text.trim().split(/\s+/).filter(Boolean).length;
        const wordCountInstruction =
          input.minWords && input.maxWords
            ? `The task requires ${input.minWords}-${input.maxWords} words; the student wrote ${wordCount}. Being ` +
              `noticeably under the minimum is a real Content/Task Achievement failure (missing required content), ` +
              "not a minor issue — reflect that in scoreContent. Being far over the maximum also loses marks for " +
              "poor task control in a real exam."
            : `The student wrote ${wordCount} words — judge whether that is a plausible length for this task at ${level}.`;
        return callDeepSeekJson<WritingFeedback>(
          EXAMINER_PERSONA +
            ` You assess Writing the way an official Cambridge examiner for CEFR level ${level} would, using the ` +
            "four official criteria: Content, Communicative Achievement, Organisation, Language (each scored 0-5, " +
            `integers only). Judge strictly against what is genuinely expected AT ${level} — do not penalise a ` +
            `${level} candidate for not writing like a C2 candidate, but do not be lenient with a C1/C2 candidate ` +
            "either. Content must explicitly check whether every point/bullet in the task prompt was actually " +
            `addressed — missing even one required point caps Content at 3 or below regardless of language quality.\n\n` +
            formatWritingScaleForPrompt(level) +
            "\n\nSeparately from that target-level score, independently place this specific text on the full A1-C2 " +
            "scale — a real Cambridge result can report a level above or below the one the candidate sat for, and " +
            "this app should be equally honest. Compare the text against every level's top-band descriptor below " +
            "and pick whichever one the text's actual vocabulary range, grammatical control and complexity most " +
            "resemble, even if that's far from the target level — do not anchor this to the target level or to the " +
            "score you just gave:\n" +
            formatAllWritingLevelsForPrompt(),
          `Target CEFR level: ${level}\nTask type: ${input.type}\nTask prompt: ${input.prompt}\n\n${wordCountInstruction}\n\n` +
            `Student's text:\n"""\n${input.text}\n"""\n\n` +
            `Evaluate it and reply with JSON: { "scoreContent": 0-5, "scoreCommunicativeAchievement": 0-5, ` +
            `"scoreOrganisation": 0-5, "scoreLanguage": 0-5, "overallScore": 0-5 (a holistic judgement, not simply ` +
            `the average of the other four), ` +
            `"grammarErrors": [ { "original": string, "correction": string, "explanation": string } ] (list every ` +
            `genuine error you find, do not stop at 2-3 if there are more), ` +
            `"vocabularyImprovements": [ { "original": string, "suggestion": string, "reason": string } ], ` +
            `"structureIssues": string[], "cohesionIssues": string[], "register": string (one sentence assessment, ` +
            `name specific register slips if any), ` +
            `"recommendations": string[] (3-5 actionable tips appropriate for a ${level} learner), ` +
            `"improvedVersion": string (a rewritten, polished ${level}-quality version of the FULL text, preserving the student's ideas), ` +
            `"estimatedLevel": "A1" | "A2" | "B1" | "B2" | "C1" | "C2" (the independent CEFR placement described ` +
            `above — may differ from "${level}"), "estimatedSublevel": "LOW" | "MID" | "HIGH" (where within that ` +
            `level this text sits) }`
        );
      },
      () => this.fallback.evaluateWriting(input)
    );
  }

  async evaluateSpeaking(input: EvaluateSpeakingInput): Promise<SpeakingFeedback> {
    return this.safe(
      "evaluateSpeaking",
      async () => {
        const level = input.level ?? "C1";
        const wordCount = input.transcript.trim().split(/\s+/).filter(Boolean).length;
        const brevityInstruction =
          input.durationSeconds && input.durationSeconds > 20 && wordCount < input.durationSeconds / 4
            ? "The transcript is short relative to the recording duration, which in a real exam signals long " +
              "pauses/hesitation or a response that didn't really develop — factor that into scoreFluency and " +
              "scoreCoherence rather than ignoring it."
            : "";
        return callDeepSeekJson<SpeakingFeedback>(
          EXAMINER_PERSONA +
            ` You assess spoken English transcripts the way an official Cambridge Speaking examiner for CEFR level ` +
            `${level} would, judged strictly against what is genuinely expected for a ${level} candidate, not a ` +
            "higher or lower level. A short, safe, grammatically correct answer that never attempts the range or " +
            "complexity expected at this level is NOT a top score, even with zero errors — real range and risk-" +
            "taking matter as much as accuracy.\n\n" +
            formatSpeakingScaleForPrompt() +
            "\n\nThe app's output fields map onto these four official criteria as follows: scoreGrammar and " +
            "scoreVocabulary together cover Grammar and Vocabulary; scoreFluency and scoreCoherence together cover " +
            "Discourse Management (fluency = extended, low-hesitation stretches of language; coherence = relevance " +
            "and organisation of ideas); scorePronunciation covers Pronunciation (hedge this — you only have a " +
            "transcript, infer risk factors like repeated simple sentence patterns rather than claiming certainty). " +
            "There is no dedicated field for Interactive Communication (initiating/responding/negotiating with the " +
            "other speaker) — factor it into scoreCoherence and mention it explicitly in feedback/hesitationNotes " +
            "when relevant (e.g. a collaborative task transcript that never responds to or builds on the other " +
            "speaker's points).\n\n" +
            "Separately from that target-level score, independently place this specific performance on the full " +
            "A1-C2 scale — a real Cambridge result can report a level above or below the one the candidate sat " +
            "for, and this app should be equally honest. Judge purely from the vocabulary range, grammatical " +
            "control/complexity, fluency and coherence actually demonstrated in the transcript, using your general " +
            "knowledge of the CEFR levels — do not anchor this to the target level or to the score you just gave; " +
            "a transcript that's clearly simpler/safer than the target level should get a lower estimatedLevel, and " +
            "one that's clearly more sophisticated should get a higher one.",
          `Target CEFR level: ${level}\nSpeaking part: ${input.part}\nTask prompt: ${input.prompt}\n` +
            (input.durationSeconds ? `Duration: ${input.durationSeconds} seconds\n` : "") +
            (brevityInstruction ? `${brevityInstruction}\n` : "") +
            `\nTranscript:\n"""\n${input.transcript}\n"""\n\n` +
            `Reply with JSON: { "scoreFluency": 0-5, "scoreGrammar": 0-5, "scoreVocabulary": 0-5, ` +
            `"scoreCoherence": 0-5, "scorePronunciation": 0-5, "overallScore": 0-5 (a holistic judgement, not ` +
            `simply the average of the other four), ` +
            `"repeatedWords": [ { "word": string, "count": number } ] (content words overused), ` +
            `"alternatives": [ { "overused": string, "alternatives": string[] } ] (overused phrases with 2-4 richer alternatives), ` +
            `"hesitationNotes": string[] (be specific — quote the phrase where fluency/coherence breaks down), ` +
            `"feedback": string[] (2-4 specific, evidence-based comments — clear about weaknesses, not softened), ` +
            `"estimatedLevel": "A1" | "A2" | "B1" | "B2" | "C1" | "C2" (the independent CEFR placement described ` +
            `above — may differ from "${level}"), "estimatedSublevel": "LOW" | "MID" | "HIGH" (where within that ` +
            `level this performance sits) }`
        );
      },
      () => this.fallback.evaluateSpeaking(input)
    );
  }

  async explainGrammar(input: ExplainGrammarInput): Promise<GrammarExplanation> {
    return this.safe(
      "explainGrammar",
      async () => {
        const level = input.level ?? "C1";
        return callDeepSeekJson<GrammarExplanation>(
          TUTOR_PERSONA,
          `A CEFR ${level} English learner asks: "${input.question}"\n\n` +
            `Give a clear, correct explanation using vocabulary and sentence complexity appropriate for a ${level} ` +
            `learner (simpler for A1/A2, more nuanced for C1/C2). Reply with JSON: { "explanation": string (2-4 ` +
            `sentences, clear and precise), "examples": string[] (2-3 example sentences illustrating the rule, at ` +
            `${level} level), "relatedExercises": [ { "order": number, "prompt": string, "questionType": ` +
            `"MULTIPLE_CHOICE", "options": string[4] (labelled "A) ", "B) ", "C) ", "D) "), "correctAnswer": string, ` +
            `"explanation": string } ] (exactly 3 original ${level}-level practice questions testing this exact point, easy to hard) }`
        );
      },
      () => this.fallback.explainGrammar(input)
    );
  }

  async generateVocabulary(input: GenerateVocabularyInput): Promise<GeneratedVocabularyWord[]> {
    return this.safe(
      "generateVocabulary",
      async () => {
        const count = input.count ?? 5;
        const candidateInstruction =
          input.candidateWords && input.candidateWords.length > 0
            ? `Pick ${count} words FROM this list of real words from Cambridge's official ${input.level} vocabulary ` +
              `list where possible (only skip one if it genuinely doesn't fit the topic below), rather than ` +
              `inventing new ones — this keeps content grounded in the actual exam's real word scope: ` +
              input.candidateWords.map((w) => `${w.word} (${w.pos})`).join(", ") +
              ". Write fresh, original definitions/translations/examples for each — do not copy any text from " +
              "elsewhere, just use these as the headwords."
            : `The words themselves, not just the definitions, must genuinely be ${input.level}-appropriate ` +
              "difficulty (simple everyday words for A1/A2, increasingly nuanced/abstract/idiomatic for B2/C1/C2).";
        const result = await callDeepSeekJson<{ words: GeneratedVocabularyWord[] }>(
          TUTOR_PERSONA,
          `Generate ${count} original CEFR ${input.level}-level English vocabulary items` +
            (input.topic ? ` on the topic of "${input.topic}"` : "") +
            `, useful for a Spanish-speaking learner preparing for a Cambridge English exam at that level. ` +
            `${candidateInstruction} Include a natural mix of single words, phrasal verbs and collocations where ` +
            `level-appropriate. Reply with JSON: ` +
            `{ "words": [ { "word": string, "definition": string (in English, ${input.level}-appropriate), ` +
            `"translation": string (in Spanish), "exampleSentence": string, "synonyms": string[], "antonyms": string[], ` +
            `"collocations": string[], "phrasalVerbs": string[], "pronunciationIPA": string, "category": string, ` +
            `"cefrLevel": "${input.level}" } ] }`
        );
        return result.words;
      },
      () => this.fallback.generateVocabulary(input)
    );
  }

  async generateStudyPlan(input: GenerateStudyPlanInput): Promise<GeneratedStudyPlan> {
    return this.safe(
      "generateStudyPlan",
      async () => {
        const weeksUntilExam = input.examDate
          ? Math.max(1, Math.min(12, Math.ceil((input.examDate.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))))
          : 8;
        return callDeepSeekJson<GeneratedStudyPlan>(
          TUTOR_PERSONA,
          `Build a ${weeksUntilExam}-week Cambridge English study plan for a learner currently at ${input.currentLevel}, ` +
            `preparing for the ${input.targetLevel} exam, studying ${input.dailyMinutes} minutes/day, ${input.daysPerWeek} days/week, ` +
            `with weaker skills in: ${input.weakSkills.join(", ") || "none specified"}. All content (grammar points, vocabulary ` +
            `topics, exam parts) must be genuinely appropriate for the ${input.targetLevel} target level. ` +
            `Vary the specific grammar/vocabulary topics and exam parts week to week (don't repeat the same items every week), ` +
            `and give proportionally more attention to the weak skills. Reply with JSON: { "weeks": [ { "week": number, ` +
            `"grammar": string[], "vocabulary": string[], "reading": string[], "writing": string[], "listening": string[], "speaking": string[] } ] }`
        );
      },
      () => this.fallback.generateStudyPlan(input)
    );
  }

  // Pure statistics over the user's own error log — deterministic and free,
  // no LLM call needed (and more trustworthy as plain arithmetic).
  async analyzeErrors(input: AnalyzeErrorsInput): Promise<AnalyzeErrorsResult> {
    return this.fallback.analyzeErrors(input);
  }

  async chatWithTutor(input: ChatWithTutorInput): Promise<TutorReply> {
    return this.safe(
      "chatWithTutor",
      async () => {
        const level = input.level ?? "C1";
        const historyText = input.history
          .slice(-10)
          .map((h) => `${h.role === "USER" ? "Student" : "Teacher"}: ${h.content}`)
          .join("\n");
        return callDeepSeekJson<TutorReply>(
          TUTOR_PERSONA +
            ` You are chatting live with a student preparing for CEFR level ${level}. Keep replies concise ` +
            `(2-5 sentences), conversational, and pitched at ${level} complexity — simpler vocabulary and shorter ` +
            "sentences for A1/A2, richer nuance for C1/C2. If the student asks about a specific grammar/vocabulary " +
            `point, explain it and include 3 short original ${level}-level practice questions to check ` +
            "understanding. If they ask something unrelated to English learning, gently redirect them. If they " +
            "paste a sentence asking for correction, correct it inline.",
          `Conversation so far:\n${historyText || "(start of conversation)"}\n\nStudent: ${input.message}\n\n` +
            `Reply with JSON: { "reply": string, "suggestedExercises": [ { "order": number, "prompt": string, ` +
            `"questionType": "MULTIPLE_CHOICE", "options": string[4], "correctAnswer": string, "explanation": string } ] ` +
            `(omit or use an empty array if no practice questions are relevant right now) }`
        );
      },
      () => this.fallback.chatWithTutor(input)
    );
  }

  async generateGrammarTopics(input: GenerateGrammarTopicsInput): Promise<GeneratedGrammarTopicItem[]> {
    return this.safe(
      "generateGrammarTopics",
      async () => {
        const result = await callDeepSeekJson<{ topics: GeneratedGrammarTopicItem[] }>(
          TUTOR_PERSONA,
          `List ${input.count} original English grammar topics that are genuinely core, exam-relevant content for a ` +
            `CEFR ${input.level} learner preparing for a Cambridge English exam at that level — not topics from a ` +
            `higher or lower level (e.g. for A1/A2 use things like present simple, articles, there is/are, plurals, ` +
            `basic prepositions, going-to future; for B1/B2 use things like past tenses, first/second conditionals, ` +
            `comparatives, reported statements; reserve advanced topics like inversion, mixed conditionals, cleft ` +
            `sentences or participle clauses for C1/C2 only). Each topic needs a clear explanation and examples at ` +
            `${input.level} complexity. Reply with JSON: { "topics": [ { "slug": string (kebab-case, url-safe, unique), ` +
            `"title": string, "summary": string (one short sentence), "explanation": string[] (2-3 short paragraphs, ` +
            `${input.level}-appropriate vocabulary and sentence length), "examples": [ { "correct": string, "note": string } ] ` +
            `(2-3 example sentences) } ] }`
        );
        return result.topics;
      },
      () => this.fallback.generateGrammarTopics(input)
    );
  }

  async generateWritingPrompts(input: GenerateWritingPromptsInput): Promise<GeneratedWritingPromptItem[]> {
    return this.safe(
      "generateWritingPrompts",
      async () => {
        const result = await callDeepSeekJson<{ prompts: GeneratedWritingPromptItem[] }>(
          TUTOR_PERSONA,
          `Create ${input.count} original Writing task prompts genuinely appropriate for a CEFR ${input.level} ` +
            `Cambridge English exam. The task TYPE and length must match what is actually tested at ${input.level} — ` +
            `for A1/A2 (Key/KET-style) use very short guided tasks: a short informal message or postcard, 20-35 words, ` +
            `often with 2-3 bullet points telling the student what to include; for B1 (Preliminary/PET-style) use an ` +
            `informal email/letter or short story, about 90-110 words; for B2 (First/FCE-style) use essay, email/letter, ` +
            `review or short story, about 140-190 words; for C1 use essay, proposal, report, review or email/letter, ` +
            `about 220-260 words; for C2 (Proficiency/CPE-style) use essay, report, review or email/letter with more ` +
            `abstract/nuanced topics, about 280-320 words. Vary the WritingType across the set. Reply with JSON: ` +
            `{ "prompts": [ { "slug": string (kebab-case, url-safe, unique), "type": "ESSAY" | "PROPOSAL" | "REPORT" | ` +
            `"REVIEW" | "EMAIL_LETTER" (use only types realistic for ${input.level} as described above), "title": string, ` +
            `"brief": string (the full task instructions as the student would read them), "notes": string[] (bullet ` +
            `points to cover, if the task type at this level uses them, else omit), "minWords": number, "maxWords": number } ] }`
        );
        return result.prompts;
      },
      () => this.fallback.generateWritingPrompts(input)
    );
  }

  async explainWord(input: ExplainWordInput): Promise<GeneratedVocabularyWord> {
    return this.safe(
      "explainWord",
      async () => {
        const isPhrase = input.word.trim().split(/\s+/).length > 1;
        const grammarInstruction = isPhrase
          ? ' Because this is a multi-word phrase (not a single word), also include "grammarNote": a short, clear ' +
            "breakdown of its grammatical structure for this learner — name the tense(s)/verb form(s) used and why " +
            '(e.g. "third conditional: if + past perfect, would have + past participle, describing an unreal past ' +
            'situation"), and any other structural point worth flagging (word order, a fixed collocation, a phrasal ' +
            "verb's particle changing the meaning, etc.). Omit this field entirely for a single word."
          : "";
        const result = await callDeepSeekJson<GeneratedVocabularyWord>(
          TUTOR_PERSONA,
          `A CEFR ${input.level} English learner selected the word or short phrase "${input.word}" while reading in ` +
            "this app because they didn't understand it, and wants it added to their personal vocabulary dictionary." +
            (input.context
              ? ` It appeared in this sentence/passage: """${input.context}""" — use that to pick the correct sense ` +
                "if the word is ambiguous (e.g. \"book\" a hotel room vs. \"book\" a novel), and write the example " +
                "sentence to reflect that same sense."
              : "") +
            ` Explain it for a ${input.level} learner: a clear definition, a Spanish translation, an original example ` +
            "sentence (reuse the sense from the context above if one was given, but don't just copy the source " +
            "sentence verbatim), and related vocabulary. Use the word/phrase exactly as given, in its base/dictionary " +
            `form only if the selection was an inflected form of a single word (e.g. "went" -> explain "go" but keep ` +
            '"word" as "go"); if it\'s a fixed phrase or phrasal verb, keep it as selected.' +
            grammarInstruction +
            ` Reply with JSON: { "word": string, "definition": string (in English, ${input.level}-appropriate), ` +
            `"translation": string (in Spanish), "exampleSentence": string, "synonyms": string[], "antonyms": ` +
            `string[], "collocations": string[], "phrasalVerbs": string[], "pronunciationIPA": string, "category": ` +
            `string (one or two words, e.g. "business", "phrasal verb", "idiom"), "cefrLevel": "${input.level}"` +
            (isPhrase ? ', "grammarNote": string' : "") +
            " }"
        );
        return result;
      },
      () => this.fallback.explainWord(input)
    );
  }

  async translateText(input: TranslateTextInput): Promise<TranslateTextResult> {
    return this.safe(
      "translateText",
      async () => {
        const result = await callDeepSeekJson<TranslateTextResult>(
          "You are a precise English-to-Spanish translator embedded in a Cambridge English exam-prep app. Always " +
            "reply with a single valid JSON object and nothing else.",
          `Translate this English word or short phrase into natural Spanish: "${input.text}"` +
            (input.context
              ? ` It appears in this sentence/passage, use it to pick the correct sense if ambiguous: """${input.context}"""`
              : "") +
            ' Reply with JSON: { "translation": string } — just the translation itself, no explanation, no quotes ' +
            "around it.",
          0.2
        );
        return result;
      },
      () => this.fallback.translateText(input)
    );
  }

  async generateErrorDnaReport(input: GenerateErrorDnaInput): Promise<ErrorDnaResult> {
    return this.safe(
      "generateErrorDnaReport",
      async () => {
        const summaryText = input.errorSummary
          .slice(0, 8)
          .map((s) => `${s.category}: ${s.count} total, ${s.lastSevenDays} in the last 7 days, trend ${s.trend}`)
          .join("\n");
        const samplesText = input.samples
          .map(
            (s) =>
              `[${s.category}] "${s.questionText ?? "(no question text)"}" — student answered "${s.userAnswer ?? "?"}", ` +
              `correct was "${s.correctAnswer ?? "?"}"`
          )
          .join("\n");

        const result = await callDeepSeekJson<ErrorDnaResult>(
          TUTOR_PERSONA +
            " You are writing a personalised diagnostic report — nicknamed by the app 'Your Error DNA' — for a " +
            "Spanish-speaking learner preparing for a Cambridge English exam. Your job is to explain WHY they keep " +
            "making these specific mistakes, not just restate the counts. Look for real patterns: Spanish-English " +
            "L1 interference (e.g. dropping subject pronouns because Spanish is pro-drop, misusing prepositions " +
            "that don't map 1:1 between the languages, false friends, word-order transfer, overusing the present " +
            "continuous because Spanish estar+gerundio is more frequent than English equivalents), a grammar rule " +
            "being over- or under-generalised, or a gap that's purely lexical rather than grammatical. Be specific " +
            "and evidence-based — reference the actual sample mistakes given, don't write generic advice that " +
            "could apply to any learner. Be honest and direct, not falsely reassuring, but keep the tone " +
            "constructive: the goal is insight the learner can act on, not criticism for its own sake.",
          `CEFR target level: ${input.level}\n\nError counts by category (last 200 errors):\n${summaryText}\n\n` +
            `Concrete recent examples:\n${samplesText || "(no detailed examples available)"}\n\n` +
            `Reply with JSON: { "headline": string (one punchy sentence naming the core pattern, in Spanish), ` +
            `"narrative": string (2-4 paragraphs in Spanish, evidence-based diagnosis of WHY these errors happen — ` +
            `reference the actual examples above), "focusAreas": string[] (3-5 concrete, prioritised, actionable ` +
            `items in Spanish, most important first) }`
        );
        return result;
      },
      () => this.fallback.generateErrorDnaReport(input)
    );
  }

  // Deliberately does NOT use this.safe()'s mock fallback: the mock's naive
  // "blank a random word" generator produces broken, misleading exercises
  // when applied to a real user document (e.g. blanking words out of a PDF's
  // copyright footer) — for this feature, a clear error the user can retry
  // is better than silently serving fake content as if the AI produced it.
  async generateExerciseFromMaterial(input: GenerateExerciseFromMaterialInput): Promise<GeneratedExercise> {
    try {
      const count = input.count ?? 5;
      return await callDeepSeekJson<GeneratedExercise>(
          CLASS_MATERIAL_PERSONA,
          `Material title: "${input.materialTitle}"\n\nMaterial text:\n"""\n${input.materialText}\n"""\n\n` +
            `Create exactly ${count} original practice questions based ONLY on the material above — testing whether ` +
            `the student understood and can apply what's actually written there (facts, vocabulary, grammar rules, ` +
            `worked examples, etc. present in the text). Mix question types where the material supports it: ` +
            `multiple choice, open cloze (fill the gap), or short sentence completion — pick whichever type best ` +
            `tests each specific point, don't force every question into the same type.` +
            (input.focusInstructions ? ` Additional focus requested by the student: ${input.focusInstructions}.` : "") +
            `\n\nEach explanation must be step-by-step and must reference the material directly (quote or paraphrase ` +
            `the relevant part) so the student can see exactly where the answer comes from — do not just state the ` +
            `answer.\n\nReply with JSON: { "title": string, "instructions": string, "questions": [ { "order": number, ` +
            `"prompt": string, "questionType": "MULTIPLE_CHOICE" | "OPEN_CLOZE" | "SENTENCE_COMPLETION", ` +
            `"options": string[4] (only for MULTIPLE_CHOICE, labelled "A) ", "B) ", "C) ", "D) ", omit otherwise), ` +
            `"correctAnswer": string, "explanation": string (step-by-step, grounded in the material text above) } ] }`
      );
    } catch (err) {
      console.error("[DeepSeekAIProvider] generateExerciseFromMaterial failed:", err);
      throw err;
    }
  }
}
