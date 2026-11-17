import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ModuleHero from "@/components/feature/ModuleHero";
import CategoryTile from "@/components/brand/CategoryTile";
import ProgressBar from "@/components/brand/ProgressBar";
import useScrollTop from "@/hooks/useScrollTop";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { recordActivity } from "@/hooks/useActivityProgress";
import { numbersList } from "@/mocks/child";
import { letters as lettersList, lettersTotal } from "@/data/letters";
import useProgress from "@/store/progress";
import { ar } from "@/pages/learning/letter/kit";

export default function Learning() {
  useScrollTop();
  const { speaking, speakSequence, stop } = useArabicSpeech();
  const { isDone, count } = useProgress();
  const mastered = count("letter:");
  const [barReady, setBarReady] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setBarReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const [activeLetter, setActiveLetter] = useState(lettersList[0]);
  const [activeNumber, setActiveNumber] = useState(numbersList[0]);

  const playLetter = (letter: (typeof lettersList)[number]) => {
    setActiveLetter(letter);
    recordActivity({
      key: "learning:letters",
      title: "الحروف الهجائية",
      subtitle: `آخر ما وصلت إليه: حرف ${letter.name}`,
      icon: "ri-text",
      route: "/learning",
      tone: "bg-sky-100 text-sky-700",
    });
    speakSequence([letter.name, letter.word]);
  };

  const playAllLetters = () => {
    const parts = lettersList.flatMap((item) => [item.name, item.word]);
    speakSequence(parts);
  };

  const playNumber = (num: (typeof numbersList)[number]) => {
    setActiveNumber(num);
    recordActivity({
      key: "learning:numbers",
      title: "الأرقام من ١ إلى ١٠",
      subtitle: `آخر ما وصلت إليه: ${num.word}`,
      icon: "ri-sort-asc",
      route: "/learning",
      tone: "bg-sky-100 text-sky-700",
    });
    speakSequence([num.word]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <ModuleHero
          category="learning"
          badge="الحروف والأرقام"
          badgeIcon="ri-text"
          title="نتعلّم الحروف والأرقام ونلعب"
          description="اسمع الحرف، شاهد شكله، وتعلّم الأرقام من ١ إلى ١٠ مع جمّول."
          actions={
            <Link to="/child-select" className="btn btn-primary btn-lg">
              <i className="ri-play-circle-line" />
              هيا نبدأ
            </Link>
          }
        />

        <section className="w-full bg-background-50 py-10 md:py-14">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-start gap-3">
                <CategoryTile category="learning" size="md" />
                <div>
                  <h2 className="text-2xl font-bold md:text-4xl">الحروف الهجائية</h2>
                  <p className="mt-1 text-base leading-relaxed text-foreground-600">
                    اضغط على أي حرف لتسمع اسمه وكلمة تبدأ به.
                  </p>
                </div>
              </div>
              <button type="button" onClick={playAllLetters} className="btn btn-ghost">
                <i className="ri-volume-up-line" />
                استمع لكل الحروف
              </button>
            </div>

            <div className="mb-6 flex max-w-sm items-center gap-3">
              <ProgressBar
                value={barReady ? (mastered / lettersTotal) * 100 : 0}
                tone="sky"
                label="الحروف التي أتقنتها"
                height="h-2.5"
                className="flex-1"
              />
              <span className="whitespace-nowrap text-xs font-medium text-foreground-600">
                أتقنت {ar(mastered)} من {ar(lettersTotal)} حرفًا
              </span>
            </div>

            <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
              {lettersList.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => playLetter(item)}
                    aria-pressed={activeLetter.id === item.id}
                    className={`relative flex aspect-square min-h-[2.75rem] w-full flex-col items-center justify-center rounded-3xl font-heading transition-transform cursor-pointer ${
                      activeLetter.id === item.id
                        ? "scale-105 bg-sky-600 text-background-50"
                        : `${item.tone} hover:-translate-y-1`
                    }`}
                  >
                    <span className="text-3xl font-bold md:text-4xl">{item.letter}</span>
                    <span className="mt-1 text-xs font-medium opacity-80">{item.word}</span>
                    {activeLetter.id === item.id && speaking ? (
                      <i className="ri-volume-up-line absolute end-2 top-2 text-sm" />
                    ) : null}
                    {isDone(`letter:${item.id}`) ? (
                      <span className="absolute start-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-leaf-600 text-[11px] text-background-50">
                        <i className="ri-check-line" />
                        <span className="sr-only">أتقنت هذا الحرف</span>
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>

            <div className="card mt-6 flex flex-wrap items-center gap-4 bg-sky-50 p-5 md:p-6">
              <span
                lang="ar"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-background-50 font-heading text-4xl font-bold text-sky-700"
              >
                {activeLetter.letter}
              </span>
              <div className="min-w-[12rem] flex-1">
                <h3 className="text-lg font-bold md:text-xl">
                  حرف {activeLetter.name} — {activeLetter.word}
                </h3>
                <p className="mt-1 text-base leading-relaxed text-foreground-600">
                  اسم الحرف مع كلمة مثال بصوت واضح.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakSequence([activeLetter.name, activeLetter.word])}
                  aria-label="استمع"
                  className="btn btn-secondary"
                >
                  <i className={speaking ? "ri-volume-up-fill animate-pulse" : "ri-volume-up-line"} />
                  استمع
                </button>
                <button type="button" onClick={stop} aria-label="إيقاف" className="btn-icon">
                  <i className="ri-stop-circle-line text-xl" />
                </button>
              </div>
              <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-foreground-900/10 pt-4">
                <p className="text-base leading-relaxed text-foreground-600">
                  رحلة حرف {activeLetter.name}: شاهد، ارسم، انطق، ثم اختر الصورة.
                </p>
                <Link to={`/learning/letter/${activeLetter.id}`} className="btn btn-primary">
                  <i className="ri-play-circle-line" />
                  ابدأ رحلة الحرف
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-background-100 py-10 md:py-14">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-start gap-3">
                <CategoryTile icon="ri-sort-asc" tone="sky" size="md" />
                <div>
                  <h2 className="text-2xl font-bold md:text-4xl">الأرقام من ١ إلى ١٠</h2>
                  <p className="mt-1 text-base leading-relaxed text-foreground-600">
                    اضغط على الرقم لتسمع نُطقه وتعرف شكله.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveNumber(numbersList[0]);
                  speakSequence(numbersList.map((num) => num.word));
                }}
                className="btn btn-ghost"
              >
                <i className="ri-volume-up-line" />
                استمع لكل الأرقام
              </button>
            </div>

            <ul className="mt-6 grid grid-cols-5 gap-3 lg:grid-cols-10">
              {numbersList.map((num) => (
                <li key={num.id}>
                  <button
                    type="button"
                    onClick={() => playNumber(num)}
                    aria-pressed={activeNumber.id === num.id}
                    className={`relative flex aspect-square min-h-[2.75rem] w-full flex-col items-center justify-center rounded-2xl font-heading transition-transform cursor-pointer ${
                      activeNumber.id === num.id
                        ? "scale-105 bg-sky-600 text-background-50"
                        : "bg-primary-100 text-primary-800 hover:-translate-y-1"
                    }`}
                  >
                    <span className="text-2xl font-bold md:text-3xl">{num.digit}</span>
                    <span className="mt-0.5 text-[10px] font-medium md:text-xs">{num.word}</span>
                    {activeNumber.id === num.id && speaking ? (
                      <i className="ri-volume-up-line absolute end-1 top-1 text-xs" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
            <div aria-hidden="true" className="najdi-zigzag mx-auto mt-10 hidden w-48 opacity-70 md:block" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
