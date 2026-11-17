import { useEffect, useState } from "react";
import useGameSounds from "@/hooks/useGameSounds";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { useCelebration } from "@/pages/games/components/celebration";
import { useRewards } from "@/components/feature/RewardProvider";
import { completeActivity } from "@/hooks/useActivityProgress";
import { StatBar, toAr } from "@/pages/games/components/gameParts";

type LetterItem = { emoji: string; word: string; letter: string };

const ITEMS: LetterItem[] = [
  { emoji: "🦁", word: "أسد", letter: "أ" },
  { emoji: "🦆", word: "بطة", letter: "ب" },
  { emoji: "🍎", word: "تفاحة", letter: "ت" },
  { emoji: "🦊", word: "ثعلب", letter: "ث" },
  { emoji: "🐪", word: "جمل", letter: "ج" },
  { emoji: "🐴", word: "حصان", letter: "ح" },
  { emoji: "🐑", word: "خروف", letter: "خ" },
  { emoji: "🐔", word: "دجاجة", letter: "د" },
];

const shuffle = <T,>(items: T[]): T[] => [...items].sort(() => Math.random() - 0.5);

const makeRound = (previous?: LetterItem) => {
  const pool = ITEMS.filter((item) => item.letter !== previous?.letter);
  const target = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffle(ITEMS.filter((item) => item.letter !== target.letter)).slice(0, 3);
  const letters = shuffle([target, ...distractors]).map((item) => item.letter);
  return { target, letters };
};

export default function LetterMatchGame({ soundOn = true }: { soundOn?: boolean }) {
  const { playCorrect, playWrong } = useGameSounds();
  const { speak } = useArabicSpeech();
  const { celebrate } = useCelebration();
  const { earn } = useRewards();
  const [round, setRound] = useState(() => makeRound());
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const currentWord = round.target.word;

  useEffect(() => {
    if (!soundOn) return;
    const timer = window.setTimeout(() => speak(currentWord), 250);
    return () => window.clearTimeout(timer);
  }, [currentWord, soundOn, speak]);

  const choose = (letter: string) => {
    if (picked) return;
    setPicked(letter);
    if (letter === round.target.letter) {
      setScore((value) => value + 1);
      if (score + 1 >= 5) {
        // five correct answers finish the game (points are given once)
        earn("game:letters", 10, "أنهيت لعبة عالم الحروف");
        completeActivity("game:letters");
      }
      if (soundOn) playCorrect();
      celebrate();
    } else if (soundOn) {
      playWrong();
    }
    window.setTimeout(() => {
      setRound((prev) => makeRound(prev.target));
      setPicked(null);
    }, 1000);
  };

  const isCorrect = picked === round.target.letter;

  return (
    <div className="flex flex-col gap-5">
      <StatBar icon="ri-star-fill" left={<>نقاطك: {toAr(score)}</>} right="بأي حرف تبدأ الكلمة؟" />

      <div className="flex flex-col items-center gap-2 rounded-3xl bg-primary-50 py-6">
        <span className="text-6xl" aria-hidden="true">
          {round.target.emoji}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-heading text-2xl font-bold text-foreground-900">{round.target.word}</span>
          <button
            type="button"
            onClick={() => speak(round.target.word)}
            aria-label="استمع إلى الكلمة"
            className="btn-icon !bg-primary-500 !text-foreground-900"
          >
            <i className="ri-volume-up-line text-xl" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {round.letters.map((letter) => {
          const chosen = picked === letter;
          const reveal = picked !== null && letter === round.target.letter;
          return (
            <button
              key={letter}
              type="button"
              onClick={() => choose(letter)}
              className={`flex aspect-square min-h-[3.5rem] cursor-pointer items-center justify-center rounded-2xl font-heading text-3xl font-bold transition-colors duration-200 ${
                reveal
                  ? "bg-leaf-100 text-leaf-800"
                  : chosen
                    ? "bg-secondary-100 text-secondary-800"
                    : "bg-background-100 text-foreground-800 hover:bg-background-200"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" role="status" className="min-h-[3rem]">
        {picked ? (
          <p
            className={`flex items-center justify-center gap-2 rounded-3xl p-3 text-sm font-bold ${
              isCorrect ? "bg-leaf-50 text-leaf-800" : "bg-primary-50 text-primary-900"
            }`}
          >
            <i className={isCorrect ? "ri-checkbox-circle-line" : "ri-lightbulb-flash-line"} />
            {isCorrect ? "إجابة صحيحة! أحسنت" : `تبدأ بحرف ${round.target.letter}`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
