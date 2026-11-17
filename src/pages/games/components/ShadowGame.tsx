import { useState } from "react";
import useGameSounds from "@/hooks/useGameSounds";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { completeActivity } from "@/hooks/useActivityProgress";
import { useRewards } from "@/components/feature/RewardProvider";
import { useCelebration } from "@/pages/games/components/celebration";
import { FinishCard, NextButton, Notice, RoundBar, shuffleList, useLater } from "@/pages/games/components/gameParts";

type Thing = { id: string; name: string; icon: string; tone: string };

const THINGS: Thing[] = [
  { id: "sun", name: "شمس", icon: "ri-sun-fill", tone: "text-primary-500" },
  { id: "moon", name: "قمر", icon: "ri-moon-fill", tone: "text-primary-600" },
  { id: "star", name: "نجمة", icon: "ri-star-fill", tone: "text-primary-400" },
  { id: "heart", name: "قلب", icon: "ri-heart-fill", tone: "text-secondary-500" },
  { id: "home", name: "بيت", icon: "ri-home-fill", tone: "text-secondary-600" },
  { id: "tree", name: "شجرة", icon: "ri-tree-fill", tone: "text-leaf-600" },
  { id: "flower", name: "زهرة", icon: "ri-flower-fill", tone: "text-secondary-400" },
  { id: "apple", name: "تفاحة", icon: "ri-apple-fill", tone: "text-secondary-500" },
  { id: "cloud", name: "غيمة", icon: "ri-cloud-fill", tone: "text-foreground-400" },
  { id: "gift", name: "هدية", icon: "ri-gift-fill", tone: "text-secondary-500" },
  { id: "key", name: "مفتاح", icon: "ri-key-fill", tone: "text-primary-600" },
  { id: "umbrella", name: "مظلة", icon: "ri-umbrella-fill", tone: "text-leaf-600" },
  { id: "book", name: "كتاب", icon: "ri-book-fill", tone: "text-leaf-700" },
  { id: "car", name: "سيارة", icon: "ri-car-fill", tone: "text-secondary-600" },
  { id: "rocket", name: "صاروخ", icon: "ri-rocket-fill", tone: "text-secondary-500" },
  { id: "plane", name: "طائرة", icon: "ri-plane-fill", tone: "text-leaf-600" },
  { id: "football", name: "كرة", icon: "ri-football-fill", tone: "text-primary-700" },
  { id: "bell", name: "جرس", icon: "ri-bell-fill", tone: "text-primary-500" },
];

const ROUNDS = 6;

type Round = { target: Thing; options: Thing[] };

const buildGame = (): Round[] => {
  const targets = shuffleList(THINGS).slice(0, ROUNDS);
  return targets.map((target, index) => {
    const wrong = shuffleList(THINGS.filter((t) => t.id !== target.id)).slice(0, index < 3 ? 2 : 3);
    return { target, options: shuffleList([target, ...wrong]) };
  });
};

type NoticeState = { tone: "good" | "again" | "info"; text: string } | null;

export default function ShadowGame({ soundOn = true }: { soundOn?: boolean }) {
  const { playCorrect, playWrong, playWin } = useGameSounds();
  const { speak } = useArabicSpeech();
  const { celebrate } = useCelebration();
  const { earn } = useRewards();
  const later = useLater();

  const [rounds, setRounds] = useState<Round[]>(() => buildGame());
  const [index, setIndex] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [shaking, setShaking] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [notice, setNotice] = useState<NoticeState>({ tone: "info", text: "من صاحب هذا الظل؟ اضغط على الصورة المناسبة." });
  const [gained, setGained] = useState<number | null>(null);

  const round = rounds[Math.min(index, rounds.length - 1)];
  const finished = gained !== null;

  const choose = (thing: Thing) => {
    if (solved || missed.includes(thing.id)) return;
    if (thing.id === round.target.id) {
      setSolved(true);
      setNotice({ tone: "good", text: `صحيح! الظل لـ«${thing.name}».` });
      if (soundOn) {
        playCorrect();
        later(() => speak(thing.name), 400);
      }
      return;
    }
    setMissed((prev) => [...prev, thing.id]);
    setShaking(thing.id);
    later(() => setShaking(null), 500);
    setNotice({ tone: "again", text: "جرّب مرة أخرى! انظر جيدًا إلى شكل الظل." });
    if (soundOn) playWrong();
  };

  const next = () => {
    if (index + 1 < rounds.length) {
      setIndex(index + 1);
      setMissed([]);
      setSolved(false);
      setNotice({ tone: "info", text: "ظل جديد! من صاحبه؟" });
      return;
    }
    if (soundOn) playWin();
    celebrate();
    const result = earn("game:shadow", 10, "أنهيت لعبة تحدي الظلال");
    completeActivity("game:shadow");
    setNotice(null);
    setGained(result.gained);
  };

  const restart = () => {
    setRounds(buildGame());
    setIndex(0);
    setMissed([]);
    setSolved(false);
    setGained(null);
    setNotice({ tone: "info", text: "من صاحب هذا الظل؟ اضغط على الصورة المناسبة." });
  };

  if (finished) {
    return (
      <div className="flex flex-col gap-4">
        <RoundBar icon="ri-contrast-drop-2-line" label="تحدي الظلال" round={ROUNDS} total={ROUNDS} done={ROUNDS} />
        <FinishCard
          title="عين الصقر!"
          text="عرفت أصحاب الظلال كلها بالنظر إلى أشكالها."
          gained={gained ?? 0}
          onAgain={restart}
        >
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {rounds.map((r) => (
              <li key={r.target.id} className="flex h-11 w-11 items-center justify-center rounded-full bg-background-50 text-2xl">
                <i className={`${r.target.icon} ${r.target.tone}`} aria-label={r.target.name} />
              </li>
            ))}
          </ul>
        </FinishCard>
      </div>
    );
  }

  // after two misses one of the wrong pictures fades away to help
  const hidden = missed.length >= 2 ? round.options.find((o) => o.id !== round.target.id && !missed.includes(o.id))?.id : undefined;

  return (
    <div className="flex flex-col gap-4">
      <RoundBar
        icon="ri-contrast-drop-2-line"
        label="من صاحب الظل؟"
        round={index + 1}
        total={ROUNDS}
        done={index + (solved ? 1 : 0)}
      />

      <div key={index} className="animate-rise-in flex flex-col items-center gap-3 rounded-3xl bg-primary-50 px-4 py-6">
        <div
          className={`relative flex h-36 w-36 items-center justify-center rounded-full border-2 border-dashed transition-colors duration-500 ${
            solved ? "border-leaf-400 bg-background-50" : "border-primary-300 bg-background-50"
          }`}
        >
          <i
            className={`${round.target.icon} text-7xl transition-all duration-500 ${
              solved ? `${round.target.tone} scale-110` : "text-foreground-950 opacity-80"
            }`}
            aria-label={solved ? round.target.name : "ظل لشيء مجهول"}
            role="img"
          />
          {solved ? (
            <i className="ri-sparkling-2-fill absolute end-2 top-2 text-2xl text-primary-400 motion-safe:animate-twinkle" aria-hidden="true" />
          ) : (
            <i className="ri-question-mark absolute -top-1 end-3 text-2xl text-primary-500 motion-safe:animate-floaty" aria-hidden="true" />
          )}
        </div>
        <p className="font-heading text-lg font-bold text-foreground-950">
          {solved ? round.target.name : "من صاحب هذا الظل؟"}
        </p>
      </div>

      <ul className={`grid gap-2.5 ${round.options.length > 3 ? "grid-cols-2" : "grid-cols-3"}`} aria-label="الصور">
        {round.options.map((thing) => {
          const wasMissed = missed.includes(thing.id);
          const isTarget = solved && thing.id === round.target.id;
          const faded = hidden === thing.id;
          return (
            <li key={thing.id}>
              <button
                type="button"
                onClick={() => choose(thing)}
                disabled={solved || wasMissed || faded}
                aria-label={thing.name}
                className={`flex h-24 w-full items-center justify-center rounded-2xl text-5xl transition-all duration-300 cursor-pointer disabled:cursor-default ${
                  isTarget
                    ? "bg-leaf-100 xg-pop"
                    : wasMissed || faded
                      ? "scale-90 bg-background-100 opacity-30"
                      : solved
                        ? "bg-background-100 opacity-50"
                        : "bg-background-100 hover:-translate-y-1 hover:bg-background-200"
                } ${shaking === thing.id ? "xg-shake" : ""}`}
              >
                <i className={`${thing.icon} ${thing.tone}`} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      <Notice tone={notice?.tone} text={notice?.text} />

      {solved ? <NextButton onClick={next}>{index + 1 < rounds.length ? "الظل التالي" : "أنهِ اللعبة"}</NextButton> : null}
    </div>
  );
}
