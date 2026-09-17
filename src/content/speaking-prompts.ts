export type SpeakingPrompt = {
  slug: string;
  part: "INTERVIEW" | "LONG_TURN" | "COLLABORATIVE_TASK" | "DISCUSSION";
  title: string;
  instructions: string;
  questions: string[];
  prepSeconds: number;
  speakSeconds: number;
};

export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  {
    slug: "interview-work-study",
    part: "INTERVIEW",
    title: "Part 1 — Interview",
    instructions: "Answer each question naturally, as if talking to an examiner meeting you for the first time.",
    questions: [
      "What do you do — do you work or are you a student?",
      "What do you enjoy most about your work or studies?",
      "How do you usually spend your weekends?",
      "What are your plans for the next few years?",
    ],
    prepSeconds: 0,
    speakSeconds: 60,
  },
  {
    slug: "long-turn-a-decision",
    part: "LONG_TURN",
    title: "Part 2 — Long Turn: An important decision",
    instructions:
      "Talk for about a minute on your own. Describe an important decision you had to make, why it was difficult, and how you felt about it afterwards.",
    questions: [
      "What was the decision?",
      "Why was it difficult to make?",
      "How did you feel once you'd made it?",
    ],
    prepSeconds: 60,
    speakSeconds: 90,
  },
  {
    slug: "long-turn-a-skill",
    part: "LONG_TURN",
    title: "Part 2 — Long Turn: Learning a new skill",
    instructions:
      "Talk for about a minute on your own. Describe a skill you would like to learn, why it interests you, and how you would go about learning it.",
    questions: ["What is the skill?", "Why does it interest you?", "How would you learn it?"],
    prepSeconds: 60,
    speakSeconds: 90,
  },
  {
    slug: "collaborative-office-design",
    part: "COLLABORATIVE_TASK",
    title: "Part 3 — Collaborative Task: Designing a new office",
    instructions:
      "Imagine a company is designing a new open-plan office. Here are some features they are considering. Talk to each other about how useful each feature would be, then decide which two are most important.",
    questions: [
      "A quiet room for focused work",
      "A games area for breaks",
      "Standing desks",
      "A large kitchen/social space",
      "Soundproof phone booths",
    ],
    prepSeconds: 15,
    speakSeconds: 180,
  },
  {
    slug: "discussion-office-design",
    part: "DISCUSSION",
    title: "Part 4 — Discussion: Work environments",
    instructions: "Continue the conversation, giving your own opinions and reacting to what your partner says.",
    questions: [
      "How important is the physical office environment to how well people work?",
      "Do you think open-plan offices help or hinder productivity?",
      "How do you think workplaces will change over the next twenty years?",
    ],
    prepSeconds: 0,
    speakSeconds: 240,
  },
];
