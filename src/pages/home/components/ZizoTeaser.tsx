import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

const IDEAS = [
  "في واحة خضراء وجد جمّول خريطة صغيرة. إلى أين تقوده؟ أكمل الحكاية!",
  "ارسم نجمة ضلّت طريقها، ثم اختر لها اسمًا جميلًا.",
  "عُدّ خمسة أشياء جميلة حولك وارسم كل واحدة بلون مختلف.",
  "ثعلوب سمع صوتًا غريبًا خلف الكثيب. من يكون صاحبه؟",
];

/**
 * A brand moment: deep blue night, Zizo floating inside a dashed orbit on a saffron disc,
 * today's idea in a speech bubble and a way in. Hovering the orbit makes Zizo bounce and the ring turn.
 */
export default function ZizoTeaser() {
  const idea = useMemo(() => IDEAS[Math.floor(Date.now() / 86400000) % IDEAS.length], []);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* the disc rises, Zizo drops in and then floats (the one ambient loop) */
        const enter = { trigger: "[data-stage]", start: "top 80%", once: true };
        gsap.from("[data-disc]", { scale: 0.6, opacity: 0, transformOrigin: "50% 50%", duration: 0.9, ease: "back.out(1.6)", scrollTrigger: enter });
        gsap.from("[data-zizo-react]", { y: -44, opacity: 0, scale: 0.9, duration: 0.9, delay: 0.15, ease: "back.out(1.7)", scrollTrigger: enter });
        gsap.to("[data-zizo]", { y: -12, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });

      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const stage = el.querySelector<HTMLElement>("[data-stage]");
        const zizo = el.querySelector<HTMLElement>("[data-zizo-react]");
        const ring = el.querySelector<SVGElement>("[data-orbit]");
        if (!stage) return;
        let turn = 0;
        const on = () => {
          turn += 30;
          if (zizo) gsap.to(zizo, { scale: 1.06, rotation: 6, duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
          if (ring) gsap.to(ring, { rotation: turn, transformOrigin: "50% 50%", duration: 0.4, ease: "power3.out", overwrite: "auto" });
        };
        const off = () => {
          if (zizo) gsap.to(zizo, { scale: 1, rotation: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" });
        };
        stage.addEventListener("pointerenter", on);
        stage.addEventListener("pointerleave", off);
        return () => {
          stage.removeEventListener("pointerenter", on);
          stage.removeEventListener("pointerleave", off);
        };
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-label="عالم زيزو" className="on-navy relative isolate w-full overflow-hidden bg-sky-700 pb-20 pt-16 text-background-50 md:pb-28 md:pt-24">
      {/* a large, slightly darker disc gives the night some depth */}
      <span aria-hidden="true" className="absolute -start-28 top-1/2 -z-10 hidden h-[36rem] w-[36rem] -translate-y-1/2 rounded-full bg-sky-800/40 md:block" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        {/* the focal point: Zizo in his orbit */}
        <div data-stage className="relative mx-auto aspect-square w-[18.5rem] md:w-[27rem]">
          <Deco kind="ring" data-orbit className="inset-0 h-full w-full text-background-50/45" />
          <Deco kind="sparkle" data-pop className="end-[10%] top-[8%] h-5 w-5 text-primary-400 md:h-8 md:w-8" />
          <Deco kind="sparkle" data-pop className="bottom-[10%] start-[8%] h-4 w-4 text-primary-400 md:h-6 md:w-6" />
          <Deco kind="sparkle" data-pop className="bottom-[22%] end-[2%] hidden h-4 w-4 text-background-50/70 md:block" />
          <span data-disc aria-hidden="true" className="absolute inset-[17%] rounded-full bg-primary-400" />
          <div data-zizo className="absolute inset-0 flex items-center justify-center">
            <div data-zizo-react>
              <Character name="zizo" className="!h-[13.5rem] md:!h-[18.5rem]" />
            </div>
          </div>
        </div>

        {/* a short invitation */}
        <div>
          <ChapterHeader onDark icon="ri-robot-2-line" tone="primary" title="عالم زيزو" line="بيب بوب! عندي فكرة لك." className="!mb-6 md:!mb-8" />
          <p className="rounded-3xl rounded-ss-lg bg-background-50 p-5 text-lg leading-relaxed text-foreground-800 shadow-[0_6px_0_oklch(var(--sky-900)/1)] md:p-6 md:text-xl">«{idea}»</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/ai" className="btn btn-primary btn-lg">
              <i className="ri-magic-line text-lg" />
              ابتكر فكرتك
            </Link>
            <Link to="/explore" className="btn btn-ghost btn-lg">
              كل المغامرات
            </Link>
          </div>
        </div>
      </div>

      <SectionBridge variant="arches" className="text-leaf-50" />
    </section>
  );
}
