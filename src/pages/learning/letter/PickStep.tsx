import { useMemo, useState } from "react";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { useSound } from "@/components/feature/SoundProvider";
import { letters, wordPic, type ArabicLetter, type LetterWord } from "@/data/letters";
import { ar, BTN_PRIMARY, BTN_SECONDARY, shuffle, type ToneKit } from "./kit";
import { Sparkles } from "./parts";

const ROUNDS = 3;

type Choice = LetterWord & { key: string };
type Round = { target: Choice; choices: Choice[] };

const CHOICE_TONES = [
  { box: "bg-sky-100 text-sky-700", ring: "ring-sky-400" },
  { box: "bg-primary-100 text-primary-800", ring: "ring-primary-500" },
  { box: "bg-foreground-100 text-foreground-800", ring: "ring-foreground-400" },
];

function buildRounds(letter: ArabicLetter): Round[] {
  const own = letter.words;
  const targets = shuffle(own);
  const pool = letters
    .filter((other) => other.id !== letter.id)
    .flatMap((other) =>
      other.words.map((item) => ({ ...item, key: `${other.id}:${item.word}` }))
    );

  return Array.from({ length: ROUNDS }, (_, index) => {
    const base = targets[index % targets.length];
    const target: Choice = { ...base, key: `${letter.id}:${base.word}` };
    const usedIcons = new Set<string>([target.pic]);
    const distractors: Choice[] = [];
    for (const candidate of shuffle(pool)) {
      if (usedIcons.has(candidate.pic)) continue;
      usedIcons.add(candidate.pic);
      distractors.push(candidate);
      if (distractors.length === 2) break;
    }
    return { target, choices: shuffle([target, ...distractors]) };
  });
}

export default function PickStep({
  letter,
  tone,
  onBack,
  onComplete,
}: {
  letter: ArabicLetter;
  tone: ToneKit;
  onBack: () => void;
  onComplete: (stars: number) => void;
}) {
  const { speak, speakSequence } = useArabicSpeech();
  const { play } = useSound();
  const rounds = useMemo(() => buildRounds(letter), [letter]);

  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [burst, setBurst] = useState(0);
  const [shakeKey, setShakeKey] = useState<string | null>(null);

  const round = rounds[index];
  const misses = wrong.length;
  const hint = misses >= 2 && !solved;
  const last = index === rounds.length - 1;

  const choose = (choice: Choice) => {
    if (solved || wrong.includes(choice.key)) return;
    if (choice.key === round.target.key) {
      setSolved(true);
      setBurst((n) => n + 1);
      if (misses === 0) setFirstTry((n) => n + 1);
      try {
        play("correct");
      } catch {
        /* sound is optional */
      }
      speak(choice.word);
    } else {
      setWrong((list) => [...list, choice.key]);
      setShakeKey(choice.key);
      try {
        play("wrong");
      } catch {
        /* sound is optional */
      }
    }
  };

  const next = () => {
    if (!last) {
      setIndex((n) => n + 1);
      setWrong([]);
      setSolved(false);
      setShakeKey(null);
      return;
    }
    const total = firstTry;
    onComplete(total >= 3 ? 3 : total === 2 ? 2 : 1);
  };

  return (
    <div className="animate-rise-in">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="flex items-center gap-1.5" aria-label={`الجولة ${ar(index + 1)} من ${ar(rounds.length)}`} role="img">
          {rounds.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                i < index || (i === index && solved)
                  ? "w-8 bg-leaf-600"
                  : i === index
                    ? `w-8 ${tone.bar}`
                    : "w-2.5 bg-background-300"
              }`}
            />
          ))}
        </div>

        <h3 className="mt-4 text-xl font-bold md:text-2xl">
          أيّ صورة تبدأ بحرف {letter.name}؟
        </h3>
        <div className="mt-3 flex items-center gap-3">
          <span
            className={`flex h-16 w-16 items-center justify-center rounded-3xl ${tone.soft} font-heading text-4xl font-bold ${tone.text}`}
            lang="ar"
          >
            {letter.letter}
          </span>
          <button
            type="button"
            onClick={() => speakSequence([`أيّ صورة تبدأ بحرف ${letter.name}؟`])}
            aria-label="أعد السؤال بالصوت"
            className="btn-icon"
          >
            <i className="ri-volume-up-line text-xl" />
          </button>
        </div>

        <div className="relative mt-6 w-full">
          <ul className="grid grid-cols-3 gap-3 md:gap-4">
            {round.choices.map((choice, i) => {
              const isRight = choice.key === round.target.key;
              const isWrong = wrong.includes(choice.key);
              const pulse = (hint && isRight) || (solved && isRight);
              const skin = CHOICE_TONES[i % CHOICE_TONES.length];
              return (
                <li key={choice.key}>
                  <button
                    type="button"
                    onClick={() => choose(choice)}
                    disabled={solved || isWrong}
                    aria-label={choice.word}
                    className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-3xl p-3 shadow-[0_6px_0_rgb(0_0_0/0.08)] transition-all duration-300 ${
                      isWrong
                        ? "scale-95 bg-background-200 text-foreground-400"
                        : `${skin.box} ${solved && !isRight ? "opacity-50" : "hover:-translate-y-1.5 active:scale-95"}`
                    } ${pulse ? `ring-4 ${skin.ring} ${hint ? "animate-pulse lj-nudge" : ""}` : ""} ${
                      shakeKey === choice.key && isWrong ? "lj-shake" : ""
                    } ${solved || isWrong ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <img src={wordPic(choice)} alt="" draggable={false} className={`h-full w-full max-h-[78%] max-w-[78%] object-contain drop-shadow-[0_6px_6px_rgba(0,0,0,0.18)] transition-all ${isWrong ? "grayscale opacity-40" : ""} ${solved && isRight ? "animate-celebrate-pop" : ""}`} />
                    {solved && isRight ? (
                      <>
                        <span className="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-leaf-600 text-lg text-background-50">
                          <i className="ri-check-line" />
                        </span>
                        <span className="absolute inset-x-0 bottom-2 text-sm font-bold text-foreground-900">
                          {choice.word}
                        </span>
                      </>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {solved ? <Sparkles run={burst} /> : null}
        </div>

        <p aria-live="polite" className="mt-4 min-h-[1.75rem] text-base font-bold text-foreground-800">
          {solved
            ? `أحسنت! «${round.target.word}» تبدأ بحرف ${letter.name}.`
            : misses > 0
              ? hint
                ? "جرّب مرة أخرى، الصورة المضيئة هي الإجابة الصحيحة."
                : "جرّب مرة أخرى، أنت قريب!"
              : "اضغط على الصورة الصحيحة."}
        </p>

        {solved ? (
          <button type="button" onClick={next} className={`${BTN_PRIMARY} mt-2 animate-celebrate-pop`}>
            {last ? "أنهيت الجولات" : "الصورة التالية"}
            <i className={last ? "ri-trophy-line" : "ri-arrow-left-line"} />
          </button>
        ) : null}
      </div>

      <div className="mt-6 flex justify-start">
        <button type="button" onClick={onBack} className={BTN_SECONDARY}>
          <i className="ri-arrow-right-line" />
          السابق
        </button>
      </div>
    </div>
  );
}
