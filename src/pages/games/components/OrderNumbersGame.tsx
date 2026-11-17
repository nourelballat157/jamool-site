import { useEffect, useState } from "react";
import useGameSounds from "@/hooks/useGameSounds";
import { completeActivity } from "@/hooks/useActivityProgress";
import { useCelebration } from "@/pages/games/components/celebration";
import { useRewards } from "@/components/feature/RewardProvider";
import { RestartButton, RewardPanel, StatBar, toAr, useGamesProgress } from "@/pages/games/components/gameParts";

const NUMBERS = ["١", "٢", "٣", "٤", "٥"];

const shuffle = () => [...NUMBERS].sort(() => Math.random() - 0.5);

export default function OrderNumbersGame({ soundOn = true }: { soundOn?: boolean }) {
  const { playCorrect, playWrong, playWin } = useGameSounds();
  const { celebrate } = useCelebration();
  const { earn } = useRewards();
  const games = useGamesProgress();
  const [pool, setPool] = useState<string[]>(() => shuffle());
  const [placed, setPlaced] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [winPlayed, setWinPlayed] = useState(false);

  const next = NUMBERS[placed.length];
  const won = placed.length === NUMBERS.length;

  useEffect(() => {
    if (won && !winPlayed) {
      if (soundOn) playWin();
      celebrate();
      completeActivity("game:numbers");
      earn("game:numbers", 10, "أنهيت لعبة مغامرة الأرقام");
      setWinPlayed(true);
    }
  }, [won, winPlayed, soundOn, playWin, celebrate, earn]);

  const place = (digit: string) => {
    if (placed.includes(digit)) return;
    if (digit !== next) {
      setMessage("حاول بالترتيب: ابدأ بالأصغر");
      if (soundOn) playWrong();
      return;
    }
    setMessage("");
    if (soundOn) playCorrect();
    setPlaced((prev) => [...prev, digit]);
  };

  const restart = () => {
    setPool(shuffle());
    setPlaced([]);
    setMessage("");
    setWinPlayed(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <StatBar
        icon="ri-sort-asc"
        left="رتّب من الأصغر إلى الأكبر"
        right={
          <>
            {toAr(placed.length)} / {toAr(NUMBERS.length)}
          </>
        }
      />

      <div className="flex min-h-[4rem] flex-wrap items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-background-300 bg-background-100 p-3">
        {placed.length === 0 ? (
          <span className="text-sm font-medium text-foreground-500">اضغط الأرقام بالترتيب هنا…</span>
        ) : (
          placed.map((digit) => (
            <span
              key={digit}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-100 font-heading text-2xl font-bold text-leaf-800"
            >
              {digit}
            </span>
          ))
        )}
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        {pool.map((digit) => {
          const used = placed.includes(digit);
          return (
            <button
              key={digit}
              type="button"
              onClick={() => place(digit)}
              disabled={used}
              className={`flex aspect-square min-h-[3.25rem] cursor-pointer items-center justify-center rounded-2xl font-heading text-3xl font-bold transition-colors duration-200 disabled:cursor-default ${
                used ? "bg-background-100 text-foreground-300" : "bg-primary-100 text-foreground-900 hover:bg-primary-200"
              }`}
            >
              {digit}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" role="status" className="min-h-[3rem]">
        {message ? (
          <p className="flex items-center justify-center gap-2 rounded-3xl bg-primary-50 p-3 text-sm font-bold text-primary-900">
            <i className="ri-lightbulb-flash-line" />
            {message}
          </p>
        ) : null}
      </div>

      {won ? (
        <RewardPanel
          title="ترتيب مثالي! أحسنت"
          text="رتّبت الأرقام من الأصغر إلى الأكبر."
          character="thaloob"
          progress={{
            value: games.pct,
            label: "الألعاب التي أنهيتها",
            caption: `أنهيت ${toAr(games.finished)} من ${toAr(games.total)} ألعاب`,
          }}
        />
      ) : null}

      <RestartButton onClick={restart} />
    </div>
  );
}
