import { useEffect, useState } from "react";
import useGameSounds from "@/hooks/useGameSounds";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { completeActivity } from "@/hooks/useActivityProgress";
import { useRewards } from "@/components/feature/RewardProvider";
import { useCelebration } from "@/pages/games/components/celebration";
import { FinishCard, NextButton, Notice, RoundBar, shuffleList, toAr, useLater } from "@/pages/games/components/gameParts";

type WordItem = { word: string; icon: string; tone: string };

const WORDS: WordItem[] = [
  { word: "شمس", icon: "ri-sun-fill", tone: "text-primary-500" },
  { word: "قمر", icon: "ri-moon-fill", tone: "text-primary-600" },
  { word: "بيت", icon: "ri-home-fill", tone: "text-secondary-500" },
  { word: "قلب", icon: "ri-heart-fill", tone: "text-secondary-500" },
  { word: "عين", icon: "ri-eye-fill", tone: "text-leaf-600" },
  { word: "قلم", icon: "ri-pencil-fill", tone: "text-primary-600" },
  { word: "باب", icon: "ri-door-fill", tone: "text-primary-700" },
  { word: "كتاب", icon: "ri-book-fill", tone: "text-leaf-700" },
  { word: "نجمة", icon: "ri-star-fill", tone: "text-primary-500" },
  { word: "زهرة", icon: "ri-flower-fill", tone: "text-secondary-400" },
  { word: "شجرة", icon: "ri-tree-fill", tone: "text-leaf-600" },
  { word: "غيمة", icon: "ri-cloud-fill", tone: "text-foreground-400" },
  { word: "تفاح", icon: "ri-apple-fill", tone: "text-secondary-500" },
  { word: "هدية", icon: "ri-gift-fill", tone: "text-secondary-500" },
];

const ROUNDS = 5;

type Tile = { id: number; ch: string };

type RoundData = { item: WordItem; tiles: Tile[] };

const buildRound = (item: WordItem): RoundData => {
  const letters = Array.from(item.word).map((ch, id) => ({ id, ch }));
  let tiles = shuffleList(letters);
  // never start already solved
  let guard = 0;
  while (tiles.map((t) => t.ch).join("") === item.word && guard < 8) {
    tiles = shuffleList(letters);
    guard += 1;
  }
  return { item, tiles };
};

/** 5 words, short ones first so the game warms up gently. */
const buildGame = (): RoundData[] =>
  shuffleList(WORDS)
    .slice(0, ROUNDS)
    .sort((a, b) => a.word.length - b.word.length)
    .map(buildRound);

type NoticeState = { tone: "good" | "again" | "info"; text: string } | null;

export default function WordGame({ soundOn = true }: { soundOn?: boolean }) {
  const { playCorrect, playWrong, playWin } = useGameSounds();
  const { supported, speak } = useArabicSpeech();
  const { celebrate } = useCelebration();
  const { earn } = useRewards();
  const later = useLater();

  const [rounds, setRounds] = useState<RoundData[]>(() => buildGame());
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [hintId, setHintId] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [notice, setNotice] = useState<NoticeState>({ tone: "info", text: "اضغط الحروف بالترتيب لتكوّن الكلمة." });
  const [gained, setGained] = useState<number | null>(null);

  const round = rounds[Math.min(index, rounds.length - 1)];
  const target = round.item.word;
  const finished = gained !== null;
  const assembled = placed.map((id) => round.tiles.find((t) => t.id === id)?.ch ?? "").join("");

  useEffect(() => {
    setHintId(null);
  }, [index, placed]);

  const check = (ids: number[]) => {
    if (ids.length !== target.length) return;
    const word = ids.map((id) => round.tiles.find((t) => t.id === id)?.ch ?? "").join("");
    if (word === target) {
      setSolved(true);
      setNotice({ tone: "good", text: `أحسنت! كوّنت كلمة «${target}».` });
      if (soundOn) {
        playCorrect();
        later(() => speak(target), 450);
      }
    } else {
      setShake(true);
      later(() => setShake(false), 500);
      setNotice({ tone: "again", text: "قريب! اضغط على أي حرف لتغيّر مكانه، أو اطلب مساعدة." });
      if (soundOn) playWrong();
    }
  };

  const toggleTile = (tile: Tile) => {
    if (solved) return;
    if (placed.includes(tile.id)) {
      // tap again to take it back
      setPlaced(placed.filter((id) => id !== tile.id));
      setNotice({ tone: "info", text: "أعدنا الحرف. جرّب مكانًا آخر." });
      return;
    }
    const next = [...placed, tile.id];
    setPlaced(next);
    if (next.length < target.length) setNotice(null);
    check(next);
  };

  const removeLast = () => {
    if (solved || placed.length === 0) return;
    setPlaced(placed.slice(0, -1));
    setNotice(null);
  };

  const help = () => {
    if (solved) return;
    // keep the correct beginning, drop the rest, then glow the right next letter
    let keep = 0;
    while (keep < placed.length) {
      const ch = round.tiles.find((t) => t.id === placed[keep])?.ch;
      if (ch !== target[keep]) break;
      keep += 1;
    }
    const kept = placed.slice(0, keep);
    setPlaced(kept);
    const wanted = target[keep];
    const tile = round.tiles.find((t) => t.ch === wanted && !kept.includes(t.id));
    later(() => setHintId(tile?.id ?? null), 30);
    setNotice({
      tone: "again",
      text: keep === 0 ? `الكلمة تبدأ بحرف «${target[0]}». ابحث عنه!` : `الحرف التالي هو «${wanted}».`,
    });
  };

  const goNext = () => {
    if (index + 1 < rounds.length) {
      setIndex(index + 1);
      setPlaced([]);
      setSolved(false);
      setNotice({ tone: "info", text: "كلمة جديدة! اضغط الحروف بالترتيب." });
      return;
    }
    if (soundOn) playWin();
    celebrate();
    const result = earn("game:word", 10, "أنهيت لعبة كوّن الكلمة");
    completeActivity("game:word");
    setNotice(null);
    setGained(result.gained);
  };

  const restart = () => {
    setRounds(buildGame());
    setIndex(0);
    setPlaced([]);
    setSolved(false);
    setGained(null);
    setNotice({ tone: "info", text: "اضغط الحروف بالترتيب لتكوّن الكلمة." });
  };

  if (finished) {
    return (
      <div className="flex flex-col gap-4">
        <RoundBar icon="ri-t-box-line" label="كوّن الكلمة" round={ROUNDS} total={ROUNDS} done={ROUNDS} />
        <FinishCard
          title="صانع كلمات ماهر!"
          text="كوّنت خمس كلمات من الحروف المبعثرة."
          gained={gained ?? 0}
          onAgain={restart}
        >
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {rounds.map((r) => (
              <li
                key={r.item.word}
                lang="ar"
                className="inline-flex items-center gap-1.5 rounded-full bg-background-50 px-3 py-1.5 font-heading text-base font-bold text-foreground-900"
              >
                <i className={`${r.item.icon} ${r.item.tone}`} />
                {r.item.word}
              </li>
            ))}
          </ul>
        </FinishCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <RoundBar icon="ri-t-box-line" label="كوّن الكلمة" round={index + 1} total={ROUNDS} done={index + (solved ? 1 : 0)} />

      <div key={index} className="animate-rise-in flex flex-col items-center gap-3 rounded-3xl bg-primary-50 px-4 py-5">
        <span className={`flex h-24 w-24 items-center justify-center rounded-full bg-background-50 text-5xl ${round.item.tone}`}>
          <i className={round.item.icon} aria-hidden="true" />
        </span>
        <p className="text-sm font-bold text-foreground-700">ما اسم هذه الصورة؟ كوّن الكلمة من الحروف.</p>
        {supported ? (
          <button
            type="button"
            onClick={() => speak(target)}
            aria-label="استمع إلى الكلمة"
            className="btn-icon !bg-primary-500 !text-foreground-900"
          >
            <i className="ri-volume-up-line" />
          </button>
        ) : null}
      </div>

      {/* the assembled word is plain text, so the letters join correctly */}
      <div
        className={`flex min-h-[6.5rem] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-3 py-3 transition-colors duration-300 ${
          solved ? "border-leaf-400 bg-leaf-50" : "border-background-300 bg-background-100"
        } ${shake ? "xg-shake" : ""}`}
      >
        {assembled ? (
          <span
            lang="ar"
            dir="rtl"
            aria-label={assembled}
            className={`font-heading text-5xl font-bold leading-tight ${solved ? "animate-celebrate-pop text-leaf-700" : "text-foreground-950"}`}
          >
            {assembled}
          </span>
        ) : (
          <span className="text-sm font-semibold text-foreground-400">الكلمة ستظهر هنا…</span>
        )}
        <div className="flex items-center justify-center gap-1.5" aria-label={`${toAr(placed.length)} من ${toAr(target.length)} حروف`}>
          {Array.from(target).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < placed.length ? (solved ? "w-8 bg-leaf-500" : "w-8 bg-primary-500") : "w-5 bg-background-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5" role="group" aria-label="الحروف">
        {round.tiles.map((tile) => {
          const used = placed.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => toggleTile(tile)}
              aria-pressed={used}
              aria-label={`حرف ${tile.ch}`}
              disabled={solved}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl font-heading text-4xl font-bold transition-all duration-200 cursor-pointer disabled:cursor-default ${
                used
                  ? "scale-95 bg-background-100 text-foreground-300"
                  : "bg-primary-100 text-foreground-900 hover:-translate-y-1 hover:bg-primary-200"
              } ${hintId === tile.id ? "xg-glow bg-primary-300" : ""}`}
            >
              {tile.ch}
            </button>
          );
        })}
      </div>

      <Notice tone={notice?.tone} text={notice?.text} />

      {solved ? (
        <NextButton onClick={goNext}>{index + 1 < rounds.length ? "الكلمة التالية" : "أنهِ اللعبة"}</NextButton>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={help}
            className="btn btn-primary btn-sm"
          >
            <i className="ri-lightbulb-flash-line" />
            ساعدني
          </button>
          <button
            type="button"
            onClick={removeLast}
            disabled={placed.length === 0}
            className="btn btn-ghost btn-sm"
          >
            <i className="ri-delete-back-2-line" />
            امسح حرفًا
          </button>
        </div>
      )}
    </div>
  );
}
