import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { letters, wordPic } from "@/data/letters";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

/** the four stops of every letter's journey, shown as arch-topped tiles (like the Quran corner) */
const STEPS = [
  { id: "watch", label: "شاهد واستمع", desc: "شاهد الحرف واسمع اسمه وكلماته", icon: "ri-eye-line" },
  { id: "trace", label: "ارسم الحرف", desc: "ارسمه بإصبعك خطوة بخطوة", icon: "ri-brush-line" },
  { id: "speak", label: "انطق الحرف", desc: "قله بصوتك وأحسن النطق", icon: "ri-mic-line" },
  { id: "pick", label: "اختر الصورة", desc: "أي صورة تبدأ بهذا الحرف؟", icon: "ri-image-line" },
];

/** big, quiet letters on the blue ground: position (%), size (rem), tilt */
const WATERMARK = [
  ["أ", 6, 14, 7, -12],
  ["ب", 88, 10, 6, 10],
  ["م", 14, 70, 8, 8],
  ["ن", 80, 62, 7, -8],
  ["ك", 48, 6, 5, 6],
  ["س", 54, 84, 6, -10],
  ["ح", 30, 40, 5, 12],
  ["و", 70, 34, 5, -6],
] as const;

/** the letters the showcase turns through by itself (the child does not have to touch anything) */
const SHOWCASE = ["alef", "baa", "taa", "thaa", "jeem", "haa", "khaa", "dal", "raa", "seen", "meem", "noon"]
  .map((id) => letters.find((l) => l.id === id))
  .filter((l): l is (typeof letters)[number] => Boolean(l));

/**
 * Letters: a brand moment, in the language of the Quran corner. A deep blue ground with big faint letters drifting
 * on it, one tall arch on which a letter and its picture turn by themselves (أ أسد، ب بطة، ت تفاحة…), the four steps
 * of every letter's journey as arch-topped tiles, and one way in: the learning page. Nothing here is played with on the
 * home page; pressing the arch, a step or the button opens the letters page.
 */
export default function LearningSection() {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const current = SHOWCASE[index];

  /* the arch turns to the next letter every few seconds while it is on screen */
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let timer: number | undefined;
    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => setIndex((i) => (i + 1) % SHOWCASE.length), 2800);
    };
    const stop = () => window.clearInterval(timer);
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.25 });
    io.observe(el);
    // warm the pictures so every turn is instant
    SHOWCASE.forEach((l) => {
      const img = new Image();
      img.src = wordPic(l.words[0]);
    });
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  /* a new letter pops onto the arch */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.fromTo("[data-glyph]", { scale: 0.55, rotation: -10, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(2.2)", overwrite: "auto" });
        gsap.fromTo("[data-pic]", { y: 26, scale: 0.6, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, delay: 0.08, ease: "back.out(1.8)", overwrite: "auto" });
        gsap.fromTo("[data-cap]", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.15, overwrite: "auto" });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [index] }
  );

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* ambient: the arch floats, the big letters drift, the bubbles bob */
        gsap.to(el.querySelector("[data-float]"), { y: -10, duration: 2.8, ease: "sine.inOut", repeat: -1, yoyo: true });
        gsap.utils.toArray<HTMLElement>("[data-mark]", el).forEach((m, i) => {
          gsap.to(m, { y: i % 2 ? -16 : 16, rotation: `+=${i % 2 ? 6 : -6}`, duration: 5 + (i % 4), ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.3 });
        });
        gsap.utils.toArray<HTMLElement>("[data-bubble]", el).forEach((b, i) => {
          gsap.to(b, { y: i % 2 ? -12 : 12, x: i % 2 ? 6 : -6, duration: 3 + i * 0.5, ease: "sine.inOut", repeat: -1, yoyo: true });
        });
      });

      /* hover devices: step tiles lift and their icon wiggles */
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
        const tilt = el.querySelector("[data-tilt]");
        if (stage && tilt) {
          const on = () => gsap.to(tilt, { rotation: 3, duration: 0.4, ease: "back.out(2)" });
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

  const bubbles = [SHOWCASE[(index + 2) % SHOWCASE.length], SHOWCASE[(index + 5) % SHOWCASE.length], SHOWCASE[(index + 8) % SHOWCASE.length]];

  return (
    <section ref={root} id="learning" className="on-navy relative isolate w-full overflow-hidden bg-sky-700 pb-20 pt-16 text-background-50 md:pb-28 md:pt-24">
      {/* the ground: a soft light, a fine dot print and big faint letters */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_20%_10%,rgb(255_255_255/0.14),transparent_70%),radial-gradient(60%_50%_at_90%_90%,rgb(255_196_61/0.12),transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(rgb(255_255_255/0.12)_1.6px,transparent_2px)] [background-size:26px_26px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {WATERMARK.map(([g, x, y, size, tilt]) => (
          <span key={g} data-mark className="absolute font-heading font-bold text-white/[0.07]" style={{ insetInlineStart: `${x}%`, top: `${y}%`, fontSize: `${size}rem`, transform: `rotate(${tilt}deg)`, lineHeight: 1 }}>
            {g}
          </span>
        ))}
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader category="learning" tone="primary" onDark title="عالم الحروف والأرقام" line="نتعلّم كل حرف بالصورة والصوت والرسم، ونمرح معه." />

        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          {/* a letter and its picture turn by themselves on the arch; pressing it opens the letters page */}
          <div data-stage className="relative mx-auto flex w-full max-w-[22rem] flex-col items-center">
            <Link to="/learning" aria-label="ادخل عالم الحروف" className="relative block h-[22rem] w-[17rem] md:h-[27rem] md:w-[20.5rem]">
              <Deco kind="sparkle" data-pop className="-start-5 top-24 z-10 hidden h-8 w-8 text-primary-300 md:block" />
              <Deco kind="sparkle" data-pop className="-end-7 bottom-28 z-10 hidden h-5 w-5 text-background-100 md:block" />
              <span aria-hidden="true" className="absolute inset-x-6 -bottom-1 h-4 rounded-full bg-black/35" />
              <div data-float className="absolute inset-0 pb-1">
                <div data-tilt className="relative h-full w-full origin-bottom overflow-hidden rounded-b-[1.4rem] rounded-t-[999px] bg-gradient-to-b from-[#59A2FF] via-[#2F7BEA] to-[#1F5FC4] shadow-[0_10px_0_rgb(0_0_0/0.2),0_26px_40px_-20px_rgb(0_0_0/0.65)] ring-[3px] ring-primary-300">
                  <span aria-hidden="true" className="absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/0.22)_2px,transparent_2.5px)] [background-size:24px_24px]" />
                  <span aria-hidden="true" className="absolute inset-x-[16%] top-[5%] h-1/4 rounded-full bg-white/25 blur-md" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pt-6">
                    <span data-glyph lang="ar" className="font-heading text-[8.5rem] font-bold leading-[0.95] text-white drop-shadow-[0_10px_18px_rgb(0_0_0/0.25)] md:text-[10.5rem]">
                      {current.letter}
                    </span>
                    <img data-pic src={wordPic(current.words[0])} alt="" draggable={false} className="h-24 w-24 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.28)] md:h-32 md:w-32" />
                  </div>
                </div>
              </div>

              {/* little letter bubbles around the arch */}
              {([
                ["start-[-12%] top-[8%]", 0],
                ["end-[-13%] top-[34%]", 1],
                ["start-[-10%] bottom-[16%]", 2],
              ] as const).map(([pos, i]) => (
                <span key={pos} data-bubble aria-hidden="true" className={`absolute z-10 flex h-14 w-14 items-center justify-center rounded-full bg-background-50 font-heading text-3xl font-bold text-sky-700 shadow-[0_10px_20px_-6px_rgb(0_0_30/0.55)] md:h-16 md:w-16 md:text-4xl ${pos}`}>
                  {bubbles[i].letter}
                </span>
              ))}
            </Link>
            <p className="relative z-10 -mt-3 rounded-3xl bg-background-50 px-5 py-3 text-center text-base font-medium leading-relaxed text-foreground-800 shadow-card">
              <span data-cap className="block">
                حرف {current.name}
                <span className="mt-0.5 block text-xs font-medium text-sky-700">{current.words[0].word}</span>
              </span>
            </p>
          </div>

          {/* the four steps of every letter, as little doors */}
          <div className="flex flex-col items-center gap-10 lg:items-start">
            <ul className="grid w-full grid-cols-2 gap-4 md:gap-6">
              {STEPS.map((step, i) => (
                <li key={step.id}>
                  <Link to="/learning" data-step className="group block h-full rounded-t-[999px] rounded-b-3xl">
                    <span data-tile className="flex h-full min-h-[12.5rem] flex-col items-center gap-2 rounded-b-3xl rounded-t-[999px] bg-sky-600 px-3 pb-5 pt-7 text-center ring-1 ring-background-100/20 transition-colors duration-200 group-hover:bg-sky-500 md:min-h-[14.5rem] md:px-5 md:pt-9">
                      <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 font-heading text-base font-bold text-foreground-900">
                        {(i + 1).toLocaleString("ar-EG")}
                      </span>
                      <span data-icon aria-hidden="true" className="inline-flex text-4xl text-primary-300 md:text-5xl">
                        <i className={step.icon} />
                      </span>
                      <span className="font-heading text-lg font-bold text-background-50 md:text-xl">{step.label}</span>
                      <span className="text-sm leading-relaxed text-background-200">{step.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link to="/learning" className="btn btn-primary btn-lg">
                <i className="ri-text" />
                ادخل عالم الحروف
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-background-100 ring-1 ring-white/20">
                <i className="ri-sparkling-2-fill text-primary-300" />
                ٢٨ حرفًا و١٠ أرقام
              </span>
            </div>
          </div>
        </div>
      </div>

      <SectionBridge variant="zigzag" className="text-accent-800" />
    </section>
  );
}
