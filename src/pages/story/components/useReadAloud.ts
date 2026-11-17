import { useCallback, useEffect, useRef, useState } from "react";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { wordDuration } from "./parse";

/**
 * Read-aloud with word-by-word highlight.
 * Browser TTS word-boundary events are unreliable for Arabic, so the highlight runs
 * on a gentle timer matched to the reading pace; it starts when the voice starts,
 * and the page is only "done" once both the timer and the voice have finished.
 */
export default function useReadAloud(onPageDone: () => void) {
  const { supported, speaking, speak, stop } = useArabicSpeech();
  const [word, setWord] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const speakingRef = useRef(speaking);
  speakingRef.current = speaking;
  const doneRef = useRef(onPageDone);
  doneRef.current = onPageDone;

  const runRef = useRef(0);
  const playingRef = useRef(false);
  const timeouts = useRef<number[]>([]);
  const intervals = useRef<number[]>([]);

  const clear = useCallback(() => {
    timeouts.current.forEach((id) => window.clearTimeout(id));
    intervals.current.forEach((id) => window.clearInterval(id));
    timeouts.current = [];
    intervals.current = [];
  }, []);

  const halt = useCallback(() => {
    runRef.current += 1;
    clear();
    stop();
    playingRef.current = false;
    setPlaying(false);
    setWord(-1);
  }, [clear, stop]);

  const play = useCallback(
    (plain: string, words: string[]) => {
      clear();
      runRef.current += 1;
      const run = runRef.current;
      playingRef.current = true;
      setPlaying(true);
      setWord(-1);
      if (supported) speak(plain);

      const startedAt = Date.now();
      const alive = () => run === runRef.current;

      const waitForVoice = () => {
        const waitStart = Date.now();
        const id = window.setInterval(() => {
          if (!alive()) {
            window.clearInterval(id);
            return;
          }
          if (!speakingRef.current || Date.now() - waitStart > 6000) {
            window.clearInterval(id);
            timeouts.current.push(
              window.setTimeout(() => {
                if (alive()) doneRef.current();
              }, 650)
            );
          }
        }, 150);
        intervals.current.push(id);
      };

      const begin = () => {
        let at = 0;
        words.forEach((w, i) => {
          timeouts.current.push(
            window.setTimeout(() => {
              if (alive()) setWord(i);
            }, at)
          );
          at += wordDuration(w);
        });
        timeouts.current.push(window.setTimeout(waitForVoice, at));
      };

      if (!supported) {
        begin();
        return;
      }
      const id = window.setInterval(() => {
        if (!alive()) {
          window.clearInterval(id);
          return;
        }
        if (speakingRef.current || Date.now() - startedAt > 1500) {
          window.clearInterval(id);
          begin();
        }
      }, 80);
      intervals.current.push(id);
    },
    [clear, speak, supported]
  );

  /** Speak one short phrase (a vocabulary meaning) and stop any page reading. */
  const say = useCallback(
    (text: string) => {
      halt();
      if (supported) speak(text);
    },
    [halt, speak, supported]
  );

  useEffect(() => {
    return () => {
      runRef.current += 1;
      clear();
    };
  }, [clear]);

  return { supported, playing, playingRef, word, play, halt, say };
}
