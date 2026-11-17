import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import ChapterHeader from "@/pages/home/components/ChapterHeader";
import useProgress, { ageOf } from "@/store/progress";
import { categoryById, tones } from "@/data/brand";
import { adventures, ageLabel, fitsAge, type Adventure, type AgeGroupId } from "@/data/adventures";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";

const groupFor = (age: number | null): AgeGroupId => (age === null ? "all" : age <= 5 ? "3-5" : age <= 8 ? "6-8" : "9-12");

/**
 * "ماذا نكتشف اليوم؟": three adventures chosen for this child's age, unfinished ones first.
 * Each one is a small arch-topped door in its world's colour with the world's friend standing inside;
 * a story with a cover shows the cover inside the doorway instead.
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
      const doors = gsap.utils.toArray<HTMLElement>(el.querySelectorAll("[data-card]"));
      const mm = gsap.matchMedia();

      /* the one ambient loop: the friends inside the doors breathe, each on its own beat */
      mm.add(MOTION_OK_QUERY, () => {
        el.querySelectorAll("[data-bob]").forEach((b, i) => {
          gsap.to(b, { y: -5, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.4 });
        });
      });

      /* pointer devices: the door rises a little, its friend hops, the glyph wiggles, the cover zooms */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        doors.forEach((card) => {
          const door = card.querySelector("[data-door]");
          const hop = card.querySelector("[data-hop]");
          const glyph = card.querySelector("[data-glyph]");
          const zoom = card.querySelector("[data-zoom]");
          const go = card.querySelector("[data-go]");
          if (hop) gsap.set(hop, { transformOrigin: "50% 100%" });
          const on = () => {
            gsap.to(door, { y: -8, duration: 0.35, ease: "power3.out", overwrite: "auto" });
            if (hop) gsap.to(hop, { y: -6, rotation: 3, scale: 1.04, duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
            if (glyph) gsap.fromTo(glyph, { rotation: -10 }, { rotation: 0, duration: 0.4, ease: "back.out(3)", overwrite: "auto" });
            if (zoom) gsap.to(zoom, { scale: 1.07, duration: 0.5, ease: "power3.out", overwrite: "auto" });
            gsap.to(go, { x: -4, duration: 0.3, ease: "power3.out", overwrite: "auto" });
          };
          const off = () => {
            gsap.to(door, { y: 0, duration: 0.35, ease: "power3.out", overwrite: "auto" });
            if (hop) gsap.to(hop, { y: 0, rotation: 0, scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
            if (zoom) gsap.to(zoom, { scale: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
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
    <section ref={root} aria-label="مغامرات مقترحة" className="relative w-full overflow-hidden bg-background-100 pb-20 pt-14 md:pb-28 md:pt-20">
      <Deco kind="sparkle" data-pop className="start-[5%] top-24 hidden h-8 w-8 text-primary-400 md:block" />
      <Deco kind="ring" data-pop className="-end-20 top-40 hidden h-72 w-72 text-primary-300 md:block" />
      <Deco kind="diamond" data-pop className="bottom-24 start-[9%] hidden h-10 w-10 text-foreground-900/15 md:block" />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader
          icon="ri-compass-3-line"
          tone="primary"
          title={`ماذا نكتشف اليوم يا ${child.name}؟`}
          line="مغامرات مختارة لعمرك."
          aside={
            <Link to="/explore" className="btn btn-ghost btn-sm min-h-11 self-start md:self-end">
              كل المغامرات
              <i className="ri-arrow-left-line text-lg" />
            </Link>
          }
        />

        <ul className="grid gap-4 md:grid-cols-3 md:items-start md:gap-8">
          {picks.map((a, i) => {
            const cat = categoryById(a.category);
            const t = tones[cat.tone];
            return (
              <li key={a.id} className={i === 1 ? "md:mt-12" : ""}>
                <Link
                  to={a.to}
                  data-card
                  className="group flex items-center gap-4 rounded-[1.75rem] bg-background-50 p-3 shadow-card outline-offset-4 md:flex-col md:items-stretch md:gap-0 md:bg-transparent md:p-0 md:shadow-none"
                >
                  {/* the door: a flat arch in the world's colour */}
                  <span
                    data-door
                    className={`relative block h-40 w-28 shrink-0 rounded-b-2xl rounded-t-[999px] p-1.5 shadow-[0_6px_0_rgb(31_42_92/0.14)] md:mx-auto md:h-[22rem] md:w-full md:max-w-[16rem] md:p-2.5 ${t.solid}`}
                  >
                    <span className="relative block h-full w-full overflow-hidden rounded-b-xl rounded-t-[999px] bg-background-50/20">
                      {a.image ? (
                        <img data-zoom src={a.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <>
                          <span aria-hidden="true" data-glyph className="absolute inset-x-0 top-[9%] flex justify-center text-4xl opacity-90 md:text-6xl">
                            <i className={cat.icon} />
                          </span>
                          <span aria-hidden="true" data-bob className="absolute inset-x-0 bottom-0 flex justify-center">
                            <span data-hop className="block">
                              <Character name={cat.character} size="md" small decorative className="!h-28 md:!h-[13.5rem]" />
                            </span>
                          </span>
                        </>
                      )}
                    </span>
                  </span>
                  <span aria-hidden="true" className="mx-auto mt-0 hidden h-2.5 w-[88%] rounded-full bg-foreground-900/10 md:block" />

                  <span className="flex min-w-0 flex-1 flex-col items-start gap-1 md:mt-5 md:flex-none md:items-center md:text-center">
                    <span className={`rounded-full px-3 py-1 font-heading text-xs font-semibold ${t.chip}`}>{a.kind}</span>
                    <span className="font-heading text-xl font-bold text-foreground-900 md:text-2xl">{a.title}</span>
                    <span className="text-sm text-foreground-500">
                      {a.minutes.toLocaleString("ar-EG")} دقائق · {ageLabel(a)}
                    </span>
                  </span>

                  <span data-go className="flex shrink-0 md:mt-4 md:justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-xl text-foreground-900 md:h-12 md:w-12 md:text-2xl">
                      <i className="ri-play-fill" aria-hidden="true" />
                      <span className="sr-only">ابدأ</span>
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
