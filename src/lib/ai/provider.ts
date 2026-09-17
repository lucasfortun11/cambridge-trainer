// The AIProvider interface isolates every part of the app from the concrete
// AI backend. Swapping providers (mock -> Anthropic API, or any other model)
// only means writing a new class here and pointing AI_PROVIDER at it in
// src/lib/ai/index.ts — nothing else in the app changes.

import type {
  AnalyzeErrorsInput,
  AnalyzeErrorsResult,
  ChatWithTutorInput,
  EvaluateSpeakingInput,
  EvaluateWritingInput,
  ErrorDnaResult,
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

export interface AIProvider {
  generateExercise(input: GenerateExerciseInput): Promise<GeneratedExercise>;
  evaluateWriting(input: EvaluateWritingInput): Promise<WritingFeedback>;
  evaluateSpeaking(input: EvaluateSpeakingInput): Promise<SpeakingFeedback>;
  explainGrammar(input: ExplainGrammarInput): Promise<GrammarExplanation>;
  generateVocabulary(
    input: GenerateVocabularyInput
  ): Promise<GeneratedVocabularyWord[]>;
  generateStudyPlan(input: GenerateStudyPlanInput): Promise<GeneratedStudyPlan>;
  analyzeErrors(input: AnalyzeErrorsInput): Promise<AnalyzeErrorsResult>;
  chatWithTutor(input: ChatWithTutorInput): Promise<TutorReply>;
  generateGrammarTopics(input: GenerateGrammarTopicsInput): Promise<GeneratedGrammarTopicItem[]>;
  generateWritingPrompts(input: GenerateWritingPromptsInput): Promise<GeneratedWritingPromptItem[]>;
  explainWord(input: ExplainWordInput): Promise<GeneratedVocabularyWord>;
  translateText(input: TranslateTextInput): Promise<TranslateTextResult>;
  generateErrorDnaReport(input: GenerateErrorDnaInput): Promise<ErrorDnaResult>;
  // "Mi Clase" — grounded strictly in the user's own uploaded material, fully
  // independent from generateExercise's Cambridge-exam content.
  generateExerciseFromMaterial(input: GenerateExerciseFromMaterialInput): Promise<GeneratedExercise>;
}
