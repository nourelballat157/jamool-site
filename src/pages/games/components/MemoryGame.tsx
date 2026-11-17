import { useEffect, useState } from "react";
import useGameSounds from "@/hooks/useGameSounds";
import { completeActivity } from "@/hooks/useActivityProgress";
import { useCelebration } from "@/pages/games/components/celebration";
import { useRewards } from "@/components/feature/RewardProvider";
import { RestartButton, RewardPanel, StatBar, toAr, useGamesProgress } from "@/pages/games/components/gameParts";

type Card = { id: number; symbol: string; matched: boolean };

const SYMBOLS = ["🦁", "🐰", "🌟", "🎈", "🍎", "🚀", "⚽", "🎨"];

const buildDeck = (): Card[] => {
  const deck = [...SYMBOLS, ...SYMBOLS].map((symbol, index) => ({ id: index, symbol, matched: false }));
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export default function MemoryGame({ soundOn = true }: { soundOn?: boolean }) {
  const { playCorrect, playWrong, playWin, playClick } = useGameSounds();
  const { celebrate } = useCelebration();
  const { earn } = useRewards();
  const games = useGamesProgress();
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [winPlayed, setWinPlayed] = useState(false);

  const won = deck.length > 0 && deck.every((card) => card.matched);

  useEffect(() => {
    if (flipped.length !== 2) return;
    setLocked(true);
    const [a, b] = flipped;
    const isMatch = deck[a].symbol === deck[b].symbol;
    if (soundOn) {
      if (isMatch) playCorrect();
      else playWrong();
    }
    const timer = window.setTimeout(
      () => {
        setDeck((prev) =>
          prev.map((card, index) =>
            index === a || index === b ? { ...card, matched: isMatch || card.matched } : card
          )
        );
        setFlipped([]);
        setLocked(false);
      },
      isMatch ? 420 : 820
    );
    return () => window.clearTimeout(timer);
  }, [flipped, deck, soundOn, playCorrect, playWrong]);

  useEffect(() => {
    if (won && !winPlayed) {
      if (soundOn) playWin();
      celebrate();
      completeActivity("game:memory");
      earn("game:memory", 10, "أنهيت لعبة الذاكرة");
      setWinPlayed(true);
    }
  }, [won, winPlayed, soundOn, playWin, celebrate, earn]);

  const flip = (index: number) => {
    if (locked || flipped.includes(index) || deck[index].matched || flipped.length >= 2) return;
    if (soundOn) playClick();
    setFlipped((prev) => [...prev, index]);
    if (flipped.length === 1) setMoves((m) => m + 1);
  };

  const restart = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setWinPlayed(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <StatBar
        icon="ri-repeat-line"
        left={<>الحركات: {toAr(moves)}</>}
        right={
          <span className="flex items-center gap-2">
            <i className="ri-star-smile-line text-primary-500" />
            الأزواج: {toAr(deck.filter((card) => card.matched).length / 2)} / {toAr(SYMBOLS.length)}
          </span>
        }
      />

      <div className="grid grid-cols-4 gap-2.5">
        {deck.map((card, index) => {
          const open = card.matched || flipped.includes(index);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(index)}
              aria-label={open ? card.symbol : "بطاقة مغلقة"}
              className={`flex aspect-square min-h-[3.5rem] cursor-pointer items-center justify-center rounded-2xl text-3xl transition-colors duration-200 ${
                card.matched
                  ? "bg-leaf-100 text-foreground-900"
                  : open
                    ? "bg-primary-100 text-foreground-900"
                    : "bg-secondary-500 text-white hover:bg-secondary-600"
              }`}
            >
              {open ? card.symbol : <i className="ri-question-mark text-2xl" />}
            </button>
          );
        })}
      </div>

      {won ? (
        <RewardPanel
          title="أحسنت! أنهيت اللعبة"
          text={`جمعت كل الأزواج في ${toAr(moves)} حركة.`}
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