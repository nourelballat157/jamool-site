import quran from "@/data/quran.json";

/**
 * Metadata for the memorisation journey ("رحلة الحفظ").
 * Verse text and global ayah numbers live in `quran.json` (used exactly as stored);
 * this file only adds the kid-friendly layer around it.
 */

export type QuranAyah = { n: number; g: number; t: string };

type RawSurah = { id: number; name: string; en: string; count: number; ayahs: QuranAyah[] };
const raw = quran as unknown as Record<string, RawSurah>;

export type SurahMeta = {
  id: string;
  /** Arabic name without the word "سورة" (matches the existing list on the Quran page). */
  name: string;
  meaning: string;
  count: number;
  gist: string;
  ayahs: QuranAyah[];
};

const BASE: { id: string; name: string; meaning: string; gist: string }[] = [
  { id: "112", name: "الإخلاص", meaning: "التوحيد", gist: "نتعلّم أنّ الله واحد أحد، لا شريك له ولا يشبهه شيء." },
  { id: "113", name: "الفلق", meaning: "الاستعاذة", gist: "نلجأ إلى ربّ الفجر ليحفظنا من كل شرّ." },
  { id: "114", name: "الناس", meaning: "حصن المسلم", gist: "نطلب من ربّ الناس أن يحمينا من وسوسة الشيطان." },
  { id: "108", name: "الكوثر", meaning: "الخير الكثير", gist: "الله أعطى نبيَّه خيرًا كثيرًا، فنصلّي له ونشكره." },
  { id: "103", name: "العصر", meaning: "قيمة الوقت", gist: "الوقت ثمين، والرابحون هم الذين يؤمنون ويعملون الخير." },
  { id: "110", name: "النصر", meaning: "نصر الله والفتح", gist: "إذا جاء نصر الله فلنسبّح بحمد ربّنا ونستغفره." },
  { id: "109", name: "الكافرون", meaning: "الثبات على الدين", gist: "نعبد الله وحده ونحترم غيرنا، ولكلٍّ دينه." },
  { id: "106", name: "قريش", meaning: "نعمة الأمان", gist: "الله أطعم قريشًا وآمنهم، فليعبدوا ربّ هذا البيت." },
  { id: "105", name: "الفيل", meaning: "حماية البيت", gist: "حمى الله الكعبة وردّ جيش الفيل بقدرته." },
  { id: "111", name: "المسد", meaning: "عاقبة العناد", gist: "من عادى الحقّ وآذى الناس خسر وخاب سعيه." },
  { id: "107", name: "الماعون", meaning: "الإحسان للآخرين", gist: "نصلّي بخشوع ونحسن إلى اليتيم والمسكين ونعاون الناس." },
  { id: "1", name: "الفاتحة", meaning: "أمّ الكتاب", gist: "نحمد الله ونسأله الهداية إلى الطريق المستقيم." },
];

/** Suggested learning order: easy to longer. */
export const hifzSurahs: SurahMeta[] = BASE.map((b) => ({
  ...b,
  count: raw[b.id].count,
  ayahs: raw[b.id].ayahs,
}));

export const getSurahMeta = (id: string | undefined): SurahMeta | null =>
  hifzSurahs.find((s) => s.id === id) ?? null;

export const hifzIndex = (id: string) => hifzSurahs.findIndex((s) => s.id === id);

/** Reciter audio for one ayah (Mishary Alafasy, 128 kbps). `g` is the global ayah number. */
export const ayahAudio = (g: number) => `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${g}.mp3`;

/* ----------------------------- progress ------------------------------- */

export type QuranRecord = { stage: number; verse: number; reps: number; updatedAt: number };

export const STAGES_TOTAL = 3;
export const REPS_PER_VERSE = 3;

/** Smooth 0..1 progress across the three stages. `stage` = completed stages (0..3). */
export function surahProgress(rec: QuranRecord | undefined, count: number): number {
  if (!rec) return 0;
  if (rec.stage >= STAGES_TOTAL) return 1;
  const verse = Math.max(0, Math.min(rec.verse, count));
  const inner = rec.stage === 1 ? (verse + Math.min(rec.reps, REPS_PER_VERSE) / REPS_PER_VERSE) / count : verse / count;
  return Math.min(1, (rec.stage + Math.min(inner, 1)) / STAGES_TOTAL);
}

export type SurahStatus = "new" | "learning" | "done";

export function surahStatus(rec: QuranRecord | undefined): SurahStatus {
  if (!rec) return "new";
  if (rec.stage >= STAGES_TOTAL) return "done";
  return rec.stage > 0 || rec.verse > 0 || rec.reps > 0 ? "learning" : "new";
}

export const todayKey = (d = new Date()) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const dayNumber = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
};

/** Whole days since a yyyy-mm-dd date (0 = today). */
export const daysSince = (iso: string, now = new Date()) => dayNumber(todayKey(now)) - dayNumber(iso);

/**
 * Last time a finished surah was reviewed (yyyy-mm-dd): the latest of the daily
 * review rewards (`quran-review:<id>:<date>`) and the day the surah was completed.
 */
export function lastReviewOf(id: string, earned: Record<string, number>): string | null {
  const prefix = `quran-review:${id}:`;
  const dates = Object.keys(earned)
    .filter((key) => key.startsWith(prefix))
    .map((key) => key.slice(prefix.length));
  const doneAt = earned[`quran-done:${id}`];
  if (doneAt) dates.push(todayKey(new Date(doneAt)));
  // yyyy-mm-dd strings sort chronologically
  return dates.length > 0 ? dates.sort()[dates.length - 1] : null;
}

/** Arabic-Indic digits: 12 → ١٢ */
export const arNum = (value: number): string =>
  String(Math.round(value)).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** "٤ آيات" with correct Arabic plural forms. */
export const versesLabel = (count: number): string => {
  if (count === 1) return "آية واحدة";
  if (count === 2) return "آيتان";
  return `${arNum(count)} ${count <= 10 ? "آيات" : "آية"}`;
};
