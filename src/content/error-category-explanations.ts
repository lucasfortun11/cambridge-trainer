// Explanation used by the AI Tutor, explainGrammar() and mini-lessons for
// every ErrorCategory — including non-grammar ones (vocabulary, spelling,
// register...) not covered by the deeper Grammar-module topics.

export type CategoryExplanation = {
  title: string;
  summary: string;
  explanation: string[];
  examples: { correct: string; note?: string }[];
  grammarTopicSlug?: string; // links to a full src/content/grammar-topics.ts entry, if one exists
};

export const CATEGORY_EXPLANATIONS: Record<string, CategoryExplanation> = {
  ARTICLES: {
    title: "Articles",
    summary: "a/an, the, and the zero article.",
    explanation: [
      "The zero article is used with plural/uncountable nouns for general statements, but 'the' is needed for a specific, known instance.",
      "'Such a/an + adjective + noun' needs the indefinite article before a singular countable noun.",
    ],
    examples: [
      { correct: "Education is the key to economic growth.", note: "General statement — no article." },
      { correct: "The education she received abroad shaped her career.", note: "Specific, known instance." },
    ],
    grammarTopicSlug: "determiners-articles",
  },
  PREPOSITIONS: {
    title: "Prepositions",
    summary: "Dependent prepositions after adjectives, verbs and nouns.",
    explanation: [
      "Many C1 errors come from dependent prepositions that don't translate directly — these need to be learned as fixed pairs.",
      "Common problem pairs: responsible for, insist on, interested in, married to, depend on, consist of.",
    ],
    examples: [{ correct: "She is responsible for the entire marketing budget." }],
    grammarTopicSlug: "prepositions",
  },
  TENSES: {
    title: "Tenses",
    summary: "Perfect aspects and how they connect two points in time.",
    explanation: [
      "Present perfect simple focuses on the result; present perfect continuous focuses on the ongoing activity itself.",
      "Past perfect makes clear that one past event happened before another past event.",
    ],
    examples: [{ correct: "By the time she arrived, the meeting had already finished." }],
    grammarTopicSlug: "advanced-tenses",
  },
  CONDITIONALS: {
    title: "Conditionals",
    summary: "Beyond the four basic conditionals — mixing time frames.",
    explanation: [
      "Mixed conditionals combine a condition in one time frame with a result in another.",
      "Past condition → present result: If + past perfect, ... would + base form.",
    ],
    examples: [{ correct: "If I had taken that job, I would be living in Berlin now." }],
    grammarTopicSlug: "conditionals",
  },
  MODAL_VERBS: {
    title: "Modal verbs",
    summary: "Expressing certainty, obligation and criticism about the past.",
    explanation: [
      "Modal + have + past participle lets you talk about the past: certainty (must/can't have), possibility (may/might have), criticism (should/shouldn't have).",
    ],
    examples: [{ correct: "You shouldn't have raised your voice in the meeting." }],
    grammarTopicSlug: "modal-verbs",
  },
  RELATIVE_CLAUSES: {
    title: "Relative clauses",
    summary: "Defining vs non-defining clauses.",
    explanation: [
      "Defining relative clauses (no commas) identify which person/thing; non-defining clauses (with commas) add extra information.",
      "'Which' can refer back to a whole previous clause, not just a noun.",
    ],
    examples: [{ correct: "She passed the exam first time, which surprised everyone." }],
    grammarTopicSlug: "relative-clauses",
  },
  INVERSION: {
    title: "Inversion",
    summary: "Fronting negative/limiting adverbials for emphasis.",
    explanation: [
      "Fronting negative or limiting adverbials (never, rarely, no sooner, not only) triggers subject-auxiliary inversion.",
    ],
    examples: [{ correct: "Never have I seen such a disorganised meeting." }],
    grammarTopicSlug: "inversion",
  },
  PASSIVE_VOICE: {
    title: "Passive voice",
    summary: "Impersonal, formal or report-style structures.",
    explanation: [
      "The passive is especially common in formal/academic writing, where the agent is unknown or less important than the action.",
      "'It is said/believed that...' distances the writer from a claim.",
    ],
    examples: [{ correct: "It is widely believed that the policy will be revised next year." }],
    grammarTopicSlug: "passive-structures",
  },
  REPORTED_SPEECH: {
    title: "Reported speech",
    summary: "Backshifting tenses and a wider range of reporting verbs.",
    explanation: [
      "When the reporting verb is in the past, tenses generally shift back one step.",
      "Verbs like admit, deny, suggest, warn, urge make reported speech far more precise than repeated 'said that'.",
    ],
    examples: [{ correct: "She admitted that she had forgotten the deadline." }],
    grammarTopicSlug: "reported-speech",
  },
  GERUNDS_INFINITIVES: {
    title: "Gerunds and infinitives",
    summary: "Verb patterns where the choice changes the meaning.",
    explanation: [
      "remember/forget/regret + -ing refers to a past action; + to refers to a future action/obligation.",
      "stop + -ing means ceasing an activity; stop + to means pausing to do something else.",
    ],
    examples: [{ correct: "Remember to lock the door." }],
    grammarTopicSlug: "gerunds-infinitives",
  },
  COLLOCATIONS: {
    title: "Collocations",
    summary: "Words that habitually go together in English.",
    explanation: [
      "Collocations can't be worked out logically — they need to be learned as fixed word pairs.",
      "Getting the wrong collocation (e.g. 'make a mistake' vs 'do a mistake') is one of the most common C1 vocabulary errors.",
    ],
    examples: [{ correct: "The new policy will have a substantial impact on small businesses." }],
  },
  PHRASAL_VERBS: {
    title: "Phrasal verbs",
    summary: "Verb + particle combinations with often non-literal meanings.",
    explanation: [
      "Phrasal verbs are extremely common in spoken and informal written English, and using them naturally is a strong C1 marker.",
      "Many have a more formal one-word equivalent (call off = cancel), useful to know for register.",
    ],
    examples: [{ correct: "The meeting was called off due to bad weather." }],
  },
  WORD_FORMATION: {
    title: "Word formation",
    summary: "Turning a word into the correct part of speech for the gap.",
    explanation: [
      "Identify what part of speech the gap needs (noun, adjective, adverb, verb) before choosing the prefix/suffix.",
      "Watch for negative prefixes (un-, in-, dis-) that reverse the meaning.",
    ],
    examples: [{ correct: "The committee reached a unanimous decision." }],
  },
  VOCABULARY: {
    title: "Vocabulary",
    summary: "Choosing the most precise word for the context.",
    explanation: [
      "At C1, near-synonyms often aren't interchangeable — connotation, formality and collocation all narrow down the best choice.",
    ],
    examples: [{ correct: "His explanation was ambiguous — nobody could tell what he meant." }],
  },
  SPELLING: {
    title: "Spelling",
    summary: "Common misspellings that persist even at advanced levels.",
    explanation: [
      "A handful of words (definitely, receive, occurred, separate) are misspelled disproportionately often — worth memorising individually.",
    ],
    examples: [{ correct: "I will definitely receive the results tomorrow." }],
  },
  WORD_CHOICE: {
    title: "Word choice",
    summary: "Picking the word that best fits collocation and meaning.",
    explanation: [
      "Several options can be grammatically correct but only one fits naturally — pay attention to the words immediately before/after the gap.",
    ],
    examples: [{ correct: "Remote work has shifted from a niche arrangement to the mainstream." }],
  },
  REGISTER: {
    title: "Register",
    summary: "Matching formality to the task (formal vs informal English).",
    explanation: [
      "Contractions, phrasal verbs and casual expressions suit informal writing; full forms and more formal vocabulary suit formal writing.",
      "Mixing registers within one text is a common C1 Writing penalty.",
    ],
    examples: [{ correct: "I look forward to hearing from you.", note: "Formal email closing." }],
  },
  PRONUNCIATION: {
    title: "Pronunciation",
    summary: "Word stress and sounds that affect intelligibility.",
    explanation: [
      "Word stress errors (e.g. stressing the wrong syllable) can affect intelligibility more than individual sound errors.",
      "Practising with IPA transcriptions (shown on Vocabulary flashcards) helps build accurate mental models of pronunciation.",
    ],
    examples: [{ correct: "/səbˈstæn.ʃəl/", note: "Stress on the second syllable of 'substantial'." }],
  },
  COHESION: {
    title: "Cohesion",
    summary: "Connecting ideas smoothly across sentences and paragraphs.",
    explanation: [
      "A wide range of linkers (moreover, nonetheless, provided that, whereas) signals the precise logical relationship between ideas.",
      "Although/though are followed by a clause; despite/in spite of are followed by a noun phrase — mixing these up is a very common error.",
    ],
    examples: [{ correct: "Although the budget was limited, the campaign succeeded." }],
    grammarTopicSlug: "linking-devices",
  },
  OTHER: {
    title: "General",
    summary: "Miscellaneous errors that don't fit a single category.",
    explanation: ["Review the specific explanation attached to each error in My Errors for details."],
    examples: [],
  },
};
