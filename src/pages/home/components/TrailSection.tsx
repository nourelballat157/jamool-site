import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import DoorIcon, { QuranScene } from "@/components/brand/DoorIcons";
import { categories, type Category, type ToneId } from "@/data/brand";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";

/** One word per door: children read pictures, not paragraphs. */
const WORDS: Record<string, string> = {
  stories: "قصص",
  learning: "حروف",
  surahs: "سور",
  games: "ألعاب",
  art: "ألوان",
  ai: "زيزو",
  values: "قيم",
  competitions: "تحدّي",
};

const DOORS: (Category & { word: string })[] = categories.filter((c) => c.id !== "video").map((c) => ({ ...c, word: WORDS[c.id] }));

/** Door paint per brand tone: architrave (frame), leaf, and the glyph colour. Literal classes so Tailwind keeps them. */
const DOOR_COLORS: Record<ToneId, { frame: string; leaf: string; ped: string; label: string }> = {
  violet: { frame: "from-violet-300 to-violet-500", leaf: "from-violet-500 to-violet-600", ped: "from-violet-400 to-violet-700", label: "text-violet-700" },
  sky: { frame: "from-sky-300 to-sky-500", leaf: "from-sky-500 to-sky-600", ped: "from-sky-400 to-sky-700", label: "text-sky-700" },
  accent: { frame: "from-accent-300 to-accent-500", leaf: "from-accent-500 to-accent-600", ped: "from-accent-400 to-accent-700", label: "text-accent-700" },
  secondary: { frame: "from-secondary-300 to-secondary-500", leaf: "from-secondary-500 to-secondary-600", ped: "from-secondary-400 to-secondary-700", label: "text-secondary-700" },
  amber: { frame: "from-amber-300 to-amber-500", leaf: "from-amber-500 to-amber-600", ped: "from-amber-400 to-amber-700", label: "text-amber-800" },
  leaf: { frame: "from-leaf-300 to-leaf-500", leaf: "from-leaf-500 to-leaf-600", ped: "from-leaf-400 to-leaf-700", label: "text-leaf-700" },
  primary: { frame: "from-primary-300 to-primary-500", leaf: "from-primary-500 to-primary-600", ped: "from-primary-400 to-primary-700", label: "text-primary-800" },
};
function useStars(n: number) {
  return useMemo(() => {
    let s = 21;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: n }, () => ({ x: rnd() * 100, y: rnd() * 70, r: 1 + rnd() * 2 }));
  }, [n]);
}

/**
 * "اختر بابًا": a night street of eight magic doors. Walk Jamool along it by scrolling
 * (pinned horizontal journey on desktop, swipe on phones); the door near you glows,
 * and on hover it swings open and the world's friend steps out.
 */
export default function TrailSection() {
  const root = useRef<HTMLElement>(null);
  const stars = useStars(36);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const viewport = el.querySelector<HTMLElement>("[data-viewport]")!;
      const track = el.querySelector<HTMLElement>("[data-track]")!;
      const doors = gsap.utils.toArray<HTMLElement>("[data-door]");

      /* how close each door is to the middle of the screen drives its glow (0..1) */
      const updateNear = () => {
        const vr = viewport.getBoundingClientRect();
        const mid = vr.left + vr.width / 2;
        doors.forEach((d) => {
          const r = d.getBoundingClientRect();
          const dist = Math.abs(r.left + r.width / 2 - mid);
          const near = Math.max(0, 1 - dist / (vr.width * 0.34));
          d.style.setProperty("--near", near.toFixed(3));
        });
      };

      const mm = gsap.matchMedia();

      /* desktop: a pinned horizontal journey, Jamool walks the ground line */
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const dist = () => Math.max(0, track.offsetWidth - viewport.clientWidth);
        const journey = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el.querySelector("[data-pin]"),
            start: "top 80px",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: updateNear,
            onRefresh: updateNear,
          },
        });
        journey.to(track, { x: () => dist() }, 0).to("[data-token]", { x: () => -(viewport.clientWidth - 220) }, 0);
        journey.to("[data-ground-fill]", { scaleX: 1, transformOrigin: "100% 50%" }, 0);
        updateNear();
      });

      /* phones and tablets: native swipe, glow follows the scroll position */
      mm.add("(max-width: 1023px)", () => {
        let raf = 0;
        const onScroll = () => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(updateNear);
        };
        viewport.addEventListener("scroll", onScroll, { passive: true });
        updateNear();
        return () => {
          viewport.removeEventListener("scroll", onScroll);
          cancelAnimationFrame(raf);
        };
      });

      mm.add(MOTION_OK_QUERY, () => {
        /* the street arrives with a ripple of doors */
        gsap.from(doors, {
          y: 90,
          opacity: 0,
          rotation: (i) => (i % 2 ? 3 : -3),
          duration: 0.9,
          stagger: 0.09,
          ease: "back.out(1.5)",
          scrollTrigger: { trigger: el, start: "top 70%", once: true },
        });
        gsap.from("[data-head] > *", { y: 30, opacity: 0, duration: 0.7, stagger: 0.12, scrollTrigger: { trigger: el, start: "top 75%", once: true } });

        /* lanterns sway, each on its own rhythm; the flame breathes */
        gsap.utils.toArray<HTMLElement>("[data-lantern]").forEach((l, i) => {
          gsap.set(l, { transformOrigin: "50% 0%" });
          gsap.to(l, { rotation: i % 2 ? 5 : -5, duration: 2.2 + (i % 4) * 0.35, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.17 });
          gsap.to(l.querySelector("[data-flame]"), { opacity: 0.55, scale: 0.92, duration: 0.7 + (i % 3) * 0.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.11 });
        });
        gsap.utils.toArray<HTMLElement>("[data-star-b]").forEach((s, i) => {
          gsap.to(s, { opacity: gsap.utils.random(0.2, 0.55), duration: gsap.utils.random(1.2, 2.8), repeat: -1, yoyo: true, ease: "sine.inOut", delay: (i % 6) * 0.25 });
        });
        gsap.utils.toArray<SVGElement>("[data-spark]").forEach((s, i) => {
          gsap.to(s, { scale: gsap.utils.random(0.6, 1.2), opacity: gsap.utils.random(0.35, 0.95), rotation: i % 2 ? 25 : -25, duration: gsap.utils.random(1.2, 2.4), repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.2 });
        });
        gsap.to("[data-token]", { y: -6, duration: 0.45, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to("[data-swipe]", { x: -14, duration: 0.8, repeat: -1, yoyo: true, ease: "power1.inOut" });
      });

      /* hover devices: the door swings open and the friend steps out */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        doors.forEach((d) => {
          const leaf = d.querySelector("[data-leaf]");
          const who = d.querySelector("[data-who]");
          const glow = d.querySelector("[data-flash]");
          const icon = d.querySelector("[data-icon]");
          const word = d.querySelector("[data-doorword]");
          const frame = d.querySelector("[data-frame]");
          const spill = d.querySelector("[data-spill]");
          gsap.set(leaf, { transformPerspective: 1100, transformOrigin: "0% 50%" });
          // one quick, clean swing: the leaf opens with an expo-out, light floods in, the friend rises into it
          const open = gsap
            .timeline({ paused: true, defaults: { ease: "expo.out" } })
            .to(leaf, { rotationY: -76, filter: "brightness(0.72)", duration: 0.5 }, 0)
            .to(glow, { opacity: 1, duration: 0.35, ease: "power2.out" }, 0)
            .to(frame, { scale: 1.015, transformOrigin: "50% 100%", duration: 0.4, ease: "power3.out" }, 0)
            .to(spill, { scaleX: 1.12, scaleY: 1.5, transformOrigin: "50% 100%", duration: 0.45, ease: "power2.out" }, 0)
            .fromTo(who, { scale: 0.72, y: 34, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }, 0.06)
            .to(icon, { scale: 1.12, rotation: -6, duration: 0.3, ease: "back.out(2.4)" }, 0)
            .to(word, { y: -3, scale: 1.06, duration: 0.25, ease: "power3.out" }, 0);          const on = () => open.timeScale(1).play();
          const off = () => open.timeScale(1.7).reverse();
          d.addEventListener("pointerenter", on);
          d.addEventListener("pointerleave", off);
          d.addEventListener("focus", on);
          d.addEventListener("blur", off);
          cleanups.push(() => {
            d.removeEventListener("pointerenter", on);
            d.removeEventListener("pointerleave", off);
            d.removeEventListener("focus", on);
            d.removeEventListener("blur", off);
          });
        });
        return () => cleanups.forEach((c) => c());
      });

      /* no motion preference: show the open doors and keep everything readable */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-who]", { opacity: 1, scale: 1, y: 0 });
        gsap.set("[data-leaf]", { rotationY: 0 });
      });

      const onResize = () => updateNear();
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        mm.revert();
      };
    },
    { scope: root }
  );

  return (
    <section ref={root} id="worlds" data-no-reveal aria-labelledby="worlds-title" className="on-navy relative isolate overflow-hidden bg-foreground-900 text-background-100">
      {stars.map((s, i) => (
        <span key={i} data-star-b aria-hidden="true" className="absolute -z-10 rounded-full bg-background-100 opacity-40" style={{ insetInlineStart: `${s.x}%`, top: `${s.y}%`, width: s.r * 1.6, height: s.r * 1.6 }} />
      ))}

      <div data-pin className="relative flex flex-col justify-between overflow-x-clip pb-8 pt-8 lg:h-[calc(100svh-5rem)] lg:min-h-[40rem] lg:pb-5 lg:pt-4" style={{ ["--dh" as string]: "clamp(14rem, calc(100svh - 26.5rem), 28rem)" }}>
        {/* the night behind the street: deep navy lifting to royal blue, a far skyline that stays put while the doors travel, a lit cream stage */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-foreground-900 via-[#222C86] to-[#2E3BA8]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_30%,rgb(110_120_255/0.32),transparent_72%)]" />
          <svg viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-[10rem] h-[62%] w-full text-[#A9B2FF]/[0.3] blur-[1px]" style={{ WebkitMaskImage: "linear-gradient(to top, #000 55%, transparent)", maskImage: "linear-gradient(to top, #000 55%, transparent)" }}>
            <g fill="currentColor">
              <path d="M30 360V160h14v-16h14v16h14v-16h14v16h14v-16h14v16h12V360z" />
              <path d="M70 360V250a30 30 0 0 1 60 0V360z" opacity=".6" />
              <path d="M210 360V262h130V360zM222 262a53 53 0 0 1 106 0zM348 360V172h14V360zM341 172l14-36 14 36z" />
              <path d="M520 360c3-70 10-130 28-190l10 3c-14 58-20 118-22 187zM552 172c-34-14-68-6-92 20 32-12 60-14 92-4zM552 172c26-22 56-24 84-8-30-2-54 4-84 8zM552 172c-6-26 4-46 22-62-2 24-6 44-22 62zM552 172c-22-24-48-32-74-22 26 2 48 10 74 22z" />
              <path d="M760 360V240h110V360zM772 240a43 43 0 0 1 86 0zM880 360V150h13V360zM874 150l13-32 13 32z" />
              <path d="M1010 360c-2-60-8-118-26-170l-9 4c12 50 18 108 20 166zM982 192c34-14 68-4 92 24-32-14-62-18-92-8zM982 192c-26-22-56-24-84-6 30-2 54 6 84 6zM982 192c4-26-6-46-24-60 4 24 8 44 24 60z" />
              <path d="M1250 360V170h13v-16h13v16h13v-16h13v16h13v-16h13v16h14V360z" />
              <path d="M1300 360V250a32 32 0 0 1 64 0V360z" opacity=".6" />
            </g>
          </svg>
          {/* dashed paths curving away from the title */}
          <svg viewBox="0 0 300 90" className="absolute start-[4%] top-[15%] hidden h-20 w-[24%] text-background-100/35 lg:block">
            <path d="M2 84C60 10 170 0 298 38" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 9" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <svg viewBox="0 0 300 90" className="absolute end-[4%] top-[15%] hidden h-20 w-[24%] -scale-x-100 text-background-100/35 lg:block">
            <path d="M2 84C60 10 170 0 298 38" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 9" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <Deco kind="sparkle" data-spark className="start-[11%] top-[18%] h-8 w-8 text-primary-400" />
          <Deco kind="sparkle" data-spark className="start-[8%] top-[30%] hidden h-5 w-5 text-primary-300 md:block" />
          <Deco kind="sparkle" data-spark className="start-[22%] top-[28%] hidden h-5 w-5 text-background-100 md:block" />
          <Deco kind="sparkle" data-spark className="end-[11%] top-[17%] h-8 w-8 text-primary-400" />
          <Deco kind="sparkle" data-spark className="end-[22%] top-[27%] hidden h-5 w-5 text-background-100 md:block" />
          <Deco kind="sparkle" data-spark className="end-[34%] top-[8%] hidden h-5 w-5 text-primary-300 md:block" />
          {/* the cream stage floor the doors stand on */}
          <div className="absolute inset-x-0 bottom-0 h-[10.25rem] lg:h-[11.25rem]">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-9 w-full text-background-50">
              <path d="M0 60V34C240 6 480 0 720 0s480 6 720 34V60z" fill="currentColor" />
            </svg>
            <div className="absolute inset-x-0 bottom-0 top-[2.2rem] bg-background-50" />
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgb(255_214_130/0.55),transparent_75%)]" />
          </div>
        </div>

        {/* title: a speech bubble, with Jamool beside it pointing the way */}
        <div data-head className="relative z-10 mx-auto mt-6 flex items-center justify-center gap-2 px-4 md:mt-4">
          <Character name="jamool" size="md" small decorative motion="wave" />
          <h2
            id="worlds-title"
            className="relative rounded-[2rem] bg-background-50 px-7 py-2 font-heading text-4xl font-bold text-foreground-900 shadow-[0_6px_0_rgb(0_0_0/0.12),0_24px_34px_-14px_rgb(0_0_30/0.6)] md:px-10 md:py-3 md:text-6xl"
          >
            اختر باباً<span className="text-primary-500">!</span>
            <span aria-hidden="true" className="absolute -bottom-2 start-8 h-5 w-5 rotate-45 rounded-[3px] bg-background-50" />
            <svg aria-hidden="true" viewBox="0 0 60 40" className="absolute -start-9 -top-7 hidden h-9 w-14 text-primary-400 md:block">
              <path d="M6 34 22 14M24 38 34 8M42 34 54 18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </h2>
        </div>

        {/* the street */}
        <div data-viewport className="no-scrollbar relative z-10 mt-6 shrink-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain lg:mt-0 lg:snap-none lg:overflow-hidden">
          <ul data-track className="flex w-max items-end gap-5 px-6 pb-3 pt-8 sm:gap-8 lg:gap-14 lg:px-[10vw]">
            {DOORS.map((d) => {
              const c = DOOR_COLORS[d.tone];
              return (
                <li key={d.id} className="snap-center">
                  <Link
                    to={d.to}
                    data-door
                    style={{ ["--near" as string]: 0 }}
                    aria-label={d.label}
                    className="group relative block w-[13rem] outline-offset-8 sm:w-[15rem] lg:w-[calc(var(--dh)*0.7)]"
                  >
                    {/* the doorway: a soft, thick architrave around a dark opening with warm light and the friend inside */}
                    <span
                      data-frame
                      className={`relative block h-[19rem] rounded-t-[999px] rounded-b-md bg-gradient-to-b ${c.frame} sm:h-[22rem] lg:h-[var(--dh)]`}
                      style={{ boxShadow: "inset 0 4px 0 rgb(255 255 255 / .5), inset 4px 0 0 rgb(255 255 255 / .2), inset -4px 0 0 rgb(0 0 40 / .14), inset 0 -5px 0 rgb(0 0 40 / .22), 0 0 calc(8px + var(--near) * 48px) rgb(255 208 96 / calc(0.05 + var(--near) * 0.4)), 0 10px 14px -8px rgb(4 3 40 / .5)" }}
                    >
                      <span className="absolute inset-[1rem] rounded-t-[999px] bg-[#100E45] shadow-[0_0_0_2px_rgb(0_0_0/0.22),inset_0_8px_16px_rgb(0_0_0/0.6)]">
                        {/* what lies behind the door */}
                        <span data-glow className="absolute inset-0 overflow-hidden rounded-t-[999px] bg-gradient-to-t from-primary-300 via-primary-100 to-background-50" style={{ opacity: "calc(0.22 + var(--near) * 0.5)" }}>
                          <span aria-hidden="true" className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg_at_50%_100%,rgb(255_255_255/0.32)_0deg_5deg,transparent_5deg_15deg)]" />
                          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgb(255_255_255/0.9),transparent_70%)]" />
                        </span>
                        <span data-flash aria-hidden="true" className="absolute inset-0 rounded-t-[999px] bg-[radial-gradient(ellipse_at_50%_70%,rgb(255_250_225/0.95),rgb(255_226_150/0.55)_60%,transparent)] opacity-0" />
                        <span data-who className="absolute inset-x-0 bottom-1 flex justify-center opacity-0">
                          {d.id === "surahs" ? (
                            <QuranScene className="!h-[14rem] drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)] sm:!h-[16.5rem] lg:!h-[calc(var(--dh)-5rem)] motion-safe:animate-floaty" />
                          ) : (
                            <Character name={d.character} size="lg" small decorative className="!h-[14rem] drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)] sm:!h-[16.5rem] lg:!h-[calc(var(--dh)-5rem)]" />
                          )}
                        </span>

                        {/* the door leaf: soft paint, an arched groove, a glossy emblem, brass lever, a raised lower panel with the name */}
                        <span data-leaf className={`absolute inset-0 overflow-hidden rounded-t-[999px] bg-gradient-to-b ${c.leaf} [backface-visibility:hidden]`}>
                          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255/0.18),transparent_26%,transparent_76%,rgb(0_0_0/0.12))]" />
                          <span aria-hidden="true" className="absolute inset-x-[7%] bottom-[40%] top-[5%] rounded-t-[999px] shadow-[inset_0_3px_5px_rgb(0_0_0/0.2),0_0_0_1.5px_rgb(255_255_255/0.28)]" />
                          <span data-icon className="absolute inset-x-0 top-[7%] flex justify-center">
                            <DoorIcon id={d.id} className="h-[7rem] w-[7rem] sm:h-[8rem] sm:w-[8rem] lg:h-[calc(var(--dh)*0.38)] lg:w-[calc(var(--dh)*0.38)]" />
                          </span>
                          <span aria-hidden="true" className="absolute inset-x-[7%] top-[60%] h-1 rounded-full bg-black/15 shadow-[0_1px_0_rgb(255_255_255/0.25)]" />
                          <span aria-hidden="true" className="absolute inset-x-[7%] bottom-[5%] top-[66%] rounded-2xl bg-black/[0.06] shadow-[inset_0_3px_5px_rgb(0_0_0/0.2),inset_0_-2px_0_rgb(255_255_255/0.22),0_0_0_1.5px_rgb(255_255_255/0.2)]" />
                          <span data-doorword className={`absolute inset-x-[14%] bottom-[10%] flex h-[17%] items-center justify-center gap-1 rounded-full bg-background-50 font-heading text-lg font-bold shadow-[0_3px_0_rgb(0_0_0/0.16)] lg:text-2xl ${c.label}`}>
                            {d.word}
                          </span>
                          {/* brass lever on the free edge, opposite the hinge; its glow grows as the door nears */}
                          <span aria-hidden="true" className="absolute start-[6%] top-[52%] flex h-6 w-12 items-center" style={{ filter: "drop-shadow(0 0 calc(2px + var(--near) * 10px) rgb(255 205 90 / calc(0.3 + var(--near) * 0.6)))" }}>
                            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-200 via-primary-400 to-primary-700 shadow-[0_3px_5px_rgb(0_0_0/0.4),inset_0_1px_0_rgb(255_255_255/0.6)]" />
                            <span className="-ms-1.5 h-2.5 w-9 rounded-full bg-gradient-to-b from-primary-100 via-primary-400 to-primary-600 shadow-[0_3px_4px_rgb(0_0_0/0.35)]" />
                          </span>
                          <span aria-hidden="true" className="absolute end-0 top-[22%] h-6 w-2 rounded-s-sm bg-gradient-to-b from-primary-200 to-primary-600" />
                          <span aria-hidden="true" className="absolute end-0 top-[58%] h-6 w-2 rounded-s-sm bg-gradient-to-b from-primary-200 to-primary-600" />
                        </span>
                      </span>
                    </span>

                    {/* the round pedestal under the door, and the light spilling across it */}
                    <span aria-hidden="true" className="relative -mx-[10%] -mt-3 block h-8">
                      <span className={`absolute inset-x-0 top-2 h-6 rounded-[50%] bg-gradient-to-b ${c.ped} shadow-[0_10px_14px_-4px_rgb(0_0_30/0.5)]`} />
                      <span className="absolute inset-x-[2%] top-0 h-5 rounded-[50%] bg-gradient-to-b from-white/25 to-transparent" />
                      <span data-spill className="absolute -inset-x-[4%] -top-3 h-12 bg-[radial-gradient(ellipse_at_50%_100%,rgb(255_222_140/0.9),transparent_70%)]" style={{ opacity: "calc(0.06 + var(--near) * 0.7)" }} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* the ground line on the stage, Jamool walking it as you scroll */}
        <div className="relative z-10 mx-auto mt-2 hidden h-14 w-full max-w-[96rem] px-[4vw] lg:block">
          <div aria-hidden="true" className="absolute inset-x-[4vw] top-[1.65rem] h-[3px] rounded-full bg-foreground-900/15" />
          <div aria-hidden="true" data-ground-fill className="absolute inset-x-[4vw] top-[1.65rem] h-[3px] origin-right scale-x-0 rounded-full bg-primary-500" />
          <span data-token aria-hidden="true" className="absolute start-[4vw] top-0 block h-14 w-14 overflow-hidden rounded-full bg-amber-100 ring-4 ring-primary-400 shadow-card">
            <img src="/brand/avatar-jamool.webp" alt="" className="h-full w-full object-cover" />
          </span>
        </div>
        <div className="relative z-10 mt-3 flex justify-center lg:hidden" aria-hidden="true">
          <span data-swipe className="inline-flex items-center gap-2 rounded-full bg-foreground-900/10 px-4 py-2 text-foreground-700 ring-1 ring-foreground-900/15">
            <i className="ri-arrow-left-line text-2xl" />
            <i className="ri-arrow-left-line -ms-3 text-2xl opacity-50" />
          </span>
        </div>
      </div>
    </section>
  );
}