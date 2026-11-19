import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { letters, wordPic } from "@/data/letters";
import { numbersList } from "@/mocks/child";
import Character from "@/components/brand/Character";
import SectionBridge from "@/components/brand/SectionBridge";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

type Mode = "letters" | "numbers";

type Item = {
  id: string;
  glyph: string;
  /** what is read aloud */
  say: string;
  /** the name shown under the big glyph */
  name: string;
  /** an example word, with its picture when the picture is faithful */
  word?: string;
  image?: string;
  forms?: { label: string; glyph: string }[];
};

const BURST = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);

/**
 * "نلعب مع الحروف والأرقام": a small letter lab. One big glyph stands on a lit disc with slow orbits and a
 * ring of sound that opens when it is read aloud; a real keyboard of keycaps (all 28 letters, or the numbers)
 * chooses what is on the disc. Pressing a key pops the glyph, bursts a few stars and fills in the name, an
 * example word with its picture and the written forms of a letter. Jamool stands by, showing the keys.
 */
export default function LearningSection() {
  const root = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>("letters");
  const [activeId, setActiveId] = useState(letters[0].id);
  const { supported, speaking, speak } = useArabicSpeech();

  const items = useMemo<Record<Mode, Item[]>>(
    () => ({
      letters: letters.map((l) => ({
        id: l.id,
        glyph: l.letter,
        say: l.name,
        name: l.name,
        word: l.words[0]?.word ?? l.word,
        image: l.words[0] ? wordPic(l.words[0]) : undefined,
        forms: [
          { label: "أول", glyph: l.forms.initial },
          { label: "وسط", glyph: l.forms.medial },
          { label: "آخر", glyph: l.forms.final },
        ],
      })),
      numbers: numbersList.map((n) => ({ id: n.id, glyph: n.digit, say: n.word, name: n.word })),
    }),
    []
  );
  const list = items[mode];
  const current = list.find((i) => i.id === activeId) ?? list[0];
  const sky = mode === "letters";
  const hex = sky ? "#2F7BEA" : "#F5A63A";

  const say = () => {
    speak(current.say);
    if (typeof window === "undefined" || !window.matchMedia(MOTION_OK_QUERY).matches || !root.current) return;
    gsap.fromTo(root.current.querySelectorAll("[data-wave]"), { scale: 0.9, opacity: 0.5 }, { scale: 1.5, opacity: 0, duration: 1.1, stagger: 0.18, ease: "power2.out", overwrite: true });
    gsap.fromTo(root.current.querySelector("[data-letter]"), { scale: 1.12 }, { scale: 1, duration: 0.5, ease: "elastic.out(1,0.5)", overwrite: "auto" });
  };

  /* a new glyph on the disc: it pops in, the disc settles, a few stars burst out */
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.fromTo("[data-letter]", { scale: 0.5, rotation: -14, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: "back.out(2.4)", overwrite: "auto" });
        gsap.fromTo("[data-disc]", { scale: 0.93 }, { scale: 1, duration: 0.7, ease: "elastic.out(1,0.45)", overwrite: "auto" });
        gsap.fromTo("[data-info] > *", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power3.out", overwrite: "auto" });
        gsap.fromTo(
          "[data-burst]",
          { x: 0, y: 0, scale: 0, opacity: 1 },
          { x: (i) => Math.cos(BURST[i]) * 150, y: (i) => Math.sin(BURST[i]) * 150, scale: (i) => 0.7 + (i % 3) * 0.3, opacity: 0, duration: 0.9, ease: "power2.out", overwrite: "auto" }
        );
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [activeId, mode] }
  );

  /* the keys of the other mode arrive one after another */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.fromTo("[data-key]", { y: 22, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: { each: 0.018, from: "start" }, ease: "back.out(1.6)", clearProps: "transform,opacity" });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [mode] }
  );

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* the lab arrives: the disc blooms, Jamool steps in, the keys ripple in */
        const enter = { trigger: "[data-stage]", start: "top 80%", once: true };
        gsap.from("[data-disc]", { scale: 0.6, opacity: 0, duration: 0.9, ease: "back.out(1.6)", scrollTrigger: enter });
        gsap.from("[data-glow]", { scale: 0.5, opacity: 0, duration: 1.2, ease: "power2.out", scrollTrigger: enter });
        gsap.from("[data-friend]", { x: 60, opacity: 0, duration: 0.9, ease: "back.out(1.6)", scrollTrigger: { ...enter, start: "top 78%" } });
        ScrollTrigger.create({ trigger: "[data-keys]", start: "top 85%", once: true, onEnter: () => gsap.from("[data-keys] > *", { y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" }) });

        /* ambient: orbits turn, Jamool breathes, the glow breathes, stars drift */
        gsap.utils.toArray<HTMLElement>("[data-orbit]").forEach((o, i) => gsap.to(o, { rotation: i % 2 ? -360 : 360, duration: 70 + i * 25, repeat: -1, ease: "none" }));
        gsap.to("[data-float]", { y: -9, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true });
        gsap.to("[data-glow]", { scale: 1.08, opacity: 0.8, duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true });
        gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((s, i) => gsap.to(s, { y: i % 2 ? -12 : 12, rotation: i % 2 ? 12 : -12, duration: 3 + i * 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" }));
        gsap.to("[data-sky]", { yPercent: 10, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      });

      /* pointer: the stage leans toward you, layer by layer; Jamool tilts */
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const stage = el.querySelector<HTMLElement>("[data-stage]");
        if (!stage) return;
        const layers = gsap.utils.toArray<HTMLElement>("[data-par]", el).map((p) => ({
          qx: gsap.quickTo(p, "x", { duration: 0.8, ease: "power3.out" }),
          qy: gsap.quickTo(p, "y", { duration: 0.8, ease: "power3.out" }),
          d: Number(p.dataset.par),
        }));
        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          const cx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2));
          const cy = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2));
          layers.forEach((l) => (l.qx(-cx * l.d), l.qy(-cy * l.d * 0.7)));
        };
        const rest = () => layers.forEach((l) => (l.qx(0), l.qy(0)));
        stage.addEventListener("pointermove", move);
        stage.addEventListener("pointerleave", rest);
        return () => {
          stage.removeEventListener("pointermove", move);
          stage.removeEventListener("pointerleave", rest);
        };
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  const pick = (id: string) => setActiveId(id);
  const choose = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    setActiveId(items[m][0].id);
  };

  return (
    <section ref={root} id="learning" className="relative isolate w-full overflow-hidden bg-[linear-gradient(180deg,#FFFAF2_0%,#EAF3FF_45%,#FFFAF2_100%)] pb-24 pt-16 md:pb-32 md:pt-24">
      {/* a soft sky: slow clouds, a few little stars */}
      <div data-sky aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -start-24 top-24 h-56 w-[26rem] rounded-full bg-white/70 blur-2xl" />
        <span className="absolute -end-20 top-[46%] h-48 w-[22rem] rounded-full bg-sky-100/80 blur-2xl" />
        <i data-drift className="ri-sparkling-2-fill absolute end-[9%] top-28 text-3xl text-primary-400/80" />
        <i data-drift className="ri-sparkling-2-fill absolute start-[7%] top-[58%] text-2xl text-sky-400/60" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader category="learning" title="نلعب مع الحروف والأرقام" line="اضغط على أي مفتاح وشاهد الحرف كبيرًا، ثم اسمعه." />

        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          {/* the stage: one big glyph on a lit disc */}
          <div className="order-1">
            <div data-stage className="relative mx-auto aspect-square w-full max-w-[26rem] md:max-w-[30rem]">
              <span data-glow aria-hidden="true" className="absolute -inset-[8%] rounded-full blur-2xl transition-colors duration-500" style={{ background: `radial-gradient(circle, ${hex}66, ${hex}22 50%, transparent 72%)` }} />
              <span data-orbit aria-hidden="true" className="absolute inset-[1%] rounded-full border-2 border-dashed" style={{ borderColor: `${hex}55` }}>
                <i className="ri-sparkling-2-fill absolute -top-3 left-1/2 -translate-x-1/2 text-2xl text-primary-500" />
                <span className="absolute -bottom-1.5 left-[20%] h-3 w-3 rounded-full" style={{ background: hex }} />
              </span>
              <span data-orbit aria-hidden="true" className="absolute inset-[10%] rounded-full border" style={{ borderColor: `${hex}40` }}>
                <span className="absolute -top-1.5 right-[24%] h-3 w-3 rounded-full bg-primary-400" />
              </span>

              {/* rings of sound, opened by the voice button */}
              {[0, 1, 2].map((i) => (
                <span key={i} data-wave aria-hidden="true" className="pointer-events-none absolute inset-[16%] rounded-full border-4 opacity-0" style={{ borderColor: hex }} />
              ))}

              <span data-par="10" className="absolute inset-[14%] block">
                <span data-disc className="relative flex h-full w-full items-center justify-center rounded-full ring-[10px] ring-white/70 transition-[background] duration-500" style={{ background: `linear-gradient(150deg, ${hex}, ${hex}c4)`, boxShadow: `0 34px 60px -24px ${hex}cc, inset 0 0 0 3px rgb(255 255 255 / .35)` }}>
                  <span aria-hidden="true" className="absolute inset-x-[14%] top-[7%] h-1/4 rounded-full bg-white/25 blur-md" />
                  <span aria-hidden="true" className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(rgb(255 255 255 / .22) 2px, transparent 2.5px) 0 0 / 26px 26px" }} />
                  <p aria-live="polite" data-letter className="relative font-heading text-[10rem] font-bold leading-none text-white drop-shadow-[0_10px_18px_rgb(0_0_0/0.22)] md:text-[13rem]">
                    {current.glyph}
                  </p>
                  {BURST.map((_, i) => (
                    <i key={i} data-burst aria-hidden="true" className="ri-sparkling-2-fill pointer-events-none absolute left-1/2 top-1/2 -ms-2.5 -mt-2.5 text-xl text-primary-200 opacity-0" />
                  ))}
                </span>
              </span>

              <span data-par="26" className="absolute end-[-4%] top-[10%] block">
                <i data-drift className="ri-star-fill flex h-11 w-11 items-center justify-center rounded-full bg-primary-400 text-xl text-foreground-900 shadow-[0_8px_16px_-6px_rgb(0_0_30/0.4)]" />
              </span>

              <div data-friend className="pointer-events-none absolute -bottom-[3%] start-[-7%] z-10">
                <div data-float>
                  <Character name="jamool" size="xl" decorative className="!h-[11rem] drop-shadow-[0_14px_16px_rgba(31,42,92,0.3)] md:!h-[15rem]" />
                </div>
              </div>
            </div>

            {/* what is on the disc: name, an example word, the written forms, the voice */}
            <div data-info className="mt-8 flex flex-col items-center gap-3 text-center">
              <span className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">{current.name}</span>
              {current.word ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-heading text-lg font-bold text-foreground-800 shadow-card ring-1 ring-sky-100">
                  {current.image ? <img src={current.image} alt="" draggable={false} className="h-9 w-9 object-contain" /> : null}
                  {current.word}
                </span>
              ) : null}
              {current.forms ? (
                <span className="flex items-center gap-2" aria-label="أشكال الحرف">
                  {current.forms.map((f) => (
                    <span key={f.label} className="flex flex-col items-center rounded-2xl bg-sky-50 px-3.5 py-1.5 ring-1 ring-sky-100">
                      <span className="font-heading text-2xl font-bold text-sky-700">{f.glyph}</span>
                      <span className="text-[0.7rem] font-semibold text-foreground-500">{f.label}</span>
                    </span>
                  ))}
                </span>
              ) : null}
              {supported ? (
                <button
                  type="button"
                  onClick={say}
                  aria-label={`استمع إلى ${sky ? "الحرف" : "الرقم"} ${current.name}`}
                  className="relative inline-flex min-h-[3.75rem] cursor-pointer items-center justify-center gap-3 rounded-full bg-foreground-900 px-8 font-heading text-lg font-bold text-background-50 shadow-[0_6px_0_rgb(15_20_60/0.5)] transition-colors hover:bg-foreground-800"
                >
                  <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-foreground-900" style={{ background: "#FFC43D" }}>
                    {speaking ? <span className="eq eq-lg !text-foreground-900"><i /><i /><i /></span> : <i className="ri-volume-up-fill" />}
                  </span>
                  اسمع
                </button>
              ) : null}
            </div>
          </div>

          {/* the keyboard: keycaps for every letter, or for the numbers */}
          <div data-keys className="order-2">
            <div role="tablist" aria-label="اختر نوع البطاقات" className="mx-auto mb-6 flex w-fit items-center gap-1 rounded-full bg-white p-1.5 shadow-card ring-1 ring-sky-100 lg:mx-0">
              {(["letters", "numbers"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => choose(m)}
                  className={`min-h-11 cursor-pointer rounded-full px-6 font-heading text-base font-bold transition-colors ${mode === m ? (m === "letters" ? "bg-sky-500 text-white" : "bg-amber-500 text-foreground-900") : "text-foreground-600 hover:bg-background-100"}`}
                >
                  {m === "letters" ? "الحروف" : "الأرقام"}
                </button>
              ))}
            </div>

            <ul className={`grid gap-2.5 md:gap-3 ${sky ? "grid-cols-7" : "grid-cols-5"}`} aria-label={sky ? "حروف الهجاء" : "الأرقام من واحد إلى عشرة"}>
              {list.map((it) => {
                const on = it.id === current.id;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      data-key
                      onClick={() => pick(it.id)}
                      aria-pressed={on}
                      aria-label={`${sky ? "الحرف" : "الرقم"} ${it.name}`}
                      className={`flex aspect-square w-full cursor-pointer items-center justify-center rounded-2xl font-heading font-bold transition-[background-color,color,box-shadow] duration-200 ${sky ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"} ${
                        on
                          ? sky
                            ? "bg-sky-500 text-white shadow-[0_5px_0_#1F5FC4,0_0_0_3px_#BBD6FB]"
                            : "bg-amber-500 text-foreground-900 shadow-[0_5px_0_#B77310,0_0_0_3px_#FBE0B0]"
                          : sky
                            ? "bg-white text-sky-700 shadow-[0_5px_0_#C9DDFB] ring-1 ring-sky-100 hover:bg-sky-50"
                            : "bg-white text-amber-700 shadow-[0_5px_0_#F6DDB0] ring-1 ring-amber-100 hover:bg-amber-50"
                      }`}
                    >
                      {it.glyph}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link to="/learning" className="btn btn-primary btn-lg">
                <i className="ri-play-circle-line" />
                ابدأ التعلّم
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-foreground-600 ring-1 ring-sky-100">
                <i className="ri-sparkling-2-fill text-primary-500" />
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
