import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useProgress, { setMark, todayISO } from "@/store/progress";
import useGameSounds from "@/hooks/useGameSounds";
import { completeActivity, recordActivity } from "@/hooks/useActivityProgress";
import { useRewards } from "@/components/feature/RewardProvider";
import { useCelebration } from "@/pages/games/components/celebration";
import { RewardPanel } from "@/pages/games/components/gameParts";
import Character from "@/components/brand/Character";
import CategoryTile from "@/components/brand/CategoryTile";
import {
  QUIZ_BASE_POINTS,
  QUIZ_MAX_BONUS,
  QUIZ_SECONDS,
  type Quiz,
  type QuizQuestion,
  type QuizQuestionType,
} from "@/data/quizQuestions";
import CountdownRing from "./CountdownRing";
import { shuffleList, toAr, todayLabel } from "./format";
import "./quiz.css";

type Phase = "intro" | "playing" | "done";
type Result = { correct: boolean; skipped: boolean; bonus: number };
type Reveal = { picked: string | null; correct: boolean; timeUp: boolean; bonus: number };
type Summary = {
  correct: number;
  total: number;
  score: number;
  bonus: number;
  max: number;
  stars: 1 | 2 | 3;
  gained: number;
  best: number;
  newBest: boolean;
};

const MARKERS = ["أ", "ب", "ج", "د"];

const TYPE_INFO: Record<QuizQuestionType, { label: string; icon: string }> = {
  choice: { label: "اختر الإجابة", icon: "ri-list-check-2" },
  truefalse: { label: "صح أم خطأ؟", icon: "ri-question-answer-line" },
  icon: { label: "اختر الصورة", icon: "ri-image-line" },
};

/** options are shuffled on every play (true/false keeps its natural order) */
const prepare = (quiz: Quiz): QuizQuestion[] =>
  quiz.questions.map((q) => (q.type === "truefalse" ? q : { ...q, options: shuffleList(q.options) }));

const RULES = [
  { icon: "ri-questionnaire-line", text: "أسئلة قصيرة: اقرأ السؤال ثم اختر الإجابة الصحيحة." },
  { icon: "ri-timer-line", text: `${toAr(QUIZ_SECONDS)} ثانية لكل سؤال. وإن انتهى الوقت فلا بأس، نكمل معًا.` },
  { icon: "ri-checkbox-circle-line", text: "اضغط على إجابتك، ثم اضغط «تأكيد الإجابة». يمكنك تغيير اختيارك قبل التأكيد." },
  { icon: "ri-flashlight-fill", text: "كلما أجبت أسرع، حصلت على نقاط سرعة صغيرة." },
  { icon: "ri-star-smile-line", text: "في النهاية تنال من نجمة إلى ثلاث نجوم ونقاطًا جميلة." },
  { icon: "ri-user-heart-line", text: "المسابقة لك وحدك، فلا مقارنة بين الأطفال." },
];

export default function QuizRunner({ quiz }: { quiz: Quiz }) {
  const { data } = useProgress();
  const { celebrate } = useCelebration();
  const { earn } = useRewards();
  const { playCorrect, playWrong, playWin } = useGameSounds();

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => prepare(quiz));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [remaining, setRemaining] = useState(QUIZ_SECONDS);
  const [summary, setSummary] = useState<Summary | null>(null);

  // refs let the timer (which lives outside React's render) see the latest answer
  const selectedRef = useRef<string | null>(null);
  const remainingRef = useRef(QUIZ_SECONDS);
  const indexRef = useRef(0);
  const lockedRef = useRef(false);
  const submitRef = useRef<(timeUp: boolean) => void>(() => {});
  selectedRef.current = selected;
  indexRef.current = index;

  const total = questions.length;
  const max = total * (QUIZ_BASE_POINTS + QUIZ_MAX_BONUS);
  const bestMark = data.marks[`quiz:${quiz.id}:best`];
  const question = questions[Math.min(index, total - 1)];
  const revealed = reveal !== null;

  const submit = (timeUp: boolean) => {
    if (lockedRef.current) return;
    const q = questions[indexRef.current];
    if (!q) return;
    lockedRef.current = true;
    const picked = selectedRef.current;
    const correct = picked !== null && picked === q.answer;
    // the speed bonus only counts for an answer given before the time ran out
    const bonus = correct && !timeUp ? Math.round((remainingRef.current / QUIZ_SECONDS) * QUIZ_MAX_BONUS) : 0;
    setReveal({ picked, correct, timeUp, bonus });
    setResults((prev) => [...prev, { correct, skipped: picked === null, bonus }]);
    if (correct) playCorrect();
    else if (picked !== null) playWrong();
  };
  submitRef.current = submit;

  // the per-question countdown (tab in background = it simply waits)
  useEffect(() => {
    if (phase !== "playing" || revealed) return;
    lockedRef.current = false;
    remainingRef.current = QUIZ_SECONDS;
    setRemaining(QUIZ_SECONDS);
    let last = performance.now();
    let elapsed = 0;
    const timer = window.setInterval(() => {
      const now = performance.now();
      elapsed += Math.min(now - last, 250);
      last = now;
      const left = Math.max(0, QUIZ_SECONDS - elapsed / 1000);
      remainingRef.current = left;
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(timer);
        submitRef.current(true);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, index, revealed]);

  const start = () => {
    setQuestions(prepare(quiz));
    setIndex(0);
    setSelected(null);
    setReveal(null);
    setResults([]);
    setSummary(null);
    lockedRef.current = false;
    setPhase("playing");
    recordActivity({
      key: `quiz:${quiz.id}`,
      title: quiz.title,
      subtitle: "مسابقة سريعة — أكمل أسئلتك",
      icon: quiz.icon,
      route: `/competitions/quiz?id=${quiz.id}`,
      tone: quiz.tone,
    });
  };

  const finish = (all: Result[]) => {
    const correct = all.filter((r) => r.correct).length;
    const bonus = all.reduce((sum, r) => sum + r.bonus, 0);
    const score = correct * QUIZ_BASE_POINTS + bonus;
    const ratio = total ? correct / total : 0;
    const stars: 1 | 2 | 3 = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
    // 5..40 reward points by score; once a day per quiz
    const points = Math.max(5, Math.round(ratio * 8) * 5);
    const result = earn(`quiz:${quiz.id}:${todayISO()}`, points, `أنهيت ${quiz.title}`);
    const previous = bestMark ?? 0;
    const newBest = score > previous;
    if (newBest) setMark(`quiz:${quiz.id}:best`, score);
    completeActivity(`quiz:${quiz.id}`);
    celebrate();
    playWin();
    setSummary({ correct, total, score, bonus, max, stars, gained: result.gained, best: Math.max(previous, score), newBest });
    setPhase("done");
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setSelected(null);
      setReveal(null);
      return;
    }
    finish(results);
  };

  const choose = (id: string) => {
    if (revealed) return;
    setSelected(id);
  };

  const skip = () => {
    if (revealed) return;
    selectedRef.current = null;
    setSelected(null);
    submit(false);
  };

  /* ------------------------------- intro -------------------------------- */
  if (phase === "intro") {
    return (
      <div className="card qz-slide p-5 md:p-10">
        <div className="flex flex-col items-center text-center">
          <Character name="thaloob" size="md" motion="float" decorative small />
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-xs font-bold text-primary-800">
            <i className={quiz.icon} />
            {quiz.daily ? `تحدي اليوم${todayLabel() ? ` · ${todayLabel()}` : ""}` : "مسابقة سريعة"}
          </span>
          <h1 className="mt-3 font-heading text-3xl font-bold text-foreground-900 md:text-[2.75rem]">{quiz.title}</h1>
          <p className="mt-2 max-w-md text-base leading-relaxed text-foreground-600">{quiz.desc}</p>
        </div>

        <ul className="mx-auto mt-6 flex max-w-xl flex-col gap-2.5 rounded-3xl bg-background-100 p-4 md:p-5">
          {RULES.map((rule) => (
            <li key={rule.icon} className="flex items-start gap-3 text-base font-medium leading-relaxed text-foreground-800">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-base text-primary-800">
                <i className={rule.icon} />
              </span>
              <span className="pt-1">{rule.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-center gap-4">
          {bestMark ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background-100 px-4 py-1.5 text-xs font-bold text-foreground-800">
              <i className="ri-star-fill text-primary-500" />
              أفضل نتيجة لك: {toAr(bestMark)} / {toAr(max)}
            </span>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={start} className="btn btn-primary btn-lg">
              <i className="ri-play-fill" />
              ابدأ المسابقة
            </button>
            <Link to="/competitions/quiz" className="btn btn-ghost btn-lg">
              مسابقة أخرى
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------- done -------------------------------- */
  if (phase === "done" && summary) {
    const heading =
      summary.stars === 3 ? "ممتاز! أنت نجم المسابقة" : summary.stars === 2 ? "أحسنت! نتيجة رائعة" : "عمل جميل! في كل مرة تتحسّن";
    return (
      <div className="card qz-slide p-4 text-center md:p-8">
        <h1 className="sr-only">{quiz.title}</h1>
        <RewardPanel
          title={heading}
          text={`أجبت ${toAr(summary.correct)} من ${toAr(summary.total)} إجابات صحيحة${summary.bonus > 0 ? ` · نقاط السرعة ${toAr(summary.bonus)}` : ""}`}
          stars={summary.stars}
          heading="h2"
          character="thaloob"
          gained={summary.gained}
          progress={{
            value: summary.max ? (summary.score / summary.max) * 100 : 0,
            label: "نتيجتك في المسابقة",
            caption: `نتيجتك ${toAr(summary.score)} من ${toAr(summary.max)}`,
          }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50 px-4 py-2 text-sm font-bold text-foreground-800">
            <i className={summary.newBest ? "ri-medal-line text-primary-600" : "ri-trophy-line text-primary-600"} />
            {summary.newBest ? "أفضل نتيجة جديدة لك!" : `أفضل نتيجة لك: ${toAr(summary.best)}`}
          </span>
        </RewardPanel>

        <ol className="mt-5 flex flex-wrap items-center justify-center gap-2" aria-label="نتيجة كل سؤال">
          {results.map((r, i) => (
            <li
              key={i}
              aria-label={`السؤال ${toAr(i + 1)}: ${r.correct ? "إجابة صحيحة" : r.skipped ? "تم تخطّيه" : "إجابة تحتاج مراجعة"}`}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-base ${
                r.correct
                  ? "bg-leaf-100 text-leaf-700"
                  : r.skipped
                    ? "bg-background-200 text-foreground-600"
                    : "bg-secondary-100 text-secondary-700"
              }`}
            >
              <i className={r.correct ? "ri-check-line" : r.skipped ? "ri-skip-forward-line" : "ri-close-line"} />
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={start} className="btn btn-primary">
            <i className="ri-refresh-line" />
            العب مرة أخرى
          </button>
          <Link to="/competitions/quiz" className="btn btn-ghost">
            <i className="ri-trophy-line" />
            مسابقة أخرى
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------- playing ------------------------------- */
  const answerOption = question.options.find((o) => o.id === question.answer);
  const info = TYPE_INFO[question.type];
  const isLast = index + 1 >= total;

  const optionClass = (id: string) => {
    if (revealed) {
      if (id === question.answer) return "bg-leaf-100 text-leaf-800 qz-pop";
      if (id === reveal?.picked) return "bg-secondary-100 text-secondary-800";
      return "bg-background-100 text-foreground-500 opacity-60";
    }
    if (id === selected) return "bg-primary-100 text-foreground-900 ring-2 ring-primary-500";
    return "bg-background-100 text-foreground-800 hover:bg-background-200";
  };

  const mark = (id: string) => {
    if (!revealed) return null;
    if (id === question.answer) return <i className="ri-check-line text-xl text-leaf-700" aria-hidden="true" />;
    if (id === reveal?.picked) return <i className="ri-close-line text-xl text-secondary-700" aria-hidden="true" />;
    return null;
  };

  return (
    <div className="card p-4 md:p-8">
      <h1 className="sr-only">{quiz.title}</h1>
      {/* progress + countdown */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground-800">
            <span className="text-foreground-500">{quiz.title} · </span>
            السؤال {toAr(index + 1)} من {toAr(total)}
          </p>
          <ol className="mt-2.5 flex items-center gap-1.5" aria-hidden="true">
            {questions.map((q, i) => {
              const r = results[i];
              return (
                <li
                  key={q.id}
                  className={`h-2 flex-1 rounded-full transition-colors duration-500 ${
                    r ? (r.correct ? "bg-leaf-500" : r.skipped ? "bg-background-300" : "bg-secondary-300") : i === index ? "bg-primary-400" : "bg-background-200"
                  }`}
                />
              );
            })}
          </ol>
        </div>
        <CountdownRing remaining={remaining} total={QUIZ_SECONDS} frozen={revealed} />
      </div>

      {/* question */}
      <div key={question.id} className="qz-slide mt-6">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background-100 px-3 py-1 text-xs font-bold text-foreground-700">
            <i className={info.icon} />
            {info.label}
          </span>
          {question.icon ? <CategoryTile icon={question.icon} tone="primary" size="lg" className="mt-4" /> : null}
          <h2 className="mt-4 font-heading text-xl font-bold leading-snug text-foreground-900 md:text-2xl">{question.prompt}</h2>
        </div>

        {question.type === "choice" ? (
          <ul className="mt-5 grid gap-3" aria-label="الإجابات">
            {question.options.map((option, i) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => choose(option.id)}
                  disabled={revealed}
                  aria-pressed={selected === option.id}
                  className={`flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-start text-base font-bold transition-all duration-200 disabled:cursor-default ${optionClass(option.id)}`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
                      selected === option.id && !revealed ? "bg-primary-500 text-foreground-900" : "bg-background-50 text-foreground-700"
                    }`}
                  >
                    {MARKERS[i]}
                  </span>
                  <span className="flex-1">{option.text}</span>
                  {mark(option.id)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {question.type === "truefalse" ? (
          <ul className="mt-5 grid grid-cols-2 gap-3" aria-label="الإجابات">
            {question.options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => choose(option.id)}
                  disabled={revealed}
                  aria-pressed={selected === option.id}
                  className={`flex min-h-[5.5rem] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl px-4 py-3 font-heading text-2xl font-bold transition-all duration-200 disabled:cursor-default ${optionClass(option.id)}`}
                >
                  <i className={option.id === "t" ? "ri-check-line text-3xl" : "ri-close-line text-3xl"} aria-hidden="true" />
                  {option.text}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {question.type === "icon" ? (
          <ul className="mt-5 grid grid-cols-2 gap-3" aria-label="الصور">
            {question.options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => choose(option.id)}
                  disabled={revealed}
                  aria-pressed={selected === option.id}
                  aria-label={option.label}
                  className={`relative flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200 disabled:cursor-default ${optionClass(option.id)}`}
                >
                  <i className={`${option.icon} text-6xl ${option.tone ?? ""}`} aria-hidden="true" />
                  {revealed ? <span className="text-xs font-bold">{option.label}</span> : null}
                  <span className="absolute end-2 top-2">{mark(option.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* feedback + actions */}
      <div aria-live="polite" role="status" className="mt-5">
        {reveal ? (
          <div className={`qz-slide rounded-3xl p-4 ${reveal.correct ? "bg-leaf-50 text-leaf-900" : "bg-primary-50 text-primary-900"}`}>
            <p className="flex flex-wrap items-center gap-2 font-heading text-lg font-bold">
              <i className={reveal.correct ? "ri-emotion-happy-line text-xl" : "ri-lightbulb-flash-line text-xl"} aria-hidden="true" />
              {reveal.correct
                ? "أحسنت!"
                : reveal.picked
                  ? `قريب! الإجابة الصحيحة: ${answerOption?.label ?? ""}`
                  : `لا بأس! الإجابة الصحيحة: ${answerOption?.label ?? ""}`}
              {reveal.correct && reveal.bonus > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-500 px-2.5 py-0.5 text-xs font-bold text-foreground-900">
                  <i className="ri-flashlight-fill" />
                  سرعة +{toAr(reveal.bonus)}
                </span>
              ) : null}
            </p>
            {reveal.timeUp ? (
              <p className="mt-1 text-sm font-bold">
                {reveal.picked ? "انتهى الوقت، وحفظنا اختيارك." : "انتهى الوقت — لا بأس، نتعلّم معًا وننتقل للسؤال التالي."}
              </p>
            ) : null}
            <p className="mt-1 text-base leading-relaxed text-foreground-700">{question.explain}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {reveal ? (
          <button type="button" onClick={next} className="btn btn-primary btn-lg flex-1">
            {isLast ? "شاهد نتيجتك" : "السؤال التالي"}
            <i className="ri-arrow-left-line" />
          </button>
        ) : (
          <>
            <button type="button" onClick={() => submit(false)} disabled={selected === null} className="btn btn-primary btn-lg flex-1">
              <i className="ri-check-line" />
              تأكيد الإجابة
            </button>
            <button type="button" onClick={skip} className="btn btn-ghost btn-lg">
              <i className="ri-skip-forward-line" />
              تخطّي
            </button>
          </>
        )}
      </div>
    </div>
  );
}
