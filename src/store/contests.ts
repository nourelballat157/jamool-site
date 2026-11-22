import { useSyncExternalStore } from "react";
import { roundAt, roundOf, sampleEntries, type Contest, type Entry } from "@/data/contests";

/**
 * Entries and votes of the continuous contests. Kept in this browser (there is no server yet), shared by every
 * profile on this device, so children on the same device see and vote on each other's entries.
 * A vote belongs to a child profile (`ownerKey` = "account:child"): one vote per child in each round of a contest.
 */

type Saved = {
  entries: Entry[];
  /** "contestId:round" -> voter -> entry id */
  votes: Record<string, Record<string, string>>;
};

const KEY = "ajyal_contests_v1";

function load(): Saved {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Saved) : null;
    if (parsed && Array.isArray(parsed.entries) && parsed.votes) return parsed;
  } catch {
    /* ignore */
  }
  return { entries: [], votes: {} };
}

let state: Saved = typeof window === "undefined" ? { entries: [], votes: {} } : load();
const listeners = new Set<() => void>();

function commit(next: Saved): boolean {
  const before = state;
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    state = before;
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    state = load();
    listeners.forEach((l) => l());
  });
}

export default function useContests() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/* ------------------------------ reading -------------------------------- */

const voteKey = (contestId: string, round: number) => `${contestId}:${round}`;

export type Standing = Entry & { votes: number; rank: number };

/** every entry of one round with its votes, best first (a tie goes to the entry that was sent first) */
export function standings(saved: Saved, contest: Contest, round: number): Standing[] {
  const own = saved.entries.filter((e) => e.contestId === contest.id && e.round === round);
  const all = [...sampleEntries(contest, roundOf(contest, round)), ...own];
  const cast = saved.votes[voteKey(contest.id, round)] ?? {};
  const counts: Record<string, number> = {};
  Object.values(cast).forEach((id) => {
    counts[id] = (counts[id] ?? 0) + 1;
  });
  return all
    .map((e) => ({ ...e, votes: (e.baseVotes ?? 0) + (counts[e.id] ?? 0), rank: 0 }))
    .sort((a, b) => b.votes - a.votes || a.createdAt - b.createdAt)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

/** the winner is decided by itself: the entry with the most votes when the round has ended */
export const winnerOf = (list: Standing[]): Standing | null => list[0] ?? null;

export const myEntry = (saved: Saved, contest: Contest, round: number, ownerKey: string | null): Entry | null =>
  ownerKey ? (saved.entries.find((e) => e.contestId === contest.id && e.round === round && e.ownerKey === ownerKey) ?? null) : null;

export const myVote = (saved: Saved, contest: Contest, round: number, ownerKey: string | null): string | null =>
  ownerKey ? (saved.votes[voteKey(contest.id, round)]?.[ownerKey] ?? null) : null;

/** the child's most recent entry in a round that has already ended, with how it finished */
export function lastResult(saved: Saved, contest: Contest, ownerKey: string | null) {
  if (!ownerKey) return null;
  const now = roundAt(contest).index;
  const mine = saved.entries.filter((e) => e.contestId === contest.id && e.ownerKey === ownerKey && e.round < now).sort((a, b) => b.round - a.round)[0];
  if (!mine) return null;
  const list = standings(saved, contest, mine.round);
  const me = list.find((e) => e.id === mine.id);
  return me ? { entry: me, total: list.length, won: me.rank === 1 } : null;
}

/** counts for the cards */
export function summary(saved: Saved, contest: Contest) {
  const round = roundAt(contest);
  const list = standings(saved, contest, round.index);
  return { round, entries: list.length, votes: list.reduce((n, e) => n + e.votes, 0), leader: winnerOf(list) };
}

/* ------------------------------ writing -------------------------------- */

export type SendResult = { ok: true } | { ok: false; error: string };

export type EntryInput = {
  contest: Contest;
  ownerKey: string;
  author: string;
  avatar: string;
  title: string;
  kind: "image" | "text";
  src?: string;
  text?: string;
};

export function submitEntry(input: EntryInput): SendResult {
  const round = roundAt(input.contest);
  if (myEntry(state, input.contest, round.index, input.ownerKey)) return { ok: false, error: "شاركت في هذه الجولة من قبل." };
  const title = input.title.trim().replace(/\s+/g, " ");
  if (title.length < 2) return { ok: false, error: "اكتب عنوانًا للمشاركة (حرفان على الأقل)." };
  const entry: Entry = {
    id: `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    contestId: input.contest.id,
    round: round.index,
    ownerKey: input.ownerKey,
    author: input.author,
    avatar: input.avatar,
    title: title.slice(0, 40),
    kind: input.kind,
    src: input.src,
    text: input.text,
    createdAt: Date.now(),
  };
  const ok = commit({ ...state, entries: [...state.entries, entry] });
  return ok ? { ok: true } : { ok: false, error: "لا توجد مساحة كافية على الجهاز لحفظ المشاركة. جرّب صورة أصغر." };
}

export function withdrawEntry(entryId: string) {
  const entry = state.entries.find((e) => e.id === entryId);
  if (!entry) return;
  const key = voteKey(entry.contestId, entry.round);
  const cast = { ...(state.votes[key] ?? {}) };
  Object.keys(cast).forEach((voter) => {
    if (cast[voter] === entryId) delete cast[voter];
  });
  commit({ entries: state.entries.filter((e) => e.id !== entryId), votes: { ...state.votes, [key]: cast } });
}

/** a child gives (or moves) their one vote; nobody votes for their own entry */
export function castVote(contest: Contest, voterKey: string, entryId: string): SendResult {
  const round = roundAt(contest);
  const entry = standings(state, contest, round.index).find((e) => e.id === entryId);
  if (!entry) return { ok: false, error: "هذه المشاركة غير موجودة." };
  if (entry.ownerKey === voterKey) return { ok: false, error: "لا يمكنك التصويت لمشاركتك." };
  const key = voteKey(contest.id, round.index);
  const ok = commit({ ...state, votes: { ...state.votes, [key]: { ...(state.votes[key] ?? {}), [voterKey]: entryId } } });
  return ok ? { ok: true } : { ok: false, error: "تعذّر حفظ صوتك." };
}

export function clearVote(contest: Contest, voterKey: string) {
  const key = voteKey(contest.id, roundAt(contest).index);
  const cast = { ...(state.votes[key] ?? {}) };
  delete cast[voterKey];
  commit({ ...state, votes: { ...state.votes, [key]: cast } });
}
