import { childStories, gameList } from "@/mocks/child";
import { extraGames } from "@/pages/games/extraGames";
import { values } from "@/mocks/home";
import { hifzSurahs } from "@/data/quranSurahs";
import type { CategoryId } from "@/data/brand";

/**
 * Every activity in the product as one catalogue: used by the Explore page (age + world filters),
 * the home "suggested adventures" and any "what next?" suggestion. Routes are the real ones.
 */
export type Adventure = {
  id: string;
  category: CategoryId;
  /** short label of the kind: قصة / لعبة / نشاط / تحدٍّ / قيمة / سورة */
  kind: string;
  title: string;
  desc: string;
  to: string;
  ageMin: number;
  ageMax: number;
  minutes: number;
  image?: string;
  /** progress key in the store, when one exists (done = points awarded) */
  doneKey?: string;
};

const toNum = (s: string) =>
  Number(
    s
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/\D/g, "") || 0
  );

const ageRange = (s: string): [number, number] => {
  const nums = s.match(/[٠-٩0-9]+/g)?.map(toNum) ?? [4, 8];
  return [nums[0] ?? 4, nums[1] ?? nums[0] ?? 8];
};

const GAME_META: Record<string, { age: [number, number]; minutes: number }> = {
  memory: { age: [4, 8], minutes: 3 },
  color: { age: [3, 6], minutes: 2 },
  letters: { age: [4, 7], minutes: 3 },
  numbers: { age: [4, 7], minutes: 2 },
  plant: { age: [3, 7], minutes: 4 },
  feed: { age: [3, 6], minutes: 3 },
  honest: { age: [4, 9], minutes: 4 },
  word: { age: [5, 9], minutes: 4 },
  shadow: { age: [4, 8], minutes: 3 },
};

const stories: Adventure[] = childStories.map((s) => {
  const [a, b] = ageRange(s.age);
  return {
    id: `story-${s.id}`,
    category: "stories",
    kind: "قصة",
    title: s.title,
    desc: s.subtitle,
    to: `/stories/${s.id}`,
    ageMin: a,
    ageMax: b,
    minutes: toNum(s.minutes) || 5,
    image: s.image,
    doneKey: `story:${s.id}`,
  };
});

const games: Adventure[] = [...gameList, ...extraGames].map((g) => {
  const m = GAME_META[g.id] ?? { age: [4, 8] as [number, number], minutes: 3 };
  return {
    id: `game-${g.id}`,
    category: "games",
    kind: "لعبة",
    title: g.title,
    desc: g.desc,
    to: `/games?game=${g.id}`,
    ageMin: m.age[0],
    ageMax: m.age[1],
    minutes: m.minutes,
    image: `/img/games/${g.id}.webp`,
    doneKey: `game:${g.id}`,
  };
});

const valueAdventures: Adventure[] = values.map((v) => ({
  id: `value-${v.id}`,
  category: "values",
  kind: "قيمة",
  title: `بذرة ${v.title}`,
  desc: `${v.desc}، موقف صغير واختيار يُنبت زهرة.`,
  to: `/values/${v.id}`,
  ageMin: 4,
  ageMax: 10,
  minutes: 6,
  doneKey: `value-done:${v.id}`,
}));

const surahs: Adventure[] = hifzSurahs.map((s) => ({
  id: `surah-${s.id}`,
  category: "surahs",
  kind: "سورة",
  title: `سورة ${s.name}`,
  desc: s.meaning,
  to: `/quran/${s.id}`,
  ageMin: 5,
  ageMax: 12,
  minutes: 5,
  doneKey: `quran-done:${s.id}`,
}));

const others: Adventure[] = [
  { id: "learn-letters", category: "learning", kind: "نشاط", title: "تتبّع الحروف", desc: "اكتب الحرف بإصبعك واسمع نطقه.", to: "/learning", ageMin: 3, ageMax: 7, minutes: 4 },
  { id: "quiz-challenge", category: "competitions", kind: "تحدٍّ", title: "تحدّي المعلومات", desc: "أسئلة قصيرة ونجوم بانتظارك.", to: "/competitions/quiz", ageMin: 6, ageMax: 12, minutes: 5 },
  { id: "art-free", category: "art", kind: "نشاط", title: "لوحة حرّة مع مها", desc: "ارسم ما يخطر في بالك واحفظ لوحتك.", to: "/drawing", ageMin: 3, ageMax: 12, minutes: 8 },
  { id: "ai-lab", category: "ai", kind: "نشاط", title: "مختبر أفكار زيزو", desc: "اختر بطلًا ومكانًا وزيزو يركّب لك فكرة.", to: "/ai", ageMin: 4, ageMax: 12, minutes: 3 },
];

export const adventures: Adventure[] = [...stories, ...games, ...others, ...valueAdventures, ...surahs];

export const AGE_GROUPS = [
  { id: "all", label: "كل الأعمار", min: 0, max: 99 },
  { id: "3-5", label: "٣ – ٥ سنوات", min: 3, max: 5 },
  { id: "6-8", label: "٦ – ٨ سنوات", min: 6, max: 8 },
  { id: "9-12", label: "٩ – ١٢ سنة", min: 9, max: 12 },
] as const;

export type AgeGroupId = (typeof AGE_GROUPS)[number]["id"];

export const fitsAge = (a: Adventure, group: AgeGroupId) => {
  const g = AGE_GROUPS.find((x) => x.id === group)!;
  if (g.id === "all") return true;
  return a.ageMin <= g.max && a.ageMax >= g.min;
};

export const ageLabel = (a: Adventure) => `${a.ageMin.toLocaleString("ar-EG")} – ${a.ageMax.toLocaleString("ar-EG")} سنوات`;
