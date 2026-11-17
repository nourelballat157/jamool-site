import { useCallback, useState } from "react";

export type TextSize = 0 | 1 | 2;

const SIZE_KEY = "ajyal_story_size_v1";
const HERO_KEY = "ajyal_story_hero_v1";

function readSize(): TextSize {
  try {
    const value = Number(window.localStorage.getItem(SIZE_KEY));
    return value === 0 || value === 2 ? value : 1;
  } catch {
    return 1;
  }
}

function readHero(): boolean {
  try {
    return window.localStorage.getItem(HERO_KEY) === "1";
  } catch {
    return false;
  }
}

/** Reader preferences remembered on this device: text size and "make me the hero". */
export default function usePrefs() {
  const [size, setSizeState] = useState<TextSize>(readSize);
  const [hero, setHeroState] = useState<boolean>(readHero);

  const setSize = useCallback((value: TextSize) => {
    setSizeState(value);
    try {
      window.localStorage.setItem(SIZE_KEY, String(value));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleHero = useCallback(() => {
    setHeroState((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(HERO_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { size, setSize, hero, toggleHero };
}
