import { useRef } from "react";
import { Link } from "react-router-dom";
import { quranSteps } from "@/mocks/home";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

/** a very quiet sadu diamond lattice in cream on the turquoise ground, built from brand tokens only */
const LATTICE = {
  backgroundImage:
    "repeating-linear-gradient(45deg, oklch(var(--background-100) / 0.06) 0 1.5px, transparent 1.5px 31px), repeating-linear-gradient(-45deg, oklch(var(--background-100) / 0.06) 0 1.5px, transparent 1.5px 31px)",
} as const;

/**
 * Quran: a brand moment. Deep turquoise ground with a faint diamond lattice, Noor standing on a big saffron
 * arch with a crescent and two sparkles, and the four calm steps as arch-topped tiles.
 */
export default function QuranSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      /* the one ambient loop: Noor floats gently */
      mm.add(MOTION_OK_QUERY, () => {
        gsap.to(el.querySelector("[data-float]"), { y: -10, duration: 2.8, ease: "sine.inOut", repeat: -1, yoyo: true });
      });

      /* hover devices: step tiles lift and their glyph wiggles, Noor tilts */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        el.querySelectorAll<HTMLElement>("[data-step]").forEach((step) => {
          const tile = step.querySelector("[data-tile]");
          const icon = step.querySelector("[data-icon]");
          const tl = gsap
            .timeline({ paused: true, defaults: { duration: 0.4, ease: "power3.out" } })
            .to(tile, { y: -8 }, 0)
            .to(icon, { rotation: -12, scale: 1.15, ease: "back.out(3)" }, 0);
          const on = () => tl.play();
          const off = () => tl.reverse();
          step.addEventListener("pointerenter", on);
          step.addEventListener("pointerleave", off);
          step.addEventListener("focusin", on);
          step.addEventListener("focusout", off);
          cleanups.push(() => {
            step.removeEventListener("pointerenter", on);
            step.removeEventListener("pointerleave", off);
            step.removeEventListener("focusin", on);
            step.removeEventListener("focusout", off);
          });
        });

        const stage = el.querySelector<HTMLElement>("[data-stage]");
        const tilt = el.querySelector("[data-tilt-friend]");
        if (stage && tilt) {
          const on = () => gsap.to(tilt, { rotation: 4, duration: 0.4, ease: "back.out(2)" });
          const off = () => gsap.to(tilt, { rotation: 0, duration: 0.4, ease: "power3.out" });
          stage.addEventListener("pointerenter", on);
          stage.addEventListener("pointerleave", off);
          cleanups.push(() => {
            stage.removeEventListener("pointerenter", on);
            stage.removeEventListener("pointerleave", off);
          });
        }
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="on-navy relative isolate w-full overflow-hidden bg-accent-800 pb-20 pt-16 text-background-50 md:pb-28 md:pt-24">
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={LATTICE} />

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader category="surahs" image="/brand/surahs-emblem.webp" tone="primary" onDark title="ركن القرآن الهادئ" line="نستمع، نردّد، نتلو ثم نحفظ بهدوء." />

        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          {/* Noor on a saffron arch: the one focal point */}
          <div data-stage className="relative mx-auto flex w-full max-w-[22rem] flex-col items-center">
            <div className="relative h-[22rem] w-[17rem] md:h-[27rem] md:w-[20.5rem]">
              <Deco kind="arch" className="inset-0 h-full w-full text-primary-400" />
              <Deco kind="crescent" data-pop className="-top-3 end-0 h-10 w-10 text-primary-200 md:-top-4 md:-end-6 md:h-14 md:w-14" />
              <Deco kind="sparkle" data-pop className="-start-5 top-24 hidden h-8 w-8 text-primary-300 md:block" />
              <Deco kind="sparkle" data-pop className="-end-7 bottom-28 hidden h-5 w-5 text-background-100 md:block" />
              <span aria-hidden="true" className="absolute inset-x-6 -bottom-1 h-4 rounded-full bg-accent-900/60" />
              {/* a soft glow behind the open mushaf */}
              <span aria-hidden="true" className="absolute left-1/2 top-[46%] h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_250_225/0.95),rgb(255_236_170/0.45)_60%,transparent)] md:h-[20rem] md:w-[20rem]" />
              <div data-float className="absolute inset-0 flex items-center justify-center pb-5 md:pb-7">
                <div data-tilt-friend className="origin-bottom">
                  <img src="/brand/quran-mushaf.webp" alt="المصحف الشريف" width={703} height={760} draggable={false} className="h-auto w-[15.5rem] drop-shadow-[0_18px_16px_rgba(110,60,0,0.35)] md:w-[18.8rem]" />
                </div>
              </div>
            </div>
            <p className="relative z-10 -mt-3 rounded-3xl bg-background-50 px-5 py-3 text-center text-base font-medium leading-relaxed text-foreground-800 shadow-card">
              كتاب الله نورٌ وهداية
              <span className="mt-0.5 block text-xs font-medium text-accent-700">القرآن الكريم</span>
            </p>
          </div>

          {/* four calm steps as little doors */}
          <div className="flex flex-col items-center gap-10 lg:items-start">
            <ul className="grid w-full grid-cols-2 gap-4 md:gap-6">
              {quranSteps.map((step, i) => (
                <li key={step.id}>
                  <Link to="/quran" data-step className="group block h-full rounded-t-[999px] rounded-b-3xl">
                    <span
                      data-tile
                      className="flex h-full min-h-[12.5rem] flex-col items-center gap-2 rounded-b-3xl rounded-t-[999px] bg-accent-700 px-3 pb-5 pt-7 text-center ring-1 ring-background-100/15 transition-colors duration-200 group-hover:bg-accent-600 md:min-h-[14.5rem] md:px-5 md:pt-9"
                    >
                      <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 font-heading text-base font-bold text-foreground-900">
                        {(i + 1).toLocaleString("ar-EG")}
                      </span>
                      <span data-icon aria-hidden="true" className="inline-flex text-4xl text-primary-400 md:text-5xl">
                        <i className={step.icon} />
                      </span>
                      <span className="font-heading text-lg font-bold text-background-50 md:text-xl">{step.label}</span>
                      <span className="text-sm leading-relaxed text-background-200">{step.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link to="/quran" className="btn btn-primary btn-lg">
              <i className="ri-headphone-line" />
              ادخل ركن القرآن
            </Link>
          </div>
        </div>
      </div>

      <SectionBridge variant="arches" className="text-background-50" />
    </section>
  );
}
