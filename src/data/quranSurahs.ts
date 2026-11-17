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
  { id: "97", name: "القدر", meaning: "ليلة القدر", gist: "ليلة عظيمة نزل فيها القرآن، وهي خير من ألف شهر." },
  { id: "94", name: "الشرح", meaning: "مع العسر يسر", gist: "بعد كل صعوبة فرج، فنتفاءل ونتوكّل على الله." },
  { id: "95", name: "التين", meaning: "أحسن تقويم", gist: "الله خلق الإنسان في أحسن صورة، فنؤمن ونعمل الصالحات." },
  { id: "98", name: "البيّنة", meaning: "الدين القيّم", gist: "نعبد الله مخلصين له، ونقيم الصلاة ونؤتي الزكاة." },
  { id: "99", name: "الزلزلة", meaning: "كل عمل يُرى", gist: "كل عمل مهما كان صغيرًا سنراه، فلا نحتقر الخير القليل." },
  { id: "102", name: "التكاثر", meaning: "لا تُلهينا الدنيا", gist: "لا يشغلنا جمع المال والتفاخر عن طاعة الله والآخرة." },
  { id: "104", name: "الهمزة", meaning: "لا نسخر من أحد", gist: "نبتعد عن الغيبة والسخرية من الناس ونحفظ ألسنتنا." },
  { id: "93", name: "الضحى", meaning: "الله لا يتركك", gist: "الله لم يترك نبيّه ولم يكرهه، ويعده بعطاء يرضيه." },
  { id: "100", name: "العاديات", meaning: "شكر النعم", gist: "نشكر الله على نعمه ولا نكون جاحدين." },
  { id: "101", name: "القارعة", meaning: "الأعمال في الميزان", gist: "تثقل الموازين بالأعمال الصالحة، فنكثر منها." },
  { id: "91", name: "الشمس", meaning: "تزكية النفس", gist: "من زكّى نفسه فاز، ومن أهملها خسر، فنختار الخير." },
  { id: "86", name: "الطارق", meaning: "نجم الليل", gist: "الله يحفظ كل إنسان ويعلم ما يفعل، فنراقبه في كل حال." },
  { id: "82", name: "الانفطار", meaning: "السماء تنشقّ", gist: "الله خلقنا فسوّانا، وكل عمل نعمله يكتبه ملائكة كرام." },
  { id: "87", name: "الأعلى", meaning: "تسبيح الربّ الأعلى", gist: "نسبّح ربّنا الأعلى الذي خلق فسوّى وقدّر فهدى." },
  { id: "96", name: "العلق", meaning: "اقرأ", gist: "أول ما نزل من القرآن: اقرأ باسم ربّك، فنحبّ العلم والقراءة." },
  { id: "90", name: "البلد", meaning: "طريق الخير", gist: "طريق الخير: إطعام الجائع ومساعدة المحتاج والصبر والرحمة." },
  { id: "92", name: "الليل", meaning: "العطاء والتقوى", gist: "من أعطى واتّقى يسّره الله لكل خير." },
  { id: "85", name: "البروج", meaning: "الثبات على الإيمان", gist: "نتعلّم من أصحاب الأخدود الصبر على الإيمان وعدم التخلّي عنه." },
  { id: "84", name: "الانشقاق", meaning: "الرجوع إلى الله", gist: "كل إنسان يسعى ثم يلقى ربّه، فنجتهد في الخير." },
  { id: "88", name: "الغاشية", meaning: "أحوال يوم القيامة", gist: "نتأمّل خلق الإبل والسماء والجبال والأرض، فنعرف عظمة الله." },
  { id: "81", name: "التكوير", meaning: "مشاهد يوم القيامة", gist: "نتذكّر أنّ يوم القيامة قريب، فنحرص على عمل الخير." },
  { id: "89", name: "الفجر", meaning: "الفجر والليالي العشر", gist: "نتعلّم إكرام اليتيم وإطعام المسكين والمحافظة على الخير." },
  { id: "83", name: "المطفّفين", meaning: "العدل في الميزان", gist: "نكون أمناء في البيع والشراء، ولا ننقص حقّ أحد." },
  { id: "78", name: "النبأ", meaning: "الخبر العظيم", gist: "نتأمّل عظمة الله في الجبال والليل والنهار، ونتذكّر أنّ يوم القيامة حقّ." },
  { id: "80", name: "عبس", meaning: "أدب الدعوة", gist: "نتعلّم أن نُكرم كل من يأتي يطلب الخير ويريد أن يتعلّم." },
  { id: "79", name: "النازعات", meaning: "الملائكة والحساب", gist: "الله على كل شيء قدير، ويذكّرنا بقصة موسى مع فرعون لنخشاه ونطيعه." },
];

/** Suggested learning order: the short favourites first, then the rest of Juz' Amma from the shortest to the longest. */
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
