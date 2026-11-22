import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import SectionBridge from "@/components/brand/SectionBridge";
import useProgress, { GUEST_ID, ageOf } from "@/store/progress";
import { categoryById, tones } from "@/data/brand";
import { adventures, ageLabel, fitsAge, type Adventure, type AgeGroupId } from "@/data/adventures";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK_QUERY } from "@/lib/gsap";

const groupFor = (age: number | null): AgeGroupId => (age === null ? "all" : age <= 5 ? "3-5" : age <= 8 ? "6-8" : "9-12");

const STARS = Array.from({ length: 26 }, (_, i) => {
  const a = Math.sin(i * 21.7) * 43758.5453;
  const b = Math.sin(i * 63.1) * 12345.6789;
  return { x: (a - Math.floor(a)) * 100, y: (b - Math.floor(b)) * 100, r: 1 + ((i * 5) % 3) };
});

const arNum = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
const RING = 2 * Math.PI * 30;
const AUTOPLAY = 8;
const DOTS = "radial-gradient(rgb(255 255 255 / .22) 2px, transparent 2.5px) 0 0 / 24px 24px";

/**
 * "ماذا نكتشف اليوم؟": one showcase, no cards. The night sky stays; on it the child sees one adventure at a time
 * on a lit stage (a glowing disc, the world's friend, little floating stickers) with big open type beside it.
 * Three round stops with the world's icon choose which adventure is on stage; they advance by themselves with a
 * ring that fills, and never stop. A change re-stages everything: the glow, the disc, the friend
 * jumps in, the words slide up.
 */
export default function SuggestedSection() {
  const { child, isDone } = useProgress();
  const group = groupFor(ageOf(child.birth));
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [live, setLive] = useState(false);
  const activeRef = useRef(0);
  const busy = useRef(false);
  const timer = useRef<gsap.core.Tween | null>(null);

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
  const n = picks.length;

  /* the parts of one scene, so that the same staging plays on entrance and on every change */
  const stage = (scene: Element, text: Element, at = 0) => {
    const q = (s: string) => scene.querySelectorAll(s);
    return gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .set([scene, text], { autoAlpha: 1 }, at)
      .fromTo(q("[data-glow]"), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "power2.out" }, at)
      .fromTo(q("[data-disc]"), { scale: 0.6, rotation: -25, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.6, ease: "back.out(1.5)" }, at + 0.03)
      .fromTo(q("[data-char]"), { y: 90, scale: 0.8, autoAlpha: 0, transformOrigin: "50% 100%" }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.6)" }, at + 0.1)
      .fromTo(q("[data-sticker]"), { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.5, stagger: 0.07, ease: "back.out(2.4)" }, at + 0.25)
      .fromTo(text.querySelectorAll("[data-t]"), { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.06 }, at + 0.12);
  };

  const { contextSafe } = useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]", el);
        const texts = gsap.utils.toArray<HTMLElement>("[data-text]", el);

        /* the heading: the squiggle draws itself under the words */
        const stroke = el.querySelector<SVGPathElement>("[data-stroke]");
        const len = stroke?.getTotalLength() ?? 0;
        if (stroke) gsap.set(stroke, { strokeDasharray: len, strokeDashoffset: len });
        gsap
          .timeline({ scrollTrigger: { trigger: "[data-head]", start: "top 105%", once: true }, defaults: { ease: "power3.out" } })
          .from("[data-head] h2", { y: 24, opacity: 0, duration: 0.55 })
          .to(stroke, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, 0.3);

        /* the first scene is staged when the showcase is reached; the stops pop in after it */
        gsap.set(["[data-glow]", "[data-disc]", "[data-char]"].flatMap((s) => Array.from(scenes[0].querySelectorAll(s))), { autoAlpha: 0 });
        gsap.set(scenes[0].querySelectorAll("[data-sticker]"), { scale: 0 });
        gsap.set(texts[0].querySelectorAll("[data-t]"), { autoAlpha: 0 });
        gsap.set("[data-stop]", { scale: 0, rotation: -90 });
        gsap.set("[data-path]", { scaleX: 0, transformOrigin: "100% 50%" });
        ScrollTrigger.create({
          trigger: "[data-show]",
          start: "top 108%",
          once: true,
          onEnter: () => {
            stage(scenes[0], texts[0]).to(
              "[data-stop]",
              { scale: 1, rotation: 0, duration: 0.5, stagger: 0.08, ease: "back.out(2.2)" },
              0.35
            );
            gsap.to("[data-path]", { scaleX: 1, duration: 0.6, ease: "power2.out", delay: 0.45, onComplete: () => setLive(true) });
          },
        });

        /* ambient: the orbits turn, the friend bobs, the stickers drift. Everything is paused while the section is off screen,
           so scrolling past it costs nothing and coming back never stutters. */
        const loops: gsap.core.Tween[] = [];
        gsap.utils.toArray<HTMLElement>("[data-orbit]").forEach((o, i) => {
          loops.push(gsap.to(o, { rotation: i % 2 ? -360 : 360, duration: 60 + i * 22, repeat: -1, ease: "none", paused: true }));
        });
        gsap.utils.toArray<HTMLElement>("[data-bob]").forEach((b, i) => {
          loops.push(gsap.to(b, { y: -9, rotation: i % 2 ? 2 : -2, duration: 2.4 + i * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true }));
        });
        gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((s, i) => {
          loops.push(gsap.to(s, { y: i % 2 ? -12 : 12, x: i % 3 ? 7 : -7, rotation: i % 2 ? 10 : -10, duration: 3 + (i % 4) * 0.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.25, paused: true }));
        });
        gsap.utils.toArray<HTMLElement>("[data-glyph]").forEach((g) => {
          loops.push(gsap.to(g, { y: -8, rotation: 4, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true }));
        });
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            el.dataset.offscreen = self.isActive ? "false" : "true";
            loops.forEach((t) => (self.isActive ? t.resume() : t.pause()));
          },
        });
      });

      /* no motion: the first adventure simply stands on stage; changing is instant */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        setLive(false);
      });

      /* pointer devices: the stage leans toward you, layer by layer */
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const stageEl = el.querySelector<HTMLElement>("[data-stage]");
        if (!stageEl) return;
        const layers = gsap.utils.toArray<HTMLElement>("[data-par]").map((p) => ({
          qx: gsap.quickTo(p, "x", { duration: 0.8, ease: "power3.out" }),
          qy: gsap.quickTo(p, "y", { duration: 0.8, ease: "power3.out" }),
          d: Number(p.dataset.par),
        }));
        const move = (e: PointerEvent) => {
          const r = stageEl.getBoundingClientRect();
          const cx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2));
          const cy = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2));
          layers.forEach((l) => (l.qx(-cx * l.d), l.qy(-cy * l.d * 0.7)));
        };
        const rest = () => layers.forEach((l) => (l.qx(0), l.qy(0)));
        stageEl.addEventListener("pointermove", move);
        stageEl.addEventListener("pointerleave", rest);
        return () => {
          stageEl.removeEventListener("pointermove", move);
          stageEl.removeEventListener("pointerleave", rest);
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [picksKey], revertOnUpdate: true }
  );

  /* choose another adventure: the old one leaves the stage, the new one is staged */
  const go = contextSafe((next: number) => {
    const el = root.current;
    if (!el || next === activeRef.current || busy.current) return;
    const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]", el);
    const texts = gsap.utils.toArray<HTMLElement>("[data-text]", el);
    const cur = activeRef.current;
    activeRef.current = next;
    setActive(next);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([scenes[cur], texts[cur]], { autoAlpha: 0 });
      gsap.set([scenes[next], texts[next]], { autoAlpha: 1 });
      return;
    }
    busy.current = true;
    gsap
      .timeline({ onComplete: () => (busy.current = false) })
      .to(scenes[cur].querySelectorAll("[data-disc], [data-char], [data-glow]"), { scale: 0.85, rotation: -6, autoAlpha: 0, duration: 0.38, ease: "power2.in" }, 0)
      .to(scenes[cur].querySelectorAll("[data-sticker]"), { scale: 0, duration: 0.25, ease: "power2.in" }, 0)
      .to(texts[cur].querySelectorAll("[data-t]"), { y: -20, autoAlpha: 0, duration: 0.3, stagger: 0.04, ease: "power2.in" }, 0)
      .set([scenes[cur], texts[cur]], { autoAlpha: 0 }, 0.42)
      .add(stage(scenes[next], texts[next]), 0.42);
  });

  /* the autoplay ring on the current stop; a pause while the child is looking */
  useGSAP(
    () => {
      const el = root.current;
      if (!el || !live || n < 2) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.set("[data-ring]", { strokeDashoffset: RING });
        const ring = el.querySelector(`[data-ring="${active}"]`);
        const tween = gsap.fromTo(ring, { strokeDashoffset: RING }, { strokeDashoffset: 0, duration: AUTOPLAY, ease: "none", paused: true, onComplete: () => go((active + 1) % n) });
        timer.current = tween;
        const watch = ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? tween.resume() : tween.pause()),
        });
        if (watch.isActive) tween.resume();
        return () => watch.kill();
      });
      return () => {
        timer.current = null;
        mm.revert();
      };
    },
    { scope: root, dependencies: [active, live, n], revertOnUpdate: true }
  );

  if (picks.length === 0) return null;

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") go((active + 1) % n);
    else if (e.key === "ArrowRight") go((active - 1 + n) % n);
  };

  return (
    <section ref={root} data-no-reveal data-offscreen="true" aria-label="مغامرات مقترحة" className="sg-section on-navy relative isolate w-full overflow-hidden bg-gradient-to-b from-[#1F2A5C] via-[#25248A] to-[#2E2CA2] pb-24 pt-24 text-background-100 md:pb-32 md:pt-32">
      {/* the same night as before: stars, a halo, a cream wave where the stage floor above ends */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {STARS.slice(0, 18).map((s, i) => (
          <span key={i} className="sg-star absolute rounded-full bg-background-50" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, animationDelay: `${(i % 7) * 0.4}s`, animationDuration: `${2.4 + (i % 4) * 0.6}s` }} />
        ))}
      </div>
      <div data-halo aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[52%] -z-10 h-[70%] w-[80%] max-w-[64rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_196_61/0.28),transparent_65%)]" />
      <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-10 w-full text-background-50 md:h-16">
        <path d="M0 0H1440V28C1200 54 960 60 720 60S240 54 0 28z" fill="currentColor" />
      </svg>

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <header data-head className="mb-10 md:mb-14">
          <h2 className="font-heading text-4xl font-bold leading-[1.15] !text-background-50 md:text-6xl">{child.id === GUEST_ID ? "ماذا نكتشف اليوم؟" : `ماذا نكتشف اليوم يا ${child.name}؟`}</h2>
          <svg aria-hidden="true" viewBox="0 0 220 14" preserveAspectRatio="none" className="mt-2 block h-3 w-40 text-primary-400 md:w-56">
            <path data-stroke d="M3 9C34 2 62 13 94 7s58-5 88 1 30 1 35-2" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        </header>

        <div data-show className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
          {/* the words: open type on the sky, no boxes */}
          <div className="order-2 lg:order-1">
            <div className="grid min-h-[17rem] [&>*]:col-start-1 [&>*]:row-start-1 md:min-h-[19rem]">
              {picks.map((a, i) => {
                const cat = categoryById(a.category);
                const t = tones[cat.tone];
                return (
                  <div key={a.id} data-text aria-hidden={i !== active} className={`flex flex-col items-start justify-center ${i === 0 ? "" : "invisible"}`}>
                    <span data-t className="inline-flex items-center gap-2 font-heading text-base font-bold text-background-100/90">
                      <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ background: t.hex, boxShadow: `0 0 14px 3px ${t.hex}aa` }} />
                      {a.kind}
                      <span aria-hidden="true" className="text-background-100/40">·</span>
                      <span className="font-medium text-background-100/70">{cat.short}</span>
                      {a.doneKey && isDone(a.doneKey) ? (
                        <span className="ms-1 inline-flex items-center gap-1 rounded-full bg-accent-400/20 px-2.5 py-0.5 text-xs font-bold text-accent-200 ring-1 ring-accent-300/30">
                          <i className="ri-check-line" aria-hidden="true" />
                          أنجزتها
                        </span>
                      ) : (
                        <span className="ms-1 inline-flex items-center gap-1 rounded-full bg-primary-400/20 px-2.5 py-0.5 text-xs font-bold text-primary-200 ring-1 ring-primary-300/30">
                          <i className="ri-sparkling-2-fill" aria-hidden="true" />
                          جديدة لك
                        </span>
                      )}
                    </span>
                    <span data-t className="mt-3 block font-heading text-5xl font-bold leading-[1.1] text-background-50 md:text-7xl">{a.title}</span>
                    <span data-t className="mt-4 block max-w-md text-base leading-relaxed text-background-100/80 md:text-lg">{a.desc}</span>
                    <span data-t className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-base font-semibold text-background-100/80">
                      <span className="inline-flex items-center gap-1.5">
                        <i className="ri-time-line text-lg text-primary-300" />
                        {a.minutes.toLocaleString("ar-EG")} دقائق
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <i className="ri-user-smile-line text-lg text-primary-300" />
                        {ageLabel(a)}
                      </span>
                    </span>
                    <span data-t className="mt-7 flex flex-wrap items-center gap-3">
                      <Link to={a.to} tabIndex={i === active ? 0 : -1} className="btn btn-primary btn-lg group">
                        <i className="ri-play-fill text-xl" aria-hidden="true" />
                        ابدأ المغامرة
                      </Link>
                      <Link to="/explore" tabIndex={i === active ? 0 : -1} className="btn btn-ghost btn-lg">
                        كل المغامرات
                        <i className="ri-arrow-left-line text-lg" aria-hidden="true" />
                      </Link>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* the stops: round, with the world's icon; a ring fills on the one that is on stage */}
            {n > 1 ? (
              <div role="tablist" aria-label="اختر مغامرة" onKeyDown={onTabKey} className="relative mt-8 flex items-center gap-7 md:mt-10 md:gap-9">
                <span data-path aria-hidden="true" className="absolute inset-x-8 top-8 border-t-2 border-dashed border-background-100/25" />
                {picks.map((a, i) => {
                  const cat = categoryById(a.category);
                  const t = tones[cat.tone];
                  const on = i === active;
                  return (
                    <button
                      key={a.id}
                      data-stop
                      type="button"
                      role="tab"
                      aria-selected={on}
                      aria-label={`${a.kind}: ${a.title}`}
                      onClick={() => go(i)}
                      className="relative z-10 flex flex-col items-center gap-2 outline-offset-4"
                    >
                      <span className="relative flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white transition-[box-shadow,opacity] duration-300" style={{ background: t.hex, opacity: on ? 1 : 0.62, boxShadow: on ? `0 0 0 5px #25248A, 0 0 0 7px ${t.hex}, 0 0 28px 6px ${t.hex}88` : "0 0 0 5px #25248A" }}>
                        <svg viewBox="0 0 64 64" aria-hidden="true" className="absolute -inset-[7px] h-[calc(100%+14px)] w-[calc(100%+14px)] -rotate-90">
                          <circle data-ring={i} cx="32" cy="32" r="30" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING} />
                        </svg>
                        <i className={cat.icon} />
                        <span className="absolute -end-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-400 font-heading text-xs font-bold text-foreground-900">{arNum(i + 1)}</span>
                      </span>
                      <span className={`font-heading text-xs font-bold transition-colors ${on ? "text-background-50" : "text-background-100/60"}`}>{a.kind}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* the stage */}
          <div data-stage className="relative order-1 mx-auto aspect-square w-full max-w-[28rem] md:max-w-[34rem] lg:order-2">
            {picks.map((a, i) => {
              const cat = categoryById(a.category);
              const t = tones[cat.tone];
              const photo = !!a.image;
              return (
                <div key={a.id} data-scene aria-hidden={i !== active} className={`absolute inset-0 ${i === 0 ? "" : "invisible"}`}>
                  <span data-glow aria-hidden="true" className="absolute -inset-[10%] rounded-full" style={{ background: `radial-gradient(circle, ${t.hex}aa, ${t.hex}33 45%, transparent 70%)` }} />

                  {/* two slow orbits with little stars riding them */}
                  <span data-orbit aria-hidden="true" className="absolute inset-[1%] rounded-full border-2 border-dashed border-white/20">
                    <i className="ri-sparkling-2-fill absolute -top-3 left-1/2 -translate-x-1/2 text-2xl text-primary-300" />
                    <span className="absolute -bottom-1.5 left-[18%] h-3 w-3 rounded-full bg-white/70" />
                  </span>
                  <span data-orbit aria-hidden="true" className="absolute inset-[11%] rounded-full border border-white/15">
                    <span className="absolute -top-1.5 right-[22%] h-3 w-3 rounded-full" style={{ background: t.hex }} />
                    <i className="ri-sparkling-2-fill absolute -bottom-2.5 left-[34%] text-xl text-white/80" />
                  </span>

                  {/* the lit disc: the story's picture, or the world's icon */}
                  <span data-disc className={`absolute rounded-full ${photo ? "inset-[9%]" : "inset-[15%]"}`} aria-hidden="true">
                    <span data-par="10" className="block h-full w-full">
                      <span className="relative block h-full w-full overflow-hidden rounded-full ring-[10px] ring-white/15" style={{ background: `linear-gradient(145deg, ${t.hex}, ${t.hex}b0)`, boxShadow: `0 30px 60px -20px ${t.hex}aa, inset 0 0 0 3px rgb(255 255 255 / .3)` }}>
                        <span className="absolute inset-0" style={{ background: DOTS }} />
                        {photo ? (
                          <img src={a.image} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <span data-glyph className="absolute inset-0 flex items-center justify-center text-[8rem] text-white/90 drop-shadow-[0_8px_16px_rgb(0_0_0/0.25)] md:text-[10rem]">
                            <i className={cat.icon} />
                          </span>
                        )}
                        <span className="absolute inset-x-[12%] top-[6%] h-1/4 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
                      </span>
                    </span>
                  </span>

                  {/* the friend of this world (a story's picture already has its own, so none stands in front of it) */}
                  {photo ? null : (
                  <span data-char className={`pointer-events-none absolute inset-x-0 bottom-[-2%] flex ${photo ? "justify-end pe-[1%]" : "justify-center"}`} aria-hidden="true">
                    <span data-par="26" className="block">
                      <span data-bob className="block">
                        <Character name={cat.character} size="xl" decorative priority={i === 0} className={`drop-shadow-[0_18px_20px_rgba(10,8,70,0.55)] ${photo ? "!h-[19rem] md:!h-[24rem]" : "!h-[20rem] md:!h-[27rem]"}`} />
                      </span>
                    </span>
                  </span>
                  )}

                  {/* little stickers floating around the stage */}
                  <span data-sticker aria-hidden="true" className="absolute start-[3%] top-[14%]">
                    <span data-par="38" className="block">
                      <span data-drift className="flex h-14 w-14 items-center justify-center rounded-full bg-background-50 text-2xl shadow-[0_10px_20px_-6px_rgb(0_0_30/0.6)]" style={{ color: t.hex }}>
                        <i className={cat.icon} />
                      </span>
                    </span>
                  </span>
                  <span data-sticker aria-hidden="true" className="absolute end-[4%] top-[34%]">
                    <span data-par="32" className="block">
                      <span data-drift className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-400 text-xl text-foreground-900 shadow-[0_8px_16px_-6px_rgb(0_0_30/0.6)]">
                        <i className="ri-star-fill" />
                      </span>
                    </span>
                  </span>
                  <span data-sticker aria-hidden="true" className="absolute bottom-[22%] start-[2%]">
                    <span data-par="30" className="block">
                      <span data-drift className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg" style={{ color: t.hex }}>
                        <i className="ri-sparkling-2-fill" />
                      </span>
                    </span>
                  </span>
                </div>
              );
            })}
            <span aria-hidden="true" className="absolute inset-x-[16%] bottom-[-1%] h-5 rounded-[50%] bg-black/30" />
          </div>
        </div>
      </div>

      <SectionBridge variant="scallop" className="text-background-50" />
    </section>
  );
}
