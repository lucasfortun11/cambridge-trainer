import { describe, expect, it } from "vitest";
import { bestVoicePool, pickVoice, splitDialogue } from "./ttsVoices";

function fakeVoice(
  name: string,
  { lang = "en-US", localService = true }: { lang?: string; localService?: boolean } = {}
): SpeechSynthesisVoice {
  return { name, lang, localService } as SpeechSynthesisVoice;
}

describe("splitDialogue", () => {
  it("treats a plain monologue as a single segment", () => {
    const text = "This is just a short monologue about the weather today.";
    expect(splitDialogue(text)).toEqual([{ speaker: null, line: text }]);
  });

  it("splits a two-speaker dialogue into per-line, per-speaker segments", () => {
    const text = [
      "Emma: Hi Jack! It's Emma.",
      "Jack: Hi Emma! I'm fine, thanks.",
      "Emma: Are you still coming this weekend?",
      "Jack: Yes, I am!",
    ].join("\n");
    const segments = splitDialogue(text);
    expect(segments).toEqual([
      { speaker: "Emma", line: "Hi Jack! It's Emma." },
      { speaker: "Jack", line: "Hi Emma! I'm fine, thanks." },
      { speaker: "Emma", line: "Are you still coming this weekend?" },
      { speaker: "Jack", line: "Yes, I am!" },
    ]);
  });

  it("does not misdetect a single line with a colon as a dialogue", () => {
    const text = "Note: remember to bring your passport.";
    expect(splitDialogue(text)).toEqual([{ speaker: null, line: text }]);
  });

  it("tolerates a stray non-speaker line inside an otherwise clear dialogue", () => {
    const text = [
      "Anna: Good morning!",
      "(the phone rings)",
      "Ben: Good morning, Anna.",
      "Anna: How are you today?",
    ].join("\n");
    const segments = splitDialogue(text);
    expect(segments.filter((s) => s.speaker === "Anna")).toHaveLength(2);
    expect(segments.filter((s) => s.speaker === "Ben")).toHaveLength(1);
  });
});

describe("pickVoice", () => {
  const voices = [fakeVoice("Voice A"), fakeVoice("Voice B"), fakeVoice("Voice C")];

  it("returns undefined when there are no voices", () => {
    expect(pickVoice([], "anything")).toBeUndefined();
  });

  it("is deterministic for the same key", () => {
    expect(pickVoice(voices, "Emma")).toBe(pickVoice(voices, "Emma"));
  });

  it("tends to assign different voices to different keys", () => {
    const a = pickVoice(voices, "exercise-1:Emma");
    const b = pickVoice(voices, "exercise-1:Jack");
    // Not a strict guarantee (hash collisions are possible with only 3
    // voices), but Emma/Jack specifically should land on different voices.
    expect(a).not.toBe(b);
  });
});

describe("bestVoicePool", () => {
  it("prefers 'Natural'/neural-named voices over everything else", () => {
    const natural = fakeVoice("Microsoft Ava Online (Natural)", { localService: false });
    const cloud = fakeVoice("Google US English", { localService: false });
    const robotic = fakeVoice("Microsoft David Desktop", { localService: true });
    const pool = bestVoicePool([robotic, cloud, natural], 1);
    expect(pool).toEqual([natural]);
  });

  it("prefers non-local (cloud) voices over local ones when no neural voice exists", () => {
    const cloudA = fakeVoice("Google US English", { localService: false });
    const cloudB = fakeVoice("Google UK English Female", { localService: false });
    const robotic = fakeVoice("Microsoft David Desktop", { localService: true });
    const pool = bestVoicePool([robotic, cloudA, cloudB]);
    expect(pool).toEqual([cloudA, cloudB]);
  });

  it("widens to lower-quality tiers only when the best tier is too small for `min`", () => {
    const natural = fakeVoice("Ava Online (Natural)", { localService: false });
    const cloud = fakeVoice("Google US English", { localService: false });
    const robotic = fakeVoice("Microsoft David Desktop", { localService: true });
    const pool = bestVoicePool([robotic, cloud, natural], 2);
    expect(pool).toEqual([natural, cloud]);
  });

  it("falls back to every voice when only robotic local ones are installed", () => {
    const a = fakeVoice("Microsoft David Desktop", { localService: true });
    const b = fakeVoice("Microsoft Zira Desktop", { localService: true });
    expect(bestVoicePool([a, b])).toEqual([a, b]);
  });

  it("returns the input unchanged when there are fewer voices than `min`", () => {
    const only = [fakeVoice("Only Voice")];
    expect(bestVoicePool(only, 2)).toEqual(only);
  });
});
