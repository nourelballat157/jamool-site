import { useRef } from "react";
import { Link } from "react-router-dom";
import { competitionSteps } from "@/mocks/home";
import Character from "@/components/brand/Character";
import CategoryTile from "@/components/brand/CategoryTile";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

type CompetitionsSectionProps = {
  onRequireLogin: () => void;
};

/** The podium: three arch blocks of different heights, saffron and navy only. Order is 2nd, 1st, 3rd. */
const PODIUM = [
  { rank: 2, height: "h-24 md:h-36 lg:h-40", tone: "bg-foreground-900 text-primary-300" },
  { rank: 1, height: "h-32 md:h-48 lg:h-56", tone: "bg-primary-500 text-foreground-900" },
  { rank: 3, height: "h-16 md:h-28 lg:h-32", tone: "bg-primary-400 text-foreground-900" },
];

/**
 * Competitions chapter: Thaloob holds court beside a saffron + navy podium (the one focal scene),
 * and the three steps are a connected path of numbered arch doors. Joining still asks for login.
 */
export default function CompetitionsSection({ onRequireLogin }: CompetitionsSectionProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* the one ambient loop: the trophy bobs above the winner's arch */
        gsap.to("[data-trophy]", { y: -9, duration: 1.7, ease: "sine.inOut", repeat: -1, yoyo: true });

        /* the podium rises and the fox steps in once the scene is on screen */
        const trigger = { trigger: el.querySelector("[data-scene]"), start: "top 80%", once: true };
        gsap.from("[data-block]", { scaleY: 0, opacity: 0, transformOrigin: "50% 100%", duration: 0.8, stagger: 0.12, ease: "back.out(1.4)", scrollTrigger: trigger });
        gsap.from("[data-fox]", { y: 46, opacity: 0, duration: 0.8, delay: 0.1, scrollTrigger: trigger });
      });

      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        const on = (target: Element, type: string, fn: () => void) => {
          target.addEventListener(type, fn);
          cleanups.push(() => target.removeEventListener(type, fn));
        };

        /* Thaloob hops and tilts when you meet him */
        const fox = el.querySelector("[data-fox]");
        const hopper = el.querySelector("[data-fox-hop]");
        if (fox && hopper) {
          const hop = () =>
            gsap
              .timeline({ overwrite: "auto" })
              .to(hopper, { y: -24, rotation: -5, duration: 0.22, ease: "power2.out" })
              .to(hopper, { y: 0, rotation: 0, duration: 0.38, ease: "bounce.out" });
          on(fox, "pointerenter", hop);
          on(fox, "focusin", hop);
        }

        /* podium blocks lift under the pointer */
        el.querySelectorAll("[data-block]").forEach((b) => {
          on(b, "pointerenter", () => gsap.to(b, { y: -10, duration: 0.3, ease: "back.out(2)", overwrite: "auto" }));
          on(b, "pointerleave", () => gsap.to(b, { y: 0, duration: 0.3, ease: "power3.out", overwrite: "auto" }));
        });

        /* step icons wiggle (kept under 0.4s) */
        el.querySelectorAll("[data-step]").forEach((s) => {
          const icon = s.querySelector("[data-step-icon]");
          if (!icon) return;
          on(s, "pointerenter", () =>
            gsap
              .timeline({ overwrite: "auto" })
              .to(icon, { rotation: -14, scale: 1.1, duration: 0.12, ease: "power2.out" })
              .to(icon, { rotation: 10, duration: 0.12 })
              .to(icon, { rotation: 0, scale: 1, duration: 0.14 })
          );
        });

        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="competitions" className="relative w-full overflow-hidden bg-primary-50 pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader category="competitions" title="مسابقات مبهجة" line="كل مشاركة تُقدَّر، ولا مقارنة بين الأطفال." />

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* the path: three numbered doors joined by a dashed line */}
          <div>
            <div className="relative">
              <span aria-hidden="true" className="absolute bottom-[2.1rem] start-[1.7rem] top-[2.1rem] border-s-2 border-dashed border-primary-500/70" />
              <ul className="relative flex flex-col gap-4">
                {competitionSteps.map((step, index) => (
                  <li key={step.id}>
                    <div data-step className="flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="relative z-10 flex h-[4.25rem] w-14 shrink-0 items-center justify-center rounded-b-2xl rounded-t-[999px] bg-primary-500 pt-2 font-heading text-2xl font-bold text-foreground-900 shadow-[0_5px_0_rgb(31_42_92/0.18)]"
                      >
                        {(index + 1).toLocaleString("ar-EG")}
                      </span>
                      <article className="card card-hover flex min-h-[4.25rem] flex-1 items-center gap-3 p-2.5 pe-5">
                        <span data-step-icon className="inline-flex shrink-0">
                          <CategoryTile icon={step.icon} tone="primary" size="md" />
                        </span>
                        <h3 className="text-base font-bold text-foreground-900 md:text-lg">{step.label}</h3>
                      </article>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={onRequireLogin} className="btn btn-primary btn-lg">
                <i className="ri-award-line" />
                شارك في المسابقة
              </button>
              <Link to="/competitions" className="btn btn-ghost btn-lg">
                <i className="ri-trophy-line" />
                تصفّح كل المسابقات
              </Link>
            </div>
          </div>

          {/* the stage: a flat arch, the podium, and Thaloob */}
          <div data-scene aria-hidden="true" className="relative mx-auto flex w-full max-w-xl items-end justify-center gap-3 pb-3 pt-14 md:gap-6 max-lg:order-first">
            <Deco kind="arch" className="inset-x-0 bottom-0 mx-auto h-[96%] w-auto text-primary-200" />
            <span className="absolute inset-x-2 bottom-0 h-3 rounded-full bg-primary-200" />
            <Deco kind="ring" className="-top-2 start-0 hidden h-24 w-24 text-primary-500 md:block" />
            <Deco kind="sparkle" data-pop className="end-2 top-2 hidden h-8 w-8 text-primary-500 md:block" />
            <Deco kind="sparkle" data-pop className="start-[38%] top-0 h-4 w-4 text-primary-500 md:h-5 md:w-5" />

            <div data-fox className="relative z-10">
              <div data-fox-hop className="origin-bottom">
                <Character name="thaloob" size="xl" decorative className="!h-44 drop-shadow-[0_12px_14px_rgba(31,42,92,0.18)] sm:!h-60 lg:!h-72" />
              </div>
            </div>

            <div className="relative z-10 flex items-end gap-2 md:gap-3">
              {PODIUM.map((p) => (
                <div key={p.rank} className="relative">
                  {p.rank === 1 ? (
                    <span className="absolute inset-x-0 bottom-full mb-2 flex justify-center">
                      <span data-trophy className="block text-5xl text-foreground-900 md:text-6xl">
                        <i className="ri-trophy-line" />
                      </span>
                    </span>
                  ) : null}
                  <div
                    data-block
                    className={`flex w-14 items-start justify-center rounded-t-[999px] pt-4 font-heading text-2xl font-bold md:w-20 md:pt-6 md:text-4xl lg:w-24 ${p.height} ${p.tone}`}
                  >
                    {p.rank.toLocaleString("ar-EG")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <SectionBridge variant="scallop" className="text-background-50" />
    </section>
  );
}
