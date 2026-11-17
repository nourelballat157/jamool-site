import { useState } from "react";
import Character from "@/components/brand/Character";
import CategoryTile from "@/components/brand/CategoryTile";
import ProgressBar from "@/components/brand/ProgressBar";
import type { ChoicesMission, MissionContent, OrderMission } from "@/data/valueJourneys";
import "../journey.css";

type MissionPanelProps = {
  title: string;
  mission: MissionContent;
  tone: { soft: string; strong: string };
  /** speak Noor's words aloud (the caller decides if sound is on) */
  say: (text: string) => void;
  /** the child finished the mission */
  onFinish: () => void;
  onClose: () => void;
};

const toArabic = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

const finishButton = "btn btn-primary max-w-full";

const softButton = "btn btn-ghost btn-sm min-h-[2.75rem] max-w-full";

/* ------------------------------ scenarios ------------------------------ */

function ChoicesActivity({
  mission,
  tone,
  say,
  onFinish,
}: {
  mission: ChoicesMission;
  tone: { soft: string; strong: string };
  say: (text: string) => void;
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string } | null>(null);
  const [nudge, setNudge] = useState(0);

  const scenario = mission.scenarios[index];
  const last = index === mission.scenarios.length - 1;

  const pick = (choiceIndex: number) => {
    if (solved !== null) return;
    const choice = scenario.choices[choiceIndex];
    if (choice.good) {
      setSolved(choiceIndex);
      setFeedback({ good: true, text: choice.reply });
      say(choice.reply);
    } else {
      setTried((list) => (list.includes(choiceIndex) ? list : [...list, choiceIndex]));
      setNudge((value) => value + 1);
      const text = `${choice.reply} ${scenario.hint}`;
      setFeedback({ good: false, text });
      say(choice.reply);
    }
  };

  const next = () => {
    if (last) {
      onFinish();
      return;
    }
    setIndex((value) => value + 1);
    setTried([]);
    setSolved(null);
    setFeedback(null);
  };

  return (
    <div key={scenario.id} className="vj-fade-in">
      <ProgressBar
        value={((index + (solved !== null ? 1 : 0)) / mission.scenarios.length) * 100}
        tone="leaf"
        label="تقدّم المهمة"
        height="h-2"
      />
      <p className="mt-2 text-xs font-bold text-foreground-500">
        الموقف {toArabic(index + 1)} من {toArabic(mission.scenarios.length)}
      </p>

      <div className="card mt-4 flex items-start gap-4 p-4 md:p-5">
        <CategoryTile icon={scenario.icon} tone="leaf" size="lg" />
        <p className="pt-1 font-heading text-lg font-bold leading-relaxed text-foreground-900 md:text-xl">
          {scenario.prompt}
        </p>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {scenario.choices.map((choice, choiceIndex) => {
          const isSolved = solved === choiceIndex;
          const wasTried = tried.includes(choiceIndex);
          const dimmed = solved !== null && !isSolved;
          return (
            <li key={choice.text}>
              <button
                type="button"
                disabled={solved !== null}
                onClick={() => pick(choiceIndex)}
                aria-pressed={isSolved}
                className={`flex min-h-[3.5rem] w-full items-center gap-3 rounded-3xl border-2 px-4 py-3 text-start text-sm font-bold transition-all duration-300 md:text-base ${
                  isSolved
                    ? "border-leaf-400 bg-leaf-100 text-leaf-800"
                    : wasTried
                      ? "border-primary-200 bg-primary-50 text-foreground-700"
                      : "border-transparent bg-background-50 text-foreground-900 hover:-translate-y-0.5 hover:border-leaf-200"
                  } ${dimmed ? "opacity-50" : ""} cursor-pointer disabled:cursor-default`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base ${
                    isSolved ? "bg-leaf-500 text-white" : wasTried ? "bg-primary-100 text-primary-700" : "bg-background-100 text-foreground-500"
                  }`}
                >
                  <i className={isSolved ? "ri-check-line" : wasTried ? "ri-refresh-line" : "ri-cursor-line"} />
                </span>
                <span className="flex-1 leading-relaxed">{choice.text}</span>
                {wasTried && !isSolved ? (
                  <span className="shrink-0 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-800">
                    فكّر مرة أخرى
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="mt-4 min-h-[1rem]">
        {feedback ? (
          <div
            key={`${feedback.good}-${nudge}`}
            className={`${feedback.good ? "vj-fade-in bg-leaf-100 text-leaf-900" : "vj-nudge bg-primary-100 text-foreground-800"} flex items-start gap-3 rounded-3xl p-4`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                feedback.good ? "bg-leaf-500 text-white" : "bg-primary-500 text-foreground-900"
              }`}
            >
              <i className={feedback.good ? "ri-star-smile-line" : "ri-lightbulb-flash-line"} />
            </span>
            <p className="pt-1 text-sm font-bold leading-relaxed md:text-base">{feedback.text}</p>
          </div>
        ) : null}
      </div>

      {solved !== null ? (
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={next} className={finishButton}>
            {last ? "أنهيت المهمة" : "الموقف التالي"}
            <i className={last ? "ri-check-double-line text-lg" : "ri-arrow-left-line text-lg"} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* --------------------------- tap to order steps --------------------------- */

function OrderActivity({
  mission,
  tone,
  say,
  onFinish,
}: {
  mission: OrderMission;
  tone: { soft: string; strong: string };
  say: (text: string) => void;
  onFinish: () => void;
}) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [wrong, setWrong] = useState<{ step: number; n: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const total = mission.steps.length;
  const complete = placed.length === total;
  const remaining = mission.shuffle.filter((step) => !placed.includes(step));

  const tap = (step: number) => {
    if (complete) return;
    if (step === placed.length) {
      const nextPlaced = [...placed, step];
      setPlaced(nextPlaced);
      setWrong(null);
      if (nextPlaced.length === total) {
        const text = "أحسنت! رتّبت الخطوات كلها بشكل جميل.";
        setMessage(text);
        say(text);
      } else {
        setMessage("ممتاز! خطوة صحيحة. ما الخطوة التالية؟");
      }
    } else {
      setWrong((value) => ({ step, n: (value?.n ?? 0) + 1 }));
      const text = `جرّب مرة أخرى. ${mission.hint}`;
      setMessage(text);
      say("جرّب مرة أخرى.");
    }
  };

  const reset = () => {
    setPlaced([]);
    setWrong(null);
    setMessage(null);
  };

  return (
    <div className="vj-fade-in">
      <p className="text-sm font-bold leading-relaxed text-foreground-600 md:text-base">{mission.prompt}</p>

      <ol className="mt-4 flex flex-col gap-2">
        {mission.steps.map((_, slot) => {
          const filled = placed[slot];
          const isFilled = filled !== undefined;
          return (
            <li
              key={slot}
              className={`flex min-h-[3.25rem] items-center gap-3 rounded-3xl px-3 py-2 transition-colors duration-500 ${
                isFilled ? `${tone.soft} ${tone.strong}` : "border-2 border-dashed border-background-300 bg-background-50/60 text-foreground-400"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isFilled ? "bg-background-50 text-foreground-900" : "bg-background-100 text-foreground-400"
                }`}
              >
                {toArabic(slot + 1)}
              </span>
              {isFilled ? (
                <span key={`filled-${filled}`} className="vj-pop flex-1 text-sm font-bold leading-relaxed md:text-base">
                  {mission.steps[filled]}
                </span>
              ) : (
                <span className="flex-1 text-xs font-bold">الخطوة {toArabic(slot + 1)}</span>
              )}
              {isFilled ? <i className="ri-check-line text-lg text-leaf-700" /> : null}
            </li>
          );
        })}
      </ol>

      {!complete ? (
        <>
          <p className="mt-5 text-xs font-bold text-foreground-500">اضغط على الخطوة التي تأتي الآن:</p>
          <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {remaining.map((step) => (
              <li key={`${step}-${wrong?.step === step ? wrong.n : 0}`}>
                <button
                  type="button"
                  onClick={() => tap(step)}
                  className={`flex min-h-[3.25rem] w-full items-center gap-3 rounded-3xl border-2 border-transparent bg-background-50 px-4 py-2 text-start text-sm font-bold text-foreground-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-leaf-200 cursor-pointer ${
                    wrong?.step === step ? "vj-nudge border-primary-200 bg-primary-50" : ""
                  }`}
                >
                  <i className="ri-cursor-line text-lg text-foreground-400" />
                  <span className="flex-1 leading-relaxed">{mission.steps[step]}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <div aria-live="polite" className="mt-4 min-h-[1rem]">
        {message ? (
          <div
            key={`${placed.length}-${wrong?.n ?? 0}`}
            className={`${complete ? "vj-fade-in bg-leaf-100 text-leaf-900" : wrong ? "vj-nudge bg-primary-100 text-foreground-800" : "vj-fade-in bg-background-50 text-foreground-700"} flex items-start gap-3 rounded-3xl p-4`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
                complete ? "bg-leaf-500 text-white" : wrong ? "bg-primary-500 text-foreground-900" : "bg-leaf-100 text-leaf-700"
              }`}
            >
              <i className={complete ? "ri-star-smile-line" : wrong ? "ri-lightbulb-flash-line" : "ri-thumb-up-line"} />
            </span>
            <p className="pt-1 text-sm font-bold leading-relaxed md:text-base">{message}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {placed.length > 0 && !complete ? (
          <button type="button" onClick={reset} className={softButton}>
            <i className="ri-restart-line text-lg" />
            ابدأ من جديد
          </button>
        ) : (
          <span />
        )}
        {complete ? (
          <button type="button" onClick={onFinish} className={finishButton}>
            أنهيت المهمة
            <i className="ri-check-double-line text-lg" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------- panel -------------------------------- */

export default function MissionPanel({ title, mission, tone, say, onFinish, onClose }: MissionPanelProps) {
  return (
    <div className="vj-fade-in card bg-background-100 p-5 md:p-8">
      <div className="flex items-start gap-4">
        <Character name="noor" size="sm" small motion="float" className="hidden shrink-0 min-[420px]:block" />
        <div className="flex-1">
          <p className="text-xs font-bold text-leaf-700">مهمة نور</p>
          <h3 className="font-heading text-xl font-bold text-foreground-900 md:text-2xl">{title}</h3>
          <p className="mt-1 text-base leading-relaxed text-foreground-600">
            {mission.intro}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق المهمة"
          title="إغلاق"
          className="btn-icon shrink-0 text-xl"
        >
          <i className="ri-close-line" />
        </button>
      </div>

      <div className="mt-6">
        {mission.type === "choices" ? (
          <ChoicesActivity mission={mission} tone={tone} say={say} onFinish={onFinish} />
        ) : (
          <OrderActivity mission={mission} tone={tone} say={say} onFinish={onFinish} />
        )}
      </div>
    </div>
  );
}
