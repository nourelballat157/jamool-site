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

/** letters folded so أحمد / احمد and فاطمة / فاطمه compare equal */
const fold = (text: string): string =>
  text
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();

const FEMALE_NAMES = new Set(
  [
    "سارة", "مريم", "ريم", "سلمى", "ليلى", "نور", "لينا", "هند", "جنى", "رهف", "زينب", "ملك", "لمى", "شهد", "رنا", "روان", "جود",
    "لين", "هيا", "سما", "دانة", "غادة", "تالا", "ريما", "رزان", "رغد", "بيان", "أروى", "عبير", "ياسمين", "سلوى", "منى", "هدى",
    "ندى", "سعاد", "آمنة", "أسماء", "إيمان", "ريتاج", "جميلة", "حنين", "رؤى", "سجى", "شيماء", "عائشة", "فاطمة", "خديجة", "هاجر",
    "ميار", "ميرا", "ميسم", "نجوى", "نهى", "وعد", "ولاء", "يارا", "لجين", "لانا", "ليان", "تسنيم", "بسمة", "دعاء", "رند",
  ].map(fold)
);

const MALE_NAMES = new Set(
  [
    "محمد", "أحمد", "يوسف", "عمر", "علي", "عثمان", "خالد", "زياد", "ليث", "سلمان", "فهد", "سعود", "فيصل", "ناصر", "سعد", "ماجد",
    "راشد", "تميم", "حمزة", "أسامة", "معاوية", "طلحة", "حذيفة", "زكريا", "موسى", "عيسى", "يحيى", "مصطفى", "إبراهيم", "إسماعيل",
    "إسحاق", "يعقوب", "آدم", "نوح", "هود", "صالح", "داود", "سليمان", "يونس", "إدريس", "بدر", "رامي", "رائد", "طارق", "وليد", "ياسر",
    "أنس", "بلال", "سلطان", "نايف", "منصور", "مشعل", "عادل", "كريم", "سامي", "تامر", "عبدالرحمن", "ريان", "حسن", "حسين", "جاسم", "مازن", "مالك", "نواف", "هاني", "هشام", "وائل", "تركي", "بندر", "ريان", "غازي",
  ].map(fold)
);

/**
 * The child's gender, used so story verbs, adjectives and pronouns agree with the hero.
 * An explicit choice wins; then the name (a known name, or a name ending in ة); then the picture.
 */
export function genderOfChild(child: { name: string; avatar: string; gender?: Gender }): Gender {
  if (child.gender === "m" || child.gender === "f") return child.gender;
  const first = fold(child.name.split(/s+/)[0] ?? "");
  if (MALE_NAMES.has(first) || first.startsWith("عبد")) return "m";
  if (FEMALE_NAMES.has(first) || /ه$/.test(first)) return "f";
  return genderFromAvatar(child.avatar);
}

/** The five friends: Maha and Noor are girls, the rest are boys (or the robot). */
export const genderFromAvatar = (avatar: string): Gender =>
  /avatar-(maha|noor)|girl/i.test(avatar) ? "f" : "m";

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
