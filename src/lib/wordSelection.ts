// Pure validation for WordCapture's text-selection popover, kept separate
// from the component so it's unit-testable without a DOM/jsdom environment.
//
// Deliberately permissive about length: a single word, a phrasal verb, or a
// full sentence with normal punctuation (commas, periods, quotes...) are all
// valid things to translate or add to the dictionary — only rejects
// selections that are clearly not prose (numbers, code, URLs) or absurdly
// long (a whole paragraph, which would make for a useless dictionary entry
// and an expensive translation call).

const MAX_CHARS = 280;
// Digits and code/markup-ish symbols — real prose selections don't need
// these, so their presence is a good signal the selection isn't meant to be
// looked up (a price, a code snippet, a URL fragment...).
const INVALID_CHARS = /[0-9{}[\]<>=\\/@#$%^&*_~`|]/;
const HAS_LETTER = /[A-Za-zÀ-ÿ]/;

/** Whether a raw text selection is worth offering to translate/add to the personal dictionary. */
export function isValidWordSelection(rawText: string): boolean {
  const text = rawText.trim();
  if (!text) return false;
  if (text.length > MAX_CHARS) return false;
  if (INVALID_CHARS.test(text)) return false;
  return HAS_LETTER.test(text);
}
