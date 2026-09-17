// Official Cambridge English Speaking assessment framework, paraphrased
// from the publicly available teacher handbooks (e.g. the B2 First
// Handbook, "Speaking Assessment" chapter). Candidates are scored by an
// assessor applying four analytical criteria, each 0-5, plus a separate
// Global Achievement mark from the interlocutor — this is the actual
// structure examiners use, reproduced here as structural/factual assessment
// criteria (not exam questions or transcripts) to ground the AI evaluator.
//
// The four criteria are the same across the whole A2-C2 exam suite; only
// the expected performance at each band shifts with level. The band-5
// (top-of-range) descriptor below is Cambridge's own B2 First wording,
// used as the calibration anchor for "what full marks looks like at this
// candidate's own target level" — the AI is instructed to scale the bar
// down or up for other levels rather than applying B2's bar universally.

export const SPEAKING_CRITERIA = [
  {
    name: "Grammar and Vocabulary",
    description:
      "Range and accuracy of grammatical forms and vocabulary, and how effectively they are used to give and exchange views on both familiar and unfamiliar topics.",
  },
  {
    name: "Discourse Management",
    description:
      "The extent, relevance, coherence and organisation of a candidate's contributions, including the length of individual turns.",
  },
  {
    name: "Pronunciation",
    description:
      "Stress, rhythm, intonation and how clearly individual sounds are articulated — how much effort a listener needs to make to understand.",
  },
  {
    name: "Interactive Communication",
    description:
      "The ability to interact with the other speaker(s): initiating and responding appropriately, maintaining and developing the conversation, and negotiating towards an outcome.",
  },
];

export const SPEAKING_TOP_BAND_EXAMPLE =
  "Official Cambridge top-band (5) descriptor, shown here as a calibration anchor (this exact wording is B2 First's; " +
  "scale the expectations up for C1/C2 and down for A2/B1 rather than treating it as a universal bar): " +
  "Grammar and Vocabulary — shows a good degree of control of a range of simple and some complex grammatical forms, " +
  "uses a range of appropriate vocabulary to give and exchange views on a wide range of familiar topics. " +
  "Discourse Management — produces extended stretches of language with very little hesitation, contributions are " +
  "relevant and there is a clear organisation of ideas, uses a range of cohesive devices and discourse markers. " +
  "Pronunciation — is intelligible, intonation is appropriate, sentence and word stress is accurately placed, " +
  "individual sounds are articulated clearly. Interactive Communication — initiates and responds appropriately, " +
  "linking contributions to those of other speakers, maintains and develops the interaction and negotiates towards " +
  "an outcome.";

/** Renders the Speaking assessment framework as compact prompt text for the AI examiner. */
export function formatSpeakingScaleForPrompt(): string {
  const criteria = SPEAKING_CRITERIA.map((c) => `${c.name}: ${c.description}`).join("\n");
  return (
    "Official Cambridge Speaking assessment framework (use this exact structure, do not invent your own criteria):\n" +
    `${criteria}\n\n${SPEAKING_TOP_BAND_EXAMPLE}`
  );
}
