// Browser speechSynthesis exposes several installed voices (varies by OS/
// browser — usually at least 2-4 English ones on Windows/Chrome, fewer on
// some Firefox/Safari setups). By default every SpeechSynthesisUtterance
// uses the browser's single default voice, so a two-speaker dialogue sounds
// exactly the same for both people. This picks distinct voices deterministically
// so the same speaker/exercise always sounds the same across replays.

let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve([]);

  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (resolved) return;
      resolved = true;
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(voices);
    };
    const handler = () => finish(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Some browsers never fire voiceschanged (or already had voices ready) —
    // don't hang forever waiting for it.
    setTimeout(() => finish(window.speechSynthesis.getVoices()), 500);
  });
}

/** English voices available in this browser, sorted best-quality-first (see voiceQualityRank), cached for the session. Falls back to all voices if none are tagged English. */
export async function getEnglishVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!voicesPromise) voicesPromise = loadVoices();
  const voices = await voicesPromise;
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = english.length > 0 ? english : voices;
  return [...pool].sort((a, b) => voiceQualityRank(a) - voiceQualityRank(b));
}

// The local, offline voices bundled with an OS (classic Windows SAPI voices
// like "Microsoft David"/"Zira") sound noticeably more robotic than the
// cloud-backed or newer neural ones some browsers also expose (Edge's
// "... Online (Natural)" voices, Chrome's "Google US English", etc.). The
// Web Speech API gives no explicit quality field, so this is a heuristic:
// prefer voices flagged as *not* localService (typically network/cloud
// voices) or whose name signals a newer neural engine.
function voiceQualityRank(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  if (name.includes("natural") || name.includes("neural")) return 0;
  if (v.localService === false) return 1;
  return 2;
}

/** The best quality-tier subset of `voices` (see voiceQualityRank), widened until it has at least `min` entries so there's still room for distinct speaker voices. */
export function bestVoicePool(voices: SpeechSynthesisVoice[], min = 2): SpeechSynthesisVoice[] {
  if (voices.length <= min) return voices;
  const ranked = [...voices].sort((a, b) => voiceQualityRank(a) - voiceQualityRank(b));
  let cutoff = voiceQualityRank(ranked[0]);
  let pool = ranked.filter((v) => voiceQualityRank(v) <= cutoff);
  while (pool.length < min && cutoff < 2) {
    cutoff += 1;
    pool = ranked.filter((v) => voiceQualityRank(v) <= cutoff);
  }
  return pool;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic pick from `voices` for a given key (e.g. "exerciseId:speakerName") — same key always gets the same voice. */
export function pickVoice(voices: SpeechSynthesisVoice[], key: string): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;
  return voices[hashString(key) % voices.length];
}

const DIALOGUE_LINE = /^([A-Z][a-zA-Z']{1,20}):\s*(.+)$/;

export type DialogueSegment = { speaker: string | null; line: string };

/**
 * Splits a transcript into per-speaker segments if it looks like a dialogue
 * (most lines start with "Name: ..."), otherwise returns it as one segment.
 */
export function splitDialogue(text: string): DialogueSegment[] {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const matches = lines.map((l) => l.match(DIALOGUE_LINE));
  const dialogueLineCount = matches.filter(Boolean).length;
  const isDialogue = lines.length > 1 && dialogueLineCount >= Math.max(2, Math.ceil(lines.length * 0.6));

  if (!isDialogue) return [{ speaker: null, line: text.trim() }];

  return lines.map((line, i) => {
    const m = matches[i];
    return m ? { speaker: m[1], line: m[2] } : { speaker: null, line };
  });
}
