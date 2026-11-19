import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import MushafArt from "@/components/brand/MushafArt";
import CategoryTile from "@/components/brand/CategoryTile";
import useScrollTop from "@/hooks/useScrollTop";
import useProgress, { setQuran } from "@/store/progress";
import { useRewards } from "@/components/feature/RewardProvider";
import { completeActivity, recordActivity } from "@/hooks/useActivityProgress";
import { CelebrationProvider, useCelebration } from "@/pages/games/components/celebration";
import StarBadge from "@/pages/quran/components/StarBadge";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import {
  arNum,
  getSurahMeta,
  hifzIndex,
  hifzSurahs,
  surahProgress,
  todayKey,
  versesLabel,
  type SurahMeta,
} from "@/data/quranSurahs";
import useReciter from "./useReciter";
import { BTN_ACCENT, STAGES } from "./kit";
import { Stepper } from "./parts";
import ListenStage from "./ListenStage";
import RepeatStage from "./RepeatStage";
import ReciteStage from "./ReciteStage";
import FinishCard, { type FinishKind } from "./FinishCard";
import "./surah.css";

const FINISH = 3;

function Journey({ surah, review }: { surah: SurahMeta; review: boolean }) {
  const { data } = useProgress();
  const { earn } = useRewards();
  const { celebrate } = useCelebration();
  const reciter = useReciter();
  const navigate = useNavigate();

  const stored = data.quran[surah.id];
  const storedStage = stored?.stage ?? 0;
  const [resumed] = useState(() => !review && ((stored?.stage ?? 0) > 0 || (stored?.verse ?? 0) > 0));

  const [step, setStep] = useState(() => (review ? 2 : Math.min(storedStage, FINISH)));
  const [kind, setKind] = useState<FinishKind>(review ? "review" : "known");
  const [gained, setGained] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  /* the page arrives softly: heading, steps and the stage rise one after another */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.from("[data-sj] > *", { y: 22, opacity: 0, duration: 0.65, stagger: 0.1, ease: "power3.out", clearProps: "transform,opacity" });
        gsap.from("[data-sj-badge]", { rotation: -120, scale: 0.3, duration: 1, ease: "back.out(1.6)", clearProps: "transform" });
        gsap.to("[data-sj-float]", { y: -12, rotation: 10, duration: 3.6, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.6 });
      });
      return () => mm.revert();
    },
    { scope: pageRef }
  );

  /* every new stage slides in */
  useEffect(() => {
    const el = stageRef.current?.firstElementChild;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(el, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "transform,opacity" });
  }, [step]);

  const index = hifzIndex(surah.id);
  const next = hifzSurahs[index + 1] ?? null;
  const finished = step === FINISH;
  const reachable = storedStage >= 3 ? 2 : Math.min(storedStage, 2);
  const progress = surahProgress(stored, surah.count);

  /** Only the stage the child is really on writes progress; practising an earlier stage never moves it back. */
  const save = (patch: { stage: number; verse: number; reps: number }) => {
    if (review || storedStage >= 3 || step !== storedStage) return;
    setQuran(surah.id, patch);
  };

  // any audio stops when the stage changes
  useEffect(() => {
    reciter.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // "continue where you left off" card on the home page
  useEffect(() => {
    if (review || finished || storedStage >= 3) return;
    recordActivity({
      key: `quran:${surah.id}`,
      title: `حفظ سورة ${surah.name}`,
      subtitle: `المرحلة ${arNum(step + 1)}: ${STAGES[step].title}`,
      icon: "ri-book-2-line",
      route: `/quran/${surah.id}`,
      tone: "bg-accent-100 text-accent-700",
    });
  }, [review, finished, storedStage, step, surah.id, surah.name]);

  const goStep = (target: number) => {
    reciter.stop();
    setStep(target);
    window.requestAnimationFrame(() => {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const jump = (target: number) => {
    if (target <= reachable || storedStage >= 3) goStep(target);
  };

  const finishListen = () => {
    earn(`quran:${surah.id}:s1`, 20, `أنهيت استماع سورة ${surah.name}`);
    save({ stage: 1, verse: 0, reps: 0 });
    goStep(1);
  };

  const finishRepeat = () => {
    earn(`quran:${surah.id}:s2`, 20, `أنهيت ترديد سورة ${surah.name}`);
    save({ stage: 2, verse: 0, reps: 0 });
    goStep(2);
  };

  const finishRecite = () => {
    const wasDone = storedStage >= 3;
    const a = earn(`quran:${surah.id}:s3`, 20, `أنهيت تلاوة سورة ${surah.name}`);
    const b = earn(`quran-done:${surah.id}`, 40, `حفظتَ سورة ${surah.name}`);
    save({ stage: 3, verse: 0, reps: 0 });
    completeActivity(`quran:${surah.id}`);
    setGained(a.gained + b.gained);
    setKind(wasDone ? "known" : "learned");
    if (!wasDone) celebrate();
    goStep(FINISH);
  };

  const finishReview = () => {
    const result = earn(`quran-review:${surah.id}:${todayKey()}`, 5, `راجعتَ سورة ${surah.name}`);
    setGained(result.gained);
    setKind("review");
    celebrate();
    goStep(FINISH);
  };

  const startAgain = () => goStep(0);

  const resumeVerse = step === storedStage ? (stored?.verse ?? 0) : 0;
  const resumeReps = step === storedStage ? (stored?.reps ?? 0) : 0;

  return (
    <div ref={pageRef} className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFAF2_0%,#E8F4F5_35%,#FFF8EC_100%)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <i data-sj-float className="ri-moon-fill absolute start-[6%] top-8 text-5xl text-[#F2C86B]/60" />
        <i data-sj-float className="ri-sparkling-2-fill absolute end-[8%] top-24 text-3xl text-[#7FB7D9]/60" />
        <i data-sj-float className="ri-sparkling-2-fill absolute end-[14%] top-[58%] hidden text-2xl text-[#E9A04A]/40 md:block" />
      </div>
      <section className="relative w-full pb-4 pt-6 md:pt-10">
        <div data-sj className="mx-auto w-full max-w-3xl px-4 md:px-6">
          <Link
            to="/quran#hifz"
            className="btn btn-ghost btn-sm min-h-[2.75rem]"
          >
            <i className="ri-arrow-right-line text-lg" />
            رحلة الحفظ
          </Link>

          <div className="mt-6 flex items-center gap-4 md:gap-5">
            {finished ? (
              <CategoryTile category="surahs" size="lg" />
            ) : (
              <MushafArt size="md" motion="float" priority className="shrink-0" />
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-4 py-1.5 text-xs font-bold text-accent-800">
                  <i className="ri-moon-clear-line" />
                  السورة {arNum(index + 1)} من {arNum(hifzSurahs.length)}
                </span>
                {review ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1.5 text-xs font-bold text-primary-800">
                    <i className="ri-refresh-line" />
                    وضع المراجعة
                  </span>
                ) : resumed && !finished ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1.5 text-xs font-bold text-accent-800">
                    <i className="ri-history-line" />
                    واصلنا من حيث توقفت
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 flex items-center gap-3 font-heading text-2xl font-bold leading-tight text-foreground-900 md:text-[2.75rem]">
                <span data-sj-badge className="inline-flex">
                  <StarBadge label={arNum(Number(surah.id))} size="lg" spin={false} />
                </span>
                سورة {surah.name}
              </h1>
              <p className="mt-1 text-sm font-medium text-foreground-500">
                {surah.meaning} • {versesLabel(surah.count)}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-600">{surah.gist}</p>
        </div>
      </section>

      <section className="relative w-full pb-12 md:pb-16">
        <div data-sj className="mx-auto w-full max-w-3xl px-4 md:px-6">
          {review ? null : (
            <Stepper
              step={Math.min(step, 2)}
              reachable={reachable}
              finished={finished && storedStage >= 3}
              progress={progress}
              onJump={jump}
            />
          )}

          <div
            ref={stageRef}
            className={`scroll-mt-24 ${review ? "" : "mt-4"} ${
              finished ? "" : "rounded-4xl bg-[#EAF6F5]/85 p-4 ring-1 ring-[#CFE8E6] md:p-8"
            }`}
          >
            <div key={step}>
              {!review && step === 0 ? (
                <ListenStage
                  surah={surah}
                  reciter={reciter}
                  initialHeard={step === storedStage ? (stored?.verse ?? 0) : 0}
                  onHeardChange={(count) => save({ stage: 0, verse: count, reps: 0 })}
                  onDone={finishListen}
                />
              ) : null}
              {!review && step === 1 ? (
                <RepeatStage
                  surah={surah}
                  reciter={reciter}
                  startVerse={resumeVerse}
                  startReps={resumeReps}
                  onProgress={(verse, reps) => save({ stage: 1, verse, reps })}
                  onDone={finishRepeat}
                />
              ) : null}
              {!review && step === 2 ? (
                <ReciteStage
                  surah={surah}
                  reciter={reciter}
                  mode="learn"
                  startVerse={resumeVerse}
                  onVerseSolved={(solved) => save({ stage: 2, verse: solved, reps: 0 })}
                  onDone={finishRecite}
                />
              ) : null}
              {review && !finished ? (
                <ReciteStage
                  surah={surah}
                  reciter={reciter}
                  mode="review"
                  startVerse={0}
                  onVerseSolved={() => {}}
                  onDone={finishReview}
                />
              ) : null}
              {finished ? (
                <FinishCard
                  surah={surah}
                  next={next}
                  kind={kind}
                  gained={gained}
                  onReview={() => navigate(`/quran/${surah.id}?review=1`)}
                  onPractice={startAgain}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function NotFoundCard() {
  return (
    <section className="w-full bg-background-50 py-16 md:py-24">
      <div className="mx-auto w-full max-w-lg px-4 text-center md:px-6">
        <div className="flex justify-center">
          <MushafArt size="lg" motion="float" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-bold text-foreground-900 md:text-3xl">
          لم نجد هذه السورة
        </h1>
        <p className="mt-2 text-base leading-relaxed text-foreground-600">
          لا بأس! عُد إلى رحلة الحفظ واختر سورة لنبدأ معًا.
        </p>
        <Link to="/quran#hifz" className={`${BTN_ACCENT} mt-6`}>
          <i className="ri-apps-2-line text-lg" />
          رحلة الحفظ
        </Link>
      </div>
    </section>
  );
}

export default function QuranSurahPage() {
  useScrollTop();
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const { data } = useProgress();
  const surah = getSurahMeta(id);

  const memorised = surah ? (data.quran[surah.id]?.stage ?? 0) >= 3 : false;
  const review = params.get("review") === "1" && memorised;

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        {surah ? (
          <CelebrationProvider>
            <Journey key={`${surah.id}:${review ? "review" : "journey"}`} surah={surah} review={review} />
          </CelebrationProvider>
        ) : (
          <NotFoundCard />
        )}
      </main>
      <Footer />
    </div>
  );
}
