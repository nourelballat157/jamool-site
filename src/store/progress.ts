import { useSyncExternalStore } from "react";
import { childProfiles } from "@/mocks/home";

/**
 * Local progress store (no backend): children, points, levels, badges, streaks,
 * memorisation stages, creations and the parent's settings. Everything is kept
 * in this browser only. Designed to be swapped for a real API later.
 */

export type Child = {
  id: string;
  name: string;
  avatar: string;
  ring: string;
  birth?: string;
};

export type Creation = {
  id: string;
  kind: "drawing" | "coloring" | "story";
  title: string;
  image: string; // data URL or /img path
  createdAt: number;
};

export type ChildData = {
  points: number;
  /** keys already rewarded (so points are earned once, never farmed) → timestamp */
  earned: Record<string, number>;
  badges: Record<string, number>;
  days: string[]; // ISO dates (yyyy-mm-dd) on which the child visited
  /** surah id → completed stages 0..3 + verse progress inside the current stage */
  quran: Record<string, { stage: number; verse: number; reps: number; updatedAt: number }>;
  creations: Creation[];
  minutes: Record<string, number>; // ISO date → minutes spent
  /** generic per-item progress, e.g. story page reached */
  marks: Record<string, number>;
};

export type ParentSettings = {
  dailyLimit: number; // minutes, 0 = no limit
  extra: Record<string, number>; // ISO date → extra minutes granted
  pin: string;
  features: { competitions: boolean; uploads: boolean; storyReader: boolean };
};

export type ProgressState = {
  version: 2;
  children: Child[];
  activeChildId: string;
  data: Record<string, ChildData>;
  settings: ParentSettings;
};

export type BadgeDef = {
  id: string;
  title: string;
  hint: string;
  icon: string;
  tone: string;
  test: (c: ChildData, count: (prefix: string) => number, streak: number) => boolean;
  progress?: (c: ChildData, count: (prefix: string) => number, streak: number) => [number, number];
};

const KEY = "ajyal_progress_v2";

/* ------------------------------ levels --------------------------------- */

export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];
export const LEVEL_NAMES = [
  "بذرة صغيرة",
  "نبتة طموحة",
  "مستكشف",
  "قارئ نشيط",
  "نجم صاعد",
  "بطل مجتهد",
  "حكيم صغير",
  "فارس المعرفة",
  "سفير الجمال",
  "نجم جمّول",
  "أسطورة جمّول",
];

export function levelOf(points: number) {
  let level = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i += 1) {
    if (points >= LEVEL_THRESHOLDS[i]) level = i;
  }
  const next = LEVEL_THRESHOLDS[level + 1] ?? null;
  const base = LEVEL_THRESHOLDS[level];
  return {
    level: level + 1,
    name: LEVEL_NAMES[level] ?? LEVEL_NAMES[LEVEL_NAMES.length - 1],
    base,
    next,
    pct: next === null ? 100 : Math.round(((points - base) / (next - base)) * 100),
    toNext: next === null ? 0 : next - points,
  };
}

/* ------------------------------ badges --------------------------------- */

export const BADGES: BadgeDef[] = [
  {
    id: "first-step",
    title: "الخطوة الأولى",
    hint: "أنهِ أي نشاط في عالم جمّول",
    icon: "ri-footprint-line",
    tone: "bg-primary-100 text-primary-800",
    test: (c) => Object.keys(c.earned).length >= 1,
  },
  {
    id: "story-lover",
    title: "قارئ الحكايات",
    hint: "أنهِ ٣ قصص",
    icon: "ri-book-open-line",
    tone: "bg-secondary-100 text-secondary-800",
    test: (_c, count) => count("story:") >= 3,
    progress: (_c, count) => [Math.min(count("story:"), 3), 3],
  },
  {
    id: "letter-explorer",
    title: "مستكشف الحروف",
    hint: "أتقن ٥ حروف",
    icon: "ri-text",
    tone: "bg-primary-100 text-primary-800",
    test: (_c, count) => count("letter:") >= 5,
    progress: (_c, count) => [Math.min(count("letter:"), 5), 5],
  },
  {
    id: "alphabet-star",
    title: "نجم الأبجدية",
    hint: "أتقن ١٤ حرفًا",
    icon: "ri-star-smile-line",
    tone: "bg-secondary-100 text-secondary-800",
    test: (_c, count) => count("letter:") >= 14,
    progress: (_c, count) => [Math.min(count("letter:"), 14), 14],
  },
  {
    id: "listener",
    title: "المستمع الهادئ",
    hint: "أنهِ مرحلة الاستماع في سورة",
    icon: "ri-headphone-line",
    tone: "bg-accent-100 text-accent-800",
    test: (_c, count) => count("quran:") >= 1,
  },
  {
    id: "hafiz",
    title: "حافظ صغير",
    hint: "أتمّ حفظ سورة كاملة",
    icon: "ri-moon-clear-line",
    tone: "bg-accent-100 text-accent-800",
    test: (_c, count) => count("quran-done:") >= 1,
  },
  {
    id: "game-master",
    title: "بطل الألعاب",
    hint: "أنهِ ٥ ألعاب مختلفة",
    icon: "ri-gamepad-line",
    tone: "bg-primary-100 text-primary-800",
    test: (_c, count) => count("game:") >= 5,
    progress: (_c, count) => [Math.min(count("game:"), 5), 5],
  },
  {
    id: "value-bloom",
    title: "زهرة القيم",
    hint: "أزهرت شجرة قيمة كاملة",
    icon: "ri-plant-line",
    tone: "bg-accent-100 text-accent-800",
    test: (_c, count) => count("value-done:") >= 1,
  },
  {
    id: "young-artist",
    title: "فنّان صغير",
    hint: "احفظ أول رسمة في غرفتي",
    icon: "ri-brush-line",
    tone: "bg-secondary-100 text-secondary-800",
    test: (c) => c.creations.length >= 1,
  },
  {
    id: "quiz-champ",
    title: "بطل المسابقة",
    hint: "أنهِ مسابقة سريعة",
    icon: "ri-trophy-line",
    tone: "bg-primary-100 text-primary-800",
    test: (_c, count) => count("quiz:") >= 1,
  },
  {
    id: "streak-3",
    title: "ثلاثة أيام متتالية",
    hint: "زُر عالمك ٣ أيام وراء بعض",
    icon: "ri-fire-line",
    tone: "bg-secondary-100 text-secondary-800",
    test: (_c, _n, streak) => streak >= 3,
    progress: (_c, _n, streak) => [Math.min(streak, 3), 3],
  },
  {
    id: "streak-7",
    title: "أسبوع كامل",
    hint: "زُر عالمك ٧ أيام وراء بعض",
    icon: "ri-fire-fill",
    tone: "bg-primary-100 text-primary-800",
    test: (_c, _n, streak) => streak >= 7,
    progress: (_c, _n, streak) => [Math.min(streak, 7), 7],
  },
];

/* ------------------------------ helpers -------------------------------- */

export const todayISO = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function streakOf(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  let cursor = new Date();
  // a streak is alive if the child came today or yesterday
  if (!set.has(todayISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(todayISO(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(todayISO(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

export function lastSevenDays(days: string[]) {
  const set = new Set(days);
  const names = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { iso: todayISO(d), label: names[d.getDay()], done: set.has(todayISO(d)), today: i === 6 };
  });
}

const emptyChild = (): ChildData => ({
  points: 0,
  earned: {},
  badges: {},
  days: [],
  quran: {},
  creations: [],
  minutes: {},
  marks: {},
});

function seed(): ProgressState {
  const children: Child[] = childProfiles.map((c) => ({
    id: c.id,
    name: c.name,
    avatar: c.avatar,
    ring: c.ring,
  }));
  return {
    version: 2,
    children,
    activeChildId: children[0].id,
    data: Object.fromEntries(children.map((c) => [c.id, emptyChild()])),
    settings: {
      dailyLimit: 0,
      extra: {},
      pin: "1234",
      features: { competitions: true, uploads: true, storyReader: true },
    },
  };
}

/* ------------------------------ store ---------------------------------- */

let state: ProgressState;
const listeners = new Set<() => void>();

function load(): ProgressState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProgressState;
      if (parsed && parsed.version === 2 && parsed.children?.length) {
        const LEGACY: Record<string, string> = { "/img/ajyal-avatar-girl-01.jpg": "/brand/avatar-maha.webp", "/img/ajyal-avatar-boy-01.jpg": "/brand/avatar-thaloob.webp", "/img/ajyal-avatar-girl-02.jpg": "/brand/avatar-noor.webp" };
        parsed.children.forEach((c) => {
          if (LEGACY[c.avatar]) c.avatar = LEGACY[c.avatar];
          parsed.data[c.id] = { ...emptyChild(), ...(parsed.data[c.id] ?? {}) };
        });
        return parsed;
      }
    }
  } catch {
    /* ignore corrupted storage */
  }
  return seed();
}

state = load();

function commit(next: ProgressState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full: drop silently (creations are the only big thing) */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

export function getState() {
  return state;
}

function active(): ChildData {
  return state.data[state.activeChildId];
}

function countOf(c: ChildData) {
  return (prefix: string) => Object.keys(c.earned).filter((k) => k.startsWith(prefix)).length;
}

export type AwardResult = {
  gained: number;
  levelUp: null | { level: number; name: string };
  badges: BadgeDef[];
};

function evaluateBadges(c: ChildData): BadgeDef[] {
  const fresh: BadgeDef[] = [];
  const count = countOf(c);
  const streak = streakOf(c.days);
  BADGES.forEach((b) => {
    if (!c.badges[b.id] && b.test(c, count, streak)) {
      c.badges[b.id] = Date.now();
      fresh.push(b);
    }
  });
  return fresh;
}

/** Mark today as a visit (streak). Called once when the app opens. */
export function markVisit() {
  const c = active();
  const t = todayISO();
  if (c.days.includes(t)) return;
  const nextData = { ...c, days: [...c.days, t].slice(-120) };
  evaluateBadges(nextData);
  commit({ ...state, data: { ...state.data, [state.activeChildId]: nextData } });
}

/**
 * Give points for finishing something. `key` makes it once-only (a story gives
 * its points the first time it is finished, replaying it does not farm points).
 * Returns what changed so the UI can celebrate.
 */
export function award(key: string, points: number): AwardResult {
  const c = active();
  const none: AwardResult = { gained: 0, levelUp: null, badges: [] };
  if (c.earned[key]) return none;
  const before = levelOf(c.points).level;
  const next: ChildData = {
    ...c,
    points: c.points + points,
    earned: { ...c.earned, [key]: Date.now() },
    badges: { ...c.badges },
  };
  const badges = evaluateBadges(next);
  const after = levelOf(next.points);
  commit({ ...state, data: { ...state.data, [state.activeChildId]: next } });
  return {
    gained: points,
    levelUp: after.level > before ? { level: after.level, name: after.name } : null,
    badges,
  };
}

export function setMark(key: string, value: number) {
  const c = active();
  commit({ ...state, data: { ...state.data, [state.activeChildId]: { ...c, marks: { ...c.marks, [key]: value } } } });
}

export function setQuran(surahId: string, patch: Partial<ChildData["quran"][string]>) {
  const c = active();
  const cur = c.quran[surahId] ?? { stage: 0, verse: 0, reps: 0, updatedAt: 0 };
  commit({
    ...state,
    data: {
      ...state.data,
      [state.activeChildId]: { ...c, quran: { ...c.quran, [surahId]: { ...cur, ...patch, updatedAt: Date.now() } } },
    },
  });
}

export function addCreation(item: Omit<Creation, "id" | "createdAt">): AwardResult {
  const c = active();
  const creation: Creation = { ...item, id: `c${Date.now()}`, createdAt: Date.now() };
  const next: ChildData = { ...c, creations: [creation, ...c.creations].slice(0, 24), badges: { ...c.badges } };
  const badges = evaluateBadges(next);
  commit({ ...state, data: { ...state.data, [state.activeChildId]: next } });
  return { gained: 0, levelUp: null, badges };
}

export function removeCreation(id: string) {
  const c = active();
  commit({ ...state, data: { ...state.data, [state.activeChildId]: { ...c, creations: c.creations.filter((x) => x.id !== id) } } });
}

export function addMinute(n = 1) {
  const c = active();
  const t = todayISO();
  commit({ ...state, data: { ...state.data, [state.activeChildId]: { ...c, minutes: { ...c.minutes, [t]: (c.minutes[t] ?? 0) + n } } } });
}

/* ------------------------------ children ------------------------------- */

const RINGS = ["border-secondary-300", "border-primary-300", "border-accent-300"];

export function selectChild(id: string) {
  if (state.data[id]) commit({ ...state, activeChildId: id });
}

export function addChild(name: string, avatar: string, birth?: string) {
  const id = `ch${Date.now()}`;
  const child: Child = { id, name: name.trim().slice(0, 14), avatar, birth, ring: RINGS[state.children.length % RINGS.length] };
  commit({
    ...state,
    children: [...state.children, child],
    activeChildId: id,
    data: { ...state.data, [id]: emptyChild() },
  });
  return id;
}

export function renameChild(id: string, name: string, avatar?: string) {
  commit({
    ...state,
    children: state.children.map((c) => (c.id === id ? { ...c, name: name.trim().slice(0, 14) || c.name, avatar: avatar ?? c.avatar } : c)),
  });
}

export function ageOf(birth?: string): number | null {
  if (!birth) return null;
  const b = new Date(birth);
  if (Number.isNaN(b.getTime())) return null;
  const diff = Date.now() - b.getTime();
  return Math.max(0, Math.floor(diff / (365.25 * 86400000)));
}

/* ------------------------------ parent --------------------------------- */

export function updateSettings(patch: Partial<ParentSettings>) {
  commit({ ...state, settings: { ...state.settings, ...patch, features: { ...state.settings.features, ...(patch.features ?? {}) } } });
}

export function grantExtraMinutes(n: number) {
  const t = todayISO();
  commit({ ...state, settings: { ...state.settings, extra: { ...state.settings.extra, [t]: (state.settings.extra[t] ?? 0) + n } } });
}

export function minutesLeft(): number | null {
  const { dailyLimit, extra } = state.settings;
  if (!dailyLimit) return null;
  const t = todayISO();
  const used = active().minutes[t] ?? 0;
  return Math.max(0, dailyLimit + (extra[t] ?? 0) - used);
}

/* ------------------------------ leaderboard ---------------------------- */

/** A friendly, comparison-light board built from this device's children. */
export function familyBoard() {
  return state.children
    .map((c) => ({ child: c, points: state.data[c.id]?.points ?? 0, level: levelOf(state.data[c.id]?.points ?? 0) }))
    .sort((a, b) => b.points - a.points);
}

/* ------------------------------ hook ----------------------------------- */

export default function useProgress() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const child = snap.children.find((c) => c.id === snap.activeChildId) ?? snap.children[0];
  const data = snap.data[child.id];
  const count = countOf(data);
  const streak = streakOf(data.days);
  return {
    state: snap,
    child,
    data,
    level: levelOf(data.points),
    streak,
    week: lastSevenDays(data.days),
    count,
    badges: BADGES.map((b) => ({ ...b, earned: Boolean(data.badges[b.id]), at: data.badges[b.id], progress: b.progress ? b.progress(data, count, streak) : null })),
    isDone: (key: string) => Boolean(data.earned[key]),
  };
}
