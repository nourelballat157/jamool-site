import { useEffect, useMemo, useRef, useState } from "react";
import { arNum, type SurahMeta } from "@/data/quranSurahs";
import type { Reciter } from "./useReciter";
import { activeWordAt, splitWords, wordShares } from "./words";
import { AUDIO_ERROR_TEXT, BTN_ACCENT, BTN_SECONDARY } from "./kit";
import { AudioNote, VerseBadge, Waves, WordLine } from "./parts";

const GAP_MS = 450;
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export default function ListenStage({
  surah,
  reciter,
  initialHeard,
  onHeardChange,
  onDone,
}: {
  surah: SurahMeta;
  reciter: Reciter;
  /** verses already heard in an earlier visit (the first N) */
  initialHeard: number;
  onHeardChange: (count: number) => void;
  onDone: () => void;
}) {
  const verses = useMemo(
    () =>
      surah.ayahs.map((ayah) => {
        const words = splitWords(ayah.t);
        return { ...ayah, words, shares: wordShares(words) };
      }),
    [surah]
  );

  const [heard, setHeard] = useState<Set<number>>(
    () => new Set(Array.from({ length: Math.min(initialHeard, verses.length) }, (_, i) => i))
  );
  const [auto, setAuto] = useState(false);
  const runRef = useRef(0);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const firstRender = useRef(true);

  const allHeard = heard.size >= verses.length;

  const markHeard = (index: number) =>
    setHeard((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    onHeardChange(heard.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heard.size]);

  useEffect(
    () => () => {
      runRef.current += 1;
    },
    []
  );

  const scrollToVerse = (index: number) => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    cardRefs.current[index]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  const playOne = async (index: number) => {
    runRef.current += 1;
    setAuto(false);
    const result = await reciter.play(verses[index].g);
    if (result === "ended") markHeard(index);
  };

  const playAll = async () => {
    runRef.current += 1;
    const run = runRef.current;
    setAuto(true);
    for (let i = 0; i < verses.length; i += 1) {
      if (run !== runRef.current) return;
      scrollToVerse(i);
      const result = await reciter.play(verses[i].g);
      if (run !== runRef.current) return;
      if (result !== "ended") {
        setAuto(false);
        return;
      }
      markHeard(i);
      await wait(GAP_MS);
    }
    if (run === runRef.current) setAuto(false);
  };

  const stopAll = () => {
    runRef.current += 1;
    setAuto(false);
    reciter.stop();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground-900 md:text-2xl">
            استمع بهدوء
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-foreground-600 md:text-base">
            اضغط على آية لتسمعها، أو شغّل السورة كاملة وتابع الكلمات وهي تُتلى.
          </p>
        </div>
        {auto ? (
          <button type="button" onClick={stopAll} className={BTN_SECONDARY}>
            <i className="ri-pause-fill text-lg" />
            إيقاف
          </button>
        ) : (
          <button type="button" onClick={() => void playAll()} className={BTN_ACCENT}>
            <i className="ri-play-circle-line text-xl" />
            شغّل السورة كاملة
          </button>
        )}
      </div>

      <p
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-background-50 px-4 py-2 text-sm font-bold text-accent-800"
        aria-live="polite"
      >
        <i className="ri-headphone-line text-base" />
        سمعتَ {arNum(heard.size)} من {arNum(verses.length)} {verses.length <= 10 ? "آيات" : "آية"}
      </p>

      {reciter.failed ? (
        <div className="mt-4">
          <AudioNote text={AUDIO_ERROR_TEXT} />
        </div>
      ) : null}

      <ol className="mt-5 flex flex-col gap-3">
        {verses.map((verse, index) => {
          const isPlaying = reciter.playing === verse.g;
          const isLoading = isPlaying && reciter.loading;
          const isHeard = heard.has(index);
          const active = isPlaying && !isLoading ? activeWordAt(verse.shares, reciter.progress) : -1;
          return (
            <li
              key={verse.g}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={`rounded-3xl p-4 transition-colors duration-300 md:p-5 ${
                isPlaying ? "bg-background-50 ring-2 ring-accent-300" : "bg-background-50/80"
              }`}
            >
              <div className="flex items-start gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={() => (isPlaying ? stopAll() : void playOne(index))}
                  aria-label={isPlaying ? `إيقاف الآية ${arNum(verse.n)}` : `استمع للآية ${arNum(verse.n)}`}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl transition-colors cursor-pointer ${
                    isPlaying
                      ? "bg-accent-500 text-white"
                      : "bg-accent-100 text-accent-700 hover:bg-accent-200"
                  }`}
                >
                  <i
                    className={
                      isLoading ? "ri-loader-4-line animate-spin" : isPlaying ? "ri-pause-fill" : "ri-play-fill"
                    }
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <WordLine words={verse.words} active={active} />
                </div>
                <VerseBadge n={verse.n} done={isHeard} />
              </div>

              <div className="mt-2 flex min-h-[2.25rem] flex-wrap items-center gap-2 ps-[3.75rem] md:ps-16">
                {isPlaying && !isLoading ? (
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-accent-700">
                    <Waves />
                    يُتلى الآن
                  </span>
                ) : null}
                {reciter.failed && !isHeard && !isPlaying ? (
                  <button
                    type="button"
                    onClick={() => markHeard(index)}
                    className="btn btn-sm min-h-[2.75rem] bg-primary-100 text-primary-800 hover:bg-primary-200"
                  >
                    <i className="ri-check-line text-base" />
                    سمعت الآية
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-col items-center gap-2">
        <button type="button" disabled={!allHeard} onClick={onDone} className={BTN_ACCENT}>
          أنهيت الاستماع — هيّا نردّد
          <i className="ri-arrow-left-line text-lg" />
        </button>
        {!allHeard ? (
          <p className="text-sm text-foreground-600">استمع إلى كل آيات السورة لتنتقل إلى الترديد.</p>
        ) : null}
      </div>
    </div>
  );
}
