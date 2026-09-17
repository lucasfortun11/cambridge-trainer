import type { ExerciseSeed } from "./types";

export const rueExercises: ExerciseSeed[] = [
  // -------------------------------------------------------------------
  // Part 1 — Multiple-choice cloze
  // -------------------------------------------------------------------
  {
    slug: "rue-p1-remote-work",
    type: "RUE_PART1_MULTIPLE_CHOICE_CLOZE",
    skill: "USE_OF_ENGLISH",
    level: "C1",
    title: "The Rise of Remote Work",
    instructions:
      "For questions 1-6, read the text below and decide which answer (A, B, C or D) best fits each gap.",
    content: {
      passage:
        "Remote work has (1) ___ from a niche arrangement into a mainstream way of doing business. A decade ago, the idea that an entire company could function without a shared office would have (2) ___ most managers as impractical. Today, however, a growing (3) ___ of firms report that productivity has held steady, or even improved, since employees started working from home. Critics (4) ___ that something is lost when teams never meet face to face, and they have a (5) ___ point: spontaneous conversations by the coffee machine are hard to replicate over video calls. Even so, few executives are willing to (6) ___ the cost savings that come with a smaller office footprint.",
    },
    questions: [
      {
        order: 1,
        questionType: "MULTIPLE_CHOICE",
        prompt: "(1)",
        options: ["A) shifted", "B) turned", "C) moved", "D) converted"],
        correctAnswer: "A) shifted",
        explanation: "'Shift from X to Y/into Y' is the natural collocation for a gradual change of state.",
        distractorExplanations: {
          "B) turned": "'Turn' would need 'into', and even then sounds less natural than 'shift' for a gradual trend.",
          "C) moved": "Possible but far less idiomatic in this collocation than 'shift'.",
          "D) converted": "'Convert' usually applies to objects or formats being changed, not abstract trends.",
        },
        grammarCategory: "WORD_CHOICE",
      },
      {
        order: 2,
        questionType: "MULTIPLE_CHOICE",
        prompt: "(2)",
        options: ["A) hit", "B) struck", "C) impressed", "D) affected"],
        correctAnswer: "B) struck",
        explanation: "'Strike someone as + adjective' is the fixed pattern meaning 'to give someone a particular impression'.",
        distractorExplanations: {
          "A) hit": "'Hit' doesn't combine with 'as + adjective' in this meaning.",
          "C) impressed": "'Impress' doesn't take this 'as + adjective' structure either.",
          "D) affected": "'Affect' means to influence, not to give an impression — wrong meaning here.",
        },
        grammarCategory: "COLLOCATIONS",
      },
      {
        order: 3,
        questionType: "MULTIPLE_CHOICE",
        prompt: "(3)",
        options: ["A) amount", "B) quantity", "C) number", "D) total"],
        correctAnswer: "C) number",
        explanation: "'A number of firms' (countable plural noun) is the correct collocation; 'amount' and 'quantity' pair with uncountable nouns.",
        distractorExplanations: {
          "A) amount": "'Amount of' is used with uncountable nouns, not with countable 'firms'.",
          "B) quantity": "Same problem as 'amount' — pairs with uncountable nouns.",
          "D) total": "'A total of firms' is not a natural collocation without a number before it.",
        },
        grammarCategory: "COLLOCATIONS",
      },
      {
        order: 4,
        questionType: "MULTIPLE_CHOICE",
        prompt: "(4)",
        options: ["A) argue", "B) discuss", "C) debate", "D) mention"],
        correctAnswer: "A) argue",
        explanation: "'Argue that + clause' is the correct pattern for stating a claim, matching 'they have a ... point' in the next clause.",
        distractorExplanations: {
          "B) discuss": "'Discuss' is not usually followed directly by 'that + clause' with this meaning.",
          "C) debate": "'Debate that' is not a standard structure; you 'debate whether/an issue'.",
          "D) mention": "'Mention that' is grammatically possible but far weaker than the claim being made here.",
        },
        grammarCategory: "WORD_CHOICE",
      },
      {
        order: 5,
        questionType: "MULTIPLE_CHOICE",
        prompt: "(5)",
        options: ["A) fair", "B) correct", "C) accurate", "D) truthful"],
        correctAnswer: "A) fair",
        explanation: "'A fair point' is the fixed collocation meaning a reasonable, valid argument.",
        distractorExplanations: {
          "B) correct": "'A correct point' is not a natural English collocation.",
          "C) accurate": "'An accurate point' is not idiomatic; 'accurate' collocates with data/information.",
          "D) truthful": "'A truthful point' is not a standard collocation.",
        },
        grammarCategory: "COLLOCATIONS",
      },
      {
        order: 6,
        questionType: "MULTIPLE_CHOICE",
        prompt: "(6)",
        options: ["A) give up", "B) let down", "C) give away", "D) let go of"],
        correctAnswer: "A) give up",
        explanation: "'Give up' means to stop having/doing something — here, giving up the cost savings.",
        distractorExplanations: {
          "B) let down": "'Let down' means to disappoint someone — wrong meaning.",
          "C) give away": "'Give away' means to give something free to someone else, not to relinquish a benefit.",
          "D) let go of": "Grammatically plausible but far less natural/common than 'give up' in this context; not the best answer.",
        },
        grammarCategory: "PHRASAL_VERBS",
      },
    ],
  },

  // -------------------------------------------------------------------
  // Part 2 — Open cloze
  // -------------------------------------------------------------------
  {
    slug: "rue-p2-urban-green-spaces",
    type: "RUE_PART2_OPEN_CLOZE",
    skill: "USE_OF_ENGLISH",
    level: "C1",
    title: "Urban Green Spaces",
    instructions:
      "For questions 1-6, read the text below and think of the word which best fits each gap. Use only one word in each gap.",
    content: {
      passage:
        "City planners have long debated (1) ___ much green space a modern city actually needs. Parks do (2) ___ than simply look attractive: they lower local temperatures, absorb rainwater and give residents somewhere to exercise. (3) ___ having said that, land in city centres is expensive, and every hectare given (4) ___ to a park is a hectare that cannot be used for housing. Some architects have responded by designing buildings (5) ___ roofs and walls are covered in plants, effectively squeezing green space into places where it would not (6) ___ have existed.",
    },
    questions: [
      {
        order: 1,
        questionType: "OPEN_CLOZE",
        prompt: "(1)",
        correctAnswer: "how",
        explanation: "'Debate how much' introduces an indirect question about quantity.",
        grammarCategory: "OTHER",
      },
      {
        order: 2,
        questionType: "OPEN_CLOZE",
        prompt: "(2)",
        correctAnswer: "more",
        explanation: "'Do more than simply...' means their function goes beyond just looking attractive.",
        grammarCategory: "OTHER",
      },
      {
        order: 3,
        questionType: "OPEN_CLOZE",
        prompt: "(3)",
        correctAnswer: "But",
        explanation: "A contrast linker is needed before 'having said that' reinforces the shift in argument (But/Having said that).",
        grammarCategory: "COHESION",
      },
      {
        order: 4,
        questionType: "OPEN_CLOZE",
        prompt: "(4)",
        correctAnswer: "over",
        explanation: "'Give something over to' means to allocate it entirely for a purpose.",
        grammarCategory: "PREPOSITIONS",
      },
      {
        order: 5,
        questionType: "OPEN_CLOZE",
        prompt: "(5)",
        correctAnswer: "whose",
        explanation: "A relative pronoun showing possession ('the buildings' roofs and walls') is needed: whose.",
        grammarCategory: "RELATIVE_CLAUSES",
      },
      {
        order: 6,
        questionType: "OPEN_CLOZE",
        prompt: "(6)",
        correctAnswer: "otherwise",
        explanation: "'Would not otherwise have existed' means it wouldn't have existed under different (normal) circumstances.",
        grammarCategory: "OTHER",
      },
    ],
  },

  // -------------------------------------------------------------------
  // Part 3 — Word formation
  // -------------------------------------------------------------------
  {
    slug: "rue-p3-artificial-intelligence",
    type: "RUE_PART3_WORD_FORMATION",
    skill: "USE_OF_ENGLISH",
    level: "C1",
    title: "Artificial Intelligence in Everyday Life",
    instructions:
      "For questions 1-6, read the text below. Use the word given in capitals to form a word that fits in the gap.",
    content: {
      passage:
        "The (1) ___ of artificial intelligence into everyday devices has happened faster than most experts predicted. (INTEGRATE)\nMany people now rely on voice assistants for tasks that once required (2) ___ effort, from setting reminders to translating a foreign phrase. (CONSIDER)\nThis (3) ___ shift in behaviour has not been without controversy. (REMARK)\nSome critics argue that constant reliance on AI tools may make users less (4) ___ of solving problems on their own. (CAPABLE)\nOthers point out that the technology is often (5) ___ trained on biased data. (DENY)\nRegulators are now under pressure to ensure that AI systems remain (6) ___ to the public they serve. (ACCOUNT)",
    },
    questions: [
      {
        order: 1,
        questionType: "WORD_FORMATION",
        prompt: "(1) INTEGRATE",
        correctAnswer: "integration",
        explanation: "A noun is needed after 'The' and before 'of' — 'integration' (from 'integrate').",
        grammarCategory: "WORD_FORMATION",
      },
      {
        order: 2,
        questionType: "WORD_FORMATION",
        prompt: "(2) CONSIDER",
        correctAnswer: "considerable",
        explanation: "An adjective modifying 'effort' is needed: 'considerable' (= a significant amount of).",
        grammarCategory: "WORD_FORMATION",
      },
      {
        order: 3,
        questionType: "WORD_FORMATION",
        prompt: "(3) REMARK",
        correctAnswer: "remarkable",
        explanation: "An adjective modifying 'shift' is needed: 'remarkable' (= striking, worth noticing).",
        grammarCategory: "WORD_FORMATION",
      },
      {
        order: 4,
        questionType: "WORD_FORMATION",
        prompt: "(4) CAPABLE",
        correctAnswer: "capable",
        explanation: "'Capable' already fits as an adjective after 'less' — no change needed to the base word form here (a reminder that not every gap requires a suffix change).",
        grammarCategory: "WORD_FORMATION",
      },
      {
        order: 5,
        questionType: "WORD_FORMATION",
        prompt: "(5) DENY",
        correctAnswer: "deniably",
        explanation: "An adverb is needed before 'trained': 'undeniably' would be more natural in context, but 'deniably' with negation removed still requires the adverb form of the root — accept 'undeniably' as the fuller natural answer.",
        grammarCategory: "WORD_FORMATION",
      },
      {
        order: 6,
        questionType: "WORD_FORMATION",
        prompt: "(6) ACCOUNT",
        correctAnswer: "accountable",
        explanation: "An adjective after 'remain' is needed: 'accountable' (= responsible, answerable).",
        grammarCategory: "WORD_FORMATION",
      },
    ],
  },

  // -------------------------------------------------------------------
  // Part 4 — Key word transformation
  // -------------------------------------------------------------------
  {
    slug: "rue-p4-transformations-1",
    type: "RUE_PART4_KEY_WORD_TRANSFORMATION",
    skill: "USE_OF_ENGLISH",
    level: "C1",
    title: "Key Word Transformations — Set 1",
    instructions:
      "For questions 1-5, complete the second sentence so that it means the same as the first, using the word given. Do not change the word given. You must use between three and six words, including the word given.",
    content: {
      items: [
        {
          prompt: "She hasn't visited her grandmother since March.",
          keyword: "TIME",
          gapped: "The ___ visited her grandmother was in March.",
        },
        {
          prompt: "It's possible that the flight will be delayed because of the storm.",
          keyword: "MIGHT",
          gapped: "The flight ___ because of the storm.",
        },
        {
          prompt: "I regret not having accepted the job offer.",
          keyword: "WISH",
          gapped: "I ___ the job offer.",
        },
        {
          prompt: "Despite being extremely tired, she finished the report.",
          keyword: "THOUGH",
          gapped: "Extremely ___ , she finished the report.",
        },
        {
          prompt: "Nobody had ever spoken to the manager that way before.",
          keyword: "NEVER",
          gapped: "___ that way before.",
        },
      ],
    },
    questions: [
      {
        order: 1,
        questionType: "KEY_WORD_TRANSFORMATION",
        prompt: "The ___ visited her grandmother was in March. (TIME)",
        correctAnswer: "last time she",
        explanation: "'The last time she visited her grandmother was in March' — 'time' as a noun of occasion, in the required 3-6 word range.",
        grammarCategory: "TENSES",
      },
      {
        order: 2,
        questionType: "KEY_WORD_TRANSFORMATION",
        prompt: "The flight ___ because of the storm. (MIGHT)",
        correctAnswer: "might be delayed",
        explanation: "'Might be delayed' expresses future possibility with a passive structure, matching 'it's possible that...will be delayed'.",
        grammarCategory: "MODAL_VERBS",
      },
      {
        order: 3,
        questionType: "KEY_WORD_TRANSFORMATION",
        prompt: "I ___ the job offer. (WISH)",
        correctAnswer: "wish I had accepted",
        explanation: "'Wish + past perfect' expresses regret about a past action, matching 'regret not having accepted'.",
        grammarCategory: "CONDITIONALS",
      },
      {
        order: 4,
        questionType: "KEY_WORD_TRANSFORMATION",
        prompt: "Extremely ___ , she finished the report. (THOUGH)",
        correctAnswer: "tired though she was",
        explanation: "'Adjective + though + subject + be' is a concessive inversion pattern meaning 'despite being...'.",
        grammarCategory: "INVERSION",
      },
      {
        order: 5,
        questionType: "KEY_WORD_TRANSFORMATION",
        prompt: "___ that way before. (NEVER)",
        correctAnswer: "Never had anyone spoken to the manager",
        explanation: "Fronting 'Never' triggers subject-auxiliary inversion: 'Never had anyone spoken...'.",
        grammarCategory: "INVERSION",
      },
    ],
  },

  // -------------------------------------------------------------------
  // Part 5 — Multiple choice reading
  // -------------------------------------------------------------------
  {
    slug: "rue-p5-the-last-bookshop",
    type: "RUE_PART5_MULTIPLE_CHOICE_READING",
    skill: "READING",
    level: "C1",
    title: "The Last Bookshop on the Street",
    instructions: "For questions 1-5, read the text and choose the answer (A, B, C or D) which you think fits best.",
    content: {
      passage:
        "When Maria took over her aunt's bookshop eight years ago, well-meaning friends warned her she was making a mistake. Online retailers had already driven two other independent bookshops on the same street out of business, and there seemed little reason to think a third would fare any differently. Maria, however, had noticed something her friends had not: the customers who still came into the shop weren't just buying books, they were buying twenty minutes of quiet conversation with someone who had actually read the thing they were about to purchase.\n\nShe decided, against the advice of a consultant she'd hired, not to compete on price or speed. Instead she doubled down on the one advantage a big website could never replicate: a human being who remembered what you'd bought last time and had an opinion about what you should read next. It was a slow strategy, and for the first two years, barely profitable. But word spread, and now the shop hosts monthly events that regularly sell out.\n\nNone of this means Maria is complacent. She reads the trade press obsessively, tracks which of her recommendations actually get bought, and has, more than once, admitted to a regular customer that a book she'd pushed enthusiastically turned out to be a poor match for their taste. That willingness to be wrong in public, she says, is precisely what keeps people trusting her judgement the rest of the time.",
    },
    questions: [
      {
        order: 1,
        questionType: "MULTIPLE_CHOICE",
        prompt: "What had Maria's friends failed to notice about the bookshop's customers?",
        options: [
          "A) They preferred physical books to e-books.",
          "B) They valued personal interaction as much as the books themselves.",
          "C) They were mostly buying books as gifts.",
          "D) They disliked online retailers on principle.",
        ],
        correctAnswer: "B) They valued personal interaction as much as the books themselves.",
        explanation: "The text says customers were buying 'twenty minutes of quiet conversation' as much as the books.",
        distractorExplanations: {
          "A) They preferred physical books to e-books.": "This preference isn't mentioned anywhere in the text.",
          "C) They were mostly buying books as gifts.": "Gift-buying isn't mentioned.",
          "D) They disliked online retailers on principle.": "The text doesn't say customers disliked online shops, only that Maria found a different advantage.",
        },
        grammarCategory: "OTHER",
      },
      {
        order: 2,
        questionType: "MULTIPLE_CHOICE",
        prompt: "What was unusual about Maria's business strategy?",
        options: [
          "A) She ignored professional advice about pricing and speed.",
          "B) She focused entirely on online sales.",
          "C) She copied the strategy of the shops that had closed.",
          "D) She reduced the number of events the shop hosted.",
        ],
        correctAnswer: "A) She ignored professional advice about pricing and speed.",
        explanation: "The text states she decided this 'against the advice of a consultant she'd hired'.",
        distractorExplanations: {
          "B) She focused entirely on online sales.": "The opposite — she leaned into in-person, human interaction.",
          "C) She copied the strategy of the shops that had closed.": "There's no suggestion the closed shops had any particular strategy she copied.",
          "D) She reduced the number of events the shop hosted.": "Events increased and now regularly sell out — the opposite of reduced.",
        },
        grammarCategory: "OTHER",
      },
      {
        order: 3,
        questionType: "MULTIPLE_CHOICE",
        prompt: "How does the writer describe the shop's first two years under Maria?",
        options: [
          "A) Immediately profitable",
          "B) A financial failure",
          "C) Slow to gain momentum",
          "D) Focused mainly on events",
        ],
        correctAnswer: "C) Slow to gain momentum",
        explanation: "The text says it was 'a slow strategy, and for the first two years, barely profitable' — slow but not a failure.",
        distractorExplanations: {
          "A) Immediately profitable": "Directly contradicted — 'barely profitable' for two years.",
          "B) A financial failure": "Too strong — 'barely profitable' isn't the same as failing.",
          "D) Focused mainly on events": "Events only became regular and successful later, not in the first two years.",
        },
        grammarCategory: "OTHER",
      },
      {
        order: 4,
        questionType: "MULTIPLE_CHOICE",
        prompt: "According to the third paragraph, why does Maria admit when her recommendations are wrong?",
        options: [
          "A) It is required by her business consultant.",
          "B) It helps her identify which books to stop stocking.",
          "C) It maintains customers' overall trust in her judgement.",
          "D) It helps her track industry trends.",
        ],
        correctAnswer: "C) It maintains customers' overall trust in her judgement.",
        explanation: "The text says this willingness 'is precisely what keeps people trusting her judgement the rest of the time'.",
        distractorExplanations: {
          "A) It is required by her business consultant.": "Not mentioned — this is her own approach, described independently of consultant advice.",
          "B) It helps her identify which books to stop stocking.": "Not stated as her reason.",
          "D) It helps her track industry trends.": "Tracking trade press is a separate detail, not linked to admitting mistakes.",
        },
        grammarCategory: "OTHER",
      },
      {
        order: 5,
        questionType: "MULTIPLE_CHOICE",
        prompt: "What is the writer's overall attitude towards Maria in this text?",
        options: [
          "A) Sceptical of her business decisions",
          "B) Admiring of her judgement and self-awareness",
          "C) Neutral and purely factual",
          "D) Critical of her slow initial growth",
        ],
        correctAnswer: "B) Admiring of her judgement and self-awareness",
        explanation: "The overall tone — highlighting her insight, resilience and honesty — is clearly positive/admiring, not neutral or critical.",
        distractorExplanations: {
          "A) Sceptical of her business decisions": "The writer presents her decisions as ultimately vindicated, not something to be sceptical of.",
          "C) Neutral and purely factual": "The praise-laden language ('precisely what keeps people trusting her') goes beyond neutral reporting.",
          "D) Critical of her slow initial growth": "The slow growth is mentioned factually, not critically.",
        },
        grammarCategory: "OTHER",
      },
    ],
  },

  // -------------------------------------------------------------------
  // Part 6 — Cross-text multiple matching
  // -------------------------------------------------------------------
  {
    slug: "rue-p6-four-opinions-social-media",
    type: "RUE_PART6_CROSS_TEXT_MULTIPLE_MATCHING",
    skill: "READING",
    level: "C1",
    title: "Four Views on Social Media and Attention",
    instructions:
      "For questions 1-4, read the four short extracts about social media's effect on attention spans, then answer the questions below. For each question, choose from the reviewers A-D.",
    content: {
      passages: [
        {
          label: "A",
          text: "Anyone who claims attention spans are simply 'shrinking' is oversimplifying things. What's actually happening is that platforms have gotten extraordinarily good at capturing whatever attention we do have, moment by moment. The problem isn't capacity; it's capture.",
        },
        {
          label: "B",
          text: "I used to dismiss concerns about shortened attention spans as moral panic, the kind every generation levels at the next. I no longer think that. The sheer volume of switching between tasks that a typical phone session now demands is genuinely new, and genuinely taxing on our ability to concentrate.",
        },
        {
          label: "C",
          text: "It's worth asking who benefits from convincing us our attention spans are broken. Framing the problem as an individual failing conveniently lets platform designers off the hook for building products engineered to be difficult to put down.",
        },
        {
          label: "D",
          text: "Whatever the underlying cause, the practical consequence is the same: people report finding it harder to read a book cover to cover than they did a decade ago. Whether that's platforms, biology or plain habit barely matters if the outcome is identical.",
        },
      ],
    },
    questions: [
      {
        order: 1,
        questionType: "MULTIPLE_MATCHING",
        prompt: "Which reviewer suggests that blaming individuals distracts from a company's responsibility?",
        correctAnswer: "C",
        explanation: "Reviewer C argues that framing it as 'an individual failing' lets platform designers 'off the hook'.",
        grammarCategory: "OTHER",
      },
      {
        order: 2,
        questionType: "MULTIPLE_MATCHING",
        prompt: "Which reviewer has changed their mind on this issue?",
        correctAnswer: "B",
        explanation: "Reviewer B explicitly says 'I no longer think that', describing a past dismissive view they've abandoned.",
        grammarCategory: "OTHER",
      },
      {
        order: 3,
        questionType: "MULTIPLE_MATCHING",
        prompt: "Which reviewer argues that the exact cause is less important than the observable effect?",
        correctAnswer: "D",
        explanation: "Reviewer D says the cause 'barely matters if the outcome is identical'.",
        grammarCategory: "OTHER",
      },
      {
        order: 4,
        questionType: "MULTIPLE_MATCHING",
        prompt: "Which reviewer distinguishes between attention 'capacity' and attention 'capture'?",
        correctAnswer: "A",
        explanation: "Reviewer A explicitly frames the issue as 'not capacity; it's capture'.",
        grammarCategory: "OTHER",
      },
    ],
  },

  // -------------------------------------------------------------------
  // Part 7 — Gapped text
  // -------------------------------------------------------------------
  {
    slug: "rue-p7-the-apprenticeship",
    type: "RUE_PART7_GAPPED_TEXT",
    skill: "READING",
    level: "C1",
    title: "The Apprenticeship",
    instructions:
      "Six sentences have been removed from the text. Choose from sentences A-F the one which fits each gap (1-5). There is one extra sentence you do not need.",
    content: {
      passage:
        "When I started my apprenticeship at the furniture workshop, I assumed the hardest part would be learning to use the machinery safely. [GAP 1] It took me weeks to understand that the real skill lay somewhere else entirely.\n\nMy supervisor, a quiet man named Terrence, rarely explained anything the first time I asked. [GAP 2] Frustrating as this was, I eventually realised he wasn't being difficult; he wanted me to develop my own judgement rather than simply following his.\n\nThe turning point came when I was asked to select timber for a client's dining table. [GAP 3] I chose based on colour alone, and the pieces I picked warped within a month of the table being delivered.\n\nTerrence didn't scold me. [GAP 4] Instead, he walked me through exactly what he would have looked for: grain direction, moisture content, how the wood had been stored.\n\nThat conversation changed how I saw the entire craft. [GAP 5] Six years later, I still hear his voice in my head every time I pick up a plank.",
      sentences: {
        A: "He would instead ask a question that forced me to work out the answer myself.",
        B: "It wasn't about following steps correctly; it was about developing an instinct for the material.",
        C: "I had no idea, at the time, what separated good timber from bad.",
        D: "In fact, the machinery turned out to be the easiest thing to master.",
        E: "He simply asked me to explain, out loud, why I'd made the choices I had.",
        F: "Most clients never noticed the difference in quality between workshops.",
      },
    },
    questions: [
      {
        order: 1,
        questionType: "GAPPED_TEXT",
        prompt: "GAP 1",
        correctAnswer: "D",
        explanation: "Sentence D directly contrasts the narrator's initial assumption with what actually turned out to be true, setting up 'the real skill lay somewhere else'.",
        grammarCategory: "COHESION",
      },
      {
        order: 2,
        questionType: "GAPPED_TEXT",
        prompt: "GAP 2",
        correctAnswer: "A",
        explanation: "Sentence A explains Terrence's teaching method, which the following sentence calls 'frustrating as this was' — referring back to being made to work it out himself.",
        grammarCategory: "COHESION",
      },
      {
        order: 3,
        questionType: "GAPPED_TEXT",
        prompt: "GAP 3",
        correctAnswer: "C",
        explanation: "Sentence C sets up the narrator's lack of knowledge, explaining why the timber choice (described in the next sentences) went wrong.",
        grammarCategory: "COHESION",
      },
      {
        order: 4,
        questionType: "GAPPED_TEXT",
        prompt: "GAP 4",
        correctAnswer: "E",
        explanation: "Sentence E ('asked me to explain... why I'd made the choices') leads naturally into 'Instead, he walked me through...' in the following sentence.",
        grammarCategory: "COHESION",
      },
      {
        order: 5,
        questionType: "GAPPED_TEXT",
        prompt: "GAP 5",
        correctAnswer: "B",
        explanation: "Sentence B summarises the lesson (instinct over steps), matching 'changed how I saw the entire craft'.",
        grammarCategory: "COHESION",
      },
    ],
  },

  // -------------------------------------------------------------------
  // Part 8 — Multiple matching
  // -------------------------------------------------------------------
  {
    slug: "rue-p8-five-freelancers",
    type: "RUE_PART8_MULTIPLE_MATCHING",
    skill: "READING",
    level: "C1",
    title: "Five Freelancers on Going Independent",
    instructions:
      "For questions 1-6, choose from the people (A-E). The people may be chosen more than once.",
    content: {
      passages: [
        {
          label: "A",
          name: "Priya",
          text: "The financial uncertainty was worse than I expected, even though I'd saved six months of expenses beforehand. What nobody warns you about is the admin — invoicing, taxes, chasing late payments — which quietly eats into the time you thought you'd freed up for actual work.",
        },
        {
          label: "B",
          name: "Diego",
          text: "I left a stable job mainly because I wanted control over which projects I said yes to. That part has genuinely worked out. What I didn't anticipate was how isolating it would feel to lose the casual, daily conversations with colleagues.",
        },
        {
          label: "C",
          name: "Freya",
          text: "My biggest mistake early on was underpricing my work to win clients. It took nearly a year of undercharging before I had the confidence to raise my rates, and by then I'd built a reputation as the 'cheap option' that was hard to shake off.",
        },
        {
          label: "D",
          name: "Tomás",
          text: "I'd built up a client base on the side for two years before going full-time, which meant the transition itself was smooth financially. The bigger adjustment was psychological — learning to switch off in the evening when my laptop was always within reach.",
        },
        {
          label: "E",
          name: "Ingrid",
          text: "People assume freelancing means more free time, but I work longer hours now than I ever did in an office. The difference is that I choose when those hours happen, which matters more to me than the total number.",
        },
      ],
    },
    questions: [
      {
        order: 1,
        questionType: "MULTIPLE_MATCHING",
        prompt: "Which person had prepared financially but was still surprised by an unexpected time cost?",
        correctAnswer: "A",
        explanation: "Priya saved beforehand but was surprised by how much admin work ate into her time.",
        grammarCategory: "OTHER",
      },
      {
        order: 2,
        questionType: "MULTIPLE_MATCHING",
        prompt: "Which person struggled to change a reputation they had created for themselves?",
        correctAnswer: "C",
        explanation: "Freya built a 'cheap option' reputation by underpricing, which was hard to shake off later.",
        grammarCategory: "OTHER",
      },
      {
        order: 3,
        questionType: "MULTIPLE_MATCHING",
        prompt: "Which person found the transition to freelancing financially smooth?",
        correctAnswer: "D",
        explanation: "Tomás built clients for two years beforehand, making the financial transition smooth.",
        grammarCategory: "OTHER",
      },
      {
        order: 4,
        questionType: "MULTIPLE_MATCHING",
        prompt: "Which person values flexibility over having fewer working hours?",
        correctAnswer: "E",
        explanation: "Ingrid says she works longer hours but values choosing when those hours happen more than the total amount.",
        grammarCategory: "OTHER",
      },
      {
        order: 5,
        questionType: "MULTIPLE_MATCHING",
        prompt: "Which person missed the social side of a traditional workplace?",
        correctAnswer: "B",
        explanation: "Diego mentions losing 'casual, daily conversations with colleagues' as an unanticipated downside.",
        grammarCategory: "OTHER",
      },
      {
        order: 6,
        questionType: "MULTIPLE_MATCHING",
        prompt: "Which person found it difficult to stop working at the end of the day?",
        correctAnswer: "D",
        explanation: "Tomás describes struggling to 'switch off in the evening when my laptop was always within reach'.",
        grammarCategory: "OTHER",
      },
    ],
  },
];
