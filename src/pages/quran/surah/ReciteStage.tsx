import { useMemo, useState } from "react";
import { arNum, type QuranAyah, type SurahMeta } from "@/data/quranSurahs";
import { useSound } from "@/components/feature/SoundProvider";
import type { Reciter } from "./useReciter";
import { shuffledBank, splitWords } from "./words";
import { BTN_ACCENT, BTN_TOOL } from "./kit";
import { AudioNote, Waves } from "./parts";

type Mode = "learn" | "review";

/* One verse: tap its words in order from a shuffled bank. */
function VerseBuilder({
  ayah,
  index,
  total,
  mode,
  reciter,
  onSolved,
  onNext,
}: {
  ayah: QuranAyah;
  index: number;
  total: number;
  mode: Mode;
  reciter: Reciter;
  onSolved: () => void;
  onNext: () => void;
}) {
  const { play } = useSound();
  const words = useMemo(() => splitWords(ayah.t), [ayah.t]);
  const bank = useMemo(() => shuffledBank(words), [words]);

  const [placed, setPlaced] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [hint, setHint] = useState(false);
  const [tried, setTried] = useState(false);
  const [nudge, setNudge] = useState<number | null>(null);
  const [audioTried, setAudioTried] = useState(false);

  const solved = placed.length === words.length;
  const expected = solved ? null : words[placed.length];
  const hintId = hint && expected !== null ? (bank.find((b) => !placed.includes(b.id) && b.text === expected)?.id ?? null) : null;
  const last = index === total - 1;
  const isPlaying = reciter.playing === ayah.g;

  const tap = (id: number) => {
    if (solved || placed.includes(id)) return;
    const item = bank.find((b) => b.id === id);
    if (!item) return;
    if (item.text === expected) {
      const next = [...placed, id];
      setPlaced(next);
      setMisses(0);
      setHint(false);
      setTried(false);
      try {
        play("click");
      } catch {
        /* sound is optional */
      }
      if (next.length === words.length) {
        onSolved();
        setAudioTried(true);
        void reciter.play(ayah.g);
      }
    } else {
      const count = misses + 1;
      setMisses(count);
      setTried(true);
      setNudge(id);
      if (count >= 2) setHint(true);
    }
  };

  const feedback = solved
    ? "أحسنت! رتّبتَ الآية كاملة"
    : hint
      ? "تلميح لطيف: الكلمة المتوهّجة هي التالية"
      : tried
        ? "جرّب مرة أخرى"
        : placed.length === 0
          ? "اضغط على الكلمة الأولى من الآية"
          : "أحسنت! اختر الكلمة التالية";

  return (
    <div>
      <p className="text-center text-xs font-bold text-foreground-600">
        الآية {arNum(index + 1)} من {arNum(total)}
      </p>

      <div
        className={`mt-3 rounded-4xl px-4 py-5 transition-colors duration-500 md:px-8 md:py-7 ${
          solved ? "bg-accent-100" : "card"
        }`}
      >
        <p className="text-center text-xs font-bold text-accent-800">رتّب كلمات الآية</p>
        <ol className="mt-3 flex flex-wrap justify-center gap-2" dir="rtl" aria-label="الآية التي ترتّبها">
          {words.map((word, slot) => {
            const filled = slot < placed.length;
            const current = slot === placed.length;
            return (
              <li
                key={slot}
                className={`flex min-h-[3rem] min-w-[3.25rem] items-center justify-center rounded-2xl px-3 text-center ${
                  filled
                    ? "bg-accent-200 text-accent-900"
                    : current
                      ? "border-2 border-dashed border-accent-400 bg-accent-50"
                      : "border-2 border-dashed border-background-300"
                }`}
              >
                {filled ? (
                  <span key={`f${slot}`} className="qs-ayah qs-place inline-block text-xl md:text-2xl" lang="ar">
                    {word}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-foreground-500" aria-hidden="true">
                    {arNum(slot + 1)}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <p
        className={`mt-4 text-center text-sm font-bold ${solved ? "text-accent-800" : "text-foreground-700"}`}
        aria-live="polite"
      >
        {feedback}
      </p>

      {!solved ? (
        <ul className="mt-3 flex flex-wrap justify-center gap-2.5" dir="rtl" aria-label="كلمات الآية">
          {bank.map((item) => {
            const used = placed.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={used}
                  onClick={() => tap(item.id)}
                  onAnimationEnd={() => setNudge((current) => (current === item.id ? null : current))}
                  className={`qs-ayah min-h-[3rem] cursor-pointer rounded-2xl bg-accent-100 px-4 text-xl leading-none transition-opacity duration-300 hover:bg-accent-200 disabled:cursor-default disabled:opacity-30 md:text-2xl ${
                    nudge === item.id ? "qs-nudge" : ""
                  } ${hintId === item.id ? "qs-hint" : ""}`}
                  lang="ar"
                >
                  {item.text}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {solved && audioTried && reciter.failed ? (
        <div className="mt-4">
          <AudioNote text="تعذّر تشغيل التلاوة الآن، لكنك أحسنت! يمكنك المتابعة." />
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {!solved ? (
          <>
            <button
              type="button"
              onClick={() => setHint(true)}
              className={BTN_TOOL}
              aria-label="أعطني تلميحًا"
            >
              <i className="ri-lightbulb-line text-lg" />
              تلميح
            </button>
            <button
              type="button"
              onClick={() => (isPlaying ? reciter.stop() : void reciter.play(ayah.g))}
              className={BTN_TOOL}
            >
              <i className={isPlaying ? "ri-pause-fill text-lg" : "ri-volume-up-line text-lg"} />
              {isPlaying ? "إيقاف" : "ساعدني بالاستماع"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => (isPlaying ? reciter.stop() : void reciter.play(ayah.g))}
              className={BTN_TOOL}
            >
              {isPlaying ? (
                <>
                  <Waves /> يُتلى الآن
                </>
              ) : (
                <>
                  <i className="ri-volume-up-line text-lg" /> أعد الاستماع
                </>
              )}
            </button>
            <button type="button" onClick={onNext} className={BTN_ACCENT}>
              {last ? (mode === "review" ? "أنهيت المراجعة" : "أنهيت الحفظ") : "الآية التالية"}
              <i className={last ? "ri-check-double-line text-lg" : "ri-arrow-left-line text-lg"} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReciteStage({
  surah,
  reciter,
  mode,
  startVerse,
  onVerseSolved,
  onDone,
}: {
  surah: SurahMeta;
  reciter: Reciter;
  mode: Mode;
  startVerse: number;
  /** `solved` = number of verses completed so far in this stage */
  onVerseSolved: (solved: number) => void;
  onDone: () => void;
}) {
  const total = surah.ayahs.length;
  const [verse, setVerse] = useState(() => Math.min(Math.max(startVerse, 0), total - 1));

  const next = () => {
    reciter.stop();
    if (verse >= total - 1) {
      onDone();
      return;
    }
    setVerse(verse + 1);
  };

  return (
    <div>
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground-900 md:text-2xl">
          {mode === "review" ? "مراجعة سريعة" : "اقرأ الآية من ذاكرتك"}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-foreground-600 md:text-base">
          {mode === "review"
            ? "رتّب كلمات كل آية بالترتيب الصحيح لتثبّت حفظك."
            : "رتّب كلمات كل آية بالترتيب الصحيح، وسيتلوها القارئ لتتأكد."}
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

      <div className="mt-4">
        <VerseBuilder
          key={verse}
          ayah={surah.ayahs[verse]}
          index={verse}
          total={total}
          mode={mode}
          reciter={reciter}
          onSolved={() => onVerseSolved(verse + 1)}
          onNext={next}
        />
      </div>
    </div>
  );
}
