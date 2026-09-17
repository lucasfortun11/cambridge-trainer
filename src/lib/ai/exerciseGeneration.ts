// Real (non-canned) exercise generation for the mock AI provider.
//
// Strategy: assemble from the app's own bank of hand-authored, C1-quality
// questions (all already tagged with grammarCategory and carrying full
// explanations/distractor explanations) first — genuinely useful, validated
// content — and only fall back to lightweight synthesised filler items when
// the bank doesn't have enough for the requested category/count. A real
// AIProvider can replace this with true LLM generation without any other
// code changing (see provider.ts).

import { prisma } from "@/lib/prisma";
import type { ErrorCategory } from "@prisma/client";
import type { GeneratedQuestion } from "./types";

const CEFR_ORDER: Record<string, number> = { A2: 0, B1: 1, B2: 2, C1: 3, C2: 4 };

export async function assembleFromBank(
  categories: ErrorCategory[],
  count: number
): Promise<GeneratedQuestion[]> {
  if (categories.length === 0) return [];

  // Only pull from exercise types whose questions are self-contained single
  // sentences (grammar drills, key word transformations) — reading/listening
  // questions reference a shared passage/transcript and would be meaningless
  // lifted out of context into a standalone mini-lesson. Mini-lesson exercises
  // themselves (topic prefixed "mini-lesson-") are excluded too, otherwise
  // each generation would feed its own (possibly filler-heavy) output back
  // into the bank for the next generation, compounding repetition over time.
  const rows = await prisma.question.findMany({
    where: {
      grammarCategory: { in: categories },
      exercise: {
        type: { in: ["GRAMMAR_DRILL", "RUE_PART4_KEY_WORD_TRANSFORMATION"] },
        NOT: { topic: { startsWith: "mini-lesson-" } },
      },
    },
    include: { exercise: { select: { level: true } } },
    take: 200,
  });

  // Sort easy -> hard by the parent exercise's CEFR level, then shuffle
  // within each level so repeated requests don't always return the same set.
  const shuffled = [...rows].sort(() => Math.random() - 0.5);
  shuffled.sort((a, b) => (CEFR_ORDER[a.exercise.level] ?? 2) - (CEFR_ORDER[b.exercise.level] ?? 2));

  return shuffled.slice(0, count).map((q, i) => ({
    order: i + 1,
    prompt: q.prompt,
    questionType: q.questionType as GeneratedQuestion["questionType"],
    options: q.options ? (JSON.parse(q.options) as string[]) : undefined,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    distractorExplanations: q.distractorExplanations
      ? (JSON.parse(q.distractorExplanations) as Record<string, string>)
      : undefined,
    grammarCategory: q.grammarCategory ?? undefined,
  }));
}

function fixOptionLabelling(correctText: string, options: string[]): { options: string[]; correctAnswer: string } {
  const letters = ["A", "B", "C", "D"];
  const shuffledValues = [...options].sort(() => Math.random() - 0.5);
  const labelled = shuffledValues.map((v, i) => `${letters[i]}) ${v}`);
  const correct = labelled.find((l) => l.endsWith(`) ${correctText}`))!;
  return { options: labelled, correctAnswer: correct };
}

type Variant = { prompt: string; correct: string; wrong: string[]; explanation: string };

// Several variants per category so a mini-lesson never shows the same
// filler item twice in a row — cycled through a per-call shuffled order.
const FILLER_POOLS: Partial<Record<ErrorCategory, Variant[]>> = {
  PREPOSITIONS: [
    { prompt: "The success of the project depends heavily ___ careful planning.", correct: "on", wrong: ["of", "for", "with"], explanation: "'Depend on' is the fixed dependent preposition." },
    { prompt: "She apologised ___ arriving so late to the meeting.", correct: "for", wrong: ["of", "about", "on"], explanation: "'Apologise for doing something' is the fixed pattern." },
    { prompt: "He's always been very good ___ languages.", correct: "at", wrong: ["in", "for", "on"], explanation: "'Good at' is the fixed dependent preposition for skills." },
    { prompt: "The team is capable ___ finishing the project early.", correct: "of", wrong: ["for", "to", "in"], explanation: "'Capable of' is the fixed dependent preposition." },
    { prompt: "I'm not really interested ___ politics.", correct: "in", wrong: ["on", "for", "with"], explanation: "'Interested in' is the fixed dependent preposition." },
    { prompt: "The results were consistent ___ our expectations.", correct: "with", wrong: ["to", "from", "at"], explanation: "'Consistent with' is the fixed dependent preposition." },
    { prompt: "She's married ___ a doctor.", correct: "to", wrong: ["with", "for", "on"], explanation: "'Married to' is the fixed dependent preposition." },
    { prompt: "The committee is responsible ___ approving the budget.", correct: "for", wrong: ["of", "to", "on"], explanation: "'Responsible for' is the fixed dependent preposition." },
  ],
  ARTICLES: [
    { prompt: "I have never seen ___ such beautiful sunset.", correct: "such a", wrong: ["such", "a such", "so"], explanation: "'Such a/an + adjective + singular noun' needs the indefinite article." },
    { prompt: "___ education is the key to reducing poverty worldwide.", correct: "—", wrong: ["The", "An", "A"], explanation: "General, uncountable statement — no article." },
    { prompt: "We travelled ___ night to avoid the traffic.", correct: "at", wrong: ["in the", "on", "during the"], explanation: "'At night' is a fixed expression with no article." },
    { prompt: "___ information she gave us turned out to be wrong.", correct: "The", wrong: ["—", "An", "A"], explanation: "Specific, known instance requires 'the'." },
    { prompt: "He plays ___ violin beautifully.", correct: "the", wrong: ["a", "—", "an"], explanation: "Musical instruments take 'the' after 'play'." },
    { prompt: "She's studying to become ___ engineer.", correct: "an", wrong: ["a", "the", "—"], explanation: "'Engineer' starts with a vowel sound, so it needs 'an'." },
    { prompt: "On the whole, ___ conference was a success.", correct: "the", wrong: ["a", "—", "an"], explanation: "Specific, already-mentioned event — 'the'." },
    { prompt: "___ whole, the event went well despite a few problems.", correct: "On the", wrong: ["At the", "In the", "By the"], explanation: "'On the whole' is a fixed expression meaning 'generally'." },
  ],
  TENSES: [
    { prompt: "By the time we arrived, the film ___ already started.", correct: "had", wrong: ["has", "was", "is"], explanation: "Past perfect: one past event before another past event." },
    { prompt: "I ___ this book twice already, so I'll lend it to you.", correct: "have read", wrong: ["read", "was reading", "had read"], explanation: "Present perfect for a completed action with present relevance." },
    { prompt: "She ___ for the company for six years when it was sold.", correct: "had been working", wrong: ["worked", "has worked", "was working"], explanation: "Past perfect continuous shows duration up to a past point." },
    { prompt: "By next April, they ___ married for ten years.", correct: "will have been", wrong: ["will be", "are", "have been"], explanation: "Future perfect for a state complete by a future point." },
    { prompt: "I'm exhausted — I ___ boxes all afternoon.", correct: "have been moving", wrong: ["have moved", "moved", "move"], explanation: "Present perfect continuous emphasises the tiring ongoing activity." },
    { prompt: "When I called her, she ___ already ___ the office.", correct: "had / left", wrong: ["has / left", "was / leaving", "did / leave"], explanation: "Past perfect clearly places her departure before the past action of calling." },
    { prompt: "This time next week, I ___ on a beach in Portugal.", correct: "will be lying", wrong: ["will lie", "lie", "am lying"], explanation: "Future continuous for an action in progress at a specific future time." },
    { prompt: "He ___ three different jobs since he graduated.", correct: "has had", wrong: ["had", "has", "was having"], explanation: "Present perfect for a count of events up to now." },
  ],
  CONDITIONALS: [
    { prompt: "If it ___ tomorrow, we'll cancel the picnic.", correct: "rains", wrong: ["will rain", "rained", "would rain"], explanation: "First conditional: if + present simple, will + base form." },
    { prompt: "If I ___ you, I wouldn't accept that offer.", correct: "were", wrong: ["am", "was", "will be"], explanation: "Second conditional: 'If I were you' uses subjunctive 'were'." },
    { prompt: "If she ___ harder, she would have passed the exam.", correct: "had studied", wrong: ["studied", "studies", "would study"], explanation: "Third conditional: if + past perfect, would have + past participle." },
    { prompt: "If he had taken that promotion, he ___ so stressed right now.", correct: "would be", wrong: ["would have been", "will be", "is"], explanation: "Mixed conditional: past condition, present result." },
    { prompt: "If you weren't so disorganised, you ___ the deadline last week.", correct: "wouldn't have missed", wrong: ["wouldn't miss", "don't miss", "hadn't missed"], explanation: "Mixed conditional: present condition, past result." },
    { prompt: "Provided that you ___ early, we'll get good seats.", correct: "arrive", wrong: ["will arrive", "arrived", "would arrive"], explanation: "'Provided that' behaves like 'if' in a first conditional." },
    { prompt: "Had I known about the traffic, I ___ earlier.", correct: "would have left", wrong: ["would leave", "left", "had left"], explanation: "Inverted third conditional (formal): Had + subject..., would have + past participle." },
    { prompt: "Unless we ___ costs, we'll go over budget.", correct: "cut", wrong: ["will cut", "cutting", "would cut"], explanation: "'Unless' (= if not) behaves like 'if' in a first conditional." },
  ],
  MODAL_VERBS: [
    { prompt: "She's not answering her phone — she ___ be in a meeting.", correct: "must", wrong: ["should", "can't", "needn't"], explanation: "'Must' expresses confident deduction about a present situation." },
    { prompt: "You ___ have shouted at him — he was only trying to help.", correct: "shouldn't", wrong: ["mustn't", "can't", "needn't"], explanation: "'Shouldn't have' criticises a past action." },
    { prompt: "I ___ have printed those documents — they'd already been sent.", correct: "needn't", wrong: ["shouldn't", "mustn't", "can't"], explanation: "'Needn't have' means the action was done but was unnecessary." },
    { prompt: "There's no answer at the door — they ___ have gone out already.", correct: "might", wrong: ["should", "needn't", "mustn't"], explanation: "'Might have' expresses a past possibility." },
    { prompt: "He speaks four languages fluently — he ___ have lived abroad.", correct: "must", wrong: ["could", "needn't", "shouldn't"], explanation: "'Must have' expresses a confident deduction from strong evidence." },
    { prompt: "You ___ smoke in here — it's strictly forbidden.", correct: "mustn't", wrong: ["don't have to", "needn't", "shouldn't have to"], explanation: "'Mustn't' expresses prohibition." },
    { prompt: "You ___ bring anything to the party — we've got it covered.", correct: "don't have to", wrong: ["mustn't", "shouldn't", "can't"], explanation: "'Don't have to' expresses absence of obligation, unlike 'mustn't' (prohibition)." },
    { prompt: "That ___ be the postman — he never comes this early.", correct: "can't", wrong: ["mustn't", "shouldn't", "needn't"], explanation: "'Can't' expresses confident certainty that something is NOT true." },
  ],
  PASSIVE_VOICE: [
    { prompt: "The new policy ___ next month.", correct: "will be announced", wrong: ["will announce", "is announcing", "announces"], explanation: "Passive needed — the policy doesn't announce itself." },
    { prompt: "It ___ that remote work increases productivity.", correct: "is believed", wrong: ["believes", "is believing", "believed"], explanation: "'It is believed that...' is a standard impersonal passive." },
    { prompt: "The bridge ___ by the time the festival starts.", correct: "will have been finished", wrong: ["will finish", "finishes", "is finished"], explanation: "Future perfect passive for a deadline-based completed action." },
    { prompt: "The CEO ___ to have known about the issue for months.", correct: "is said", wrong: ["says", "said", "is saying"], explanation: "'Someone is said to have done something' distances the writer from the claim." },
    { prompt: "This wine ___ from grapes grown in the same valley for a century.", correct: "is made", wrong: ["makes", "made", "is making"], explanation: "Passive present simple describes a general/factual process." },
    { prompt: "The report ___ by the finance team before it reaches the board.", correct: "must be reviewed", wrong: ["must review", "is reviewing", "reviews"], explanation: "Modal passive: must be + past participle." },
    { prompt: "The building ___ in the 1920s.", correct: "was constructed", wrong: ["constructed", "has constructed", "is constructing"], explanation: "Simple past passive for a completed historical action." },
    { prompt: "Applications ___ by Friday at the latest.", correct: "must be submitted", wrong: ["must submit", "are submitting", "submit"], explanation: "Modal passive expressing a deadline obligation." },
  ],
  REPORTED_SPEECH: [
    { prompt: "\"I'll finish it tomorrow,\" she said. → She said she ___ it the next day.", correct: "would finish", wrong: ["will finish", "finishes", "had finished"], explanation: "'Will' backshifts to 'would' after a past reporting verb." },
    { prompt: "\"I forgot to lock the door,\" he admitted. → He admitted ___ to lock the door.", correct: "forgetting", wrong: ["to forget", "forgot", "he forgets"], explanation: "'Admit doing something' reports a past action." },
    { prompt: "\"Don't touch that wire!\" she warned him. → She warned him ___ touch the wire.", correct: "not to", wrong: ["don't", "to not", "didn't"], explanation: "Negative reported imperatives: warn/tell someone not to do something." },
    { prompt: "\"Why don't we ask a lawyer?\" he said. → He ___ asking a lawyer.", correct: "suggested", wrong: ["told", "said", "asked"], explanation: "'Suggest doing something' reports a suggestion precisely." },
    { prompt: "\"I did NOT take your umbrella,\" he said firmly. → He ___ taking her umbrella.", correct: "denied", wrong: ["admitted", "suggested", "regretted"], explanation: "'Deny doing something' reports a firm rejection of an accusation." },
    { prompt: "\"You should see a doctor,\" she said. → She advised him ___ a doctor.", correct: "to see", wrong: ["seeing", "see", "saw"], explanation: "'Advise someone to do something' reports advice." },
    { prompt: "\"I'll never speak to him again,\" she said. → She said she ___ speak to him again.", correct: "would never", wrong: ["will never", "never", "had never"], explanation: "'Will' backshifts to 'would' in reported speech." },
    { prompt: "\"Please don't tell anyone,\" he begged. → He begged her ___ tell anyone.", correct: "not to", wrong: ["don't", "to not", "won't"], explanation: "Negative reported request: beg someone not to do something." },
  ],
  RELATIVE_CLAUSES: [
    { prompt: "The engineer ___ designed this bridge later won an award.", correct: "who", wrong: ["which", "whom", "whose"], explanation: "'Who' is the subject relative pronoun for people." },
    { prompt: "My sister, ___ house is around the corner, is coming to dinner.", correct: "whose", wrong: ["who", "which", "that"], explanation: "'Whose' shows possession." },
    { prompt: "The negotiations collapsed, ___ nobody had expected.", correct: "which", wrong: ["that", "what", "who"], explanation: "'Which' can refer back to a whole previous clause." },
    { prompt: "This is the exact spot ___ the treaty was signed.", correct: "where", wrong: ["which", "that", "when"], explanation: "'Where' is the relative adverb for places." },
    { prompt: "The report ___ on the table needs to be signed by Friday.", correct: "lying", wrong: ["lies", "which lying", "lain"], explanation: "Reduced relative clause with an -ing participle (active meaning)." },
    { prompt: "The year ___ I graduated was particularly difficult for my family.", correct: "when", wrong: ["which", "where", "that"], explanation: "'When' is the relative adverb for time." },
    { prompt: "The manager, ___ decision was final, refused to discuss it further.", correct: "whose", wrong: ["who", "which", "that"], explanation: "'Whose' shows possession, even for things related to people." },
    { prompt: "Anyone ___ has questions should email the office directly.", correct: "who", wrong: ["which", "whose", "whom"], explanation: "'Who' is the subject relative pronoun for people." },
  ],
  GERUNDS_INFINITIVES: [
    { prompt: "Don't forget ___ the lights before you leave.", correct: "to turn off", wrong: ["turning off", "turn off", "having turned off"], explanation: "'Forget to do' refers to a future obligation." },
    { prompt: "I'll never forget ___ the northern lights for the first time.", correct: "seeing", wrong: ["to see", "see", "having see"], explanation: "'Forget doing' refers to a memory of a past experience." },
    { prompt: "We stopped ___ coffee on the way to the meeting.", correct: "to buy", wrong: ["buying", "buy", "bought"], explanation: "'Stop to do' means pausing to do something else." },
    { prompt: "She regrets ___ so harshly to her colleague last week.", correct: "speaking", wrong: ["to speak", "speak", "having speak"], explanation: "'Regret doing' refers to a past action." },
    { prompt: "I regret ___ you that your application was unsuccessful.", correct: "to inform", wrong: ["informing", "inform", "informed"], explanation: "'Regret to inform' is the fixed formal pattern for delivering bad news." },
    { prompt: "He avoided ___ eye contact during the whole interview.", correct: "making", wrong: ["to make", "make", "having make"], explanation: "'Avoid' is always followed by a gerund." },
    { prompt: "They finally agreed ___ the terms of the contract.", correct: "to discuss", wrong: ["discussing", "discuss", "having discussed"], explanation: "'Agree to do something' takes the infinitive." },
    { prompt: "I can't help ___ how different things could have been.", correct: "wondering", wrong: ["to wonder", "wonder", "having wonder"], explanation: "'Can't help doing' is a fixed gerund pattern." },
  ],
  INVERSION: [
    { prompt: "___ such a compelling argument before.", correct: "Never have I heard", wrong: ["Never I have heard", "I have never heard", "Never did I heard"], explanation: "Fronting 'Never' triggers subject-auxiliary inversion." },
    { prompt: "___ had she started the presentation than the projector broke.", correct: "No sooner", wrong: ["Hardly", "Barely", "Scarcely"], explanation: "'No sooner...than' is a fixed inversion pattern." },
    { prompt: "___ should this door be left unlocked overnight.", correct: "Under no circumstances", wrong: ["In no circumstances", "With no circumstances", "At no circumstances"], explanation: "'Under no circumstances' is the fixed phrase that triggers inversion." },
    { prompt: "Rarely ___ such dedication from a new employee.", correct: "do we see", wrong: ["we see", "we do see", "see we"], explanation: "Fronting 'Rarely' triggers inversion with 'do'." },
    { prompt: "Not only ___ late, but he also forgot the documents.", correct: "was he", wrong: ["he was", "he did", "did he was"], explanation: "Fronting 'Not only' triggers inversion." },
    { prompt: "Little ___ that the deal would fall through so quickly.", correct: "did she know", wrong: ["she knew", "she did know", "knew she"], explanation: "Fronting 'Little' triggers inversion with 'did'." },
    { prompt: "Only after the meeting ___ what had really happened.", correct: "did I realise", wrong: ["I realised", "I did realise", "realised I"], explanation: "'Only after...' triggers inversion in the main clause." },
    { prompt: "Not until the results came in ___ how serious the problem was.", correct: "did we understand", wrong: ["we understood", "we did understand", "understood we"], explanation: "'Not until...' triggers inversion in the main clause." },
  ],
  COLLOCATIONS: [
    { prompt: "The new policy will have a substantial ___ on small businesses.", correct: "impact", wrong: ["affect", "result", "consequence"], explanation: "'Have an impact on' is the fixed collocation." },
    { prompt: "She's determined to ___ a difference in her community.", correct: "make", wrong: ["do", "have", "create"], explanation: "'Make a difference' is the fixed collocation." },
    { prompt: "It's important to ___ a balance between work and personal life.", correct: "strike", wrong: ["hit", "make", "find out"], explanation: "'Strike a balance' is the fixed collocation." },
    { prompt: "The committee decided to ___ a decision by the end of the week.", correct: "reach", wrong: ["make", "take", "do"], explanation: "'Reach a decision' is the more formal fixed collocation (also 'make')." },
    { prompt: "He was determined to ___ the risk despite the warnings.", correct: "take", wrong: ["make", "do", "have"], explanation: "'Take a risk' is the fixed collocation." },
    { prompt: "The negotiations broke down after they failed to ___ common ground.", correct: "find", wrong: ["make", "do", "take"], explanation: "'Find common ground' is the fixed collocation." },
  ],
  PHRASAL_VERBS: [
    { prompt: "The meeting was ___ due to bad weather.", correct: "called off", wrong: ["called out", "called up", "called in"], explanation: "'Call off' means to cancel." },
    { prompt: "We need to ___ the new software before the deadline.", correct: "roll out", wrong: ["roll up", "roll over", "roll in"], explanation: "'Roll out' means to launch/release something new." },
    { prompt: "She decided to ___ her old job and start a business.", correct: "give up", wrong: ["give away", "give in", "give out"], explanation: "'Give up' means to stop doing/having something." },
    { prompt: "The two colleagues ___ over a disagreement about the budget.", correct: "fell out", wrong: ["fell down", "fell through", "fell off"], explanation: "'Fall out' means to argue and stop being friendly." },
    { prompt: "Let's ___ the pros and cons before deciding.", correct: "weigh up", wrong: ["weigh in", "weigh down", "weigh on"], explanation: "'Weigh up' means to consider carefully." },
    { prompt: "The deal ___ at the very last minute.", correct: "fell through", wrong: ["fell out", "fell down", "fell off"], explanation: "'Fall through' means a plan fails to happen." },
  ],
  WORD_FORMATION: [
    { prompt: "The committee reached a ___ decision. (UNANIMOUS)", correct: "unanimous", wrong: ["unanimously", "unanimity", "unanimousness"], explanation: "An adjective is needed to modify 'decision'." },
    { prompt: "Her presentation was ___ well received by the board. (SURPRISE)", correct: "surprisingly", wrong: ["surprising", "surprised", "surprise"], explanation: "An adverb is needed to modify 'well received'." },
    { prompt: "The new policy caused widespread ___ among employees. (SATISFY, negative)", correct: "dissatisfaction", wrong: ["dissatisfy", "dissatisfied", "unsatisfaction"], explanation: "A noun is needed as the subject complement." },
    { prompt: "It would be ___ to ignore the warning signs. (RESPONSIBLE, negative)", correct: "irresponsible", wrong: ["unresponsible", "irresponsibly", "responsibility"], explanation: "An adjective is needed after 'be'." },
    { prompt: "The scientists made a ___ discovery last year. (GROUND, breaking)", correct: "groundbreaking", wrong: ["groundbreak", "grounded", "groundbroken"], explanation: "A compound adjective is needed to modify 'discovery'." },
    { prompt: "His argument was completely ___. (CONVINCE, negative)", correct: "unconvincing", wrong: ["unconvinced", "inconvincing", "unconvince"], explanation: "An adjective is needed after 'was'." },
  ],
  VOCABULARY: [
    { prompt: "His explanation was ___ — nobody could tell what he meant.", correct: "ambiguous", wrong: ["candid", "plausible", "resilient"], explanation: "'Ambiguous' means open to more than one interpretation." },
    { prompt: "The company's growth over the past year has been ___.", correct: "substantial", wrong: ["trivial", "negligible", "scarce"], explanation: "'Substantial' means large in amount or importance." },
    { prompt: "Despite the setback, she remained remarkably ___.", correct: "resilient", wrong: ["fragile", "obsolete", "ambiguous"], explanation: "'Resilient' means able to recover quickly from difficulties." },
    { prompt: "The technology quickly became ___ after a better version was released.", correct: "obsolete", wrong: ["cutting-edge", "resilient", "plausible"], explanation: "'Obsolete' means no longer used because something better exists." },
    { prompt: "Her explanation was refreshingly ___ and straightforward.", correct: "candid", wrong: ["ambiguous", "detrimental", "meticulous"], explanation: "'Candid' means honest and direct." },
    { prompt: "Poor sleep can be ___ to your long-term health.", correct: "detrimental", wrong: ["beneficial", "resilient", "plausible"], explanation: "'Detrimental' means causing harm." },
  ],
  WORD_CHOICE: [
    { prompt: "Remote work has ___ from a niche arrangement into the mainstream.", correct: "shifted", wrong: ["turned", "moved", "converted"], explanation: "'Shift from X to Y' is the natural collocation for a gradual change." },
    { prompt: "The new manager quickly ___ herself as a fair leader.", correct: "established", wrong: ["founded", "built", "formed"], explanation: "'Establish oneself as' is the natural collocation." },
    { prompt: "The evidence strongly ___ his version of events.", correct: "supports", wrong: ["holds", "carries", "maintains"], explanation: "'Support' collocates naturally with 'evidence'." },
    { prompt: "The company had to ___ several difficult decisions during the crisis.", correct: "make", wrong: ["take", "do", "have"], explanation: "'Make a decision' is the correct collocation (not 'take')." },
    { prompt: "Her argument ___ on the assumption that costs would stay low.", correct: "rests", wrong: ["sits", "stands", "lies"], explanation: "'Rest on an assumption' is the natural collocation." },
    { prompt: "The two proposals ___ significantly in terms of cost.", correct: "differ", wrong: ["differentiate", "vary from", "contrast"], explanation: "'Differ' is the correct verb for two things being unlike each other." },
  ],
  REGISTER: [
    { prompt: "Formal email closing — which is appropriate?", correct: "I look forward to hearing from you.", wrong: ["Can't wait to hear back!", "Talk soon!", "Later!"], explanation: "Formal register requires full forms and no casual expressions." },
    { prompt: "Formal complaint opening — which is appropriate?", correct: "I am writing to express my dissatisfaction with...", wrong: ["I'm so annoyed about...", "Just wanted to say...", "Hey, quick complaint..."], explanation: "Formal writing avoids contractions and casual openers." },
    { prompt: "Informal message to a friend — which fits best?", correct: "Can't wait to see you this weekend!", wrong: ["I would be delighted to see you this weekend.", "I am writing to confirm our meeting.", "Please find attached my availability."], explanation: "Informal register suits contractions and casual enthusiasm between friends." },
    { prompt: "Formal proposal — which phrase fits best?", correct: "It is recommended that the budget be increased.", wrong: ["I reckon we should spend more.", "Let's just throw more money at it.", "We gotta increase the budget."], explanation: "Formal proposals use passive/impersonal structures, not casual phrasing." },
    { prompt: "Which is too informal for a formal report?", correct: "The results were kind of surprising, to be honest.", wrong: ["The results were unexpected.", "The findings were unanticipated.", "The outcome diverged from projections."], explanation: "'Kind of' and 'to be honest' are conversational fillers unsuitable for formal reports." },
  ],
  SPELLING: [
    { prompt: "Choose the correctly spelled word.", correct: "definitely", wrong: ["definately", "definitly", "defintely"], explanation: "'Definitely' is one of the most commonly misspelled English words." },
    { prompt: "Choose the correctly spelled word.", correct: "receive", wrong: ["recieve", "receve", "receeve"], explanation: "'i before e except after c' — receive follows the 'after c' rule." },
    { prompt: "Choose the correctly spelled word.", correct: "occurred", wrong: ["occured", "ocurred", "occureed"], explanation: "'Occur' doubles the 'r' before adding '-ed'." },
    { prompt: "Choose the correctly spelled word.", correct: "separate", wrong: ["seperate", "separete", "seprate"], explanation: "Remember: there's 'a rat' in sep-a-rate." },
    { prompt: "Choose the correctly spelled word.", correct: "environment", wrong: ["enviroment", "envirnoment", "enviornment"], explanation: "Don't forget the 'n' before 'ment' in environment." },
  ],
  COHESION: [
    { prompt: "___ the budget was tight, the event was a success.", correct: "Although", wrong: ["Despite", "In spite of", "Because of"], explanation: "'Although' is followed by a clause; 'Despite/In spite of' need a noun phrase." },
    { prompt: "Sales fell in Q1; ___, profits rose due to lower costs.", correct: "nonetheless", wrong: ["moreover", "furthermore", "similarly"], explanation: "'Nonetheless' signals an unexpected contrast." },
    { prompt: "The proposal was rejected ___ its high cost was never justified.", correct: "on the grounds that", wrong: ["provided that", "as opposed to", "in addition to"], explanation: "'On the grounds that' introduces the reason for a decision." },
    { prompt: "You may attend the event, ___ you register in advance.", correct: "provided that", wrong: ["unless", "despite", "whereas"], explanation: "'Provided that' introduces a necessary condition." },
    { prompt: "The two departments have very different priorities, ___ collaboration difficult.", correct: "making", wrong: ["makes", "made", "to make"], explanation: "A participle clause (-ing) is used to add a consequence without repeating the subject." },
  ],
};

function genericFiller(category: ErrorCategory, variant: Variant): Omit<GeneratedQuestion, "order"> {
  const { options, correctAnswer } = fixOptionLabelling(variant.correct, [variant.correct, ...variant.wrong]);
  return {
    prompt: variant.prompt,
    questionType: "MULTIPLE_CHOICE",
    options,
    correctAnswer,
    explanation: variant.explanation,
  };
}

export async function generateQuestions(
  categories: ErrorCategory[],
  count: number
): Promise<GeneratedQuestion[]> {
  const fromBank = await assembleFromBank(categories, count);
  if (fromBank.length >= count) return fromBank;

  const missing = count - fromBank.length;

  // Build a shuffled pool of (category, variant) pairs across all requested
  // categories so filler items are varied even when several categories mix.
  const pool: { category: ErrorCategory; variant: Variant }[] = [];
  for (const category of categories) {
    for (const variant of FILLER_POOLS[category] ?? []) {
      pool.push({ category, variant });
    }
  }
  pool.sort(() => Math.random() - 0.5);

  const filler: GeneratedQuestion[] = [];
  for (let i = 0; i < missing; i++) {
    const entry = pool.length > 0 ? pool[i % pool.length] : null;
    const category = entry?.category ?? categories[i % categories.length] ?? "OTHER";
    const variant = entry?.variant ?? {
      prompt: "Review this category in the Grammar module for a full explanation.",
      correct: "—",
      wrong: [],
      explanation: "No practice item available yet for this category.",
    };
    const built = genericFiller(category, variant);
    filler.push({ ...built, order: fromBank.length + i + 1, grammarCategory: category });
  }

  return [...fromBank, ...filler];
}
