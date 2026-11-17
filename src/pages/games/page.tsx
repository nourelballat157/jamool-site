import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ModuleHero from "@/components/feature/ModuleHero";
import GameModal from "@/pages/games/components/GameModal";
import MemoryGame from "@/pages/games/components/MemoryGame";
import ColorMatchGame from "@/pages/games/components/ColorMatchGame";
import LetterMatchGame from "@/pages/games/components/LetterMatchGame";
import OrderNumbersGame from "@/pages/games/components/OrderNumbersGame";
import PlantGame from "@/pages/games/components/PlantGame";
import FeedGame from "@/pages/games/components/FeedGame";
import HonestGame from "@/pages/games/components/HonestGame";
import WordGame from "@/pages/games/components/WordGame";
import ShadowGame from "@/pages/games/components/ShadowGame";
import GameCard from "@/pages/games/components/GameCard";
import GamesOverview from "@/pages/games/components/GamesOverview";
import { FALLBACK_PRESENTATION, GAME_CATEGORIES, GAME_PRESENTATION, type GameCategory } from "@/pages/games/gameMeta";
import useProgress from "@/store/progress";
import { extraGames } from "@/pages/games/extraGames";
import { CelebrationProvider } from "@/pages/games/components/celebration";
import useScrollTop from "@/hooks/useScrollTop";
import { gsap, Flip, ScrollTrigger } from "@/lib/gsap";
import { useSound } from "@/components/feature/SoundProvider";
import { recordActivity } from "@/hooks/useActivityProgress";
import { gameList } from "@/mocks/child";
import { tones } from "@/data/brand";

const GAME_META: Record<string, { title: string; subtitle: string }> = {
  memory: { title: "لعبة الذاكرة", subtitle: "اكشف البطاقات وطابق الأزواج المتشابهة" },
  color: { title: "اكتشف الألوان", subtitle: "اختر اسم اللون الصحيح" },
  letters: { title: "عالم الحروف", subtitle: "بأي حرف تبدأ الكلمة؟" },
  numbers: { title: "مغامرة الأرقام", subtitle: "رتّب الأرقام من الأصغر إلى الأكبر" },
  plant: { title: "ازرع نبتة", subtitle: "اختر الأدوات بالترتيب الصحيح وشاهد النبتة تكبر" },
  feed: { title: "أطعم الحيوانات", subtitle: "اسحب الطعام أو اضغطه ثم اضغط على الحيوان المناسب" },
  honest: { title: "ماذا يفعل الصادق؟", subtitle: "مواقف قصيرة، واختيار التصرف الجميل" },
  word: { title: "كوّن الكلمة", subtitle: "رتّب الحروف المبعثرة لتكوّن اسم الصورة" },
  shadow: { title: "تحدي الظلال", subtitle: "من صاحب هذا الظل؟" },
};

const allGames = [...gameList, ...extraGames];

export default function Games() {
  useScrollTop();
  const { soundOn, toggle: toggleSound } = useSound();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<"all" | GameCategory>("all");
  const gridRef = useRef<HTMLUListElement>(null);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);

  /* GSAP Flip: cards glide to their new places when the filter changes */
  const changeCategory = (id: "all" | GameCategory) => {
    if (id === category) return;
    if (gridRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const items = gridRef.current.querySelectorAll("[data-flip-id]");
      gsap.killTweensOf(items);
      gsap.set(items, { autoAlpha: 1, y: 0, clearProps: "transform,opacity,visibility" });
      flipState.current = Flip.getState(items);
    }
    setCategory(id);
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.6,
      ease: "power2.inOut",
      stagger: 0.04,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)", clearProps: "opacity,transform" }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [category]);
  const { child, isDone } = useProgress();
  const visibleGames = allGames.filter(
    (g) => category === "all" || (GAME_PRESENTATION[g.id] ?? FALLBACK_PRESENTATION).category === category
  );

  const closeGame = () => {
    setActiveGame(null);
    if (searchParams.has("game")) {
      const next = new URLSearchParams(searchParams);
      next.delete("game");
      setSearchParams(next, { replace: true });
    }
  };

  const openGame = useCallback((id: string) => {
    const game = allGames.find((item) => item.id === id);
    if (game) {
      recordActivity({
        key: `game:${id}`,
        title: GAME_META[id]?.title ?? game.title,
        subtitle: GAME_META[id]?.subtitle ?? game.desc,
        icon: game.icon,
        route: `/games?game=${id}`,
        tone: game.tone,
      });
    }
    setActiveGame(id);
  }, []);

  // /games?game=<id> opens that game straight away (used by links from other pages)
  const wantedGame = searchParams.get("game");
  useEffect(() => {
    if (wantedGame && allGames.some((item) => item.id === wantedGame)) openGame(wantedGame);
  }, [wantedGame, openGame]);

  return (
    <CelebrationProvider>
      <div className="flex min-h-screen flex-col bg-background-50">
        <Navbar />
        <main className="flex-1">
          <ModuleHero
            category="games"
            badge="منطقة اللعب"
            badgeIcon="ri-gamepad-line"
            title="تعال نجرّب ألعاب ثعلوب"
            description="ألعاب قصيرة وممتعة تدرّب الذاكرة والملاحظة والحروف، وكل لعبة تمنحك نقاطًا بلا تعقيد."
            actions={
              <a href="#game-list" className="btn btn-primary btn-lg">
                <i className="ri-play-fill" />
                هيا نلعب
              </a>
            }
          />

          <section id="game-list" className="w-full bg-background-50 py-10 md:py-14">
            <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
              <div className="mb-6 text-center md:mb-8">
                <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-4xl">اختر لعبتك المفضلة</h2>
                <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">
                  ألعاب قصيرة وواضحة، تبدأ فورًا وتلعب كما تحب.
                </p>
              </div>

              <GamesOverview
                games={allGames.map((g) => ({ id: g.id, title: g.title, desc: g.desc, done: isDone(`game:${g.id}`) }))}
                childName={child.name}
                onPlay={openGame}
              />

              <div className="mb-8 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="تصنيف الألعاب">
                <div className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-3xl bg-background-100 p-1.5">
                  {GAME_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={category === cat.id}
                      onClick={() => changeCategory(cat.id)}
                      className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-bold transition-colors duration-200 ${
                        category === cat.id ? tones.secondary.solid : "text-foreground-700 hover:bg-secondary-100"
                      }`}
                    >
                      <i className={cat.icon} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <ul ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {visibleGames.map((game, index) => (
                  <li key={game.id} data-flip-id={game.id}>
                    <GameCard
                      id={game.id}
                      title={game.title}
                      desc={game.desc}
                      done={isDone(`game:${game.id}`)}
                      index={index}
                      onPlay={openGame}
                    />
                  </li>
                ))}
              </ul>

              <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs font-medium text-foreground-500">
                <i className="ri-information-line text-secondary-600" />
                ألعاب فردية ممتعة — بلا عدّادات ولا حياة ولا متجر، التركيز على التعلّم والمرح.
              </p>
            </div>
          </section>
        </main>
        <Footer />

        {activeGame ? (
          <GameModal
            title={GAME_META[activeGame]?.title || "لعبة"}
            subtitle={GAME_META[activeGame]?.subtitle}
            onClose={closeGame}
            soundOn={soundOn}
            onToggleSound={toggleSound}
          >
            {activeGame === "memory" ? <MemoryGame soundOn={soundOn} /> : null}
            {activeGame === "color" ? <ColorMatchGame soundOn={soundOn} /> : null}
            {activeGame === "letters" ? <LetterMatchGame soundOn={soundOn} /> : null}
            {activeGame === "numbers" ? <OrderNumbersGame soundOn={soundOn} /> : null}
            {activeGame === "plant" ? <PlantGame soundOn={soundOn} /> : null}
            {activeGame === "feed" ? <FeedGame soundOn={soundOn} /> : null}
            {activeGame === "honest" ? <HonestGame soundOn={soundOn} /> : null}
            {activeGame === "word" ? <WordGame soundOn={soundOn} /> : null}
            {activeGame === "shadow" ? <ShadowGame soundOn={soundOn} /> : null}
          </GameModal>
        ) : null}
      </div>
    </CelebrationProvider>
  );
}
