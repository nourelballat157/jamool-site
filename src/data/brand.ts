/**
 * Jamool brand data: the official cast, the nine category worlds and their colour roles.
 * Source of truth: "الملف المقترح لهوية منصة جمول" (brand identity PDF, 2026).
 */

export type CharacterId = "jamool" | "thaloob" | "zizo" | "noor" | "maha";

export type CharacterInfo = {
  id: CharacterId;
  name: string;
  role: string; // short title shown under the name
  tagline: string; // one warm line, in the character's voice
  skills: string[];
  to: string; // the world the character leads
  src: string;
  small: string;
  /** natural width / height of the artwork, used to avoid layout shift */
  ratio: number;
  tone: ToneId;
};

export const characters: Record<CharacterId, CharacterInfo> = {
  jamool: {
    id: "jamool",
    name: "جمّول",
    role: "قائد الرحلة",
    tagline: "حقيبتي جاهزة، فهيا نكتشف معًا!",
    skills: ["القصص", "التعلّم", "الاستكشاف"],
    to: "/stories",
    src: "/brand/jamool.webp",
    small: "/brand/jamool-sm.webp",
    ratio: 568 / 900,
    tone: "amber",
  },
  thaloob: {
    id: "thaloob",
    name: "ثعلوب",
    role: "بطل التحديات",
    tagline: "لكل لغز حلّ، وأنا أحبّ البحث عنه.",
    skills: ["الألعاب", "الألغاز", "التحديات"],
    to: "/games",
    src: "/brand/thaloob.webp",
    small: "/brand/thaloob-sm.webp",
    ratio: 637 / 900,
    tone: "secondary",
  },
  zizo: {
    id: "zizo",
    name: "زيزو",
    role: "المساعد الذكي",
    tagline: "بيب بوب! عندي فكرة لك.",
    skills: ["الأفكار", "الأسئلة", "الاستكشاف"],
    to: "/ai",
    src: "/brand/zizo.webp",
    small: "/brand/zizo-sm.webp",
    ratio: 797 / 900,
    tone: "sky",
  },
  noor: {
    id: "noor",
    name: "نور",
    role: "صديقة القيم",
    tagline: "الكلمة الطيبة تصنع فرقًا كبيرًا.",
    skills: ["القيم", "قصار السور", "الإرشاد"],
    to: "/values",
    src: "/brand/noor.webp",
    small: "/brand/noor-sm.webp",
    ratio: 721 / 900,
    tone: "violet",
  },
  maha: {
    id: "maha",
    name: "مها",
    role: "فنانة الألوان",
    tagline: "الورقة البيضاء تنتظر خيالك.",
    skills: ["الرسم", "التلوين", "الإبداع"],
    to: "/drawing",
    src: "/brand/maha.webp",
    small: "/brand/maha-sm.webp",
    ratio: 467 / 900,
    tone: "accent",
  },
};

export const characterList = Object.values(characters);

/* ---------- colour roles per category (Tailwind needs literal class strings) ---------- */

export type ToneId = "violet" | "sky" | "accent" | "secondary" | "amber" | "leaf" | "primary";

export type ToneClasses = {
  /** soft icon tile: tinted background + readable glyph */
  tile: string;
  /** strong fill with a readable label */
  solid: string;
  /** very soft section / card background */
  soft: string;
  /** slightly stronger tint, for chips */
  chip: string;
  text: string;
  bar: string;
  ring: string;
  border: string;
  hex: string;
};

export const tones: Record<ToneId, ToneClasses> = {
  violet: { tile: "bg-violet-100 text-violet-600", solid: "bg-violet-500 text-white", soft: "bg-violet-50", chip: "bg-violet-100 text-violet-700", text: "text-violet-700", bar: "bg-violet-500", ring: "ring-violet-200", border: "border-violet-200", hex: "#8D6BEB" },
  sky: { tile: "bg-sky-100 text-sky-600", solid: "bg-sky-500 text-white", soft: "bg-sky-50", chip: "bg-sky-100 text-sky-700", text: "text-sky-700", bar: "bg-sky-500", ring: "ring-sky-200", border: "border-sky-200", hex: "#2F7BEA" },
  accent: { tile: "bg-accent-100 text-accent-600", solid: "bg-accent-500 text-white", soft: "bg-accent-50", chip: "bg-accent-100 text-accent-700", text: "text-accent-700", bar: "bg-accent-500", ring: "ring-accent-200", border: "border-accent-200", hex: "#1E9E96" },
  secondary: { tile: "bg-secondary-100 text-secondary-600", solid: "bg-secondary-500 text-white", soft: "bg-secondary-50", chip: "bg-secondary-100 text-secondary-700", text: "text-secondary-700", bar: "bg-secondary-500", ring: "ring-secondary-200", border: "border-secondary-200", hex: "#F0563A" },
  amber: { tile: "bg-amber-100 text-amber-600", solid: "bg-amber-500 text-foreground-900", soft: "bg-amber-50", chip: "bg-amber-100 text-amber-700", text: "text-amber-700", bar: "bg-amber-500", ring: "ring-amber-200", border: "border-amber-200", hex: "#F5A63A" },
  leaf: { tile: "bg-leaf-100 text-leaf-600", solid: "bg-leaf-500 text-white", soft: "bg-leaf-50", chip: "bg-leaf-100 text-leaf-700", text: "text-leaf-700", bar: "bg-leaf-500", ring: "ring-leaf-200", border: "border-leaf-200", hex: "#3E9E6A" },
  primary: { tile: "bg-primary-100 text-primary-700", solid: "bg-primary-500 text-foreground-900", soft: "bg-primary-50", chip: "bg-primary-100 text-primary-800", text: "text-primary-800", bar: "bg-primary-500", ring: "ring-primary-200", border: "border-primary-200", hex: "#FFC43D" },
};

export type CategoryId =
  | "stories"
  | "learning"
  | "surahs"
  | "games"
  | "art"
  | "ai"
  | "values"
  | "competitions"
  | "video";

export type Category = {
  id: CategoryId;
  label: string;
  short: string; // a two-word invitation, child friendly
  to: string;
  icon: string; // ri-* class (rendered as Material Symbols Rounded)
  tone: ToneId;
  character: CharacterId;
};

export const categories: Category[] = [
  { id: "stories", label: "القصص", short: "هيا نقرأ حكاية", to: "/stories", icon: "ri-book-open-line", tone: "violet", character: "jamool" },
  { id: "learning", label: "الحروف والأرقام", short: "نتعلّم ونلعب", to: "/learning", icon: "ri-school-line", tone: "sky", character: "jamool" },
  { id: "surahs", label: "قصار السور", short: "نقرأ بهدوء", to: "/quran", icon: "ri-book-2-line", tone: "accent", character: "noor" },
  { id: "games", label: "الألعاب", short: "تعال نجرّب", to: "/games", icon: "ri-gamepad-line", tone: "secondary", character: "thaloob" },
  { id: "art", label: "الرسم والتلوين", short: "لوّن خيالك", to: "/drawing", icon: "ri-palette-line", tone: "amber", character: "maha" },
  { id: "ai", label: "عالم زيزو", short: "اسأل زيزو", to: "/ai", icon: "ri-robot-2-line", tone: "sky", character: "zizo" },
  { id: "values", label: "حديقة القيم", short: "نزرع الخير", to: "/values", icon: "ri-plant-line", tone: "leaf", character: "noor" },
  { id: "competitions", label: "المسابقات", short: "أرني ما تعرف", to: "/competitions", icon: "ri-trophy-line", tone: "primary", character: "thaloob" },
  { id: "video", label: "الفيديو والمحتوى", short: "شاهد واستمتع", to: "/explore", icon: "ri-movie-2-line", tone: "secondary", character: "jamool" },
];

export const categoryById = (id: CategoryId): Category => categories.find((c) => c.id === id)!;

/** Map a category to the route it should link to, for pages that only know the id */
export const toneOf = (id: ToneId): ToneClasses => tones[id];

/** Children pick one of the five friends as their profile picture (square, tinted background). */
export const avatarChoices = (['jamool', 'thaloob', 'zizo', 'noor', 'maha'] as CharacterId[]).map((id) => ({ id, name: characters[id].name, src: `/brand/avatar-${id}.webp` }));
