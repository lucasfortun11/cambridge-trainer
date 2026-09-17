// Static explanations for the Grammar trainer. Practice exercises for each
// topic live in the database (Exercise.topic matches `slug` below) so they
// can be fetched, attempted and tracked like any other exercise.

export type GrammarTopic = {
  slug: string;
  title: string;
  level: "B2" | "C1";
  summary: string;
  explanation: string[];
  examples: { correct: string; note?: string }[];
};

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    slug: "advanced-tenses",
    title: "Advanced tenses",
    level: "B2",
    summary: "Perfect aspects and how they connect two points in time.",
    explanation: [
      "The perfect aspects (have done, have been doing, had done, had been doing) all link two moments in time — normally a result now (or then) and an earlier cause.",
      "Present perfect simple focuses on the result; present perfect continuous focuses on the ongoing activity itself, often with a sense of duration or complaint.",
      "Past perfect is used to make clear that one past event happened before another past event — it doesn't just mean 'a long time ago'.",
    ],
    examples: [
      { correct: "I've written three reports this week.", note: "Result/achievement so far." },
      { correct: "I've been writing reports all morning.", note: "Focus on the ongoing activity, possibly tiring." },
      { correct: "By the time she arrived, the meeting had already finished.", note: "One past event before another." },
    ],
  },
  {
    slug: "conditionals",
    title: "Conditionals and mixed conditionals",
    level: "C1",
    summary: "Beyond the four basic conditionals — mixing time frames.",
    explanation: [
      "Mixed conditionals combine a condition in one time frame with a result in another — typically a past condition with a present result, or a present/general condition with a past result.",
      "Past condition → present result: If + past perfect, ... would + base form.",
      "Present/general condition → past result: If + past simple, ... would have + past participle.",
    ],
    examples: [
      { correct: "If I had taken that job, I would be living in Berlin now.", note: "Past condition, present result." },
      { correct: "If she weren't so stubborn, she wouldn't have argued with the client.", note: "General/present condition, past result." },
    ],
  },
  {
    slug: "modal-verbs",
    title: "Modal verbs, including modals in the past",
    level: "C1",
    summary: "Expressing certainty, obligation and criticism about the past.",
    explanation: [
      "Modal + have + past participle lets you talk about the past: certainty (must/can't have), possibility (may/might/could have), obligation not fulfilled (should/shouldn't have), and unnecessary past actions (needn't have).",
      "'Needn't have done' means you did something that wasn't necessary; 'didn't need to do' just states it wasn't necessary, without saying whether it was done.",
    ],
    examples: [
      { correct: "She must have missed the train — she's never this late.", note: "Certainty about a past event." },
      { correct: "You needn't have brought a gift, but thank you.", note: "Unnecessary action that was done anyway." },
      { correct: "He shouldn't have raised his voice in the meeting.", note: "Criticism of a past action." },
    ],
  },
  {
    slug: "passive-structures",
    title: "Passive structures",
    level: "C1",
    summary: "Using the passive for impersonal, formal or report-style writing.",
    explanation: [
      "The passive is especially common in formal/academic writing and reports, where the agent (who did it) is unknown, obvious, or less important than the action itself.",
      "'It is said/believed/reported that...' and 'He is said/believed to be...' are common passive reporting structures used to distance the writer from a claim.",
    ],
    examples: [
      { correct: "It is widely believed that the policy will be revised next year." },
      { correct: "The company is reported to have lost several major clients." },
    ],
  },
  {
    slug: "reported-speech",
    title: "Reported speech",
    level: "B2",
    summary: "Backshifting tenses and reporting verbs beyond 'say' and 'tell'.",
    explanation: [
      "When the reporting verb is in the past, tenses generally shift back one step (present → past, past → past perfect), though this can be flexible if the fact is still true.",
      "Using a wider range of reporting verbs (insist, admit, deny, suggest, warn, urge) makes reported speech far more natural and precise than repeated 'said that'.",
    ],
    examples: [
      { correct: "She admitted that she had forgotten the deadline." },
      { correct: "He warned us not to sign the contract without reading it first." },
    ],
  },
  {
    slug: "relative-clauses",
    title: "Relative clauses",
    level: "B2",
    summary: "Defining vs non-defining clauses, and reduced relative clauses.",
    explanation: [
      "Defining relative clauses (no commas) identify which person/thing you mean; non-defining clauses (with commas) add extra, non-essential information.",
      "'Which' can refer back to a whole previous clause, not just a noun — useful for commenting on a situation.",
      "Relative clauses can often be reduced using a participle: 'the man who is standing there' → 'the man standing there'.",
    ],
    examples: [
      { correct: "The report, which took three weeks to write, was rejected.", note: "Non-defining — extra comment." },
      { correct: "She passed the exam first time, which surprised everyone.", note: "'Which' refers to the whole previous clause." },
    ],
  },
  {
    slug: "participle-clauses",
    title: "Participle clauses",
    level: "C1",
    summary: "Using -ing and -ed clauses to write more concisely.",
    explanation: [
      "Participle clauses replace a full clause (often with a relative pronoun or conjunction) to sound more concise and formal — common in written English.",
      "-ing clauses usually have an active meaning; -ed/past participle clauses usually have a passive meaning.",
      "Having + past participle shows the participle-clause action happened before the main clause.",
    ],
    examples: [
      { correct: "Having finished the report, she left the office early.", note: "One action completed before another." },
      { correct: "Written in just two weeks, the novel became an instant bestseller.", note: "Passive meaning: the novel was written." },
    ],
  },
  {
    slug: "gerunds-infinitives",
    title: "Gerunds and infinitives",
    level: "B2",
    summary: "Verb patterns where the choice changes the meaning.",
    explanation: [
      "Some verbs change meaning depending on whether they're followed by a gerund or an infinitive: remember/forget/regret + -ing (about a past action) vs + to (about a future action/obligation).",
      "Stop + -ing means to stop an activity; stop + to means to pause in order to do something else.",
    ],
    examples: [
      { correct: "I remember locking the door.", note: "Memory of a past action." },
      { correct: "Remember to lock the door.", note: "A future obligation/reminder." },
      { correct: "We stopped to have lunch.", note: "Stopped one activity in order to eat." },
    ],
  },
  {
    slug: "inversion",
    title: "Inversion",
    level: "C1",
    summary: "Fronting negative/limiting adverbials for emphasis.",
    explanation: [
      "Fronting certain negative or limiting adverbials (never, rarely, no sooner, not only, under no circumstances, little) triggers subject-auxiliary inversion, typical of formal or emphatic written English.",
      "'No sooner...than' and 'Hardly...when' are fixed inversion patterns for two events happening in quick succession.",
    ],
    examples: [
      { correct: "Never have I seen such a disorganised meeting." },
      { correct: "No sooner had she sat down than the phone rang." },
      { correct: "Under no circumstances should this door be left unlocked." },
    ],
  },
  {
    slug: "cleft-sentences",
    title: "Cleft sentences",
    level: "C1",
    summary: "Using 'It is...that' and 'What...is' to add emphasis.",
    explanation: [
      "Cleft sentences split a single idea into two clauses to emphasise one particular piece of information — very common in spoken and persuasive written English.",
      "'It + be + [emphasised part] + that/who...' emphasises a specific element; 'What + clause + is/was + ...' emphasises the whole remaining idea.",
    ],
    examples: [
      { correct: "It was the manager who approved the budget, not the finance team." },
      { correct: "What surprised me most was how quickly she learned the software." },
    ],
  },
  {
    slug: "determiners-articles",
    title: "Determiners and articles",
    level: "B2",
    summary: "The finer points of a/an, the, and zero article.",
    explanation: [
      "The zero article is used with plural/uncountable nouns for general statements, but 'the' is needed when referring to a specific, known instance.",
      "'Such a/an + adjective + noun' needs the indefinite article before a singular countable noun.",
      "Some fixed expressions use 'the' unexpectedly (in the end, on the whole) or no article at all (at night, by car).",
    ],
    examples: [
      { correct: "Education is the key to economic growth.", note: "General statement — no article." },
      { correct: "The education she received abroad shaped her career.", note: "Specific, known instance." },
    ],
  },
  {
    slug: "prepositions",
    title: "Prepositions",
    level: "B2",
    summary: "Dependent prepositions after adjectives, verbs and nouns.",
    explanation: [
      "Many C1 errors come from dependent prepositions that don't translate directly from other languages — these need to be learned as fixed pairs, not worked out logically.",
      "Common problem pairs: responsible for (not 'of'), insist on (not 'in'), interested in, married to, depend on, consist of.",
    ],
    examples: [
      { correct: "She is responsible for the entire marketing budget." },
      { correct: "The success of the project depends on careful planning." },
    ],
  },
  {
    slug: "linking-devices",
    title: "Linking devices and cohesion",
    level: "C1",
    summary: "Connecting ideas smoothly without repeating 'and' or 'but'.",
    explanation: [
      "A wide range of linkers (moreover, nonetheless, provided that, whereas, in spite of, on the grounds that) signals the precise logical relationship between ideas and is essential for a C1-level Writing score.",
      "Some linkers are followed by a clause (although, even though), others by a noun phrase (despite, in spite of) — mixing these up is one of the most common C1 errors.",
    ],
    examples: [
      { correct: "Although the budget was limited, the campaign succeeded.", note: "Followed by a clause." },
      { correct: "Despite the limited budget, the campaign succeeded.", note: "Followed by a noun phrase." },
    ],
  },
];
