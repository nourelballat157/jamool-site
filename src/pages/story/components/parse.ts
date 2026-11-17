export type Gender = "m" | "f";

export type Token = {
  /** the visible word (for vocabulary words, the marked word) */
  text: string;
  /** punctuation glued after a vocabulary word */
  suffix?: string;
  /** meaning, present only for vocabulary words */
  meaning?: string;
};

/** Western digits to Arabic-Indic digits, to match the rest of the site. */
export const arDigits = (value: number | string): string =>
  String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** Guess the child's gender from the avatar picture (the site only has boy / girl avatars). */
export const genderFromAvatar = (avatar: string): Gender =>
  /girl/i.test(avatar) ? "f" : "m";

/**
 * Resolves `{name}` and `[masc|fem]` markup. Vocabulary markup `{word|meaning}`
 * is left untouched so it can be tokenized afterwards.
 */
export function resolveText(text: string, name: string, gender: Gender): string {
  return text
    .replace(/\{name\}/g, name)
    .replace(/\[([^\]|]*)\|([^\]]*)\]/g, (_m, masc: string, fem: string) =>
      gender === "f" ? fem : masc
    );
}

/** Splits resolved text into words; vocabulary words keep their meaning. */
export function tokenize(resolved: string): Token[] {
  const tokens: Token[] = [];
  const vocab = /\{([^|}]+)\|([^}]+)\}([^\s{]*)/g;
  const pushPlain = (chunk: string) => {
    chunk
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => tokens.push({ text: word }));
  };

  let last = 0;
  let match: RegExpExecArray | null = vocab.exec(resolved);
  while (match) {
    pushPlain(resolved.slice(last, match.index));
    tokens.push({ text: match[1], meaning: match[2], suffix: match[3] || undefined });
    last = vocab.lastIndex;
    match = vocab.exec(resolved);
  }
  pushPlain(resolved.slice(last));
  return tokens;
}

export const tokenWord = (token: Token): string => `${token.text}${token.suffix ?? ""}`;

/** Plain text for the text-to-speech engine. */
export const plainText = (tokens: Token[]): string => tokens.map(tokenWord).join(" ");

/** Rough reading time of one word (ms), matched to the slow child-friendly TTS pace. */
export function wordDuration(word: string): number {
  let ms = 260 + word.replace(/[^؀-ۿ]/g, "").length * 62;
  if (/[.!؟?]$/.test(word)) ms += 380;
  else if (/[،,:؛]$/.test(word)) ms += 220;
  return ms;
}
