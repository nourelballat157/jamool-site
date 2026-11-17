import Character from "@/components/brand/Character";
import CategoryTile from "@/components/brand/CategoryTile";
import ProgressBar from "@/components/brand/ProgressBar";
import { FALLBACK_PRESENTATION, GAME_PRESENTATION } from "@/pages/games/gameMeta";

type OverviewGame = { id: string; title: string; desc: string; done: boolean };

type GamesOverviewProps = {
  games: OverviewGame[];
  childName: string;
  onPlay: (id: string) => void;
};

/**
 * A calm progress card above the games: the next suggested game, a "surprise me" button,
 * how many games are finished and the points earned. Thaloob appears once, here.
 */
export default function GamesOverview({ games, childName, onPlay }: GamesOverviewProps) {
  const total = games.length;
  const finished = games.filter((g) => g.done).length;
  const next = games.find((g) => !g.done) ?? games[0];
  const pct = total === 0 ? 0 : Math.round((finished / total) * 100);
  const meta = GAME_PRESENTATION[next?.id ?? ""] ?? FALLBACK_PRESENTATION;
  const allDone = finished === total;

  const surprise = () => {
    const pool = games.filter((g) => !g.done);
    const list = pool.length > 0 ? pool : games;
    onPlay(list[Math.floor(Math.random() * list.length)].id);
  };

  return (
    <div className="card mb-8 grid grid-cols-1 gap-6 p-5 md:mb-10 md:p-7 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
      {/* suggested game */}
      <div className="flex min-w-0 items-start gap-4 md:gap-5">
        <CategoryTile icon={meta.icon} tone="secondary" size="lg" solid />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-secondary-700">
            {allDone ? `أحسنت يا ${childName}! أنهيت كل الألعاب` : `لعبتك المقترحة يا ${childName}`}
          </p>
          <h3 className="mt-1 font-heading text-xl font-bold text-foreground-900 md:text-2xl">{next?.title}</h3>
          <p className="mt-1 text-base leading-relaxed text-foreground-600">{next?.desc}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => next && onPlay(next.id)} className="btn btn-primary btn-sm">
              <i className="ri-play-fill" />
              {allDone ? "العب مرة أخرى" : "هيا نبدأ"}
            </button>
            <button type="button" onClick={surprise} className="btn btn-ghost btn-sm">
              <i className="ri-dice-3-line" />
              فاجئني
            </button>
          </div>
        </div>
      </div>

      {/* progress */}
      <div className="flex min-w-0 flex-col justify-center rounded-3xl bg-secondary-50 p-4 md:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-secondary-700">تقدّمك في الألعاب</p>
            <p className="mt-1 font-heading text-3xl font-bold text-foreground-900">
              {finished.toLocaleString("ar-EG")}
              <span className="text-lg font-bold text-foreground-500"> / {total.toLocaleString("ar-EG")}</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50 px-3 py-1.5 text-xs font-bold text-foreground-800">
            <i className="ri-star-fill text-primary-500" />
            {(finished * 10).toLocaleString("ar-EG")} نقطة من الألعاب
          </span>
        </div>

        <ProgressBar value={pct} tone="secondary" label="الألعاب التي أنهيتها" className="mt-4" />

        <ul className="mt-3 flex items-center gap-1.5" aria-hidden="true">
          {games.map((g) => (
            <li key={g.id} className={`h-2 flex-1 rounded-full transition-colors ${g.done ? "bg-secondary-400" : "bg-background-200"}`} />
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-3">
          <Character name="thaloob" size="md" motion={finished > 0 ? "cheer" : "float"} decorative small />
          <p className="min-w-0 flex-1 rounded-3xl bg-background-50 p-3 text-sm leading-relaxed text-foreground-700">
            {finished === 0
              ? "ثعلوب يقول: اختر أي لعبة وابدأ! كل لعبة تمنحك ١٠ نقاط في المرة الأولى."
              : "ثعلوب فخور بك! تقدر تعيد أي لعبة كما تحب."}
          </p>
        </div>
      </div>
    </div>
  );
}
