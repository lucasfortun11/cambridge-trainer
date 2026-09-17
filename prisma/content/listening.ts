import type { ExerciseSeed } from "./types";

// No licensed audio files are bundled with the app (see README/section 22 of
// the spec — never ship copyrighted material without a licence). Each
// exercise stores a full transcript so the practice still works via reading,
// and `audioUrl` is left null, ready for a real narrated recording to be
// attached later without any other change to the data model or UI.

export const listeningExercises: ExerciseSeed[] = [
  {
    slug: "listening-p1-short-extracts",
    type: "LISTENING_PART1_MULTIPLE_CHOICE",
    skill: "LISTENING",
    level: "B2",
    title: "Short Extracts — Multiple Choice",
    instructions:
      "You will hear three short extracts. For questions 1-3, choose the answer (A, B or C) which fits best according to what you hear.",
    content: {
      audioPending: true,
      transcripts: [
        {
          label: "Extract One",
          text: "Speaker: \"Honestly, I applied for the internal transfer mostly because I wanted a change of scenery, not because I disliked my old team. If anything, I still miss the people I used to work with every day.\"",
        },
        {
          label: "Extract Two",
          text: "Speaker: \"The training course itself was fine, nothing special, but the real value was getting to know people from other branches. Those contacts have already proved more useful than anything in the manual.\"",
        },
        {
          label: "Extract Three",
          text: "Speaker: \"I was sceptical about the new software at first — it looked overly complicated. Two months in, though, I can't imagine going back to the old system; it's saved me hours every week.\"",
        },
      ],
    },
    questions: [
      {
        order: 1,
        questionType: "MULTIPLE_CHOICE",
        prompt: "Extract One: Why did the speaker request the transfer?",
        options: ["A) They disliked their previous team.", "B) They wanted a change of environment.", "C) They were asked to by management."],
        correctAnswer: "B) They wanted a change of environment.",
        explanation: "The speaker says they applied 'mostly because I wanted a change of scenery', explicitly denying that they disliked their team.",
        distractorExplanations: {
          "A) They disliked their previous team.": "Directly contradicted — the speaker says they still miss their old colleagues.",
          "C) They were asked to by management.": "Not mentioned at all.",
        },
        grammarCategory: "OTHER",
      },
      {
        order: 2,
        questionType: "MULTIPLE_CHOICE",
        prompt: "Extract Two: What does the speaker say was most valuable about the course?",
        options: ["A) The content of the training itself", "B) The certificate they received", "C) The professional contacts they made"],
        correctAnswer: "C) The professional contacts they made",
        explanation: "The speaker says 'the real value was getting to know people from other branches'.",
        distractorExplanations: {
          "A) The content of the training itself": "Described as 'fine, nothing special' — not the most valuable part.",
          "B) The certificate they received": "Not mentioned at all.",
        },
        grammarCategory: "OTHER",
      },
      {
        order: 3,
        questionType: "MULTIPLE_CHOICE",
        prompt: "Extract Three: How does the speaker feel about the new software now?",
        options: ["A) Still sceptical about its usefulness", "B) Positive, despite initial doubts", "C) Neutral, since it hasn't changed much"],
        correctAnswer: "B) Positive, despite initial doubts",
        explanation: "The speaker was sceptical at first but now says they 'can't imagine going back' and it 'saved hours every week'.",
        distractorExplanations: {
          "A) Still sceptical about its usefulness": "Contradicted — the scepticism was only 'at first'.",
          "C) Neutral, since it hasn't changed much": "Contradicted by the strong positive statement about saving hours.",
        },
        grammarCategory: "OTHER",
      },
    ],
  },
  {
    slug: "listening-p2-sustainable-architecture",
    type: "LISTENING_PART2_SENTENCE_COMPLETION",
    skill: "LISTENING",
    level: "B2",
    title: "A Talk on Sustainable Architecture",
    instructions: "Listen to the talk and complete the sentences below with one to three words.",
    content: {
      audioPending: true,
      transcript:
        "Good afternoon, everyone. Today I want to talk about a project our studio completed last year: a community centre built almost entirely from recycled timber. When we started, our biggest challenge wasn't the design — it was sourcing enough reclaimed wood that met safety standards. We eventually found a supplier who salvages timber from demolished warehouses. The building uses a passive cooling system, which means we avoided installing air conditioning altogether, cutting the centre's energy use by around forty percent compared to a conventional building of the same size. One detail visitors often ask about is the roof: it's covered in local wildflowers, which helps with insulation and also supports local bee populations. The whole project took fourteen months from the first sketch to the opening ceremony, about four months longer than we originally planned, mostly because of the timber sourcing issue I mentioned earlier.",
    },
    questions: [
      {
        order: 1,
        questionType: "SENTENCE_COMPLETION",
        prompt: "The building's main material is _______.",
        correctAnswer: "recycled timber",
        explanation: "The speaker says the centre was 'built almost entirely from recycled timber'.",
        grammarCategory: "VOCABULARY",
      },
      {
        order: 2,
        questionType: "SENTENCE_COMPLETION",
        prompt: "The biggest early challenge was sourcing wood that met _______.",
        correctAnswer: "safety standards",
        explanation: "The speaker says the challenge was 'sourcing enough reclaimed wood that met safety standards'.",
        grammarCategory: "VOCABULARY",
      },
      {
        order: 3,
        questionType: "SENTENCE_COMPLETION",
        prompt: "The passive cooling system reduced energy use by around _______.",
        correctAnswer: "forty percent",
        explanation: "The speaker states this figure directly: 'cutting the centre's energy use by around forty percent'.",
        grammarCategory: "VOCABULARY",
      },
      {
        order: 4,
        questionType: "SENTENCE_COMPLETION",
        prompt: "The roof is covered in local _______, which also helps local bees.",
        correctAnswer: "wildflowers",
        explanation: "The speaker mentions the roof 'is covered in local wildflowers, which... supports local bee populations'.",
        grammarCategory: "VOCABULARY",
      },
      {
        order: 5,
        questionType: "SENTENCE_COMPLETION",
        prompt: "The whole project took _______ from sketch to opening.",
        correctAnswer: "fourteen months",
        explanation: "The speaker says 'The whole project took fourteen months from the first sketch to the opening ceremony'.",
        grammarCategory: "VOCABULARY",
      },
    ],
  },
  {
    slug: "listening-p3-multiple-choice-interview",
    type: "LISTENING_PART3_MULTIPLE_CHOICE",
    skill: "LISTENING",
    level: "C1",
    title: "Interview With a Marathon Coach",
    instructions:
      "Listen to an interview with a marathon coach and answer questions 1-4 by choosing A, B, C or D.",
    content: {
      audioPending: true,
      transcript:
        "Interviewer: You've coached runners for over twenty years. What's the biggest misconception people have about marathon training?\nCoach: That more mileage is always better. I see so many amateur runners injure themselves because they think doubling their training volume will halve their finishing time. It almost never works that way — recovery matters just as much as the running itself, and most people chronically under-recover.\nInterviewer: So how do you structure a typical training block?\nCoach: I build in a genuinely easy week every fourth week, no exceptions, even for runners who feel great and want to push through. That week is non-negotiable, because the adaptation — the actual improvement — happens during recovery, not during the hard sessions.\nInterviewer: Do you think nutrition gets enough attention?\nCoach: Less than it should, especially for older runners. I've had athletes fix long-standing performance plateaus just by eating enough on hard training days, nothing fancier than that.\nInterviewer: Any final advice for someone attempting their first marathon?\nCoach: Don't compare your training plan to anyone else's. I've seen far too many first-timers copy a plan built for someone with ten years of running behind them, and then wonder why they're constantly exhausted.",
    },
    questions: [
      {
        order: 1,
        questionType: "MULTIPLE_CHOICE",
        prompt: "According to the coach, what mistake do many amateur runners make?",
        options: [
          "A) They don't run enough kilometres per week.",
          "B) They assume more training automatically means better results.",
          "C) They focus too much on recovery.",
          "D) They ignore their coach's advice.",
        ],
        correctAnswer: "B) They assume more training automatically means better results.",
        explanation: "The coach explicitly names this as the biggest misconception: 'that more mileage is always better'.",
        distractorExplanations: {
          "A) They don't run enough kilometres per week.": "The opposite is implied — they tend to run too much.",
          "C) They focus too much on recovery.": "The coach says the opposite: people 'under-recover'.",
          "D) They ignore their coach's advice.": "Not mentioned in this context.",
        },
        grammarCategory: "OTHER",
      },
      {
        order: 2,
        questionType: "MULTIPLE_CHOICE",
        prompt: "What does the coach say about the easy week every fourth week?",
        options: [
          "A) It's optional for experienced runners.",
          "B) It can be skipped if a runner feels good.",
          "C) It is essential, with no exceptions.",
          "D) It only applies to injured runners.",
        ],
        correctAnswer: "C) It is essential, with no exceptions.",
        explanation: "The coach says it is 'non-negotiable, ... no exceptions, even for runners who feel great'.",
        distractorExplanations: {
          "A) It's optional for experienced runners.": "Directly contradicted — no exceptions are made.",
          "B) It can be skipped if a runner feels good.": "Directly contradicted by the same statement.",
          "D) It only applies to injured runners.": "Not mentioned — it applies to everyone.",
        },
        grammarCategory: "OTHER",
      },
      {
        order: 3,
        questionType: "MULTIPLE_CHOICE",
        prompt: "What simple change helped some older athletes according to the coach?",
        options: [
          "A) Following a strict diet plan",
          "B) Eating enough on hard training days",
          "C) Taking more rest days",
          "D) Working with a nutritionist",
        ],
        correctAnswer: "B) Eating enough on hard training days",
        explanation: "The coach says athletes fixed plateaus 'just by eating enough on hard training days, nothing fancier than that'.",
        distractorExplanations: {
          "A) Following a strict diet plan": "The coach explicitly says it was 'nothing fancier' than just eating enough.",
          "C) Taking more rest days": "This point is about nutrition, not rest.",
          "D) Working with a nutritionist": "Not mentioned.",
        },
        grammarCategory: "OTHER",
      },
      {
        order: 4,
        questionType: "MULTIPLE_CHOICE",
        prompt: "What is the coach's main advice for first-time marathon runners?",
        options: [
          "A) Hire a personal coach immediately.",
          "B) Follow a plan designed for experienced runners.",
          "C) Avoid comparing their plan to more experienced runners' plans.",
          "D) Focus only on long-distance runs.",
        ],
        correctAnswer: "C) Avoid comparing their plan to more experienced runners' plans.",
        explanation: "The coach's final advice is 'Don't compare your training plan to anyone else's', warning against copying experienced runners' plans.",
        distractorExplanations: {
          "A) Hire a personal coach immediately.": "Not mentioned as advice.",
          "B) Follow a plan designed for experienced runners.": "This is exactly the mistake the coach warns against.",
          "D) Focus only on long-distance runs.": "Not mentioned.",
        },
        grammarCategory: "OTHER",
      },
    ],
  },
  {
    slug: "listening-p4-five-speakers-work",
    type: "LISTENING_PART4_MULTIPLE_MATCHING",
    skill: "LISTENING",
    level: "C1",
    title: "Five Speakers on Changing Careers",
    instructions:
      "You will hear five short speakers talking about changing careers. For questions 1-5, choose from the list A-H what each speaker says. Use each letter only once.",
    content: {
      audioPending: true,
      transcripts: [
        { label: "Speaker 1", text: "The scariest part wasn't the pay cut, it was admitting to myself that I'd spent a decade in the wrong field." },
        { label: "Speaker 2", text: "I kept my old job for the first year and just did the new thing on evenings and weekends until I knew it would actually work." },
        { label: "Speaker 3", text: "My family thought I'd lost my mind, honestly. It took them a good two years to come around to the idea." },
        { label: "Speaker 4", text: "I went back to studying at thirty-four, sitting in lectures with people ten years younger than me. It was humbling, but I got used to it." },
        { label: "Speaker 5", text: "What surprised me most was how much of my old experience actually transferred over. I'd assumed I was starting completely from zero." },
      ],
      options: {
        A: "This speaker built the new career alongside the old job before fully committing.",
        B: "This speaker was surprised that previous skills were still useful.",
        C: "This speaker found accepting a personal truth harder than any financial concern.",
        D: "This speaker faced strong disapproval from relatives at first.",
        E: "This speaker regrets not changing career sooner.",
        F: "This speaker felt uncomfortable being older than classmates.",
        G: "This speaker changed careers due to a health issue.",
        H: "This speaker never told their family about the change.",
      },
    },
    questions: [
      { order: 1, questionType: "MULTIPLE_MATCHING", prompt: "Speaker 1", correctAnswer: "C", explanation: "Speaker 1 says the hardest part was admitting the truth to themselves, harder than the pay cut (a financial concern).", grammarCategory: "OTHER" },
      { order: 2, questionType: "MULTIPLE_MATCHING", prompt: "Speaker 2", correctAnswer: "A", explanation: "Speaker 2 kept the old job while building the new one on the side before committing fully.", grammarCategory: "OTHER" },
      { order: 3, questionType: "MULTIPLE_MATCHING", prompt: "Speaker 3", correctAnswer: "D", explanation: "Speaker 3's family thought they'd 'lost my mind' and took two years to accept it — disapproval from relatives.", grammarCategory: "OTHER" },
      { order: 4, questionType: "MULTIPLE_MATCHING", prompt: "Speaker 4", correctAnswer: "F", explanation: "Speaker 4 found it 'humbling' to be older than classmates, i.e. uncomfortable about the age gap.", grammarCategory: "OTHER" },
      { order: 5, questionType: "MULTIPLE_MATCHING", prompt: "Speaker 5", correctAnswer: "B", explanation: "Speaker 5 was surprised how much old experience 'transferred over', having assumed they'd start from zero.", grammarCategory: "OTHER" },
    ],
  },
];
