import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { learningChips } from "@/mocks/home";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

const isNumber = (label: string) => /[٠-٩0-9]/.test(label);

/** how each card is read aloud (a lone letter is better said by its name) */
const SPOKEN: Record<string, string> = {
  "أ": "ألف",
  "ب": "باء",
  "ت": "تاء",
  "١": "واحد",
  "٢": "اثنان",
  "٣": "ثلاثة",
};

/**
 * Learning: one huge letter on a sky-blue arch (a door) with a big voice button; the picker is a row of
 * arch-topped tiles (letters sky, numbers saffron) and Jamool stands beside them pointing at the card.
 */
export default function LearningSection() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(learningChips[0].id);
  const { supported, speak } = useArabicSpeech();
  const current = learningChips.find((c) => c.id === active) || learningChips[0];
  const kind = isNumber(current.label) ? "الرقم" : "الحرف";

  const say = () => {
    speak(SPOKEN[current.label] ?? current.label);
    if (typeof window === "undefined" || !window.matchMedia(MOTION_OK_QUERY).matches || !root.current) return;
    gsap.fromTo(root.current.querySelector("[data-voice-icon]"), { rotation: -14, scale: 1.25 }, { rotation: 0, scale: 1, duration: 0.4, ease: "back.out(3)", overwrite: true });
    gsap.fromTo(root.current.querySelector("[data-wave]"), { scale: 1, opacity: 0.45 }, { scale: 1.6, opacity: 0, duration: 0.6, ease: "power2.out", overwrite: true });
  };

  /* the letter pops each time a new tile is picked */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.fromTo("[data-letter]", { scale: 0.55, rotation: -8, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: "back.out(2.4)" });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [active] }
  );

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      /* the one ambient loop: Jamool breathes */
      mm.add(MOTION_OK_QUERY, () => {
        gsap.to(el.querySelector("[data-float]"), { y: -9, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true });
      });

      /* hover devices: tiles wiggle and lift, Jamool tilts */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        el.querySelectorAll<HTMLElement>("[data-tile]").forEach((tile, i) => {
          const on = () => gsap.to(tile, { y: -6, rotation: i % 2 ? 3 : -3, duration: 0.3, ease: "back.out(2)" });
          const off = () => gsap.to(tile, { y: 0, rotation: 0, duration: 0.3, ease: "power3.out" });
          tile.addEventListener("pointerenter", on);
          tile.addEventListener("pointerleave", off);
          cleanups.push(() => {
            tile.removeEventListener("pointerenter", on);
            tile.removeEventListener("pointerleave", off);
          });
        });
        const friend = el.querySelector<HTMLElement>("[data-friend]");
        const tilt = el.querySelector("[data-tilt-friend]");
        if (friend && tilt) {
          const on = () => gsap.to(tilt, { rotation: 5, duration: 0.4, ease: "back.out(2)" });
          const off = () => gsap.to(tilt, { rotation: 0, duration: 0.4, ease: "power3.out" });
          friend.addEventListener("pointerenter", on);
          friend.addEventListener("pointerleave", off);
          cleanups.push(() => {
            friend.removeEventListener("pointerenter", on);
            friend.removeEventListener("pointerleave", off);
          });
        }
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="learning" className="relative w-full overflow-hidden bg-background-50 pb-20 pt-16 md:pb-28 md:pt-24">
      <Deco kind="diamond" className="end-10 top-10 hidden h-12 w-12 text-sky-300 md:block" />

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader category="learning" title="نلعب مع الحروف والأرقام" line="اضغط على حرف أو رقم وشاهده كبيرًا." />

        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
          {/* the focal point: one big letter on a sky arch */}
          <div className="relative mx-auto w-full max-w-[26rem] pb-8">
            <Deco kind="ring" className="-inset-10 hidden h-[calc(100%+5rem)] w-[calc(100%+5rem)] text-sky-200 md:block" />
            <Deco kind="sparkle" data-pop className="end-0 top-16 h-8 w-8 text-primary-500 md:-end-4 md:h-11 md:w-11" />
            <div className="relative flex flex-col items-center rounded-t-[13rem] rounded-b-[2rem] bg-sky-500 px-6 pb-14 pt-14 text-center text-white shadow-card md:pt-16">
              <span aria-hidden="true" className="absolute inset-3 rounded-t-[12.5rem] rounded-b-[1.4rem] border-2 border-white/25" />
              <span className="relative rounded-full bg-white/20 px-4 py-1 text-sm font-medium">بطاقة {kind}</span>
              <p aria-live="polite" data-letter className="relative mt-5 font-heading text-[9.5rem] font-bold leading-[1.15] md:text-[11.5rem]">
                {current.label}
              </p>
              {supported ? (
                <div className="absolute inset-x-0 -bottom-8 flex justify-center">
                  <button
                    type="button"
                    onClick={say}
                    aria-label={`استمع إلى ${kind} ${current.label}`}
                    className="relative inline-flex min-h-[4rem] cursor-pointer items-center justify-center gap-3 rounded-full bg-background-50 px-8 font-heading text-lg font-bold text-sky-700 shadow-pop transition-colors hover:bg-background-100 md:min-h-[4.5rem]"
                  >
                    <span aria-hidden="true" data-wave className="pointer-events-none absolute inset-0 rounded-full bg-background-50 opacity-0" />
                    <span data-voice-icon className="relative inline-flex text-4xl">
                      <i className="ri-volume-up-fill" />
                    </span>
                    <span className="relative">اسمع</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* the picker and Jamool */}
          <div className="flex flex-col gap-10">
            <ul className="grid max-w-lg grid-cols-3 gap-3 md:gap-5" aria-label="اختر حرفًا أو رقمًا">
              {learningChips.map((chip) => {
                const on = active === chip.id;
                const num = isNumber(chip.label);
                const palette = num
                  ? on
                    ? "bg-primary-500 text-foreground-900 ring-4 ring-primary-200"
                    : "bg-primary-100 text-primary-800 hover:bg-primary-200"
                  : on
                    ? "bg-sky-500 text-white ring-4 ring-sky-200"
                    : "bg-sky-100 text-sky-700 hover:bg-sky-200";
                return (
                  <li key={chip.id}>
                    <button
                      type="button"
                      data-tile
                      onClick={() => setActive(chip.id)}
                      aria-pressed={on}
                      aria-label={`${num ? "الرقم" : "الحرف"} ${chip.label}`}
                      className={`flex aspect-[4/5] min-h-[5rem] w-full cursor-pointer items-center justify-center rounded-b-2xl rounded-t-[999px] pt-3 font-heading text-4xl font-bold transition-colors duration-200 md:text-5xl ${palette}`}
                    >
                      {chip.label}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end md:gap-8">
              <div data-friend className="relative h-[10.5rem] w-[10.5rem] shrink-0 md:h-[14rem] md:w-[14rem]">
                <span aria-hidden="true" className="absolute inset-0 rounded-full bg-sky-100" />
                <div data-float className="absolute inset-x-0 bottom-0 flex justify-center">
                  <div data-tilt-friend className="origin-bottom">
                    <Character name="jamool" size="xl" decorative className="!h-[13rem] md:!h-[18rem]" />
                  </div>
                </div>
              </div>
              <Link to="/learning" className="btn btn-primary btn-lg mb-2">
                <i className="ri-play-circle-line" />
                ابدأ التعلّم
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SectionBridge variant="zigzag" className="text-accent-800" />
    </section>
  );
}
