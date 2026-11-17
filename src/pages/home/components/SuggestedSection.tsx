import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import SectionBridge from "@/components/brand/SectionBridge";
import ChapterHeader from "@/pages/home/components/ChapterHeader";
import useProgress, { ageOf } from "@/store/progress";
import { categoryById, tones } from "@/data/brand";
import { adventures, ageLabel, fitsAge, type Adventure, type AgeGroupId } from "@/data/adventures";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK_QUERY } from "@/lib/gsap";

const groupFor = (age: number | null): AgeGroupId => (age === null ? "all" : age <= 5 ? "3-5" : age <= 8 ? "6-8" : "9-12");

const STARS = Array.from({ length: 26 }, (_, i) => {
  const a = Math.sin(i * 21.7) * 43758.5453;
  const b = Math.sin(i * 63.1) * 12345.6789;
  return { x: (a - Math.floor(a)) * 100, y: (b - Math.floor(b)) * 100, r: 1 + ((i * 5) % 3) };
});

/**
 * "ماذا نكتشف اليوم؟": three adventures chosen for this child's age, unfinished ones first.
 * The night of the hero and the street of doors goes on: each adventure is a glowing portal in its world's
 * colour. As the street comes into view the door swings open and the world's friend (or a story's cover) steps
 * into the light, then the name and the play button arrive.
 */
export default function SuggestedSection() {
  const { child, isDone } = useProgress();
  const group = groupFor(ageOf(child.birth));
  const root = useRef<HTMLElement>(null);

  const picks = useMemo(() => {
    const open = (a: Adventure) => (a.doneKey ? !isDone(a.doneKey) : true);
    const fit = adventures.filter((a) => fitsAge(a, group));
    const first = (cat: Adventure["category"][]) => fit.find((a) => cat.includes(a.category) && open(a)) ?? fit.find((a) => cat.includes(a.category));
    const story = first(["stories"]);
    const play = first(["games"]);
    const other = first(["values", "art", "surahs", "learning", "ai"]);
    return [story, play, other].filter(Boolean) as Adventure[];
  }, [group, isDone]);

  const picksKey = picks.map((p) => p.id).join("|");

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        const leaves = cards.map((c) => c.querySelector("[data-leaf]"));
        const inners = cards.map((c) => c.querySelector("[data-inner]"));
        const metas = cards.map((c) => c.querySelector("[data-meta]"));
        const lights = cards.map((c) => c.querySelector("[data-glow]"));
        gsap.set(leaves, { transformPerspective: 1100, transformOrigin: "0% 50%", rotationY: 0 });
        gsap.set(inners, { opacity: 0, scale: 0.84, y: 34 });
        gsap.set(metas, { opacity: 0, y: 22 });
        gsap.set(lights, { opacity: 0.25 });

        /* the street arrives: each door swings open, light floods out, the friend steps in */
        ScrollTrigger.batch(cards, {
          start: "top 82%",
          once: true,
          onEnter: (batch) => {
            const q = (sel: string) => batch.map((b) => b.querySelector(sel));
            const tl = gsap.timeline();
            tl.fromTo(q("[data-portal]"), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.16, ease: "power3.out" }, 0)
              .to(q("[data-leaf]"), { rotationY: -78, filter: "brightness(0.72)", duration: 1.1, stagger: 0.16, ease: "expo.out" }, 0.5)
              .to(q("[data-glow]"), { opacity: 0.9, duration: 0.9, stagger: 0.16 }, 0.55)
              .to(q("[data-inner]"), { opacity: 1, scale: 1, y: 0, duration: 0.9, stagger: 0.16, ease: "back.out(1.5)" }, 0.75)
              .to(q("[data-meta]"), { opacity: 1, y: 0, duration: 0.7, stagger: 0.16, ease: "power3.out" }, 1.1);
          },
        });

        /* ambient: stars, the halo behind the street, each friend on its own beat */
        gsap.utils.toArray<HTMLElement>("[data-star]").forEach((s, i) => {
          gsap.to(s, { opacity: 0.25, scale: 0.6, duration: 1.4 + (i % 4) * 0.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: (i % 7) * 0.2 });
        });
        gsap.to("[data-halo]", { scale: 1.08, opacity: 0.75, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
        el.querySelectorAll("[data-bob]").forEach((b, i) => {
          gsap.to(b, { y: -6, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.4 + i * 0.4 });
        });
        gsap.to("[data-sky]", { yPercent: 14, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      });

      /* no motion: the doors stand open and everything is readable */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-leaf]", { autoAlpha: 0 });
      });

      /* pointer devices: the light grows, the friend hops, the cover zooms, the arrow slides */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
          const glow = card.querySelector("[data-glow]");
          const hop = card.querySelector("[data-hop]");
          const glyph = card.querySelector("[data-glyph]");
          const zoom = card.querySelector("[data-zoom]");
          const go = card.querySelector("[data-go]");
          if (hop) gsap.set(hop, { transformOrigin: "50% 100%" });
          const on = () => {
            gsap.to(glow, { opacity: 1, scale: 1.12, duration: 0.5, ease: "power3.out", overwrite: "auto" });
            if (hop) gsap.to(hop, { y: -8, rotation: 3, scale: 1.05, duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
            if (glyph) gsap.fromTo(glyph, { rotation: -10 }, { rotation: 0, duration: 0.4, ease: "back.out(3)", overwrite: "auto" });
            if (zoom) gsap.to(zoom, { scale: 1.08, duration: 0.6, ease: "power3.out", overwrite: "auto" });
            gsap.to(go, { x: -5, duration: 0.3, ease: "power3.out", overwrite: "auto" });
          };
          const off = () => {
            gsap.to(glow, { opacity: 0.9, scale: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
            if (hop) gsap.to(hop, { y: 0, rotation: 0, scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
            if (zoom) gsap.to(zoom, { scale: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" });
            gsap.to(go, { x: 0, duration: 0.3, ease: "power3.out", overwrite: "auto" });
          };
          card.addEventListener("pointerenter", on);
          card.addEventListener("pointerleave", off);
          card.addEventListener("focus", on);
          card.addEventListener("blur", off);
          cleanups.push(() => {
            card.removeEventListener("pointerenter", on);
            card.removeEventListener("pointerleave", off);
            card.removeEventListener("focus", on);
            card.removeEventListener("blur", off);
          });
        });
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [picksKey], revertOnUpdate: true }
  );

  if (picks.length === 0) return null;

  return (
    <section ref={root} data-no-reveal aria-label="مغامرات مقترحة" className="on-navy relative isolate w-full overflow-hidden bg-gradient-to-b from-[#1F2A5C] via-[#25248A] to-[#2E2CA2] pb-24 pt-24 text-background-100 md:pb-32 md:pt-32">
      {/* the night goes on: stars, a halo behind the street, a cream wave where the stage floor above ends */}
      <div data-sky aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {STARS.map((s, i) => (
          <span key={i} data-star className="absolute rounded-full bg-background-50" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: 0.7 }} />
        ))}
      </div>
      <div data-halo aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[52%] -z-10 h-[70%] w-[80%] max-w-[64rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_196_61/0.28),transparent_65%)] blur-2xl" />
      <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-10 w-full text-background-50 md:h-16">
        <path d="M0 0H1440V28C1200 54 960 60 720 60S240 54 0 28z" fill="currentColor" />
      </svg>

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader
          variant="bubble"
          onDark
          icon="ri-compass-3-line"
          tone="primary"
          title={`ماذا نكتشف اليوم يا ${child.name}؟`}
          line="مغامرات مختارة لعمرك."
          aside={
            <Link to="/explore" className="btn btn-ghost btn-sm min-h-11">
              كل المغامرات
              <i className="ri-arrow-left-line text-lg" />
            </Link>
          }
        />

        <ul className="grid gap-12 md:grid-cols-3 md:items-start md:gap-8">
          {picks.map((a, i) => {
            const cat = categoryById(a.category);
            const t = tones[cat.tone];
            return (
              <li key={a.id} className={i === 1 ? "md:mt-14" : ""}>
                <Link to={a.to} data-card className="group relative flex flex-col items-center outline-offset-8">
                  {/* the portal: a lit doorway in the world's colour with its door swung open beside it */}
                  <span data-portal className="relative block h-[19rem] w-full max-w-[15rem] md:h-[24rem] md:max-w-[17rem]">
                    <span data-glow aria-hidden="true" className="absolute -inset-5 rounded-t-[999px] blur-2xl" style={{ background: `radial-gradient(circle at 50% 70%, ${t.hex}99, transparent 70%)` }} />
                    <span className="absolute inset-0 rounded-b-2xl rounded-t-[999px] p-2.5 shadow-[0_26px_44px_-18px_rgb(0_0_30/0.7)]" style={{ background: `linear-gradient(180deg, ${t.hex}, ${t.hex}b0)` }}>
                      <span className="absolute inset-x-5 top-2.5 h-1/4 rounded-t-[999px] bg-white/25" aria-hidden="true" />
                      <span className="relative block h-full w-full overflow-hidden rounded-b-xl rounded-t-[999px] bg-[#100E45] shadow-[inset_0_10px_30px_rgb(0_0_0/0.6)]">
                        <span data-inner className="absolute inset-0">
                          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#FFE9A8] via-[#FFB84A]/75 to-[#5B3FD0]/55" />
                          {a.image ? (
                            <>
                              <img data-zoom src={a.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                            </>
                          ) : (
                            <>
                              <span aria-hidden="true" data-glyph className="absolute inset-x-0 top-[9%] flex justify-center text-5xl text-white drop-shadow-[0_4px_10px_rgb(0_0_0/0.35)] md:text-7xl">
                                <i className={cat.icon} />
                              </span>
                              <span aria-hidden="true" data-bob className="absolute inset-x-0 bottom-0 flex justify-center">
                                <span data-hop className="block">
                                  <Character name={cat.character} size="md" small decorative className="!h-36 drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)] md:!h-[14.5rem]" />
                                </span>
                              </span>
                            </>
                          )}
                        </span>
                        {/* the door leaf: it swings open as the street comes into view */}
                        <span data-leaf aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-t-[999px] [backface-visibility:hidden]" style={{ background: `linear-gradient(180deg, ${t.hex}, ${t.hex}d0)` }}>
                          <span className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255/0.2),transparent_26%,transparent_76%,rgb(0_0_0/0.16))]" />
                          <span className="absolute inset-x-[8%] bottom-[34%] top-[5%] rounded-t-[999px] shadow-[inset_0_3px_5px_rgb(0_0_0/0.22),0_0_0_1.5px_rgb(255_255_255/0.28)]" />
                          <span className="absolute inset-x-0 top-[12%] flex justify-center text-5xl text-white/90 md:text-6xl">
                            <i className={cat.icon} />
                          </span>
                          <span className="absolute inset-x-[8%] bottom-[5%] top-[70%] rounded-2xl bg-black/[0.08] shadow-[inset_0_3px_5px_rgb(0_0_0/0.2),0_0_0_1.5px_rgb(255_255_255/0.2)]" />
                          <span className="absolute start-[7%] top-[54%] flex h-6 w-12 items-center">
                            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-200 via-primary-400 to-primary-700 shadow-[0_3px_5px_rgb(0_0_0/0.4)]" />
                            <span className="-ms-1.5 h-2.5 w-9 rounded-full bg-gradient-to-b from-primary-100 via-primary-400 to-primary-600" />
                          </span>
                        </span>
                      </span>
                    </span>
                    <span aria-hidden="true" className="absolute -bottom-3 -inset-x-[7%] h-6 rounded-[50%] bg-gradient-to-b from-white/25 to-black/30 shadow-[0_12px_18px_-6px_rgb(0_0_30/0.6)]" style={{ boxShadow: `0 12px 18px -6px rgb(0 0 30 / .6), inset 0 0 0 2px ${t.hex}66` }} />
                  </span>

                  <span data-meta className="mt-9 flex min-w-0 flex-col items-center gap-1.5 text-center">
                    <span className="rounded-full bg-background-50/15 px-3 py-1 font-heading text-xs font-semibold text-background-50 ring-1 ring-background-50/25 backdrop-blur-sm">{a.kind}</span>
                    <span className="font-heading text-2xl font-bold text-background-50 md:text-[1.7rem]">{a.title}</span>
                    <span className="text-sm text-background-100/75">
                      {a.minutes.toLocaleString("ar-EG")} دقائق · {ageLabel(a)}
                    </span>
                    <span data-go className="mt-3 flex">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-400 text-2xl text-foreground-900 shadow-[0_5px_0_rgb(160_105_0/0.8),0_0_24px_rgb(255_196_61/0.45)]">
                        <i className="ri-play-fill" aria-hidden="true" />
                        <span className="sr-only">ابدأ</span>
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <SectionBridge variant="scallop" className="text-background-50" />
    </section>
  );
}
