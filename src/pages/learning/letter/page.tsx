import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import Character from "@/components/brand/Character";
import useScrollTop from "@/hooks/useScrollTop";
import useProgress, { setMark } from "@/store/progress";
import { useRewards } from "@/components/feature/RewardProvider";
import { useSound } from "@/components/feature/SoundProvider";
import { recordActivity } from "@/hooks/useActivityProgress";
import { CelebrationProvider, useCelebration } from "@/pages/games/components/celebration";
import { getLetter, letterIndex, letters, lettersTotal, toneFamily, wordPic, type ArabicLetter } from "@/data/letters";
import { ar, BTN_PRIMARY, STEP_LABELS, TONE_KIT } from "./kit";
import { Stars, StepIndicator } from "./parts";
import WatchStep from "./WatchStep";
import TraceStep from "./TraceStep";
import SpeakStep from "./SpeakStep";
import PickStep from "./PickStep";
import FinishCard from "./FinishCard";
import "./letter.css";

const LAST_STEP = 3;
const FINISH = 4;

function Journey({ letter }: { letter: ArabicLetter }) {
  const { data, isDone, count } = useProgress();
  const { earn } = useRewards();
  const { celebrate } = useCelebration();
  const { play } = useSound();

  const index = letterIndex(letter.id);
  const prev = letters[index - 1] ?? null;
  const next = letters[index + 1] ?? null;
  const toneName = toneFamily(letter.tone);
  const tone = TONE_KIT[toneName];

  const stepKey = `letter:${letter.id}:step`;
  const traceKey = `letter:${letter.id}:trace`;
  const starsKey = `letter:${letter.id}:stars`;

  const wasMastered = useRef(isDone(`letter:${letter.id}`));
  const savedStep = data.marks[stepKey];
  const startStep =
    !wasMastered.current && typeof savedStep === "number" && savedStep >= 0 && savedStep <= LAST_STEP
      ? Math.floor(savedStep)
      : 0;
  const savedTrace = data.marks[traceKey];

  const [step, setStep] = useState(startStep);
  const [maxStep, setMaxStep] = useState(wasMastered.current ? LAST_STEP : startStep);
  const [resumed] = useState(startStep > 0);
  const [traceStars, setTraceStars] = useState<number | null>(
    !wasMastered.current && typeof savedTrace === "number" && savedTrace > 0 ? savedTrace : null
  );
  const [quizStars, setQuizStars] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);

  const finished = step === FINISH;
  const finalStars = useMemo(
    () => Math.max(1, Math.min(3, Math.round(((traceStars ?? 1) + (quizStars ?? 1)) / 2))),
    [traceStars, quizStars]
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  /* resume card on the home page */
  useEffect(() => {
    recordActivity({
      key: "learning:letters",
      title: "الحروف الهجائية",
      subtitle: finished
        ? next
          ? `أتقنت حرف ${letter.name} — التالي: حرف ${next.name}`
          : `أتقنت حرف ${letter.name}`
        : `حرف ${letter.name} — ${STEP_LABELS[step]}`,
      icon: "ri-text",
      route: finished && next ? `/learning/letter/${next.id}` : `/learning/letter/${letter.id}`,
      tone: letter.tone,
    });
  }, [step, finished, letter.id, letter.name, letter.tone, next]);

  /* finish: points, stars, confetti (each runs once) */
  useEffect(() => {
    if (!finished || finishedRef.current) return;
    finishedRef.current = true;
    const result = earn(`letter:${letter.id}`, 15, `أتقنت حرف ${letter.name}`);
    const best = Math.max(data.marks[starsKey] ?? 0, finalStars);
    setMark(starsKey, best);
    setMark(stepKey, 0);
    celebrate();
    if (result.gained === 0) {
      try {
        play("win");
      } catch {
        /* sound is optional */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const goStep = (target: number) => {
    setStep(target);
    setMaxStep((current) => Math.max(current, Math.min(target, LAST_STEP)));
    setMark(stepKey, target <= LAST_STEP ? target : 0);
    window.requestAnimationFrame(() => {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const restart = () => {
    finishedRef.current = false;
    setTraceStars(null);
    setQuizStars(null);
    setMaxStep(LAST_STEP);
    goStep(0);
  };

  const handleTraceDone = (stars: number) => {
    setTraceStars(stars);
    setMark(traceKey, stars);
  };

  const handleQuizDone = (stars: number) => {
    setQuizStars(stars);
    goStep(FINISH);
  };

  return (
    <>
      <section className="w-full bg-background-50 pb-4 pt-6 md:pt-10">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/learning"
              className="btn btn-ghost btn-sm min-h-[2.75rem]"
            >
              <i className="ri-arrow-right-line" />
              كل الحروف
            </Link>
            <div className="flex items-center gap-2">
              {prev ? (
                <Link
                  to={`/learning/letter/${prev.id}`}
                  aria-label={`الحرف السابق: ${prev.name}`}
                  className="btn btn-ghost btn-sm min-h-[2.75rem]"
                >
                  <i className="ri-arrow-right-line" />
                  <span className="font-heading text-lg leading-none">{prev.letter}</span>
                </Link>
              ) : null}
              {next ? (
                <Link
                  to={`/learning/letter/${next.id}`}
                  aria-label={`الحرف التالي: ${next.name}`}
                  className="btn btn-primary btn-sm min-h-[2.75rem]"
                >
                  <span className="font-heading text-lg leading-none">{next.letter}</span>
                  <i className="ri-arrow-left-line" />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 md:gap-5">
            <span
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl ${tone.soft} font-heading text-5xl font-bold leading-none ${tone.text} md:h-24 md:w-24 md:text-6xl`}
              lang="ar"
            >
              {letter.letter}
            </span>
            <img src={wordPic(letter.words[0])} alt="" draggable={false} className="h-20 w-20 shrink-0 object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.2)] motion-safe:animate-floaty md:h-24 md:w-24" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-xs font-bold text-sky-700">
                  <i className="ri-text" />
                  الحرف {ar(index + 1)} من {ar(lettersTotal)}
                </span>
                {wasMastered.current ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1.5 text-xs font-bold text-leaf-700">
                    <i className="ri-check-double-line" />
                    أتقنته من قبل
                  </span>
                ) : resumed && !finished ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-100 px-3 py-1.5 text-xs font-bold text-leaf-700">
                    <i className="ri-history-line" />
                    واصلنا من حيث توقفت
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 text-3xl font-bold md:text-[2.75rem]">
                رحلة حرف {letter.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-background-50 pb-12 md:pb-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <StepIndicator
            step={Math.min(step, LAST_STEP)}
            maxStep={maxStep}
            finished={finished}
            tone={tone}
            onJump={goStep}
          />

          <div ref={stageRef} className="mt-4 scroll-mt-24 rounded-4xl bg-sky-50 p-4 md:p-8">
            <div key={step}>
              {step === 0 ? <WatchStep letter={letter} tone={tone} onNext={() => goStep(1)} /> : null}
              {step === 1 ? (
                <TraceStep
                  letter={letter}
                  tone={tone}
                  toneName={toneName}
                  initialStars={traceStars}
                  onComplete={handleTraceDone}
                  onBack={() => goStep(0)}
                  onNext={() => goStep(2)}
                />
              ) : null}
              {step === 2 ? (
                <SpeakStep letter={letter} tone={tone} onBack={() => goStep(1)} onNext={() => goStep(3)} />
              ) : null}
              {step === 3 ? (
                <PickStep letter={letter} tone={tone} onBack={() => goStep(2)} onComplete={handleQuizDone} />
              ) : null}
              {finished ? (
                <FinishCard
                  letter={letter}
                  next={next}
                  tone={tone}
                  stars={finalStars}
                  traceStars={traceStars ?? 1}
                  quizStars={quizStars ?? 1}
                  mastered={count("letter:")}
                  onRestart={restart}
                />
              ) : null}
            </div>
          </div>

          {!finished && wasMastered.current ? (
            <p className="mt-4 flex items-center justify-center gap-2 text-base text-foreground-600">
              <Stars value={data.marks[starsKey] ?? 1} size="text-base" animate={false} />
              أفضل نتيجة لك في هذا الحرف
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}

function NotFound() {
  return (
    <section className="w-full bg-background-50 py-16 md:py-24">
      <div className="mx-auto w-full max-w-lg px-4 text-center md:px-6">
        <Character name="jamool" size="lg" motion="float" decorative className="mx-auto" />
        <h1 className="mt-5 text-3xl font-bold md:text-[2.75rem]">
          لم نجد هذا الحرف
        </h1>
        <p className="mt-2 text-base leading-relaxed text-foreground-600">
          لا بأس! عُد إلى قائمة الحروف واختر حرفًا لنبدأ رحلة جديدة.
        </p>
        <Link to="/learning" className={`${BTN_PRIMARY} mt-6`}>
          <i className="ri-apps-2-line" />
          كل الحروف
        </Link>
      </div>
    </section>
  );
}

export default function LetterJourneyPage() {
  useScrollTop();
  const { id } = useParams<{ id: string }>();
  const letter = getLetter(id);

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        {letter ? (
          <CelebrationProvider>
            <Journey key={letter.id} letter={letter} />
          </CelebrationProvider>
        ) : (
          <NotFound />
        )}
      </main>
      <Footer />
    </div>
  );
}
