const LETTER = /[ء-يٱ]/;
const LETTERS = /[ء-يٱ]/g;

/**
 * Splits an ayah into words exactly as stored. Tokens that hold only a
 * pause/recitation mark (no letters) are glued to the previous word.
 */
export function splitWords(text: string): string[] {
  const words: string[] = [];
  text
    .split(/\s+/)
    .filter(Boolean)
    .forEach((token) => {
      if (!LETTER.test(token) && words.length > 0) {
        words[words.length - 1] = `${words[words.length - 1]} ${token}`;
      } else {
        words.push(token);
      }
    });
  return words;
}

/** Share of the audio each word takes (by letter count), summing to 1. */
export function wordShares(words: string[]): number[] {
  const weights = words.map((w) => Math.max(1, (w.match(LETTERS) ?? []).length));
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / total);
}

/**
 * Which word is being recited at `progress` (0..1 of the audio file).
 * Reciter files start almost at once and end with a little silence, so the
 * spoken part is mapped to roughly 3%–94% of the file.
 */
export function activeWordAt(shares: number[], progress: number): number {
  const spoken = Math.min(1, Math.max(0, (progress - 0.03) / 0.91));
  let edge = 0;
  for (let i = 0; i < shares.length; i += 1) {
    edge += shares[i];
    if (spoken <= edge + 1e-6) return i;
  }
  return shares.length - 1;
}

export type BankWord = { id: number; text: string };

/** Shuffled copy of the words (never in reading order when there are 2+ words). */
export function shuffledBank(words: string[]): BankWord[] {
  const items: BankWord[] = words.map((text, id) => ({ id, text }));
  if (items.length < 2) return items;
  let out = items;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    out = [...items];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    if (out.some((item, i) => item.text !== items[i].text)) break;
  }
  return out;
}
