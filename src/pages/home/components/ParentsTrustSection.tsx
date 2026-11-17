import { useRef } from "react";
import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import ChapterHeader from "@/pages/home/components/ChapterHeader";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";

/** Three calm promises (ads + personal data are one: nothing leaves the child's path, nothing personal is asked). */
const FACTS = [
  { icon: "ri-shield-check-line", title: "بلا إعلانات", desc: "ولا روابط خارجية، ولا بيانات شخصية." },
  { icon: "ri-lock-line", title: "على جهازك", desc: "النقاط والرسومات تبقى في هذا الجهاز فقط." },
  { icon: "ri-timer-line", title: "وقت بيدك", desc: "حدّ يومي بكلمة سر لا يعرفها الطفل." },
];

/**
 * "مكان تثق به": calm, navy and turquoise. Three promises with arch icons on the start side,
 * Noor standing whole on a turquoise arch on the other, one button and one quiet link.
 */
export default function ParentsTrustSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      /* the one ambient loop: Noor floats gently */
      mm.add(MOTION_OK_QUERY, () => {
        gsap.to(el.querySelectorAll("[data-float]"), { y: -8, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });

      /* pointer devices: Noor leans in, a promise's icon gives a small wiggle */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];

        const stage = el.querySelector<HTMLElement>("[data-stage]");
        const char = el.querySelector("[data-tilt-char]");
        if (stage && char) {
          gsap.set(char, { transformOrigin: "50% 100%" });
          const on = () => gsap.to(char, { rotation: 3, scale: 1.03, duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
          const off = () => gsap.to(char, { rotation: 0, scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
          stage.addEventListener("pointerenter", on);
          stage.addEventListener("pointerleave", off);
          cleanups.push(() => {
            stage.removeEventListener("pointerenter", on);
            stage.removeEventListener("pointerleave", off);
          });
        }

        el.querySelectorAll<HTMLElement>("[data-fact]").forEach((fact) => {
          const icon = fact.querySelector("[data-icon]");
          if (!icon) return;
          const on = () =>
            gsap.to(icon, {
              keyframes: [
                { rotation: -8, duration: 0.12 },
                { rotation: 6, duration: 0.14 },
                { rotation: 0, duration: 0.14 },
              ],
              ease: "power2.out",
              overwrite: "auto",
            });
          fact.addEventListener("pointerenter", on);
          cleanups.push(() => fact.removeEventListener("pointerenter", on));
        });

        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section aria-label="لأولياء الأمور" ref={root} className="relative w-full overflow-hidden bg-background-100 pb-24 pt-14 md:pb-32 md:pt-20">
      <Deco kind="diamond" data-pop className="start-[4%] top-24 hidden h-10 w-10 text-foreground-900/15 md:block" />
      <Deco kind="sparkle" data-pop className="bottom-32 end-[6%] hidden h-7 w-7 text-accent-500 md:block" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 md:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div>
          <ChapterHeader icon="ri-shield-check-line" tone="accent" title="مكان تثق به لطفلك" line="هادئة وآمنة، والقرار قرارك." className="!mb-6 md:!mb-8" />

          <ul className="divide-y-2 divide-dashed divide-foreground-900/10">
            {FACTS.map((f) => (
              <li key={f.title} data-fact className="flex items-center gap-4 py-4 md:gap-5 md:py-5">
                <span
                  aria-hidden="true"
                  data-icon
                  className="inline-flex h-16 w-12 shrink-0 items-center justify-center rounded-b-xl rounded-t-[999px] bg-foreground-900 pt-1.5 text-2xl text-accent-300 shadow-[0_5px_0_rgb(31_42_92/0.16)] md:h-[4.5rem] md:w-14 md:text-3xl"
                >
                  <i className={f.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-lg font-bold text-foreground-900 md:text-xl">{f.title}</span>
                  <span className="mt-0.5 block text-base leading-relaxed text-foreground-600">{f.desc}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to="/parent" className="btn btn-secondary btn-lg">
              <i className="ri-parent-line text-lg" />
              ركن أولياء الأمور
            </Link>
            <Link to="/privacy" className="inline-flex min-h-11 items-center gap-1.5 font-heading text-base font-semibold text-accent-700 underline-offset-4 hover:underline">
              سياسة الخصوصية
              <i className="ri-arrow-left-line text-lg" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Noor, whole, on a turquoise arch */}
        <div aria-hidden="true" data-stage className="relative order-first mx-auto flex h-[20rem] w-full max-w-sm items-end justify-center md:h-[30rem] lg:order-none">
          <Deco kind="ring" className="-top-2 start-0 hidden h-72 w-72 text-accent-300 md:block" />
          <span className="absolute inset-x-10 bottom-0 top-6 rounded-t-[999px] bg-accent-500 md:inset-x-8 md:top-10" />
          <span className="absolute inset-x-[4.25rem] bottom-0 top-14 rounded-t-[999px] border-2 border-dashed border-background-50/40 md:inset-x-16 md:top-[4.5rem]" />
          <span className="absolute bottom-2 h-3 w-36 rounded-full bg-foreground-900/10" />
          <span data-float className="relative block pb-3">
            <span data-tilt-char className="block">
              <Character name="noor" size="2xl" decorative className="!h-[17rem] md:!h-[24rem]" />
            </span>
          </span>
        </div>
      </div>

      <SectionBridge variant="arches" className="text-foreground-900" />
    </section>
  );
}
