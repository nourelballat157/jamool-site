import { useRef } from "react";
import { Link } from "react-router-dom";
import { gameWorlds } from "@/mocks/home";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

/** Two flat, tactile flavours: coral and saffron. They alternate so the grid reads as a playful checkerboard. */
const FLAVOURS = [
  {
    tile: "bg-secondary-500 text-white shadow-[0_7px_0_oklch(var(--secondary-700)/1)]",
    disc: "bg-secondary-400",
    ghost: "bg-secondary-400",
    play: "text-secondary-600",
  },
  {
    tile: "bg-primary-400 text-foreground-900 shadow-[0_7px_0_oklch(var(--primary-700)/1)]",
    disc: "bg-primary-300",
    ghost: "bg-primary-300",
    play: "text-secondary-600",
  },
] as const;

/**
 * Thaloob's challenge corner: the fox stands in a coral door, four game worlds sit beside him as chunky tiles.
 * Hovering a tile makes the tile pop, its icon wiggle and Thaloob lean in to look.
 */
export default function GamesSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* the door grows, the fox steps in, then he bobs gently (the one ambient loop) */
        const enter = { trigger: "[data-stage]", start: "top 80%", once: true };
        gsap.from("[data-arch]", { scaleY: 0.72, opacity: 0, transformOrigin: "50% 100%", duration: 0.9, ease: "back.out(1.5)", scrollTrigger: enter });
        gsap.from("[data-fox-react]", { y: 56, opacity: 0, scale: 0.9, transformOrigin: "50% 100%", duration: 0.8, delay: 0.15, ease: "back.out(1.7)", scrollTrigger: enter });
        gsap.to("[data-fox]", { y: -9, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });

      /* hover devices only: tile pops, icon wiggles, the fox reacts */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const fox = el.querySelector<HTMLElement>("[data-fox-react]");
        const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]", el);
        const cleanups: (() => void)[] = [];

        tiles.forEach((tile, i) => {
          const icon = tile.querySelector<HTMLElement>("[data-icon]");
          const dir = i % 2 ? 1 : -1;
          const on = () => {
            gsap.to(tile, { y: -8, rotation: dir * 1.5, duration: 0.3, ease: "back.out(2.2)", overwrite: "auto" });
            if (icon) {
              gsap.to(icon, {
                keyframes: [
                  { rotation: -14, duration: 0.1 },
                  { rotation: 10, duration: 0.1 },
                  { rotation: 0, duration: 0.15 },
                ],
                overwrite: "auto",
              });
            }
            if (fox) gsap.to(fox, { rotation: dir * -5, scale: 1.04, transformOrigin: "50% 100%", duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
          };
          const off = () => {
            gsap.to(tile, { y: 0, rotation: 0, duration: 0.3, ease: "power3.out", overwrite: "auto" });
            if (fox) gsap.to(fox, { rotation: 0, scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
          };
          tile.addEventListener("pointerenter", on);
          tile.addEventListener("pointerleave", off);
          tile.addEventListener("focus", on);
          tile.addEventListener("blur", off);
          cleanups.push(() => {
            tile.removeEventListener("pointerenter", on);
            tile.removeEventListener("pointerleave", off);
            tile.removeEventListener("focus", on);
            tile.removeEventListener("blur", off);
          });
        });
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="games" className="relative isolate w-full overflow-hidden bg-background-50 pb-20 pt-16 md:pb-28 md:pt-24">
      {/* quiet decoration: a few shapes, hidden on phones except the tiny sparkle */}
      <Deco kind="dots" className="-z-10 end-6 top-24 hidden h-16 w-16 text-secondary-200 md:block" />
      <Deco kind="sparkle" data-pop className="-z-10 start-5 top-28 h-4 w-4 text-primary-500 md:start-16 md:h-7 md:w-7" />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader category="games" title="تحديات ثعلوب" line="ألعاب قصيرة، وفي كل لعبة نجمة تنتظرك." />

        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* the focal point: Thaloob standing in a coral door */}
          <div data-stage className="relative mx-auto w-[16.5rem] md:w-[21rem]">
            <Deco
              kind="ring"
              data-drift="14"
              className="-z-10 start-[-2.5rem] top-[-2.5rem] hidden h-[calc(100%+5rem)] w-[calc(100%+5rem)] text-secondary-300 md:block"
            />
            <span aria-hidden="true" className="absolute -end-3 top-[6%] -z-10 h-14 w-14 rounded-full bg-primary-400 md:-end-8 md:h-20 md:w-20" />
            <Deco kind="sparkle" data-pop className="-top-4 start-0 h-6 w-6 text-secondary-500 md:-start-6 md:h-9 md:w-9" />

            <div className="relative aspect-[100/130]">
              <div data-arch aria-hidden="true" className="absolute inset-0">
                <div className="absolute inset-0 rounded-b-[1.75rem] rounded-t-[999px] bg-secondary-500 shadow-[0_8px_0_oklch(var(--secondary-700)/1)]" />
                <div className="absolute inset-3 rounded-b-2xl rounded-t-[999px] bg-background-50 md:inset-4" />
                <div className="absolute inset-x-10 bottom-4 h-3 rounded-full bg-secondary-200 md:bottom-5 md:h-4" />
              </div>
              <div data-fox className="absolute inset-x-0 -bottom-1 flex justify-center md:bottom-0">
                <div data-fox-react>
                  <Character name="thaloob" flip decorative className="!h-[17.5rem] md:!h-[23rem]" />
                </div>
              </div>
            </div>
          </div>

          {/* four game worlds + one action */}
          <div>
            <ul className="grid grid-cols-2 gap-4 md:gap-6">
              {gameWorlds.map((game, i) => {
                const f = FLAVOURS[i % 2];
                return (
                  <li key={game.id} className={i % 2 ? "mt-6 md:mt-9" : ""}>
                    <Link
                      to="/games"
                      data-tile
                      className={`group relative flex min-h-[10.75rem] flex-col justify-between gap-4 overflow-hidden rounded-[1.75rem] p-4 md:min-h-[14rem] md:p-5 ${f.tile}`}
                    >
                      <span aria-hidden="true" className={`absolute -bottom-8 -end-5 h-28 w-24 rounded-t-[999px] ${f.ghost}`} />
                      <span className="relative flex items-start justify-between">
                        <span data-icon aria-hidden="true" className={`inline-flex h-14 w-14 items-center justify-center rounded-full text-3xl md:h-[4.5rem] md:w-[4.5rem] md:text-5xl ${f.disc}`}>
                          <i className={game.icon} />
                        </span>
                        <span aria-hidden="true" className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-background-50 text-2xl ${f.play}`}>
                          <i className="ri-play-fill" />
                        </span>
                      </span>
                      <span className="relative font-heading text-xl font-bold leading-snug md:text-2xl">{game.title}</span>
                      <span className="sr-only">{game.desc}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 flex justify-center lg:justify-start">
              <Link to="/games" className="btn btn-primary btn-lg">
                <i className="ri-play-fill" />
                العب الآن
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SectionBridge variant="scallop" className="text-amber-50" />
    </section>
  );
}
