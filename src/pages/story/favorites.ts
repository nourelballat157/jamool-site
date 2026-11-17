import { useCallback, useSyncExternalStore } from "react";

/**
 * Favourite stories: a tiny per-device store kept in localStorage.
 * (Key: ajyal_story_favs_v1 - a list of story ids.)
 */
const KEY = "ajyal_story_favs_v1";
const listeners = new Set<() => void>();

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

let cache: string[] = read();

function write(next: string[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or full storage: keep it in memory for this visit */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => cache;

export default function useFavorites() {
  const favs = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const isFav = useCallback((id: string) => favs.includes(id), [favs]);

  const toggle = useCallback((id: string) => {
    write(cache.includes(id) ? cache.filter((x) => x !== id) : [...cache, id]);
  }, []);

  return { favs, isFav, toggle, count: favs.length };
}
