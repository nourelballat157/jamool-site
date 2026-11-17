import { useEffect, useState } from "react";

export type ActivityEntry = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  tone?: string;
  completed: boolean;
  updatedAt: number;
};

type ActivityInput = Omit<ActivityEntry, "updatedAt" | "completed"> & {
  completed?: boolean;
};

/**
 * A lightweight local "resume" store used by the "أكمل من حيث توقفت" section.
 * It only remembers which activities a child started on this device — no
 * personal data and no backend are needed. Designed to be replaced by the
 * real progress store once the platform is connected to a backend.
 */
const STORAGE_KEY = "ajyal_activity_v1";
const listeners = new Set<() => void>();
let cache: ActivityEntry[] = [];
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
}

function persist() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
      /* ignore quota errors */
    }
  }
  listeners.forEach((listener) => listener());
}

export function recordActivity(entry: ActivityInput) {
  load();
  const next: ActivityEntry = {
    ...entry,
    completed: entry.completed ?? false,
    updatedAt: Date.now(),
  };
  cache = [next, ...cache.filter((item) => item.key !== entry.key)].slice(0, 12);
  persist();
}

export function completeActivity(key: string) {
  load();
  cache = cache.map((item) =>
    item.key === key ? { ...item, completed: true, updatedAt: Date.now() } : item
  );
  persist();
}

export function clearActivity() {
  load();
  cache = [];
  persist();
}

export default function useActivityProgress() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    load();
    setVersion((value) => value + 1);
    const listener = () => setVersion((value) => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const items = cache
    .filter((item) => !item.completed)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return { items };
}