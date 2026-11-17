import { useRef } from "react";
import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import type { CharacterId } from "@/data/brand";

/** The whole cast, left to right of the row (Jamool in the middle). Heights are set per breakpoint so five fit at 1024px. */
const CAST: { id: CharacterId; wrap: string; height: string }[] = [
  { id: "noor", wrap: "hidden md:block", height: "md:!h-[12rem] lg:!h-[15rem]" },
  { id: "thaloob", wrap: "", height: "!h-[10rem] md:!h-[14rem] lg:!h-[18rem]" },
  { id: "jamool", wrap: "", height: "!h-[13rem] md:!h-[20rem] lg:!h-[24rem]" },
  { id: "zizo", wrap: "", height: "!h-[9rem] md:!h-[13rem] lg:!h-[16rem]" },
  { id: "maha", wrap: "hidden md:block", height: "md:!h-[13rem] lg:!h-[16rem]" },
];

/**
 * The last chapter: one headline, one big saffron button, one ghost link. The whole cast peeks up from the
 * bottom edge of the navy ground and rises into place as you scroll the section into view.
 */
export default function FinalCtaSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* the cast rises up from behind the bottom edge, scrubbed by scroll, one friend after another */
        gsap.fromTo(
          "[data-rise]",
          { yPercent: 34 },
          {
            yPercent: 0,
            ease: "power2.out",
            stagger: 0.06,
            scrollTrigger: { trigger: el, start: "top 75%", end: "bottom bottom", scrub: 0.7 },
          }
        );

        /* the one ambient loop: sparkles drift slowly on their own paths */
        gsap.utils.toArray<SVGElement>("[data-spark]").forEach((s, i) => {
          gsap.to(s, {
            x: gsap.utils.random(-16, 16),
            y: gsap.utils.random(-20, 20),
            opacity: gsap.utils.random(0.45, 1),
            duration: gsap.utils.random(3.5, 6.5),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * 0.4,
          });
        });
      });

      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        el.querySelectorAll("[data-cast-item]").forEach((item) => {
          const hop = item.querySelector("[data-hop]");
          if (!hop) return;
          const play = () =>
            gsap
              .timeline({ overwrite: "auto" })
              .to(hop, { y: -20, duration: 0.18, ease: "power2.out" }, 0)
              .to(hop, { y: 0, duration: 0.32, ease: "bounce.out" }, 0.18)
              .to(hop, { rotation: -5, duration: 0.12, ease: "sine.inOut" }, 0.05)
              .to(hop, { rotation: 5, duration: 0.14, ease: "sine.inOut" }, 0.17)
              .to(hop, { rotation: 0, duration: 0.16, ease: "sine.out" }, 0.31);
          item.addEventListener("pointerenter", play);
          cleanups.push(() => item.removeEventListener("pointerenter", play));
        });
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="on-navy relative w-full overflow-hidden bg-foreground-900 pattern-diamond-navy text-background-100">
      <Deco kind="sparkle" data-spark className="start-[10%] top-[16%] h-4 w-4 text-primary-400" />
      <Deco kind="sparkle" data-spark className="end-[12%] top-[28%] h-3 w-3 text-background-100/60" />
      <Deco kind="sparkle" data-spark className="start-[22%] top-[44%] hidden h-7 w-7 text-primary-400 md:block" />
      <Deco kind="sparkle" data-spark className="end-[22%] top-[12%] hidden h-6 w-6 text-background-100/60 md:block" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-16 text-center md:px-6 md:pt-24">
        <h2 className="font-heading text-4xl font-bold leading-tight !text-background-50 md:text-6xl">
          جاهز للمغامرة؟ <span className="block text-primary-400">جمّول مستنيك!</span>
        </h2>
        <div className="mt-8 flex flex-col items-center gap-4 md:mt-10">
          <Link to="/login" className="btn btn-primary btn-lg !min-h-[4.25rem] !px-10 !text-xl">
            <i className="ri-play-fill text-2xl" />
            ابدأ رحلتك
          </Link>
          <Link to="/explore" className="btn btn-ghost">
            <i className="ri-compass-3-line" />
            كل المغامرات
          </Link>
        </div>
      </div>

      {/* the cast, peeking up from the bottom edge: the section simply ends a little below their waists */}
      <div aria-hidden="true" className="relative z-0 mx-auto -mb-6 mt-10 flex max-w-6xl items-end justify-center md:-mb-10 lg:-mb-14">
        <Deco kind="arch" className="inset-x-0 bottom-0 mx-auto h-[17rem] w-auto text-foreground-800 md:h-[25rem] lg:h-[30rem]" />
        {CAST.map((c) => (
          <div key={c.id} data-cast-item className={`relative -mx-2 md:-mx-3 lg:-mx-2 ${c.wrap}`}>
            <div data-rise>
              <div data-hop className="origin-bottom">
                <Character name={c.id} size="xl" decorative className={c.height} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
