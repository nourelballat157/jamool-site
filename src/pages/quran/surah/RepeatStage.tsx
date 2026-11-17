import { useMemo, useState } from "react";
import { arNum, REPS_PER_VERSE, type SurahMeta } from "@/data/quranSurahs";
import type { Reciter } from "./useReciter";
import { activeWordAt, splitWords, wordShares } from "./words";
import { AUDIO_ERROR_TEXT, BTN_ACCENT, BTN_SECONDARY } from "./kit";
import { AudioNote, Waves, WordLine } from "./parts";

export default function RepeatStage({
  surah,
  reciter,
  startVerse,
  startReps,
  onProgress,
  onDone,
}: {
  surah: SurahMeta;
  reciter: Reciter;
  startVerse: number;
  startReps: number;
  /** called after every repetition and every verse change */
  onProgress: (verse: number, reps: number) => void;
  onDone: () => void;
}) {
  const total = surah.ayahs.length;
  const [verse, setVerse] = useState(() => Math.min(Math.max(startVerse, 0), total - 1));
  const [reps, setReps] = useState(() => Math.min(Math.max(startReps, 0), REPS_PER_VERSE));
  const [listened, setListened] = useState(() => startReps > 0);

  const ayah = surah.ayahs[verse];
  const words = useMemo(() => splitWords(ayah.t), [ayah.t]);
  const shares = useMemo(() => wordShares(words), [words]);

  const isPlaying = reciter.playing === ayah.g;
  const isLoading = isPlaying && reciter.loading;
  const active = isPlaying && !isLoading ? activeWordAt(shares, reciter.progress) : -1;
  const verseDone = reps >= REPS_PER_VERSE;
  const last = verse === total - 1;

  const listen = async () => {
    if (isPlaying) {
      reciter.stop();
      return;
    }
    const result = await reciter.play(ayah.g);
    if (result === "ended") setListened(true);
  };

  const repeated = () => {
    if (!listened || verseDone) return;
    const next = reps + 1;
    setReps(next);
    onProgress(verse, next);
  };

  const nextVerse = () => {
    reciter.stop();
    if (last) {
      onDone();
      return;
    }
    setVerse(verse + 1);
    setReps(0);
    setListened(false);
    onProgress(verse + 1, 0);
  };

  return (
    <div>
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground-900 md:text-2xl">
          استمع ثم ردّد ثلاث مرات
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-foreground-600 md:text-base">
          اسمع الآية، ثم رددها بصوتك، واضغط «ردّدت الآية» بعد كل مرة.
        </p>
      </div>

      <ol className="mt-5 flex items-center justify-center gap-2" aria-label="آيات السورة">
        {surah.ayahs.map((item, index) => (
          <li
            key={item.g}
            aria-current={index === verse ? "step" : undefined}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              index < verse ? "w-6 bg-accent-500" : index === verse ? "w-10 bg-accent-400" : "w-6 bg-accent-100"
            }`}
          />
        ))}
      </ol>
      <p className="mt-2 text-center text-xs font-bold text-foreground-600">
        الآية {arNum(verse + 1)} من {arNum(total)}
      </p>

      <div className="card mt-4 px-4 py-6 text-center md:px-8 md:py-8">
        <WordLine words={words} active={active} size="text-3xl md:text-4xl" />

        <div className="mt-4 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => void listen()}
            aria-label={isPlaying ? "إيقاف الآية" : "استمع للآية"}
            className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl transition-colors cursor-pointer ${
              isPlaying ? "bg-accent-500 text-white" : "bg-accent-100 text-accent-700 hover:bg-accent-200"
            }`}
          >
            <i
              className={isLoading ? "ri-loader-4-line animate-spin" : isPlaying ? "ri-pause-fill" : "ri-play-fill"}
            />
          </button>
          <span className="inline-flex h-5 items-center gap-2 text-xs font-bold text-accent-700">
            {isPlaying && !isLoading ? (
              <>
                <Waves /> يُتلى الآن
              </>
            ) : (
              <span className="text-foreground-600">{listened ? "اسمعها مرة أخرى متى شئت" : "اضغط واستمع أولًا"}</span>
            )}
          </span>
        </div>

        {reciter.failed && !listened ? (
          <div className="mt-4 flex flex-col items-center gap-3">
            <AudioNote text={AUDIO_ERROR_TEXT} />
            <button
              type="button"
              onClick={() => setListened(true)}
              className="btn bg-primary-100 text-primary-800 hover:bg-primary-200"
            >
              <i className="ri-check-line text-lg" />
              سمعت الآية
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-4xl bg-accent-50 px-4 py-5 text-center md:px-8">
        <p className="text-xs font-bold text-accent-800">عدّاد الترديد</p>
        <div className="mt-3 flex items-center justify-center gap-3" aria-hidden="true">
          {Array.from({ length: REPS_PER_VERSE }, (_, i) => (
            <span
              key={i}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors duration-300 ${
                i < reps ? "bg-primary-100 text-primary-500" : "bg-background-50 text-foreground-300"
              }`}
            >
              <i
                key={i < reps ? "on" : "off"}
                className={`${i < reps ? "ri-star-fill" : "ri-star-line"} ${i === reps - 1 ? "qs-place inline-block" : ""}`}
              />
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm font-bold text-foreground-900" aria-live="polite">
          {verseDone
            ? "أحسنت! أتممتَ ثلاث مرات"
            : `ردّدتَ ${arNum(reps)} من ${arNum(REPS_PER_VERSE)}`}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {verseDone ? (
            <button type="button" onClick={nextVerse} className={BTN_ACCENT}>
              {last ? "أنهيت الترديد — هيّا نقرأ" : "الآية التالية"}
              <i className="ri-arrow-left-line text-lg" />
            </button>
          ) : (
            <button type="button" disabled={!listened} onClick={repeated} className={BTN_ACCENT}>
              <i className="ri-mic-line text-xl" />
              ردّدت الآية
            </button>
          )}
          {!verseDone ? (
            <button type="button" onClick={() => void listen()} className={BTN_SECONDARY}>
              <i className="ri-volume-up-line text-lg" />
              {isPlaying ? "إيقاف" : "اسمعها"}
            </button>
          ) : null}
        </div>
        {!listened && !verseDone ? (
          <p className="mt-3 text-sm text-foreground-600">استمع للآية أولًا ثم ردّدها.</p>
        ) : null}
      </div>
    </div>
  );
}
