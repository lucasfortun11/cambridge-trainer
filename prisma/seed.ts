import { PrismaClient, type ErrorCategory, type Skill } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { rueExercises } from "./content/reading-use-of-english";
import { grammarExercises } from "./content/grammar";
import { listeningExercises } from "./content/listening";
import { vocabularyWords as vocabularyWordSeeds } from "./content/vocabulary";
import type { ExerciseSeed } from "./content/types";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Seeding database...");

  // Clean slate — safe to re-run. Deleting the demo user cascades all of
  // their attempts/errors/reviews/sessions/etc. VocabularyWord and
  // Achievement are global catalog tables owned entirely by this seed
  // script in Phase 1, so they're reset too (cascades UserAchievement /
  // VocabularyReview rows for any other user as well).
  await prisma.user.deleteMany({ where: { email: "demo@c1trainer.com" } });
  await prisma.vocabularyWord.deleteMany({});
  await prisma.achievement.deleteMany({});

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const user = await prisma.user.create({
    data: {
      email: "demo@c1trainer.com",
      name: "Demo",
      passwordHash,
      profile: {
        create: {
          targetExamDate: daysAgo(-70),
          dailyMinutesAvailable: 60,
          studyDaysPerWeek: 5,
          overallLevel: "B2",
          overallSublevel: "HIGH",
          readingLevel: "C1",
          readingSublevel: "LOW",
          useOfEnglishLevel: "B2",
          useOfEnglishSublevel: "HIGH",
          writingLevel: "B2",
          writingSublevel: "HIGH",
          listeningLevel: "B2",
          listeningSublevel: "MID",
          speakingLevel: "B2",
          speakingSublevel: "MID",
          grammarLevel: "B2",
          grammarSublevel: "HIGH",
          vocabularyLevel: "C1",
          vocabularySublevel: "MID",
          estimatedCambridgeScore: 178,
          examReadinessPercent: 74,
          targetLevel: "C1",
          xp: 2350,
          level: 6,
          currentStreak: 7,
          longestStreak: 21,
          lastStudyDate: daysAgo(0),
          hasCompletedPlacementTest: true,
          onboardingCompleted: true,
          planTier: "ANNUAL",
          subscribedAt: daysAgo(30),
        },
      },
    },
  });

  // ---------------------------------------------------------------------
  // Exercise content library (Reading & Use of English, Grammar, Listening)
  // Global catalog, not tied to any user — only seeded once (skipped if
  // already present) so re-running this script never duplicates content or
  // wipes real users' Attempt history tied to these exercises.
  // ---------------------------------------------------------------------

  const allExerciseSeeds: ExerciseSeed[] = [...rueExercises, ...grammarExercises, ...listeningExercises];
  const existingExerciseCount = await prisma.exercise.count();

  if (existingExerciseCount === 0) {
    for (const ex of allExerciseSeeds) {
      await prisma.exercise.create({
        data: {
          slug: ex.slug,
          type: ex.type as never,
          skill: ex.skill as never,
          level: ex.level as never,
          title: ex.title,
          topic: ex.topic,
          instructions: ex.instructions,
          content: JSON.stringify(ex.content),
          audioUrl: ex.audioUrl,
          questions: {
            create: ex.questions.map((q) => ({
              order: q.order,
              questionType: q.questionType as never,
              prompt: q.prompt,
              options: q.options ? JSON.stringify(q.options) : null,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              distractorExplanations: q.distractorExplanations
                ? JSON.stringify(q.distractorExplanations)
                : null,
              grammarCategory: (q.grammarCategory as never) ?? null,
            })),
          },
        },
      });
    }
    console.log(`Seeded ${allExerciseSeeds.length} exercises.`);
  } else {
    console.log(`Skipped exercise content seed (${existingExerciseCount} exercises already exist).`);
  }

  // ---------------------------------------------------------------------
  // Attempts + Answers (wires the exercise flow end-to-end for the demo user)
  // ---------------------------------------------------------------------

  const demoExerciseSlugs = ["rue-p1-remote-work", "grammar-inversion", "listening-p2-sustainable-architecture"];
  const demoExercises = await prisma.exercise.findMany({
    where: { slug: { in: demoExerciseSlugs } },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  const skillToErrorSource: Record<string, "READING_USE_OF_ENGLISH" | "GRAMMAR_DRILL" | "LISTENING"> = {
    USE_OF_ENGLISH: "READING_USE_OF_ENGLISH",
    READING: "READING_USE_OF_ENGLISH",
    GRAMMAR: "GRAMMAR_DRILL",
    LISTENING: "LISTENING",
  };

  for (const exercise of demoExercises) {
    const attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        exerciseId: exercise.id,
        startedAt: daysAgo(3),
        completedAt: daysAgo(3),
        totalQuestions: exercise.questions.length,
        correctCount: Math.max(0, exercise.questions.length - 1),
        scorePercent: Math.round(
          ((exercise.questions.length - 1) / exercise.questions.length) * 100
        ),
        timeSpentSeconds: 240,
      },
    });

    for (let i = 0; i < exercise.questions.length; i++) {
      const q = exercise.questions[i];
      const isCorrect = i !== 0; // first question wrong, rest correct
      const wrongAnswer = q.options ? JSON.parse(q.options)[1] : "(incorrect answer)";

      await prisma.answer.create({
        data: {
          attemptId: attempt.id,
          questionId: q.id,
          userAnswer: isCorrect ? q.correctAnswer : wrongAnswer,
          isCorrect,
        },
      });

      if (!isCorrect) {
        await prisma.errorLog.create({
          data: {
            userId: user.id,
            questionId: q.id,
            source: skillToErrorSource[exercise.skill] ?? "READING_USE_OF_ENGLISH",
            category: q.grammarCategory ?? "OTHER",
            questionText: q.prompt,
            correctAnswer: q.correctAnswer,
            userAnswer: wrongAnswer,
            explanation: q.explanation,
            createdAt: daysAgo(3),
          },
        });
      }
    }
  }

  // ---------------------------------------------------------------------
  // Historical error log (drives "My Errors" pattern detection + dashboard)
  // ---------------------------------------------------------------------

  const errorTemplates: {
    category: ErrorCategory;
    source: "READING_USE_OF_ENGLISH" | "WRITING" | "GRAMMAR_DRILL";
    questionText: string;
    correctAnswer: string;
    userAnswer: string;
    explanation: string;
  }[] = [
    {
      category: "PREPOSITIONS",
      source: "GRAMMAR_DRILL",
      questionText: "She is responsible ___ the entire marketing budget.",
      correctAnswer: "for",
      userAnswer: "of",
      explanation: "'Responsible for' is the correct dependent preposition, not 'responsible of'.",
    },
    {
      category: "PREPOSITIONS",
      source: "READING_USE_OF_ENGLISH",
      questionText: "He insisted ___ paying for dinner.",
      correctAnswer: "on",
      userAnswer: "in",
      explanation: "'Insist on doing something' is the fixed collocation.",
    },
    {
      category: "ARTICLES",
      source: "WRITING",
      questionText: "I have never seen ___ such beautiful sunset.",
      correctAnswer: "such a",
      userAnswer: "such",
      explanation: "'Such' + singular countable noun requires the indefinite article: 'such a sunset'.",
    },
    {
      category: "WORD_FORMATION",
      source: "READING_USE_OF_ENGLISH",
      questionText: "The committee reached a ___ decision. (UNANIMOUS)",
      correctAnswer: "unanimous",
      userAnswer: "unanimously",
      explanation: "The gap needs an adjective to modify 'decision', not an adverb.",
    },
    {
      category: "CONDITIONALS",
      source: "GRAMMAR_DRILL",
      questionText: "If I ___ harder, I would have passed the exam.",
      correctAnswer: "had studied",
      userAnswer: "would have studied",
      explanation: "Third conditional: 'if' clause takes the past perfect, not 'would have'.",
    },
    {
      category: "COLLOCATIONS",
      source: "WRITING",
      questionText: "The new policy will have a substantial ___ on small businesses.",
      correctAnswer: "impact",
      userAnswer: "affect",
      explanation: "'Impact' is a noun that collocates with 'have a ... on'; 'affect' is normally a verb.",
    },
    {
      category: "PHRASAL_VERBS",
      source: "READING_USE_OF_ENGLISH",
      questionText: "The meeting was ___ due to bad weather.",
      correctAnswer: "called off",
      userAnswer: "called out",
      explanation: "'Call off' means to cancel; 'call out' means to challenge or shout.",
    },
    {
      category: "REGISTER",
      source: "WRITING",
      questionText: "Formal email closing",
      correctAnswer: "I look forward to hearing from you.",
      userAnswer: "Can't wait to hear back!",
      explanation: "This register is too informal for a formal email to a client.",
    },
  ];

  const errorRows: {
    userId: string;
    source: "READING_USE_OF_ENGLISH" | "WRITING" | "GRAMMAR_DRILL";
    category: ErrorCategory;
    questionText: string;
    correctAnswer: string;
    userAnswer: string;
    explanation: string;
    createdAt: Date;
  }[] = [];

  for (let i = 0; i < 45; i++) {
    const t = pick(errorTemplates);
    errorRows.push({
      userId: user.id,
      source: t.source,
      category: t.category,
      questionText: t.questionText,
      correctAnswer: t.correctAnswer,
      userAnswer: t.userAnswer,
      explanation: t.explanation,
      createdAt: daysAgo(Math.floor(Math.random() * 21)),
    });
  }
  await prisma.errorLog.createMany({ data: errorRows });

  // ---------------------------------------------------------------------
  // Progress history (8 weeks, trending upward, per skill)
  // ---------------------------------------------------------------------

  const skills: Skill[] = [
    "READING",
    "USE_OF_ENGLISH",
    "WRITING",
    "LISTENING",
    "SPEAKING",
    "GRAMMAR",
    "VOCABULARY",
  ];
  const baseAccuracy: Record<Skill, number> = {
    READING: 68,
    USE_OF_ENGLISH: 60,
    WRITING: 65,
    LISTENING: 58,
    SPEAKING: 62,
    GRAMMAR: 66,
    VOCABULARY: 72,
  };

  const progressRows: {
    userId: string;
    date: Date;
    skill: Skill;
    accuracyPercent: number;
    exercisesCompleted: number;
    minutesStudied: number;
  }[] = [];

  for (let week = 8; week >= 0; week--) {
    for (const skill of skills) {
      const improvement = (8 - week) * 1.8; // gentle upward trend
      const noise = Math.random() * 8 - 4;
      const accuracy = Math.max(
        35,
        Math.min(97, Math.round(baseAccuracy[skill] + improvement + noise))
      );
      // 2-3 sessions logged per week per skill
      const sessionsThisWeek = 2 + Math.floor(Math.random() * 2);
      for (let s = 0; s < sessionsThisWeek; s++) {
        progressRows.push({
          userId: user.id,
          date: daysAgo(week * 7 + Math.floor(Math.random() * 6)),
          skill,
          accuracyPercent: Math.max(30, accuracy + Math.round(Math.random() * 6 - 3)),
          exercisesCompleted: 3 + Math.floor(Math.random() * 8),
          minutesStudied: 10 + Math.floor(Math.random() * 20),
        });
      }
    }
  }
  await prisma.progress.createMany({ data: progressRows });

  // ---------------------------------------------------------------------
  // Study sessions (last 20 days, mostly completed — drives streak & minutes)
  // ---------------------------------------------------------------------

  const sessionRows: {
    userId: string;
    date: Date;
    plannedMinutes: number;
    actualMinutes: number;
    tasks: string;
    completedAt: Date;
    xpEarned: number;
  }[] = [];

  for (let d = 20; d >= 0; d--) {
    if (d % 5 === 4) continue; // skip a day here and there, realistic streak
    const planned = pick([30, 45, 60]);
    sessionRows.push({
      userId: user.id,
      date: daysAgo(d),
      plannedMinutes: planned,
      actualMinutes: planned - Math.floor(Math.random() * 10),
      tasks: JSON.stringify([
        { skill: "USE_OF_ENGLISH", label: "Use of English", minutes: 15 },
        { skill: "READING", label: "Reading", minutes: 20 },
        { skill: "VOCABULARY", label: "Vocabulary", minutes: 10 },
      ]),
      completedAt: daysAgo(d),
      xpEarned: 40 + Math.floor(Math.random() * 30),
    });
  }
  await prisma.studySession.createMany({ data: sessionRows });

  // ---------------------------------------------------------------------
  // Mock exams (evolution: 168 -> 174 -> 181)
  // ---------------------------------------------------------------------

  const mockScores = [168, 174, 181];
  for (let i = 0; i < mockScores.length; i++) {
    const daysBack = (mockScores.length - i) * 14;
    await prisma.mockExam.create({
      data: {
        userId: user.id,
        startedAt: daysAgo(daysBack),
        completedAt: daysAgo(daysBack),
        readingUseOfEnglishScore: mockScores[i] - 4,
        writingScore: mockScores[i] - 2,
        listeningScore: mockScores[i] - 6,
        speakingScore: mockScores[i],
        overallScore: mockScores[i],
        estimatedGrade: mockScores[i] >= 180 ? "Grade A/B (C1)" : "Grade C (B2/C1 borderline)",
        details: JSON.stringify({ note: "Seeded sample mock exam result." }),
      },
    });
  }

  // ---------------------------------------------------------------------
  // Vocabulary
  // ---------------------------------------------------------------------

  const createdWords = [];
  for (const w of vocabularyWordSeeds) {
    createdWords.push(
      await prisma.vocabularyWord.create({
        data: {
          word: w.word,
          definition: w.definition,
          translation: w.translation,
          exampleSentence: w.exampleSentence,
          synonyms: JSON.stringify(w.synonyms ?? []),
          antonyms: JSON.stringify(w.antonyms ?? []),
          collocations: JSON.stringify(w.collocations ?? []),
          phrasalVerbs: JSON.stringify(w.phrasalVerbs ?? []),
          pronunciationIPA: w.pronunciationIPA,
          category: w.category,
          cefrLevel: w.cefrLevel as never,
        },
      })
    );
  }

  const statuses = ["NEW", "LEARNING", "REVIEWING", "MASTERED"] as const;
  for (let i = 0; i < createdWords.length; i++) {
    const status = statuses[i % statuses.length];
    await prisma.vocabularyReview.create({
      data: {
        userId: user.id,
        wordId: createdWords[i].id,
        status,
        easeFactor: 2.3 + Math.random() * 0.4,
        intervalDays: status === "MASTERED" ? 30 : status === "REVIEWING" ? 6 : 1,
        repetitions: status === "MASTERED" ? 6 : status === "REVIEWING" ? 3 : status === "LEARNING" ? 1 : 0,
        nextReviewDate: status === "NEW" ? new Date() : daysAgo(-Math.floor(Math.random() * 5)),
        lastReviewedAt: status === "NEW" ? null : daysAgo(Math.floor(Math.random() * 5)),
      },
    });
  }

  // ---------------------------------------------------------------------
  // Achievements
  // ---------------------------------------------------------------------

  const achievements = [
    { code: "STREAK_7", title: "7 días seguidos", description: "Estudiaste 7 días seguidos.", icon: "🔥" },
    { code: "VOCAB_100", title: "100 palabras aprendidas", description: "Dominaste 100 palabras.", icon: "📚" },
    { code: "UOE_50", title: "50 ejercicios de Use of English", description: "Completaste 50 ejercicios.", icon: "✍️" },
    { code: "FIRST_MOCK", title: "Primer mock completo", description: "Completaste tu primer simulacro.", icon: "🏆" },
    { code: "EARLY_BIRD", title: "Madrugador", description: "Estudiaste antes de las 8am 5 veces.", icon: "🌅" },
    { code: "GRAMMAR_MASTER", title: "Maestro de gramática", description: "90%+ de aciertos en Grammar durante una semana.", icon: "🎯" },
  ];

  const createdAchievements = [];
  for (const a of achievements) {
    createdAchievements.push(await prisma.achievement.create({ data: a }));
  }

  for (const a of createdAchievements.slice(0, 3)) {
    await prisma.userAchievement.create({
      data: { userId: user.id, achievementId: a.id, unlockedAt: daysAgo(Math.floor(Math.random() * 15)) },
    });
  }

  // ---------------------------------------------------------------------
  // AI Tutor sample chat
  // ---------------------------------------------------------------------

  await prisma.chatMessage.createMany({
    data: [
      {
        userId: user.id,
        role: "USER",
        content: 'Why is "I have been knowing him" wrong?',
        createdAt: daysAgo(2),
      },
      {
        userId: user.id,
        role: "TUTOR",
        content:
          "\"Know\" is normally a stative verb, so we don't usually use it in the continuous form. You should say \"I have known him for five years.\"",
        createdAt: daysAgo(2),
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo login -> email: demo@c1trainer.com | password: demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
