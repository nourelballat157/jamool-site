import { useCallback, useEffect, useRef, useState } from "react";
import { ayahAudio } from "@/data/quranSurahs";

export type PlayResult = "ended" | "error" | "stopped";

const START_TIMEOUT_MS = 9000;

/**
 * One shared <audio> element that plays a single ayah at a time from the reciter files.
 * `play()` resolves when the ayah ends, fails or is interrupted, so callers can
 * chain verses with plain async code. `progress` (0..1) drives word highlighting.
 */
export default function useReciter() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const settleRef = useRef<((result: PlayResult) => void) | null>(null);
  const timerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastProgressRef = useRef(0);

  const [playing, setPlaying] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopFrames = () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const settle = useCallback((result: PlayResult) => {
    clearTimer();
    stopFrames();
    const done = settleRef.current;
    settleRef.current = null;
    setPlaying(null);
    setLoading(false);
    if (result !== "stopped") setProgress(0);
    lastProgressRef.current = 0;
    if (done) done(result);
  }, []);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration > 0 && Number.isFinite(audio.duration)) {
      const next = Math.min(1, audio.currentTime / audio.duration);
      if (Math.abs(next - lastProgressRef.current) >= 0.01) {
        lastProgressRef.current = next;
        setProgress(next);
      }
    }
    frameRef.current = window.requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlaying = () => {
      clearTimer();
      setLoading(false);
      setFailed(false);
      stopFrames();
      frameRef.current = window.requestAnimationFrame(tick);
    };
    const onEnded = () => {
      setProgress(1);
      settle("ended");
    };
    const onError = () => {
      setFailed(true);
      settle("error");
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      clearTimer();
      stopFrames();
      settleRef.current = null;
    };
  }, [settle, tick]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    settle("stopped");
  }, [settle]);

  const play = useCallback(
    (g: number): Promise<PlayResult> => {
      const audio = audioRef.current;
      if (!audio) return Promise.resolve("error");
      // interrupt whatever is playing; its promise resolves "stopped"
      audio.pause();
      settle("stopped");

      return new Promise<PlayResult>((resolve) => {
        settleRef.current = resolve;
        setPlaying(g);
        setLoading(true);
        setProgress(0);
        lastProgressRef.current = 0;
        audio.src = ayahAudio(g);
        timerRef.current = window.setTimeout(() => {
          // the network never delivered audio: give up gently
          audio.pause();
          setFailed(true);
          settle("error");
        }, START_TIMEOUT_MS);
        audio.play().catch((err: unknown) => {
          // a newer play() or stop() already took over: not an error
          if (settleRef.current !== resolve) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          setFailed(true);
          settle("error");
        });
      });
    },
    [settle]
  );

  return { play, stop, playing, loading, progress, failed, clearFailed: () => setFailed(false) };
}

export type Reciter = ReturnType<typeof useReciter>;
