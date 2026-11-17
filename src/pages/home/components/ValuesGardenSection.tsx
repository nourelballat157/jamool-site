import { useRef } from "react";
import { Link } from "react-router-dom";
import { values } from "@/mocks/home";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

/** Every plant has its own height, so the garden looks planted rather than printed. */
const STEMS = ["h-8 md:h-14", "h-14 md:h-24", "h-6 md:h-10", "h-12 md:h-20", "h-9 md:h-16"] as const;

/**
 * The values garden: each value is a flat leaf-shaped tile growing from a saffron arch pot,
 * and Noor stands on a little hill at the end of the row. On entering, every plant grows from the ground up.
 */
export default function ValuesGardenSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* pot pops, stem grows, leaf unfolds: one plant after another, always from the bottom */
        const plants = gsap.utils.toArray<HTMLElement>("[data-plant]", el);
        const grow = gsap.timeline({ scrollTrigger: { trigger: "[data-garden]", start: "top 78%", once: true } });
        plants.forEach((plant, i) => {
          const pot = plant.querySelector("[data-pot]");
          const stem = plant.querySelector("[data-stem]");
          const leaf = plant.querySelector("[data-leaf]");
          const t = gsap.timeline();
          t.from(pot, { scale: 0, transformOrigin: "50% 100%", duration: 0.35, ease: "back.out(2.2)" })
            .from(stem, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.4, ease: "power2.out" }, ">-0.05")
            .from(leaf, { scale: 0, transformOrigin: "50% 100%", duration: 0.6, ease: "back.out(1.9)" }, ">-0.1");
          grow.add(t, i * 0.14);
        });
        gsap.from("[data-noor-react]", { y: 50, opacity: 0, transformOrigin: "50% 100%", duration: 0.8, ease: "back.out(1.7)", scrollTrigger: { trigger: "[data-garden]", start: "top 78%", once: true } });
        /* the one ambient loop: Noor floats gently */
        gsap.to("[data-noor]", { y: -8, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });

      /* hover devices only: the plant sways from its stem, the icon wiggles, Noor leans a little */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const noor = el.querySelector<HTMLElement>("[data-noor-react]");
        const plants = gsap.utils.toArray<HTMLElement>("[data-plant]", el);
        const cleanups: (() => void)[] = [];

        plants.forEach((plant, i) => {
          const leaf = plant.querySelector<HTMLElement>("[data-leaf]");
          const icon = plant.querySelector<HTMLElement>("[data-icon]");
          const dir = i % 2 ? 1 : -1;
          const on = () => {
            if (leaf) gsap.to(leaf, { rotation: dir * 3, y: -6, transformOrigin: "50% 100%", duration: 0.35, ease: "back.out(2.2)", overwrite: "auto" });
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
            if (noor) gsap.to(noor, { rotation: dir * 3, transformOrigin: "50% 100%", duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
          };
          const off = () => {
            if (leaf) gsap.to(leaf, { rotation: 0, y: 0, duration: 0.35, ease: "power3.out", overwrite: "auto" });
            if (noor) gsap.to(noor, { rotation: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" });
          };
          plant.addEventListener("pointerenter", on);
          plant.addEventListener("pointerleave", off);
          plant.addEventListener("focus", on);
          plant.addEventListener("blur", off);
          cleanups.push(() => {
            plant.removeEventListener("pointerenter", on);
            plant.removeEventListener("pointerleave", off);
            plant.removeEventListener("focus", on);
            plant.removeEventListener("blur", off);
          });
        });
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="values" className="relative isolate w-full overflow-hidden bg-leaf-50 pb-20 pt-16 md:pb-28 md:pt-24">
      <Deco kind="dots" className="-z-10 start-6 top-24 hidden h-16 w-16 text-leaf-200 md:block" />
      <Deco kind="sparkle" data-pop className="-z-10 end-6 top-28 h-4 w-4 text-primary-500 md:end-24 md:h-7 md:w-7" />
      <Deco kind="sparkle" data-pop className="-z-10 start-[12%] top-[46%] hidden h-5 w-5 text-leaf-400 md:block" />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader category="values" title="حديقة القيم" line="نزرع قيمة جميلة، ونراها تكبر." />

        <div data-garden className="flex flex-col gap-10 lg:flex-row lg:items-end lg:gap-10">
          {/* the plants */}
          <ul className="flex flex-wrap items-end justify-center gap-x-4 gap-y-10 lg:min-w-0 lg:flex-1 lg:flex-nowrap lg:gap-x-5">
            {values.map((value, i) => (
              <li key={value.id} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-auto lg:min-w-0 lg:flex-1">
                <Link to="/values" data-plant className="group flex flex-col items-center">
                  <span
                    data-leaf
                    className="block w-full rounded-es-xl rounded-se-xl rounded-ee-[2.75rem] rounded-ss-[2.75rem] bg-leaf-600 px-3 pb-5 pt-5 text-center text-white shadow-[0_6px_0_oklch(var(--leaf-800)/1)]"
                  >
                    <span data-icon aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background-50 text-3xl text-leaf-700">
                      <i className={value.icon} />
                    </span>
                    <h3 className="mt-3 text-lg font-bold !text-white md:text-xl">{value.title}</h3>
                    <p className="mt-1 text-sm leading-snug text-leaf-50 md:text-base">{value.desc}</p>
                  </span>
                  <span data-stem aria-hidden="true" className={`block w-1.5 rounded-full bg-leaf-700 ${STEMS[i % STEMS.length]}`} />
                  <span data-pot aria-hidden="true" className="block h-10 w-20 rounded-t-[999px] bg-primary-400 md:h-12 md:w-24" />
                  <span aria-hidden="true" className="-mt-0.5 block h-3 w-28 rounded-full bg-leaf-200 md:w-32" />
                </Link>
              </li>
            ))}
          </ul>

          {/* the focal point: Noor on her hill, with a little sun */}
          <div className="relative order-first mx-auto w-[15rem] shrink-0 md:w-[17rem] lg:order-last lg:mx-0">
            <span aria-hidden="true" className="absolute -top-2 end-0 block h-24 w-24 rounded-full bg-primary-300 md:h-32 md:w-32" />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 block h-20 rounded-t-[999px] bg-leaf-200 md:h-24" />
            <div data-noor className="relative flex justify-center pb-3 pt-2">
              <div data-noor-react>
                <Character name="noor" decorative className="!h-[15rem] md:!h-[18.5rem]" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/values" className="btn btn-primary btn-lg">
            <i className="ri-plant-line" />
            ادخل حديقة القيم
          </Link>
        </div>
      </div>

      <SectionBridge variant="dunes" className="text-primary-50" />
    </section>
  );
}
