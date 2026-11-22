import { useSyncExternalStore } from "react";
import { currentAccountId, getAccount, planOfAccount, subscribeAuth } from "@/store/auth";
import { claimChild, releaseChild } from "@/store/childSession";

/**
 * Local progress store (no backend): children, points, levels, badges, streaks,
 * memorisation stages, creations and the parent's settings. Everything is kept
 * in this browser only, per signed-in parent account. Designed to be swapped for a real API later.
 *
 * Without a signed-in parent (or while the parent is on the dashboard) the site runs as a GUEST:
 * a throw-away "ضيف" profile held in memory, never saved, so nothing about it needs an account.
 */

export type Child = {
  id: string;
  name: string;
  avatar: string;
  ring: string;
  birth?: string;
  /** boy / girl: stories use it so the grammar agrees with the hero */
  gender?: "m" | "f";
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

const keyFor = (accountId: string) => `ajyal_progress_v3_${accountId}`;
const ACTIVE_KEY = "ajyal_active_child_v1";

export const GUEST_ID = "guest";
export const GUEST_CHILD: Child = { id: GUEST_ID, name: "ضيف", avatar: "/brand/avatar-jamool.webp", ring: "border-primary-300" };

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

function fresh(): ProgressState {
  return {
    version: 2,
    children: [],
    activeChildId: GUEST_ID,
    data: { [GUEST_ID]: emptyChild() },
    settings: {
      dailyLimit: 0,
      extra: {},
      features: { competitions: true, uploads: true, storyReader: true },
    },
  };
}

/* ------------------------------ store ---------------------------------- */

let state: ProgressState;
let owner: string | null = null;
const listeners = new Set<() => void>();

/** the child this tab was playing as before a refresh (tab-scoped, so a new tab starts on the dashboard) */
function savedActive(accountId: string): string | null {
  try {
    const raw = window.sessionStorage.getItem(ACTIVE_KEY);
    const v = raw ? (JSON.parse(raw) as { accountId: string; childId: string }) : null;
    return v && v.accountId === accountId ? v.childId : null;
  } catch {
    return null;
  }
}

function load(accountId: string | null): ProgressState {
  if (typeof window === "undefined" || !accountId) return fresh();
  try {
    const raw = window.localStorage.getItem(keyFor(accountId));
    if (raw) {
      const parsed = JSON.parse(raw) as ProgressState;
      if (parsed && parsed.version === 2 && Array.isArray(parsed.children)) {
        parsed.data = parsed.data ?? {};
        parsed.children.forEach((c) => {
          parsed.data[c.id] = { ...emptyChild(), ...(parsed.data[c.id] ?? {}) };
        });
        parsed.data[GUEST_ID] = emptyChild();
        parsed.settings = { ...fresh().settings, ...parsed.settings, features: { ...fresh().settings.features, ...(parsed.settings?.features ?? {}) } };
        parsed.activeChildId = GUEST_ID;
        // a refresh keeps the child this tab was playing, if no other tab holds that profile
        const back = savedActive(accountId);
        if (back && parsed.children.some((c) => c.id === back) && claimChild(accountId, back)) parsed.activeChildId = back;
        return parsed;
      }
    }
  } catch {
    /* ignore corrupted storage */
  }
  return fresh();
}

/** switches the whole store to another account (or to the guest) */
function setOwner(accountId: string | null) {
  if (accountId === owner && state) return;
  if (owner && state && state.activeChildId !== GUEST_ID) releaseChild(owner, state.activeChildId);
  owner = accountId;
  state = load(accountId);
  persistActive();
  listeners.forEach((l) => l());
}

owner = typeof window === "undefined" ? null : currentAccountId();
state = load(owner);
if (typeof window !== "undefined") subscribeAuth(() => setOwner(currentAccountId()));

function persistActive() {
  try {
    if (owner && state.activeChildId !== GUEST_ID) window.sessionStorage.setItem(ACTIVE_KEY, JSON.stringify({ accountId: owner, childId: state.activeChildId }));
    else window.sessionStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

function commit(next: ProgressState) {
  state = next;
  if (owner) {
    try {
      const { [GUEST_ID]: _guest, ...data } = state.data;
      window.localStorage.setItem(keyFor(owner), JSON.stringify({ ...state, activeChildId: GUEST_ID, data }));
    } catch {
      /* storage full: drop silently (creations are the only big thing) */
    }
  }
  persistActive();
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
  if (state.activeChildId === GUEST_ID) return;
  const c = active();
  const t = todayISO();
  commit({ ...state, data: { ...state.data, [state.activeChildId]: { ...c, minutes: { ...c.minutes, [t]: (c.minutes[t] ?? 0) + n } } } });
}

/* ------------------------------ children ------------------------------- */

const RINGS = ["border-secondary-300", "border-primary-300", "border-accent-300"];

/** which child (if any) this tab is playing as: false = guest / parent dashboard */
export const inChildMode = () => state.activeChildId !== GUEST_ID;

export function childLimit(): number {
  return planOfAccount(getAccount()).maxChildren;
}

export function canAddChild(): boolean {
  return Boolean(owner) && state.children.length < childLimit();
}

/** open a child's world as the signed-in parent. "busy" = that profile is already open in another session */
export function enterChild(id: string): "ok" | "busy" | "missing" {
  if (!owner || !state.children.some((c) => c.id === id)) return "missing";
  if (!claimChild(owner, id)) return "busy";
  if (state.activeChildId !== GUEST_ID && state.activeChildId !== id) releaseChild(owner, state.activeChildId);
  commit({ ...state, activeChildId: id });
  return "ok";
}

/** back to the parent side (dashboard / guest browsing) */
export function leaveChild() {
  if (owner && state.activeChildId !== GUEST_ID) releaseChild(owner, state.activeChildId);
  commit({ ...state, activeChildId: GUEST_ID });
}

/** keeps the open child's lock alive; if another tab took it, this tab drops back to the parent side */
export function keepChildSession() {
  if (!owner || state.activeChildId === GUEST_ID) return;
  if (!claimChild(owner, state.activeChildId)) commit({ ...state, activeChildId: GUEST_ID });
}

export function addChild(name: string, avatar: string, birth?: string, gender?: "m" | "f"): string | null {
  if (!canAddChild()) return null;
  const id = `ch${Date.now()}`;
  const child: Child = { id, name: name.trim().slice(0, 14), avatar, birth, gender, ring: RINGS[state.children.length % RINGS.length] };
  commit({
    ...state,
    children: [...state.children, child],
    data: { ...state.data, [id]: emptyChild() },
  });
  return id;
}

export function removeChild(id: string) {
  if (!state.children.some((c) => c.id === id)) return;
  if (owner) releaseChild(owner, id);
  const { [id]: _gone, ...data } = state.data;
  commit({
    ...state,
    children: state.children.filter((c) => c.id !== id),
    activeChildId: state.activeChildId === id ? GUEST_ID : state.activeChildId,
    data,
  });
}

export function renameChild(id: string, name: string, avatar?: string, gender?: "m" | "f") {
  commit({
    ...state,
    children: state.children.map((c) => (c.id === id ? { ...c, name: name.trim().slice(0, 14) || c.name, avatar: avatar ?? c.avatar, gender: gender ?? c.gender } : c)),
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
  if (!dailyLimit || state.activeChildId === GUEST_ID) return null;
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
  const child = snap.children.find((c) => c.id === snap.activeChildId) ?? GUEST_CHILD;
  const data = snap.data[child.id] ?? snap.data[GUEST_ID] ?? emptyChild();
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
