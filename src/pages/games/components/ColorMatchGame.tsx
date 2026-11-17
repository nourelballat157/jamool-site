import { useState } from "react";
import useGameSounds from "@/hooks/useGameSounds";
import { useCelebration } from "@/pages/games/components/celebration";
import { useRewards } from "@/components/feature/RewardProvider";
import { completeActivity } from "@/hooks/useActivityProgress";
import { StatBar, toAr } from "@/pages/games/components/gameParts";

type ColorItem = { name: string; hex: string };

/* Functional exception: these are the real colours the child has to recognise, so they keep literal values. */
const COLORS: ColorItem[] = [
  { name: "أحمر", hex: "#ef4444" },
  { name: "أزرق", hex: "#3b82f6" },
  { name: "أخضر", hex: "#22c55e" },
  { name: "أصفر", hex: "#facc15" },
  { name: "برتقالي", hex: "#f97316" },
  { name: "وردي", hex: "#ec4899" },
  { name: "بنفسجي", hex: "#8b5cf6" },
  { name: "بني", hex: "#a16207" },
];

const shuffle = <T,>(items: T[]): T[] => [...items].sort(() => Math.random() - 0.5);

const makeRound = () => {
  const target = COLORS[Math.floor(Math.random() * COLORS.length)];
  const others = COLORS.filter((item) => item.name !== target.name);
  const options = shuffle([target, ...shuffle(others).slice(0, 3)]);
  return { target, options };
};

export default function ColorMatchGame({ soundOn = true }: { soundOn?: boolean }) {
  const { playCorrect, playWrong } = useGameSounds();
  const { celebrate } = useCelebration();
  const { earn } = useRewards();
  const [round, setRound] = useState(() => makeRound());
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (name: string) => {
    if (picked) return;
    setPicked(name);
    if (name === round.target.name) {
      setScore((value) => value + 1);
      if (score + 1 >= 5) {
        // five correct answers finish the game (points are given once)
        earn("game:color", 10, "أنهيت لعبة اكتشف الألوان");
        completeActivity("game:color");
      }
      if (soundOn) playCorrect();
      celebrate();
    } else if (soundOn) {
      playWrong();
    }
    window.setTimeout(() => {
      setRound(makeRound());
      setPicked(null);
    }, 1000);
  };

  const isCorrect = picked === round.target.name;

  return (
    <div className="flex flex-col gap-5">
      <StatBar icon="ri-star-fill" left={<>نقاطك: {toAr(score)}</>} right="ما هو هذا اللون؟" />

      <div className="flex justify-center">
        <span
          role="img"
          aria-label="لون يحتاج إلى اسم"
          className="h-28 w-28 rounded-full border-4 border-background-200 shadow-[var(--shadow-card)]"
          style={{ backgroundColor: round.target.hex }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {round.options.map((option) => {
          const chosen = picked === option.name;
          const reveal = picked !== null && option.name === round.target.name;
          return (
            <button
              key={option.name}
              type="button"
              onClick={() => choose(option.name)}
              className={`flex min-h-14 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 text-base font-bold transition-colors duration-200 ${
                reveal
                  ? "bg-leaf-100 text-leaf-800"
                  : chosen
                    ? "bg-secondary-100 text-secondary-800"
                    : "bg-background-100 text-foreground-800 hover:bg-background-200"
              }`}
            >
              <span aria-hidden="true" className="h-4 w-4 rounded-full border border-foreground-900/10" style={{ backgroundColor: option.hex }} />
              {option.name}
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
            {isCorrect ? "إجابة صحيحة! أحسنت" : `اللون الصحيح هو ${round.target.name}`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
