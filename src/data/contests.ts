/**
 * Continuous contests (المسابقات المستمرة): a contest runs in rounds, children join with a file or one of their
 * own creations, children vote for the entries they like, and when a round ends the entry with the most votes wins
 * by itself. Rounds repeat for ever, so there is always an open one.
 *
 * Everything the product can tune about a contest lives in `CONTESTS` (title, length of a round, conditions,
 * what can be sent, whether the vote counts are shown while the round is open).
 */

export type ContestKind = "drawing" | "story";

export type Contest = {
  id: string;
  title: string;
  kind: ContestKind;
  icon: string;
  /** one line for the cards */
  tagline: string;
  /** what the contest is about */
  details: string;
  /** days in one round */
  periodDays: number;
  /** the participation conditions shown to the child */
  conditions: string[];
  /** which of the child's own creations fit */
  creationKinds: ("drawing" | "coloring" | "story")[];
  /** what can be uploaded */
  files: { image: boolean; text: boolean };
  /** show how many votes each entry has while the round is open */
  showVotes: boolean;
};

export const CONTESTS: Contest[] = [
  {
    id: "best-drawing",
    title: "أفضل رسمة",
    kind: "drawing",
    icon: "ri-palette-line",
    tagline: "ارسم أجمل لوحة، وأصدقاؤك يختارون الأجمل.",
    details: "ارسم أو لوّن لوحتك بأي فكرة تحبها، وأرسلها للمسابقة. يتصفّح الأطفال المشاركات ويصوّتون للوحة التي أعجبتهم، وتفوز اللوحة التي تحصل على أكثر الأصوات عند نهاية الجولة.",
    periodDays: 7,
    conditions: [
      "مشاركة واحدة لكل طفل في كل جولة.",
      "الرسمة من عملك أنت، رسمتها أو لوّنتها بنفسك.",
      "صورة بصيغة PNG أو JPG أو WEBP، أو رسمة محفوظة في غرفتك.",
      "لا يصوّت الطفل لمشاركته، وله صوت واحد في كل مسابقة.",
    ],
    creationKinds: ["drawing", "coloring"],
    files: { image: true, text: false },
    showVotes: true,
  },
  {
    id: "best-story",
    title: "أفضل قصة",
    kind: "story",
    icon: "ri-book-open-line",
    tagline: "اكتب قصة قصيرة تحكيها لأصدقائك.",
    details: "اكتب قصة قصيرة من خيالك، أو ارسم غلافًا لها، وأرسلها للمسابقة. يقرأ الأطفال المشاركات ويصوّتون للقصة المفضلة، وتفوز القصة التي تحصل على أكثر الأصوات عند نهاية الجولة.",
    periodDays: 14,
    conditions: [
      "مشاركة واحدة لكل طفل في كل جولة.",
      "القصة من تأليفك أنت.",
      "ملف نصي TXT لا يزيد عن ٢٠ كيلوبايت، أو صورة لقصتك بصيغة PNG أو JPG أو WEBP.",
      "لا يصوّت الطفل لمشاركته، وله صوت واحد في كل مسابقة.",
    ],
    creationKinds: ["story"],
    files: { image: true, text: true },
    showVotes: true,
  },
];

export const contestById = (id: string | undefined): Contest | undefined => CONTESTS.find((c) => c.id === id);

/* ------------------------------ rounds --------------------------------- */

const DAY = 86400000;
/** the first round of every contest starts here */
export const EPOCH = Date.UTC(2026, 0, 1);

export type Round = { index: number; number: number; start: number; end: number };

export function roundAt(contest: Contest, now = Date.now()): Round {
  const len = contest.periodDays * DAY;
  const index = Math.floor((now - EPOCH) / len);
  return { index, number: index + 1, start: EPOCH + index * len, end: EPOCH + (index + 1) * len };
}

export function roundOf(contest: Contest, index: number): Round {
  const len = contest.periodDays * DAY;
  return { index, number: index + 1, start: EPOCH + index * len, end: EPOCH + (index + 1) * len };
}

/* ------------------------------ entries -------------------------------- */

export type Entry = {
  id: string;
  contestId: string;
  round: number;
  /** account:child that sent it; null for sample entries */
  ownerKey: string | null;
  author: string;
  avatar: string;
  title: string;
  kind: "image" | "text";
  src?: string;
  text?: string;
  createdAt: number;
  /** a sample entry, shown so the gallery is never empty */
  sample?: boolean;
  /** votes a sample entry starts with */
  baseVotes?: number;
};

const AUTHORS = [
  { name: "نورة", avatar: "/brand/avatar-maha.webp" },
  { name: "سلطان", avatar: "/brand/avatar-thaloob.webp" },
  { name: "لجين", avatar: "/brand/avatar-noor.webp" },
  { name: "ياسر", avatar: "/brand/avatar-zizo.webp" },
  { name: "ريما", avatar: "/brand/avatar-maha.webp" },
];

const DRAWINGS = [
  { title: "قلعتي السحرية", src: "/img/ajyal-art-castle-01.jpg" },
  { title: "سمكة البحر", src: "/img/ajyal-art-fish-01.jpg" },
  { title: "الشجرة الكبيرة", src: "/img/ajyal-art-tree-01.jpg" },
  { title: "فراشة الحديقة", src: "/img/ajyal-art-butterfly-01.jpg" },
];

const STORIES = [
  { title: "الجمل الصغير والنجمة", text: "كان جمل صغير يحب النجوم. في ليلة هادئة سقطت نجمة صغيرة بجانبه، فحملها بلطف وأعادها إلى السماء، وشكرته النجمة بضوء جميل." },
  { title: "حديقة الأصدقاء", text: "زرعت ريم بذرة في حديقة الحي وسقتها كل يوم. بعد أيام كبرت زهرة ملونة، فدعت الأصدقاء ليفرحوا بها معها." },
  { title: "الروبوت الذي تعلّم الصبر", text: "أخطأ روبوت صغير فانسكب العصير. لم يحزن كثيرًا، بل حاول من جديد حتى أمسك الكوب بلطف وقدّمه لجدته." },
  { title: "رحلة إلى القمر", text: "ركب سالم سفينة من الورق الملون وطار إلى القمر. وجد هناك أرنبًا يحب الحروف، فتعلّما معًا حرفًا جديدًا كل يوم." },
  { title: "السلحفاة والبحر النظيف", text: "رأت سلحفاة كيسًا يطفو في البحر. نادت أصدقاءها الدلافين، فنظّفوا الشاطئ معًا وعاد الماء صافيًا." },
];

const fract = (x: number) => x - Math.floor(x);

/** the sample entries of one round: always the same for the same contest and round */
export function sampleEntries(contest: Contest, round: Round): Entry[] {
  const pool = contest.kind === "drawing" ? DRAWINGS : STORIES;
  return pool.slice(0, contest.kind === "drawing" ? 4 : 5).map((item, i) => {
    const a = AUTHORS[(i + round.index + (contest.kind === "drawing" ? 0 : 2)) % AUTHORS.length];
    const base = 2 + Math.floor(fract(Math.sin((round.index + 3) * 12.9898 + i * 78.233 + contest.periodDays) * 43758.5453) * 15);
    const entry: Entry = {
      id: `sample-${contest.id}-${round.index}-${i}`,
      contestId: contest.id,
      round: round.index,
      ownerKey: null,
      author: a.name,
      avatar: a.avatar,
      title: item.title,
      kind: contest.kind === "drawing" ? "image" : "text",
      createdAt: round.start + (i + 1) * 3 * 3600000,
      sample: true,
      baseVotes: base,
    };
    if ("src" in item) entry.src = item.src;
    if ("text" in item) entry.text = item.text;
    return entry;
  });
}
