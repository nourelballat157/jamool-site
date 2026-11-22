/**
 * One child profile = one active session at a time.
 * A profile that is open in a tab holds a short lock (renewed every few seconds); a second tab of the same
 * browser cannot open it until the first one leaves or goes quiet. Locks across different devices need a server.
 */

const LOCK_PREFIX = "ajyal_child_lock_";
const TTL = 20000;
export const HEARTBEAT = 7000;

const tabId = (() => {
  try {
    const existing = window.sessionStorage.getItem("ajyal_tab_id");
    if (existing) return existing;
    const id = Math.random().toString(36).slice(2, 10);
    window.sessionStorage.setItem("ajyal_tab_id", id);
    return id;
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
})();

const key = (accountId: string, childId: string) => `${LOCK_PREFIX}${accountId}_${childId}`;

type Lock = { tab: string; ts: number };

function readLock(accountId: string, childId: string): Lock | null {
  try {
    const raw = window.localStorage.getItem(key(accountId, childId));
    return raw ? (JSON.parse(raw) as Lock) : null;
  } catch {
    return null;
  }
}

/** true when ANOTHER tab is using this child right now */
export function isChildBusy(accountId: string, childId: string): boolean {
  const lock = readLock(accountId, childId);
  return Boolean(lock && lock.tab !== tabId && Date.now() - lock.ts < TTL);
}

/** take (or renew) the lock; false if another tab holds it */
export function claimChild(accountId: string, childId: string): boolean {
  if (isChildBusy(accountId, childId)) return false;
  try {
    window.localStorage.setItem(key(accountId, childId), JSON.stringify({ tab: tabId, ts: Date.now() } satisfies Lock));
  } catch {
    /* storage unavailable: no lock, no block */
  }
  return true;
}

export function releaseChild(accountId: string, childId: string) {
  const lock = readLock(accountId, childId);
  if (lock && lock.tab === tabId) {
    try {
      window.localStorage.removeItem(key(accountId, childId));
    } catch {
      /* ignore */
    }
  }
}
