// Fixed-form initial placement test (not adaptive): a mix of A1-C2 items
// across five skills (core difficulty concentrated in B1-C1, with a few
// A1/A2/C2 items per skill so a very weak or very strong candidate is still
// measured directly instead of only extrapolated — see src/lib/placement.ts).
// Original content, written for this app.

export type PlacementQuestion = {
  id: string;
  skill: "GRAMMAR" | "VOCABULARY" | "READING" | "USE_OF_ENGLISH" | "LISTENING";
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  prompt: string;
  passage?: string;
  options: string[];
  correctAnswer: string;
  category?: string;
};

export const PLACEMENT_TEST: PlacementQuestion[] = [
  // --- Grammar (8) ---
  { id: "g0", skill: "GRAMMAR", level: "A1", prompt: "She ___ a doctor.", options: ["A) is", "B) are", "C) am", "D) be"], correctAnswer: "A) is", category: "OTHER" },
  { id: "g0b", skill: "GRAMMAR", level: "A2", prompt: "I ___ to the cinema yesterday.", options: ["A) go", "B) goes", "C) went", "D) going"], correctAnswer: "C) went", category: "TENSES" },
  { id: "g1", skill: "GRAMMAR", level: "B1", prompt: "By the time we arrived, the film ___ already started.", options: ["A) has", "B) had", "C) was", "D) is"], correctAnswer: "B) had", category: "TENSES" },
  { id: "g2", skill: "GRAMMAR", level: "B2", prompt: "If I ___ you, I'd apologise straight away.", options: ["A) am", "B) was", "C) were", "D) will be"], correctAnswer: "C) were", category: "CONDITIONALS" },
  { id: "g3", skill: "GRAMMAR", level: "B2", prompt: "She ___ have left already — her coat's still here.", options: ["A) can't", "B) mustn't", "C) shouldn't", "D) needn't"], correctAnswer: "A) can't", category: "MODAL_VERBS" },
  { id: "g4", skill: "GRAMMAR", level: "C1", prompt: "___ had she sat down than her phone rang.", options: ["A) Hardly", "B) No sooner", "C) Barely", "D) Rarely"], correctAnswer: "B) No sooner", category: "INVERSION" },
  { id: "g5", skill: "GRAMMAR", level: "C1", prompt: "If he had left earlier, he ___ stuck in this traffic now.", options: ["A) wouldn't be", "B) wouldn't have been", "C) isn't", "D) won't be"], correctAnswer: "A) wouldn't be", category: "CONDITIONALS" },
  { id: "g6", skill: "GRAMMAR", level: "C2", prompt: "___ I to accept the offer, what guarantees would I have?", options: ["A) Should", "B) Were", "C) Had", "D) Did"], correctAnswer: "B) Were", category: "CONDITIONALS" },

  // --- Vocabulary (8) ---
  { id: "v0", skill: "VOCABULARY", level: "A1", prompt: "What's the opposite of 'hot'?", options: ["A) cold", "B) warm", "C) wet", "D) dry"], correctAnswer: "A) cold", category: "VOCABULARY" },
  { id: "v0b", skill: "VOCABULARY", level: "A2", prompt: "She felt very ___ after the long journey.", options: ["A) tire", "B) tired", "C) tiring", "D) tiredly"], correctAnswer: "B) tired", category: "WORD_CHOICE" },
  { id: "v1", skill: "VOCABULARY", level: "B1", prompt: "The meeting was ___ off because of the storm.", options: ["A) called", "B) took", "C) given", "D) put"], correctAnswer: "A) called", category: "PHRASAL_VERBS" },
  { id: "v2", skill: "VOCABULARY", level: "B2", prompt: "She's very ___ about her work — she checks every detail twice.", options: ["A) careless", "B) meticulous", "C) reluctant", "D) optimistic"], correctAnswer: "B) meticulous", category: "VOCABULARY" },
  { id: "v3", skill: "VOCABULARY", level: "B2", prompt: "The company had to ___ the launch due to supply issues.", options: ["A) postpone", "B) postponement", "C) postponing", "D) postponed"], correctAnswer: "A) postpone", category: "WORD_CHOICE" },
  { id: "v4", skill: "VOCABULARY", level: "C1", prompt: "His explanation was ___ — nobody could tell what he actually meant.", options: ["A) candid", "B) ambiguous", "C) plausible", "D) resilient"], correctAnswer: "B) ambiguous", category: "VOCABULARY" },
  { id: "v5", skill: "VOCABULARY", level: "C1", prompt: "The new policy will be ___ out gradually over the next two years.", options: ["A) phased", "B) turned", "C) brought", "D) held"], correctAnswer: "A) phased", category: "PHRASAL_VERBS" },
  { id: "v6", skill: "VOCABULARY", level: "C2", prompt: "The committee's decision was widely seen as a ___ to public pressure.", options: ["A) capitulation", "B) contribution", "C) celebration", "D) consultation"], correctAnswer: "A) capitulation", category: "VOCABULARY" },

  // --- Use of English (8) ---
  { id: "u0", skill: "USE_OF_ENGLISH", level: "A1", prompt: "___ name is Peter.", options: ["A) My", "B) Me", "C) I", "D) Mine"], correctAnswer: "A) My", category: "OTHER" },
  { id: "u0b", skill: "USE_OF_ENGLISH", level: "A2", prompt: "There ___ some apples in the fridge.", options: ["A) is", "B) are", "C) be", "D) was"], correctAnswer: "B) are", category: "OTHER" },
  { id: "u1", skill: "USE_OF_ENGLISH", level: "B1", prompt: "I've lived here ___ five years.", options: ["A) since", "B) for", "C) during", "D) while"], correctAnswer: "B) for", category: "PREPOSITIONS" },
  { id: "u2", skill: "USE_OF_ENGLISH", level: "B2", prompt: "She is responsible ___ managing the whole team.", options: ["A) of", "B) for", "C) with", "D) to"], correctAnswer: "B) for", category: "PREPOSITIONS" },
  { id: "u3", skill: "USE_OF_ENGLISH", level: "B2", prompt: "He admitted ___ the mistake immediately.", options: ["A) to make", "B) making", "C) make", "D) makes"], correctAnswer: "B) making", category: "GERUNDS_INFINITIVES" },
  { id: "u4", skill: "USE_OF_ENGLISH", level: "C1", prompt: "___ the budget was tight, the event was a great success.", options: ["A) Despite", "B) Although", "C) In spite of", "D) Because of"], correctAnswer: "B) Although", category: "OTHER" },
  { id: "u5", skill: "USE_OF_ENGLISH", level: "C1", prompt: "It was the delay in shipping ___ caused most of the complaints.", options: ["A) who", "B) what", "C) that", "D) which was"], correctAnswer: "C) that", category: "OTHER" },
  { id: "u6", skill: "USE_OF_ENGLISH", level: "C2", prompt: "The proposal was met ___ considerable scepticism.", options: ["A) with", "B) by", "C) from", "D) in"], correctAnswer: "A) with", category: "PREPOSITIONS" },

  // --- Reading (8, based on short passages) ---
  {
    id: "r0",
    skill: "READING",
    level: "A1",
    passage: "Tom is ten years old. He likes football and pizza. He plays football every Saturday with his friends.",
    prompt: "What does Tom like?",
    options: ["A) Football and pizza", "B) Tennis and pasta", "C) Football and salad", "D) Swimming"],
    correctAnswer: "A) Football and pizza",
  },
  {
    id: "r0b",
    skill: "READING",
    level: "A2",
    passage: "Last weekend, Anna visited her grandmother in the countryside. They cooked dinner together and watched an old film. Anna went home on Sunday evening, feeling happy and relaxed.",
    prompt: "What did Anna and her grandmother do together?",
    options: ["A) They went shopping.", "B) They cooked dinner and watched a film.", "C) They visited a museum.", "D) They played football."],
    correctAnswer: "B) They cooked dinner and watched a film.",
  },
  {
    id: "r1",
    skill: "READING",
    level: "B2",
    passage:
      "When the small publishing house first suggested printing books on recycled paper only, several major retailers refused to stock the titles, arguing that customers associated recycled paper with lower quality. The publisher persisted anyway, betting that readers cared more about the environment than the retailers assumed. Five years on, recycled paper has become the industry standard, and the retailers who resisted longest are now among its most vocal supporters.",
    prompt: "Why did retailers initially refuse to stock the books?",
    options: [
      "A) The books were too expensive.",
      "B) They believed customers associated recycled paper with poor quality.",
      "C) The publisher had a poor reputation.",
      "D) The recycled paper wasn't available in large quantities.",
    ],
    correctAnswer: "B) They believed customers associated recycled paper with poor quality.",
  },
  {
    id: "r2",
    skill: "READING",
    level: "B2",
    passage:
      "When the small publishing house first suggested printing books on recycled paper only, several major retailers refused to stock the titles, arguing that customers associated recycled paper with lower quality. The publisher persisted anyway, betting that readers cared more about the environment than the retailers assumed. Five years on, recycled paper has become the industry standard, and the retailers who resisted longest are now among its most vocal supporters.",
    prompt: "What does the text suggest about the retailers who resisted longest?",
    options: [
      "A) They eventually went out of business.",
      "B) They still refuse to use recycled paper.",
      "C) They now strongly support recycled paper.",
      "D) They were bought by the publisher.",
    ],
    correctAnswer: "C) They now strongly support recycled paper.",
  },
  {
    id: "r3",
    skill: "READING",
    level: "C1",
    passage:
      "It is tempting to view the rise of four-day working weeks as a straightforward win for employees, but the reality reported by companies that have trialled the change is more nuanced. Productivity per hour often rises, sometimes enough to fully offset the lost day. Yet several firms have also found that certain roles — particularly those involving client-facing work across time zones — simply cannot be compressed without real trade-offs, forcing a two-tier system that some employees resent.",
    prompt: "According to the text, what problem has emerged for some companies?",
    options: [
      "A) Productivity per hour has fallen sharply.",
      "B) Some roles cannot easily be compressed, creating an unequal system.",
      "C) Clients have stopped working with these companies.",
      "D) Employees want to return to a five-day week entirely.",
    ],
    correctAnswer: "B) Some roles cannot easily be compressed, creating an unequal system.",
  },
  {
    id: "r4",
    skill: "READING",
    level: "C1",
    passage:
      "It is tempting to view the rise of four-day working weeks as a straightforward win for employees, but the reality reported by companies that have trialled the change is more nuanced. Productivity per hour often rises, sometimes enough to fully offset the lost day. Yet several firms have also found that certain roles — particularly those involving client-facing work across time zones — simply cannot be compressed without real trade-offs, forcing a two-tier system that some employees resent.",
    prompt: "What is the writer's overall tone towards the four-day week?",
    options: [
      "A) Entirely dismissive", "B) Enthusiastically supportive without reservation", "C) Balanced, acknowledging both benefits and complications", "D) Angry and critical",
    ],
    correctAnswer: "C) Balanced, acknowledging both benefits and complications",
  },
  {
    id: "r5",
    skill: "READING",
    level: "B2",
    passage:
      "When the small publishing house first suggested printing books on recycled paper only, several major retailers refused to stock the titles, arguing that customers associated recycled paper with lower quality. The publisher persisted anyway, betting that readers cared more about the environment than the retailers assumed. Five years on, recycled paper has become the industry standard, and the retailers who resisted longest are now among its most vocal supporters.",
    prompt: "What can be inferred about the publisher's decision to persist?",
    options: [
      "A) It was ultimately vindicated by the industry's later adoption of recycled paper.",
      "B) It caused the publisher to lose most of its customers.",
      "C) It was reversed within a year.",
      "D) It had no measurable long-term effect.",
    ],
    correctAnswer: "A) It was ultimately vindicated by the industry's later adoption of recycled paper.",
  },
  {
    id: "r6",
    skill: "READING",
    level: "C2",
    passage:
      "One hesitates to call the merger a failure — the balance sheet, after all, tells a story of modest but real synergies. What it does not capture is the slow attrition of the very talent the deal was meant to retain, nor the corrosive effect of two incompatible decision-making cultures grinding against each other long after the ink had dried.",
    prompt: "What is the writer's central point about the merger?",
    options: [
      "A) It was a financial disaster despite appearances.",
      "B) It succeeded on every measure that matters.",
      "C) Financial gains mask deeper, less visible costs.",
      "D) The talent loss was anticipated and acceptable.",
    ],
    correctAnswer: "C) Financial gains mask deeper, less visible costs.",
  },

  // --- Listening (text-based placeholder, 8) ---
  {
    id: "l0",
    skill: "LISTENING",
    level: "A1",
    passage: "Transcript: \"Hello, my name is Anna. I am from Spain.\"",
    prompt: "Where is Anna from?",
    options: ["A) Spain", "B) France", "C) Italy", "D) Portugal"],
    correctAnswer: "A) Spain",
  },
  {
    id: "l0b",
    skill: "LISTENING",
    level: "A2",
    passage: "Transcript: \"The bus leaves at half past nine, not nine o'clock as it says on the old timetable.\"",
    prompt: "What time does the bus leave?",
    options: ["A) 9:00", "B) 9:30", "C) 9:15", "D) 10:00"],
    correctAnswer: "B) 9:30",
  },
  {
    id: "l1",
    skill: "LISTENING",
    level: "B1",
    passage: "Transcript: \"The train to Manchester now departs from platform four, not platform two as previously announced.\"",
    prompt: "Which platform does the train now depart from?",
    options: ["A) Platform two", "B) Platform four", "C) Platform six", "D) It has been cancelled"],
    correctAnswer: "B) Platform four",
  },
  {
    id: "l2",
    skill: "LISTENING",
    level: "B2",
    passage: "Transcript: \"I wasn't a fan of the course at first, but by the third week I was genuinely looking forward to the classes.\"",
    prompt: "How did the speaker's opinion of the course change?",
    options: ["A) It got worse over time.", "B) It improved after the first two weeks.", "C) It stayed negative throughout.", "D) They never actually attended."],
    correctAnswer: "B) It improved after the first two weeks.",
  },
  {
    id: "l3",
    skill: "LISTENING",
    level: "B2",
    passage: "Transcript: \"We'd budgeted for a small venue, but so many people confirmed that we had to move everything to the larger hall at the last minute.\"",
    prompt: "Why did they change venues?",
    options: ["A) The original venue was double-booked.", "B) More people confirmed attendance than expected.", "C) The small venue was too expensive.", "D) The event was postponed."],
    correctAnswer: "B) More people confirmed attendance than expected.",
  },
  {
    id: "l4",
    skill: "LISTENING",
    level: "C1",
    passage: "Transcript: \"It's not that the proposal lacked ambition — if anything, it had too much. What it lacked was any sense of how we'd actually pay for it.\"",
    prompt: "What is the speaker's main criticism of the proposal?",
    options: ["A) It wasn't ambitious enough.", "B) It didn't explain how it would be funded.", "C) It was too expensive to implement.", "D) It was submitted too late."],
    correctAnswer: "B) It didn't explain how it would be funded.",
  },
  {
    id: "l5",
    skill: "LISTENING",
    level: "C1",
    passage: "Transcript: \"Everyone assumes the hardest part of moving abroad is the language. For me, honestly, it was the paperwork — that was what nearly made me give up.\"",
    prompt: "What does the speaker say was the hardest part of moving abroad, for them personally?",
    options: ["A) Learning the language", "B) Making new friends", "C) Dealing with paperwork", "D) Finding accommodation"],
    correctAnswer: "C) Dealing with paperwork",
  },
  {
    id: "l6",
    skill: "LISTENING",
    level: "C2",
    passage: "Transcript: \"I wouldn't say the merger was a mistake exactly — more that we underestimated just how much cultural friction it would create.\"",
    prompt: "What is the speaker's real view of the merger?",
    options: [
      "A) It was a complete disaster.",
      "B) It succeeded exactly as planned.",
      "C) It revealed unexpected cultural difficulties, though not an outright failure.",
      "D) It was cancelled before completion.",
    ],
    correctAnswer: "C) It revealed unexpected cultural difficulties, though not an outright failure.",
  },
];
