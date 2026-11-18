import { useRef } from "react";
import { FALLBACK_PRESENTATION, GAME_PRESENTATION, categoryLabel, gameImage } from "@/pages/games/gameMeta";
import { gsap, useGSAP } from "@/lib/gsap";

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
 * A game, shown as the game: the artwork of its own little scene fills the card, the name sits on a soft night
 * gradient, glass chips tell the time and the age, and one saffron button starts it. On a mouse the picture drifts
 * toward the pointer, a big play button blooms in the middle and the card gains depth; a finished game shows a calm check.
 */
export default function GameCard({ id, title, desc, done, onPlay }: GameCardProps) {
  const meta = GAME_PRESENTATION[id] ?? FALLBACK_PRESENTATION;
  const root = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const pic = el.querySelector<HTMLElement>("[data-pic]");
        const play = el.querySelector<HTMLElement>("[data-play]");
        const veil = el.querySelector<HTMLElement>("[data-veil]");
        if (!pic || !play || !veil) return;
        gsap.set(play, { scale: 0.5, autoAlpha: 0 });
        const qx = gsap.quickTo(pic, "x", { duration: 0.7, ease: "power3.out" });
        const qy = gsap.quickTo(pic, "y", { duration: 0.7, ease: "power3.out" });
        const on = () => {
          gsap.to(pic, { scale: 1.09, duration: 0.7, ease: "power2.out", overwrite: "auto" });
          gsap.to(play, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
          gsap.to(veil, { opacity: 0.35, duration: 0.4, overwrite: "auto" });
        };
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          qx(-((e.clientX - r.left) / r.width - 0.5) * 18);
          qy(-((e.clientY - r.top) / r.height - 0.5) * 14);
        };
        const off = () => {
          gsap.to(pic, { scale: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" });
          qx(0);
          qy(0);
          gsap.to(play, { scale: 0.5, autoAlpha: 0, duration: 0.25, overwrite: "auto" });
          gsap.to(veil, { opacity: 0, duration: 0.4, overwrite: "auto" });
        };
        el.addEventListener("pointerenter", on);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", off);
        el.addEventListener("focus", on);
        el.addEventListener("blur", off);
        return () => {
          el.removeEventListener("pointerenter", on);
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", off);
          el.removeEventListener("focus", on);
          el.removeEventListener("blur", off);
        };
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <button
      ref={root}
      type="button"
      onClick={() => onPlay(id)}
      aria-label={`${title} — ${done ? "العب مرة أخرى" : "العب الآن"}`}
      className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[1.75rem] bg-violet-900 text-start shadow-[0_18px_34px_-18px_rgb(31_26_107/0.65)] ring-1 ring-foreground-900/10 transition-shadow duration-300 hover:shadow-[0_30px_50px_-20px_rgb(31_26_107/0.8)] focus-visible:shadow-[0_0_0_4px_rgb(255_196_61/0.95)] md:rounded-4xl"
    >
      <img data-pic src={gameImage(id)} alt="" loading="lazy" decoding="async" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover will-change-transform" />
      <span data-veil aria-hidden="true" className="absolute inset-0 bg-[#1F1A6B] opacity-0" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-t from-[#1B1560]/95 via-[#1B1560]/55 to-transparent" />

      {/* top: the facts as glass chips, and the state */}
      <span className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 md:inset-x-4 md:top-4">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-bold text-foreground-900 backdrop-blur-sm">
            <i className="ri-time-line text-sm text-secondary-600" aria-hidden="true" />
            {meta.minutes.toLocaleString("ar-EG")} دقائق
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-bold text-foreground-900 backdrop-blur-sm">
            <i className="ri-user-smile-line text-sm text-secondary-600" aria-hidden="true" />
            {meta.age}
          </span>
        </span>
        {done ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-leaf-500 px-2.5 py-1 text-xs font-bold text-white shadow">
            <i className="ri-check-line" aria-hidden="true" />
            أنهيتها
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-400 px-2.5 py-1 text-xs font-bold text-foreground-900 shadow">
            <i className="ri-sparkling-2-fill" aria-hidden="true" />
            جديدة
          </span>
        )}
      </span>

      {/* middle: a play button that blooms on hover (mouse only) */}
      <span data-play aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[40%] -ml-8 -mt-8 hidden h-16 w-16 items-center justify-center rounded-full bg-white/95 text-4xl text-secondary-600 shadow-[0_12px_28px_-8px_rgb(0_0_30/0.6)] [@media(hover:hover)_and_(pointer:fine)]:flex">
        <i className="ri-play-fill" />
      </span>

      {/* bottom: name, one line, and the action */}
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4 md:p-5">
        <span className="text-xs font-bold text-primary-300">{categoryLabel(meta.category)}</span>
        <span className="font-heading text-2xl font-bold leading-tight !text-background-50 md:text-[1.7rem]">{title}</span>
        <span className="line-clamp-1 text-sm text-background-100/85 md:text-base">{desc}</span>
        <span className="mt-2 flex items-center justify-between gap-3">
          <span aria-hidden="true" className="btn btn-primary btn-sm">
            <i className={done ? "ri-restart-line" : "ri-play-fill"} />
            {done ? "العب مرة أخرى" : "العب الآن"}
          </span>
          <span aria-hidden="true" className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 font-heading text-sm font-bold text-background-50 ring-1 ring-white/25 backdrop-blur-sm">
            <i className="ri-star-fill text-primary-300" />{(10).toLocaleString("ar-EG")} نقاط
          </span>
        </span>
      </span>
    </button>
  );
}
