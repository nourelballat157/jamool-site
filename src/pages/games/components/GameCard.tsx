import CategoryTile from "@/components/brand/CategoryTile";
import { tones } from "@/data/brand";
import { FALLBACK_PRESENTATION, GAME_PRESENTATION, categoryLabel } from "@/pages/games/gameMeta";

type GameCardProps = {
  id: string;
  title: string;
  desc: string;
  done: boolean;
  /** position in the list (kept for callers; the global reveal handles entrance motion) */
  index?: number;
  onPlay: (id: string) => void;
};

/**
 * "Challenge card": coral-soft surface, a big glyph tile, quick facts and one clear action.
 * No character on the card itself (Thaloob lives in the hero and the overview). Finished games show a calm check.
 */
export default function GameCard({ id, title, desc, done, onPlay }: GameCardProps) {
  const meta = GAME_PRESENTATION[id] ?? FALLBACK_PRESENTATION;
  const t = tones.secondary;

  return (
    <button
      type="button"
      onClick={() => onPlay(id)}
      aria-label={`${title} — ${done ? "العب مرة أخرى" : "العب الآن"}`}
      className={`group card-hover flex h-full w-full cursor-pointer flex-col rounded-4xl border p-5 text-start md:p-6 ${t.soft} ${t.border}`}
    >
      <span className="flex w-full items-start justify-between gap-3">
        <span className="transition-transform duration-200 ease-out group-hover:-rotate-3 group-hover:scale-105">
          <CategoryTile icon={meta.icon} tone="secondary" size="lg" solid />
        </span>
        {done ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-leaf-100 px-3 py-1 text-xs font-bold text-leaf-700">
            <i className="ri-check-line" />
            أنهيتها
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800">
            <i className="ri-sparkling-2-fill" />
            جديدة لك
          </span>
        )}
      </span>

      <span className="mt-4 flex flex-1 flex-col">
        <span className={`text-xs font-bold ${t.text}`}>{categoryLabel(meta.category)}</span>
        <span className="mt-1 font-heading text-lg font-bold leading-snug text-foreground-900 md:text-xl">{title}</span>
        <span className="mt-1 text-base leading-relaxed text-foreground-600">{desc}</span>

        <span className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-foreground-700">
          <span className="inline-flex items-center gap-1 rounded-full bg-background-50 px-2.5 py-1">
            <i className="ri-time-line" />
            {meta.minutes.toLocaleString("ar-EG")} دقائق
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-background-50 px-2.5 py-1">
            <i className="ri-user-smile-line" />
            {meta.age}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 font-bold text-primary-800">
            <i className="ri-star-fill text-primary-500" />
            {(10).toLocaleString("ar-EG")} نقاط
          </span>
        </span>
      </span>

      <span className="btn btn-primary mt-5 w-full" aria-hidden="true">
        <i className={done ? "ri-restart-line" : "ri-play-fill"} />
        {done ? "العب مرة أخرى" : "العب الآن"}
      </span>
    </button>
  );
}
