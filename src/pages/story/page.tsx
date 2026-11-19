import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import Character from "@/components/brand/Character";
import ProgressBar from "@/components/brand/ProgressBar";
import { useRewards } from "@/components/feature/RewardProvider";
import useScrollTop from "@/hooks/useScrollTop";
import { completeActivity, recordActivity } from "@/hooks/useActivityProgress";
import useProgress, { setMark } from "@/store/progress";
import { CelebrationProvider, useCelebration } from "@/pages/games/components/celebration";
import { childStories } from "@/mocks/child";
import { getStoryContent, type StoryContent } from "@/data/storyPages";
import useFavorites from "./favorites";
import BookSpread from "./components/BookSpread";
import HeartButton from "./components/HeartButton";
import HeroSwitch from "./components/HeroSwitch";
import RichText, { VocabBubble } from "./components/RichText";
import StoryCover from "./components/StoryCover";
import StoryQuiz from "./components/StoryQuiz";
import StoryResult from "./components/StoryResult";
import usePrefs from "./components/usePrefs";
import useReadAloud from "./components/useReadAloud";
import {
  arDigits,
  genderOfChild,
  plainText,
  resolveText,
  tokenize,
  tokenWord,
} from "./components/parse";
import "./story.css";

type ChildStory = (typeof childStories)[number];
type View = "cover" | "read" | "quiz" | "result";

const SIZE_BUTTONS = [
  { size: 0 as const, label: "حجم الخط صغير", cls: "text-sm" },
  { size: 1 as const, label: "حجم الخط متوسط", cls: "text-lg" },
  { size: 2 as const, label: "حجم الخط كبير", cls: "text-2xl" },
];

export default function StoryReaderPage() {
  useScrollTop();
  const { id = "" } = useParams<{ id: string }>();

  return (
    <CelebrationProvider>
      <div className="flex min-h-screen flex-col bg-background-50">
        <Navbar />
        <main className="flex-1">
          <StoryBody key={id} id={id} />
        </main>
        <Footer />
      </div>
    </CelebrationProvider>
  );
}

function StoryBody({ id }: { id: string }) {
  const story = childStories.find((s) => s.id === id);
  const content = getStoryContent(id);

  if (!story || !content) {
    return (
      <section className="w-full bg-violet-50 py-12 md:py-20">
        <div className="mx-auto w-full max-w-xl px-4 md:px-6">
          <div className="card animate-rise-in p-6 text-center md:p-10">
            <Character name="jamool" size="lg" motion="float" decorative className="mx-auto" />
            <h1 className="mt-5 text-3xl font-bold">
              لم نجد هذه القصة
            </h1>
            <p className="mt-2 text-base leading-relaxed text-foreground-600">
              ربما انتقلت الحكاية إلى رف آخر في المكتبة. تعال نختر قصة جميلة من القصص الأخرى.
            </p>
            <Link to="/stories" className="btn btn-primary mt-6">
              <i className="ri-book-open-line" />
              العودة إلى القصص
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <Reader story={story} content={content} />;
}

function Reader({ story, content }: { story: ChildStory; content: StoryContent }) {
  const { id } = story;
  const total = content.pages.length;
  const doneKey = `story:${id}`;
  const pageKey = `story:${id}:page`;
  const starsKey = `story:${id}:stars`;

  const { child, data, isDone } = useProgress();
  const { earn } = useRewards();
  const { celebrate } = useCelebration();
  const favs = useFavorites();
  const prefs = usePrefs();

  const done = isDone(doneKey);
  const bestStars = data.marks[starsKey] ?? 0;
  const [savedPage] = useState(() => (done ? 0 : (data.marks[pageKey] ?? 0)));

  const [view, setView] = useState<View>("cover");
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [readMode, setReadMode] = useState(false);
  const [openVocab, setOpenVocab] = useState<number | null>(null);
  const [result, setResult] = useState({ stars: 1, firstTime: false });

  const bookRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(page);
  pageRef.current = page;
  const firstPaint = useRef(true);

  /* ------------------------------ text for the current page ------------------------------ */
  const heroName = prefs.hero ? child.name : content.heroName;
  const gender = prefs.hero ? genderOfChild(child) : content.heroGender;
  const resolve = useCallback(
    (text: string) => resolveText(text, heroName, gender),
    [heroName, gender]
  );

  const pageTokens = useMemo(
    () => content.pages.map((p) => tokenize(resolve(p.text))),
    [content, resolve]
  );
  const moralTokens = useMemo(() => tokenize(content.moral), [content]);
  const isEnd = page >= total;
  const tokens = isEnd ? moralTokens : (pageTokens[page] ?? []);
  const plain = useMemo(() => plainText(tokens), [tokens]);
  const words = useMemo(() => tokens.map(tokenWord), [tokens]);

  /* ------------------------------------- read aloud ------------------------------------- */
  const onPageDone = useCallback(() => {
    if (pageRef.current < total) {
      setDir("next");
      setOpenVocab(null);
      setPage(pageRef.current + 1);
    } else {
      setReadMode(false);
    }
  }, [total]);

  const audio = useReadAloud(onPageDone);
  const { play, halt, playingRef } = audio;

  useEffect(() => {
    if (view !== "read" || !readMode) {
      if (playingRef.current) halt();
      return;
    }
    play(plain, words);
  }, [view, readMode, page, plain, words, play, halt, playingRef]);

  /* ---------------------------------- navigation + resume ---------------------------------- */
  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total, next));
      if (clamped === pageRef.current) return;
      setDir(clamped > pageRef.current ? "next" : "prev");
      setOpenVocab(null);
      setPage(clamped);
    },
    [total]
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (view !== "read") return;
    setMark(pageKey, page);
    recordActivity({
      key: doneKey,
      title: story.title,
      subtitle: page >= total ? "وصلت إلى نهاية القصة" : `الصفحة ${arDigits(page + 1)} من ${arDigits(total)}`,
      icon: "ri-book-open-line",
      route: `/stories/${id}`,
      tone: "bg-violet-100 text-violet-700",
    });
  }, [view, page, pageKey, doneKey, story.title, total, id]);

  // keep the new page in view on phones (the buttons are below the text)
  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    if (view !== "read") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = bookRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 70) window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
  }, [page, view]);

  useEffect(() => {
    if (view !== "read") return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key === "ArrowLeft") goTo(pageRef.current + 1); // RTL: left = next
      if (event.key === "ArrowRight") goTo(pageRef.current - 1); // RTL: right = previous
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, goTo]);

  const startReading = (from: number, readAloud: boolean) => {
    setDir("next");
    setOpenVocab(null);
    setPage(Math.max(0, Math.min(total, from)));
    setReadMode(readAloud);
    setView("read");
  };

  const openQuiz = () => {
    halt();
    setReadMode(false);
    setView("quiz");
  };

  const backToStory = () => {
    setDir("prev");
    setPage(total);
    setView("read");
  };

  const finishQuiz = (firstTry: number) => {
    const stars = Math.max(1, Math.min(3, firstTry));
    const res = earn(doneKey, 30, `أنهيت قصة «${story.title}»`);
    completeActivity(doneKey);
    setMark(starsKey, Math.max(bestStars, stars));
    setMark(pageKey, 0);
    setResult({ stars, firstTime: res.gained > 0 });
    setView("result");
    celebrate();
  };

  const reread = () => startReading(0, false);

  /* ---------------------------------- vocabulary bubble ---------------------------------- */
  const vocab = openVocab !== null ? tokens[openVocab] : undefined;
  const onVocab = (index: number) => {
    if (openVocab === index) {
      setOpenVocab(null);
      return;
    }
    setOpenVocab(index);
    const token = tokens[index];
    if (token?.meaning) {
      setReadMode(false);
      audio.say(`${token.text}. ${token.meaning}`);
    }
  };

  const toggleRead = () => {
    if (readMode) {
      setReadMode(false);
    } else {
      setOpenVocab(null);
      setReadMode(true);
    }
  };

  /* ------------------------------------- suggestions ------------------------------------- */
  const suggestions = useMemo(() => {
    const at = childStories.findIndex((s) => s.id === id);
    const rotated = [...childStories.slice(at + 1), ...childStories.slice(0, at)];
    const fresh = rotated.filter((s) => !data.earned[`story:${s.id}`]);
    const seen = rotated.filter((s) => data.earned[`story:${s.id}`]);
    return [...fresh, ...seen].slice(0, 2);
  }, [id, data.earned]);

  const stars = bestStars;

  /* ================================= render ================================= */

  if (view === "cover") {
    return (
      <section className="w-full bg-violet-50 py-8 md:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <StoryCover
            story={story}
            total={total}
            savedPage={savedPage}
            done={done}
            bestStars={stars}
            isFav={favs.isFav(id)}
            onToggleFav={() => favs.toggle(id)}
            heroOn={prefs.hero}
            onToggleHero={prefs.toggleHero}
            childName={child.name}
            childIsGirl={genderOfChild(child) === "f"}
            canSpeak={audio.supported}
            onStart={startReading}
          />
        </div>
      </section>
    );
  }

  if (view === "quiz") {
    return (
      <section className="w-full bg-violet-50 py-8 md:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <StoryQuiz
            questions={content.quiz}
            resolve={resolve}
            onFinish={finishQuiz}
            onBack={backToStory}
          />
        </div>
      </section>
    );
  }

  if (view === "result") {
    return (
      <section className="w-full bg-violet-50 py-8 md:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <StoryResult
            story={story}
            stars={result.stars}
            firstTime={result.firstTime}
            points={30}
            childName={child.name}
            moral={content.moral}
            moralIcon={content.moralIcon}
            suggestions={suggestions}
            onReread={reread}
          />
        </div>
      </section>
    );
  }

  const current = isEnd ? null : content.pages[page];
  const hasVocab = tokens.some((t) => Boolean(t.meaning));
  const progress = Math.round(((Math.min(page, total) + 1) / (total + 1)) * 100);

  return (
    <section className="w-full bg-violet-50 py-6 md:py-10">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        {/* toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/stories"
              aria-label="كل القصص"
              className="btn-icon shrink-0"
            >
              <i className="ri-arrow-right-line text-xl" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold md:text-2xl">
                {story.title}
              </h1>
              <p className="truncate text-xs font-medium text-foreground-500">{story.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="حجم الخط"
              className="inline-flex items-center gap-1 rounded-full bg-background-50 p-1 ring-1 ring-violet-200"
            >
              {SIZE_BUTTONS.map((b) => (
                <button
                  key={b.size}
                  type="button"
                  onClick={() => prefs.setSize(b.size)}
                  aria-label={b.label}
                  aria-pressed={prefs.size === b.size}
                  className={`flex h-11 w-11 items-center justify-center rounded-full font-heading font-bold transition-colors cursor-pointer ${b.cls} ${
                    prefs.size === b.size
                      ? "bg-violet-600 text-background-50"
                      : "text-foreground-700 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  أ
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleRead}
              disabled={!audio.supported}
              aria-pressed={readMode}
              className={`btn btn-sm min-h-[2.75rem] ${readMode ? "btn-primary" : "btn-secondary"}`}
            >
              <i className={readMode ? "ri-stop-circle-line" : "ri-volume-up-line"} />
              {readMode ? "أوقف القراءة" : "اقرأ لي"}
            </button>
            <HeartButton active={favs.isFav(id)} onToggle={() => favs.toggle(id)} />
          </div>
        </div>

        <div className="mb-5">
          <HeroSwitch on={prefs.hero} onToggle={prefs.toggleHero} childName={child.name} girl={genderOfChild(child) === "f"} />
        </div>

        {/* the open book */}
        <div ref={bookRef}>
          <div key={page} className={dir === "next" ? "story-turn-next" : "story-turn-prev"}>
            {current ? (
              <BookSpread
                image={story.image}
                alt={`${story.title} - الصفحة ${arDigits(page + 1)}`}
                focus={current.focus}
                zoom={current.zoom}
                icon={current.icon}
                chip={`الصفحة ${arDigits(page + 1)}`}
              >
                <RichText
                  tokens={tokens}
                  active={audio.word}
                  reading={audio.playing}
                  size={prefs.size}
                  openVocab={openVocab}
                  onVocab={onVocab}
                />
                {vocab?.meaning ? (
                  <VocabBubble
                    word={vocab.text}
                    meaning={vocab.meaning}
                    canSpeak={audio.supported}
                    onSpeak={() => audio.say(`${vocab.text}. ${vocab.meaning ?? ""}`)}
                    onClose={() => setOpenVocab(null)}
                  />
                ) : null}
                {hasVocab && !vocab ? (
                  <p className="mt-6 flex items-center gap-2 text-xs font-medium text-foreground-500">
                    <i className="ri-lightbulb-line text-base text-primary-600" />
                    اضغط على الكلمة الملوّنة لتعرف معناها
                  </p>
                ) : null}
              </BookSpread>
            ) : (
              <BookSpread
                image={story.image}
                alt={`${story.title} - النهاية`}
                focus="50% 50%"
                zoom={1}
                icon="ri-medal-line"
                chip="النهاية"
              >
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-xs font-bold text-violet-700">
                  <i className="ri-sparkling-2-fill" />
                  انتهت الحكاية
                </span>
                <h2 className="mt-3 text-4xl font-bold md:text-5xl">
                  النهاية
                </h2>
                <div className="mt-5 flex items-end gap-3 rounded-3xl bg-violet-50 p-4 sm:p-5">
                  <Character name="noor" size="sm" small decorative className="shrink-0" />
                  <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-xs font-bold text-violet-700">
                    <i className={`${content.moralIcon} text-base`} />
                    ماذا تعلمنا؟
                  </p>
                  <div className="mt-2">
                    <RichText
                      tokens={tokens}
                      active={audio.word}
                      reading={audio.playing}
                      size={Math.max(0, prefs.size - 1)}
                      openVocab={null}
                      onVocab={() => undefined}
                    />
                  </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={openQuiz}
                    className="btn btn-primary story-halo"
                  >
                    <i className="ri-question-line" />
                    ابدأ الأسئلة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReadMode(false);
                      goTo(0);
                    }}
                    className="btn btn-ghost"
                  >
                    <i className="ri-restart-line" />
                    اقرأ من البداية
                  </button>
                </div>
              </BookSpread>
            )}
          </div>
        </div>

        {/* progress + page buttons */}
        <div className="mt-6 grid grid-cols-2 items-center gap-4 md:grid-cols-[auto_1fr_auto]">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label="الصفحة السابقة"
            className="btn btn-ghost min-w-[7.5rem] md:order-1"
          >
            <i className="ri-arrow-right-line" />
            السابق
          </button>

          <div className="order-first col-span-2 flex flex-col items-center gap-3 md:order-2 md:col-span-1">
            <div className="flex items-center justify-center" role="group" aria-label="صفحات القصة">
              {Array.from({ length: total + 1 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={i === total ? "نهاية القصة" : `الصفحة ${arDigits(i + 1)}`}
                  aria-current={i === page ? "step" : undefined}
                  className="group flex h-11 w-4 items-center justify-center cursor-pointer min-[400px]:w-5 sm:w-6"
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all duration-300 ${
                      i === page
                        ? "w-6 bg-violet-600"
                        : i < page
                          ? "w-2.5 bg-violet-300 group-hover:bg-violet-400"
                          : "w-2.5 bg-background-300 group-hover:bg-violet-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex w-full max-w-sm items-center gap-3">
              <span className="whitespace-nowrap text-sm font-bold text-foreground-700">
                {isEnd ? "النهاية" : `${arDigits(page + 1)} / ${arDigits(total)}`}
              </span>
              <ProgressBar value={progress} tone="violet" label="تقدّم القصة" height="h-2.5" className="flex-1" />
            </div>
          </div>

          {isEnd ? (
            <button
              type="button"
              onClick={openQuiz}
              className="btn btn-primary min-w-[7.5rem] justify-self-end md:order-3"
            >
              الأسئلة
              <i className="ri-question-line" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              aria-label="الصفحة التالية"
              className="btn btn-primary min-w-[7.5rem] justify-self-end md:order-3"
            >
              {page === total - 1 ? "النهاية" : "التالي"}
              <i className="ri-arrow-left-line" />
            </button>
          )}
        </div>

        <p className="mt-6 hidden items-center justify-center gap-2 text-xs font-medium text-foreground-500 md:flex">
          <i className="ri-keyboard-line text-base text-violet-600" />
          يمكنك تقليب الصفحات بالأسهم في لوحة المفاتيح
        </p>
      </div>
    </section>
  );
}
