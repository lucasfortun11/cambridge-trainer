-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CEFRLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "Sublevel" AS ENUM ('LOW', 'MID', 'HIGH');

-- CreateEnum
CREATE TYPE "Skill" AS ENUM ('READING', 'USE_OF_ENGLISH', 'WRITING', 'LISTENING', 'SPEAKING', 'GRAMMAR', 'VOCABULARY');

-- CreateEnum
CREATE TYPE "ExamPart" AS ENUM ('RUE_PART1_MULTIPLE_CHOICE_CLOZE', 'RUE_PART2_OPEN_CLOZE', 'RUE_PART3_WORD_FORMATION', 'RUE_PART4_KEY_WORD_TRANSFORMATION', 'RUE_PART5_MULTIPLE_CHOICE_READING', 'RUE_PART6_CROSS_TEXT_MULTIPLE_MATCHING', 'RUE_PART7_GAPPED_TEXT', 'RUE_PART8_MULTIPLE_MATCHING', 'LISTENING_PART1_MULTIPLE_CHOICE', 'LISTENING_PART2_SENTENCE_COMPLETION', 'LISTENING_PART3_MULTIPLE_CHOICE', 'LISTENING_PART4_MULTIPLE_MATCHING', 'GRAMMAR_DRILL', 'VOCABULARY_DRILL');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'OPEN_CLOZE', 'WORD_FORMATION', 'KEY_WORD_TRANSFORMATION', 'GAPPED_TEXT', 'MULTIPLE_MATCHING', 'SENTENCE_COMPLETION');

-- CreateEnum
CREATE TYPE "WritingType" AS ENUM ('ESSAY', 'PROPOSAL', 'REPORT', 'REVIEW', 'EMAIL_LETTER');

-- CreateEnum
CREATE TYPE "SpeakingPart" AS ENUM ('INTERVIEW', 'LONG_TURN', 'COLLABORATIVE_TASK', 'DISCUSSION');

-- CreateEnum
CREATE TYPE "ErrorCategory" AS ENUM ('ARTICLES', 'PREPOSITIONS', 'TENSES', 'CONDITIONALS', 'MODAL_VERBS', 'RELATIVE_CLAUSES', 'INVERSION', 'PASSIVE_VOICE', 'REPORTED_SPEECH', 'GERUNDS_INFINITIVES', 'COLLOCATIONS', 'PHRASAL_VERBS', 'WORD_FORMATION', 'VOCABULARY', 'SPELLING', 'WORD_CHOICE', 'REGISTER', 'PRONUNCIATION', 'COHESION', 'OTHER');

-- CreateEnum
CREATE TYPE "ErrorSource" AS ENUM ('READING_USE_OF_ENGLISH', 'LISTENING', 'WRITING', 'SPEAKING', 'GRAMMAR_DRILL', 'VOCABULARY_DRILL');

-- CreateEnum
CREATE TYPE "VocabStatus" AS ENUM ('NEW', 'LEARNING', 'REVIEWING', 'MASTERED');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'TUTOR');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('TRIAL', 'MONTHLY', 'ANNUAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetExamDate" TIMESTAMP(3),
    "dailyMinutesAvailable" INTEGER,
    "studyDaysPerWeek" INTEGER,
    "targetLevel" "CEFRLevel" NOT NULL DEFAULT 'C1',
    "overallLevel" "CEFRLevel",
    "overallSublevel" "Sublevel",
    "readingLevel" "CEFRLevel",
    "readingSublevel" "Sublevel",
    "useOfEnglishLevel" "CEFRLevel",
    "useOfEnglishSublevel" "Sublevel",
    "writingLevel" "CEFRLevel",
    "writingSublevel" "Sublevel",
    "listeningLevel" "CEFRLevel",
    "listeningSublevel" "Sublevel",
    "speakingLevel" "CEFRLevel",
    "speakingSublevel" "Sublevel",
    "grammarLevel" "CEFRLevel",
    "grammarSublevel" "Sublevel",
    "vocabularyLevel" "CEFRLevel",
    "vocabularySublevel" "Sublevel",
    "estimatedCambridgeScore" INTEGER,
    "examReadinessPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TIMESTAMP(3),
    "hasCompletedPlacementTest" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "planTier" "PlanTier" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "subscribedAt" TIMESTAMP(3),
    "subscriptionCancelledAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ExamPart" NOT NULL,
    "skill" "Skill" NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT,
    "instructions" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "distractorExplanations" TEXT,
    "grammarCategory" "ErrorCategory",

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "scorePercent" DOUBLE PRECISION,
    "timeSpentSeconds" INTEGER,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT,
    "source" "ErrorSource" NOT NULL,
    "category" "ErrorCategory" NOT NULL,
    "questionText" TEXT,
    "correctAnswer" TEXT,
    "userAnswer" TEXT,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorDnaReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "focusAreas" TEXT NOT NULL,
    "errorCountAtGeneration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorDnaReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "translation" TEXT,
    "exampleSentence" TEXT NOT NULL,
    "synonyms" TEXT,
    "antonyms" TEXT,
    "collocations" TEXT,
    "phrasalVerbs" TEXT,
    "pronunciationIPA" TEXT,
    "category" TEXT,
    "cefrLevel" "CEFRLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceContext" TEXT,
    "grammarNote" TEXT,

    CONSTRAINT "VocabularyWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VocabularyReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "status" "VocabStatus" NOT NULL DEFAULT 'NEW',
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReviewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "addedManually" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VocabularyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Writing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WritingType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "userText" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scoreContent" DOUBLE PRECISION,
    "scoreCommunicativeAchievement" DOUBLE PRECISION,
    "scoreOrganisation" DOUBLE PRECISION,
    "scoreLanguage" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "estimatedLevel" "CEFRLevel",
    "estimatedSublevel" "Sublevel",
    "feedback" TEXT,
    "improvedVersion" TEXT,

    CONSTRAINT "Writing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "part" "SpeakingPart" NOT NULL,
    "prompt" TEXT NOT NULL,
    "transcript" TEXT,
    "audioRetained" BOOLEAN NOT NULL DEFAULT false,
    "durationSeconds" INTEGER,
    "scoreFluency" DOUBLE PRECISION,
    "scoreGrammar" DOUBLE PRECISION,
    "scoreVocabulary" DOUBLE PRECISION,
    "scoreCoherence" DOUBLE PRECISION,
    "scorePronunciation" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "estimatedLevel" "CEFRLevel",
    "estimatedSublevel" "Sublevel",
    "repeatedWords" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plannedMinutes" INTEGER NOT NULL,
    "actualMinutes" INTEGER,
    "tasks" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "xpEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "readingUseOfEnglishScore" DOUBLE PRECISION,
    "writingScore" DOUBLE PRECISION,
    "listeningScore" DOUBLE PRECISION,
    "speakingScore" DOUBLE PRECISION,
    "overallScore" INTEGER,
    "estimatedGrade" TEXT,
    "details" TEXT,

    CONSTRAINT "MockExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skill" "Skill" NOT NULL,
    "accuracyPercent" DOUBLE PRECISION NOT NULL,
    "exercisesCompleted" INTEGER NOT NULL DEFAULT 0,
    "minutesStudied" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examDate" TIMESTAMP(3),
    "targetLevel" "CEFRLevel" NOT NULL DEFAULT 'C1',
    "dailyMinutes" INTEGER NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,
    "weeks" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedGrammarTopic" (
    "id" TEXT NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "examples" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedGrammarTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedWritingPrompt" (
    "id" TEXT NOT NULL,
    "level" "CEFRLevel" NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "WritingType" NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "notes" TEXT,
    "minWords" INTEGER NOT NULL,
    "maxWords" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedWritingPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGenerationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiGenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassMaterial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT,
    "fileType" TEXT NOT NULL,
    "extractedText" TEXT NOT NULL,
    "charCount" INTEGER NOT NULL,
    "truncated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassExercise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassQuestion" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "distractorExplanations" TEXT,

    CONSTRAINT "ClassQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "scorePercent" DOUBLE PRECISION,
    "timeSpentSeconds" INTEGER,

    CONSTRAINT "ClassAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_stripeCustomerId_key" ON "UserProfile"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_stripeSubscriptionId_key" ON "UserProfile"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");

-- CreateIndex
CREATE INDEX "Exercise_skill_type_idx" ON "Exercise"("skill", "type");

-- CreateIndex
CREATE INDEX "Attempt_userId_idx" ON "Attempt"("userId");

-- CreateIndex
CREATE INDEX "Answer_attemptId_idx" ON "Answer"("attemptId");

-- CreateIndex
CREATE INDEX "ErrorLog_userId_category_idx" ON "ErrorLog"("userId", "category");

-- CreateIndex
CREATE INDEX "ErrorLog_userId_createdAt_idx" ON "ErrorLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ErrorDnaReport_userId_createdAt_idx" ON "ErrorDnaReport"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "VocabularyWord_cefrLevel_idx" ON "VocabularyWord"("cefrLevel");

-- CreateIndex
CREATE INDEX "VocabularyReview_userId_nextReviewDate_idx" ON "VocabularyReview"("userId", "nextReviewDate");

-- CreateIndex
CREATE UNIQUE INDEX "VocabularyReview_userId_wordId_key" ON "VocabularyReview"("userId", "wordId");

-- CreateIndex
CREATE INDEX "Writing_userId_idx" ON "Writing"("userId");

-- CreateIndex
CREATE INDEX "SpeakingAttempt_userId_idx" ON "SpeakingAttempt"("userId");

-- CreateIndex
CREATE INDEX "StudySession_userId_date_idx" ON "StudySession"("userId", "date");

-- CreateIndex
CREATE INDEX "MockExam_userId_startedAt_idx" ON "MockExam"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "Progress_userId_skill_date_idx" ON "Progress"("userId", "skill", "date");

-- CreateIndex
CREATE INDEX "StudyPlan_userId_active_idx" ON "StudyPlan"("userId", "active");

-- CreateIndex
CREATE INDEX "ChatMessage_userId_createdAt_idx" ON "ChatMessage"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedGrammarTopic_slug_key" ON "GeneratedGrammarTopic"("slug");

-- CreateIndex
CREATE INDEX "GeneratedGrammarTopic_level_idx" ON "GeneratedGrammarTopic"("level");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedWritingPrompt_slug_key" ON "GeneratedWritingPrompt"("slug");

-- CreateIndex
CREATE INDEX "GeneratedWritingPrompt_level_idx" ON "GeneratedWritingPrompt"("level");

-- CreateIndex
CREATE INDEX "AiGenerationLog_userId_createdAt_idx" ON "AiGenerationLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "ClassMaterial_userId_createdAt_idx" ON "ClassMaterial"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassExercise_userId_createdAt_idx" ON "ClassExercise"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ClassExercise_materialId_idx" ON "ClassExercise"("materialId");

-- CreateIndex
CREATE INDEX "ClassAttempt_userId_idx" ON "ClassAttempt"("userId");

-- CreateIndex
CREATE INDEX "ClassAnswer_attemptId_idx" ON "ClassAnswer"("attemptId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorDnaReport" ADD CONSTRAINT "ErrorDnaReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyReview" ADD CONSTRAINT "VocabularyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VocabularyReview" ADD CONSTRAINT "VocabularyReview_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "VocabularyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Writing" ADD CONSTRAINT "Writing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingAttempt" ADD CONSTRAINT "SpeakingAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExam" ADD CONSTRAINT "MockExam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGenerationLog" ADD CONSTRAINT "AiGenerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMaterial" ADD CONSTRAINT "ClassMaterial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassExercise" ADD CONSTRAINT "ClassExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassExercise" ADD CONSTRAINT "ClassExercise_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "ClassMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassQuestion" ADD CONSTRAINT "ClassQuestion_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ClassExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAttempt" ADD CONSTRAINT "ClassAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAttempt" ADD CONSTRAINT "ClassAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ClassExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAnswer" ADD CONSTRAINT "ClassAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ClassAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAnswer" ADD CONSTRAINT "ClassAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ClassQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

