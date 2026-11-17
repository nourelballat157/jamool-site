import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { playSound, setSoundEnabled, type SoundName } from "@/hooks/soundEngine";

type SoundContextValue = {
  soundOn: boolean;
  toggle: () => void;
  setSoundOn: (value: boolean) => void;
  play: (name: SoundName) => void;
};

const SoundContext = createContext<SoundContextValue>({
  soundOn: true,
  toggle: () => {},
  setSoundOn: () => {},
  play: () => {},
});

const STORAGE_KEY = "ajyal_sound_on";

/**
 * One global, reusable Sound On/Off control for the whole experience.
 * It never autoplays on load, keeps a single shared audio context, and adds a
 * soft click feedback on interactive elements.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundOn, setSoundOnState] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    setSoundEnabled(soundOn);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(soundOn));
    } catch {
      /* storage can be unavailable in private mode — ignore */
    }
  }, [soundOn]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest("button, a, [role='button']");
      if (!interactive) return;
      if (interactive.getAttribute("data-sound") === "off") return;
      // Let the page's own handler speak first: a feedback sound (correct / wrong / win / badge)
      // started by this same click must not be swallowed by the generic click blip.
      window.setTimeout(() => playSound("click"), 0);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  const toggle = useCallback(() => setSoundOnState((value) => !value), []);

  const value = useMemo<SoundContextValue>(
    () => ({ soundOn, toggle, setSoundOn: setSoundOnState, play: playSound }),
    [soundOn, toggle]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  return useContext(SoundContext);
}