import { useState } from "react";
import Character from "@/components/brand/Character";
import { useSound } from "@/components/feature/SoundProvider";
import type { QuizQuestion } from "@/data/storyPages";
import { arDigits } from "./parse";

type StoryQuizProps = {
  questions: QuizQuestion[];
  /** resolves {name} / gender markup in the question text */
  resolve: (text: string) => string;
  /** called when the last question is solved, with how many were right on the first try */
  onFinish: (firstTryCorrect: number) => void;
  onBack: () => void;
};

const PICTURE_TONES = [
  "bg-violet-100 text-violet-700",
  "bg-primary-100 text-primary-800",
  "bg-foreground-100 text-foreground-800",
];

const TF_OPTIONS = [
  { label: "صح", icon: "ri-check-line", value: true },
  { label: "خطأ", icon: "ri-close-line", value: false },
];

/** Gentle 3-question quiz: a wrong answer only gives a hint and another try. */
export default function StoryQuiz({ questions, resolve, onFinish, onBack }: StoryQuizProps) {
  const { play } = useSound();
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(0);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const choose = (option: number, correct: boolean) => {
    if (solved !== null || wrong.includes(option)) return;
    if (correct) {
      setSolved(option);
      if (wrong.length === 0) setFirstTry((n) => n + 1);
      play("correct");
    } else {
      setWrong((list) => [...list, option]);
      play("wrong");
    }
  };

  const next = () => {
    if (isLast) {
      onFinish(firstTry);
      return;
    }
    setIndex((n) => n + 1);
    setWrong([]);
    setSolved(null);
  };

  const optionState = (option: number) => {
    if (solved === option) return "right" as const;
    if (wrong.includes(option)) return "wrong" as const;
    if (solved !== null) return "faded" as const;
    return "open" as const;
  };

  const base =
    "relative flex w-full items-center rounded-3xl border-2 text-start font-heading font-bold transition-all cursor-pointer";
  const toneOf = (state: ReturnType<typeof optionState>) =>
    state === "right"
      ? "animate-celebrate-pop border-leaf-500 bg-leaf-100 text-leaf-800"
      : state === "wrong"
        ? "story-shake border-background-300 bg-background-100 text-foreground-500"
        : state === "faded"
          ? "border-background-200 bg-background-50 text-foreground-500 opacity-60"
          : "border-background-300 bg-background-50 text-foreground-900 hover:-translate-y-1 hover:border-violet-400";

  const marker = (state: ReturnType<typeof optionState>) =>
    state === "right" ? (
      <i className="ri-checkbox-circle-fill ms-auto text-2xl text-leaf-600" />
    ) : state === "wrong" ? (
      <i className="ri-restart-line ms-auto text-xl text-foreground-500" />
    ) : null;

  return (
    <div className="card mx-auto w-full max-w-3xl p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-xs font-bold text-violet-700">
          <i className="ri-question-line" />
          أسئلة القصة
        </span>
        <span className="text-sm font-medium text-foreground-600">
          السؤال {arDigits(index + 1)} من {arDigits(questions.length)}
        </span>
      </div>

      <div className="mt-4 flex gap-2" aria-hidden="true">
        {questions.map((_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors duration-500 ${
              i < index || (i === index && solved !== null) ? "bg-leaf-500" : i === index ? "bg-violet-400" : "bg-background-200"
            }`}
          />
        ))}
      </div>

      <div key={index} className="story-fade">
        <h2 className="mt-6 text-2xl font-bold leading-relaxed md:text-3xl">
          {resolve(question.q)}
        </h2>

        <div className="mt-6">
          {question.kind === "choice" ? (
            <div className="flex flex-col gap-3">
              {question.options.map((label, i) => {
                const state = optionState(i);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => choose(i, i === question.answer)}
                    disabled={state === "wrong" || solved !== null}
                    className={`${base} ${toneOf(state)} min-h-[3.5rem] gap-3 px-5 py-3 text-lg`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background-100 text-sm text-foreground-700">
                      {arDigits(i + 1)}
                    </span>
                    {label}
                    {marker(state)}
                  </button>
                );
              })}
            </div>
          ) : null}

          {question.kind === "tf" ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {TF_OPTIONS.map((opt, i) => {
                const state = optionState(i);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => choose(i, opt.value === question.answer)}
                    disabled={state === "wrong" || solved !== null}
                    className={`${base} ${toneOf(state)} min-h-[5rem] flex-col justify-center gap-1 px-4 py-4 text-center text-xl`}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-2xl ${
                        i === 0 ? "bg-leaf-100 text-leaf-700" : "bg-foreground-100 text-foreground-700"
                      }`}
                    >
                      <i className={opt.icon} />
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {question.kind === "picture" ? (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {question.options.map((opt, i) => {
                const state = optionState(i);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => choose(i, i === question.answer)}
                    disabled={state === "wrong" || solved !== null}
                    className={`${base} ${toneOf(state)} min-h-[9rem] flex-col justify-center gap-3 px-2 py-4 text-center text-sm sm:text-base`}
                  >
                    <span
                      className={`flex h-16 w-16 items-center justify-center rounded-full text-4xl sm:h-20 sm:w-20 sm:text-5xl ${PICTURE_TONES[i % PICTURE_TONES.length]}`}
                    >
                      <i className={opt.icon} />
                    </span>
                    {opt.label}
                    {state === "right" ? (
                      <i className="ri-checkbox-circle-fill absolute end-2 top-2 text-xl text-leaf-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div aria-live="polite" className="mt-5 min-h-[4.5rem]">
          {solved !== null ? (
            <div className="animate-rise-in flex items-center gap-3 rounded-3xl bg-leaf-100 p-3 text-leaf-800">
              <Character name="jamool" size="xs" small motion="cheer" decorative className="shrink-0" />
              <p className="font-heading text-lg font-bold">
                {wrong.length === 0 ? "أحسنت! إجابة صحيحة" : "أحسنت! وصلت إلى الإجابة الصحيحة"}
              </p>
            </div>
          ) : wrong.length > 0 ? (
            <div className="animate-rise-in flex items-start gap-3 rounded-3xl bg-primary-100 p-4 text-foreground-800">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background-50 text-2xl text-primary-700">
                <i className="ri-lightbulb-line" />
              </span>
              <div>
                <p className="font-heading text-lg font-bold text-foreground-900">جرّب مرة أخرى</p>
                <p className="mt-0.5 text-base leading-relaxed">
                  {resolve(question.hint)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="btn btn-ghost">
          <i className="ri-book-open-line" />
          ارجع للقصة
        </button>
        {solved !== null ? (
          <button
            type="button"
            onClick={next}
            className="btn btn-primary animate-rise-in"
          >
            {isLast ? "شاهد نجومك" : "السؤال التالي"}
            <i className={isLast ? "ri-star-fill" : "ri-arrow-left-line"} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
