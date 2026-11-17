import { useRef } from "react";
import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import { characters, tones, type CharacterId } from "@/data/brand";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

/** One word per friend: what their world is about. */
const WORDS: Record<CharacterId, string> = {
  jamool: "الرحلة",
  thaloob: "التحدّي",
  zizo: "الذكاء",
  noor: "القيم",
  maha: "الألوان",
};

/** Cast order (Jamool in the middle). On phones Jamool leads and the four friends follow in a 2×2 grid. */
const CAST: CharacterId[] = ["thaloob", "zizo", "jamool", "noor", "maha"];

/**
 * Friends chapter: the whole cast stands on their own colour arch, Jamool largest in the centre.
 * Every figure is a link to that friend's world; on hover the friend hops and waves.
 */
export default function FriendsSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* the one ambient loop: Jamool floats gently above his arch */
        gsap.to("[data-float]", { y: -10, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true });

        /* arches rise, friends step up in front of them */
        const trigger = { trigger: el.querySelector("[data-cast]"), start: "top 80%", once: true };
        gsap.from("[data-arch]", { scaleY: 0.55, opacity: 0, transformOrigin: "50% 100%", duration: 0.8, stagger: 0.1, ease: "back.out(1.5)", scrollTrigger: trigger });
        gsap.from("[data-char]", { y: 36, opacity: 0, duration: 0.7, delay: 0.15, stagger: 0.1, ease: "back.out(1.6)", scrollTrigger: trigger });
      });

      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        el.querySelectorAll("[data-friend]").forEach((f) => {
          const hop = f.querySelector("[data-hop]");
          if (!hop) return;
          const play = () =>
            gsap
              .timeline({ overwrite: "auto" })
              .to(hop, { y: -22, duration: 0.18, ease: "power2.out" }, 0)
              .to(hop, { y: 0, duration: 0.32, ease: "bounce.out" }, 0.18)
              .to(hop, { rotation: -6, duration: 0.12, ease: "sine.inOut" }, 0.05)
              .to(hop, { rotation: 6, duration: 0.14, ease: "sine.inOut" }, 0.17)
              .to(hop, { rotation: 0, duration: 0.16, ease: "sine.out" }, 0.31);
          f.addEventListener("pointerenter", play);
          f.addEventListener("focusin", play);
          cleanups.push(() => {
            f.removeEventListener("pointerenter", play);
            f.removeEventListener("focusin", play);
          });
        });
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="friends" aria-label="أصدقاء جمّول" className="relative overflow-hidden bg-background-50 pb-20 pt-16 md:pb-28 md:pt-24">
      <Deco kind="sparkle" data-pop className="start-[8%] top-28 hidden h-8 w-8 text-primary-400 md:block" />
      <Deco kind="sparkle" data-pop className="start-[30%] top-[22rem] hidden h-6 w-6 text-primary-500 xl:block" />
      <Deco kind="diamond" className="end-[4%] top-[26rem] hidden h-12 w-12 text-primary-300 xl:block" />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader icon="ri-group-line" tone="primary" title="أصدقاء جمّول" line="اضغط على صديق وزُر عالمه." />

        <div data-cast className="relative">
          <Deco kind="ring" className="inset-x-0 top-0 mx-auto hidden h-[26rem] w-[26rem] text-primary-300 lg:block" />

          <ul className="relative grid grid-cols-2 gap-x-3 gap-y-10 lg:flex lg:items-end lg:justify-center lg:gap-3 xl:gap-5">
            {CAST.map((id) => {
              const c = characters[id];
              const t = tones[c.tone];
              const lead = id === "jamool";
              return (
                <li key={id} className={lead ? "order-first col-span-2 mx-auto w-60 lg:order-none lg:w-60 xl:w-72" : "mx-auto w-full max-w-[10.5rem] lg:w-40 xl:w-48"}>
                  <Link to={c.to} data-friend className="group flex flex-col items-center outline-offset-8">
                    <span className={`relative flex w-full items-end justify-center ${lead ? "h-[18rem] lg:h-[25rem] xl:h-[28rem]" : "h-[12.5rem] lg:h-[15rem] xl:h-[17rem]"}`}>
                      <span data-arch className={`absolute inset-x-0 bottom-0 rounded-t-[999px] ${t.solid} ${lead ? "top-[18%]" : "top-[22%]"}`}>
                        <span aria-hidden="true" className="absolute inset-3 rounded-t-[999px] border-2 border-background-50/25" />
                      </span>
                      <span data-float={lead ? "" : undefined} className="relative z-10 block">
                        <span data-char className="block">
                          <span data-hop className="block origin-bottom">
                            <Character
                              name={id}
                              size="xl"
                              decorative
                              className={`drop-shadow-[0_12px_12px_rgba(31,42,92,0.18)] ${
                                lead ? "!h-[17rem] lg:!h-[24rem] xl:!h-[27rem]" : "!h-[10.5rem] lg:!h-[12.5rem] xl:!h-[14.5rem]"
                              }`}
                            />
                          </span>
                        </span>
                      </span>
                    </span>

                    <span className="mt-4 flex min-h-[5.5rem] flex-col items-center text-center">
                      <span className={`font-heading font-bold text-foreground-900 ${lead ? "text-3xl" : "text-2xl"}`}>{c.name}</span>
                      <span className={`mt-1.5 inline-flex min-h-[2.25rem] items-center gap-1.5 rounded-full px-3.5 font-heading text-sm font-semibold ${t.chip}`}>
                        {WORDS[id]}
                        <i className="ri-arrow-left-line transition-transform group-hover:-translate-x-1" />
                      </span>
                      <span className="sr-only">
                        زُر عالم {c.name}. {c.tagline}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <SectionBridge variant="dunes" className="text-background-100" />
    </section>
  );
}
