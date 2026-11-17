import { useCallback } from "react";
import { playSound } from "@/hooks/soundEngine";

/**
 * Encouragement sounds for games, now powered by the single shared sound
 * engine so the global Sound On/Off control applies to every game at once.
 */
export default function useGameSounds() {
  const playCorrect = useCallback(() => playSound("correct"), []);
  const playWrong = useCallback(() => playSound("wrong"), []);
  const playWin = useCallback(() => playSound("win"), []);
  const playClick = useCallback(() => playSound("click"), []);

  return { playCorrect, playWrong, playWin, playClick };
}