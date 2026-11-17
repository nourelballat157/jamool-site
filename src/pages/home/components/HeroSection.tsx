import { useRef } from "react";
import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import { characters, type CharacterId } from "@/data/brand";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import { OPEN_VOICE_EVENT } from "@/components/feature/Navbar";

/**
 * The gateway to Jamool's world: one night scene in layers (sky, far town, dunes, a glowing doorway, Jamool
 * stepping out of it, his friends, the lit path to the first door). Everything is GSAP: a choreographed
 * entrance, a slow living idle, pointer depth, hover on the friends and worlds, and a scroll that walks the
 * child through the door and into the street below.
 *
 * Nested wrappers keep each kind of motion on its own element so they never fight:
 * depth (pointer) > scroll > lean/tilt (pointer) > entrance + idle.
 */

/* the five worlds that circle the doorway */
const WORLDS: { to: string; icon: string; label: string; color: string }[] = [
  { to: "/stories", icon: "ri-book-open-line", label: "القصص", color: "#8D6BEB" },
  { to: "/learning", icon: "ri-text", label: "الحروف", color: "#2F7BEA" },
  { to: "/quran", icon: "ri-book-2-line", label: "السور", color: "#1E9E96" },
  { to: "/drawing", icon: "ri-palette-line", label: "الرسم", color: "#F5A63A" },
  { to: "/games", icon: "ri-gamepad-line", label: "الألعاب", color: "#F0563A" },
];

/* Jamool's bubble: pictures, not sentences */
const CUES = WORLDS.map((w) => ({ icon: w.icon, color: w.color }));

const FRIENDS: { id: CharacterId; box: string; h: string; side: "l" | "r" | "t"; depth: number }[] = [
  { id: "maha", box: "left-[5%] bottom-[15%] hidden md:block", h: "h-[40%] md:portrait:h-[28%]", side: "l", depth: 34 },
  { id: "thaloob", box: "right-[3%] bottom-[14%] md:right-[6%]", h: "h-[22%] md:h-[34%] md:portrait:h-[24%]", side: "r", depth: 30 },
  { id: "zizo", box: "right-[3%] top-[27%] md:right-[22%] md:top-[31%] md:portrait:right-[6%] md:portrait:top-[24%]", h: "h-[11%] md:h-[17%] md:portrait:h-[13%]", side: "t", depth: 40 },
];

const TRUST = [
  { icon: "ri-shield-check-fill", label: "آمن للأطفال" },
  { icon: "ri-book-open-line", label: "بالعربية" },
  { icon: "ri-heart-line", label: "بلا إعلانات" },
];

/* a fixed field of stars so the sky is the same on every visit */
const STARS = Array.from({ length: 34 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return { x: (a - Math.floor(a)) * 100, y: (b - Math.floor(b)) * 62, r: 1 + ((i * 7) % 3) };
});

export default function HeroSection() {
  const root = useRef<HTMLElement>(null);
  const mic = useRef<HTMLButtonElement>(null);

  const openVoice = () => {
    const r = mic.current?.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent(OPEN_VOICE_EVENT, { detail: { x: r ? r.left + r.width / 2 : undefined, y: r ? r.top + r.height / 2 : undefined, listen: true } }));
  };

  useGSAP(
    () => {
      const host = root.current;
      if (!host) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* ---------- entrance: the doorway opens, Jamool steps out, the world fills in ---------- */
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-star]", { opacity: 0, duration: 1.2, stagger: { amount: 1, from: "random" } }, 0)
          .from("[data-halo]", { scale: 0.4, opacity: 0, duration: 1.5, ease: "power2.out" }, 0)
          .from("[data-far]", { yPercent: 25, opacity: 0, duration: 1.1 }, 0.1)
          .from("[data-frame]", { scale: 0.7, opacity: 0, transformOrigin: "50% 100%", duration: 0.9, stagger: 0.09, ease: "back.out(1.4)" }, 0.2)
          .from("[data-inside]", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.9, ease: "power4.out" }, 0.55)
          .from("[data-floor]", { yPercent: 40, opacity: 0, duration: 0.9 }, 0.4)
          .from("[data-jamool]", { y: 90, scale: 0.5, opacity: 0, transformOrigin: "50% 100%", duration: 1, ease: "back.out(1.5)" }, 0.8)
          .from("[data-word] > span", { yPercent: 125, duration: 0.8, stagger: 0.12 }, 0.85)
          .from("[data-friend-l]", { x: -90, opacity: 0, duration: 0.9, ease: "back.out(1.5)" }, 1.1)
          .from("[data-friend-r]", { x: 90, opacity: 0, duration: 0.9, ease: "back.out(1.5)" }, 1.2)
          .from("[data-friend-t]", { y: -90, opacity: 0, duration: 1, ease: "bounce.out" }, 1.3)
          .from("[data-orb]", { scale: 0, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(2)" }, 1.35)
          .from("[data-bubble]", { scale: 0, rotation: -10, transformOrigin: "0% 100%", duration: 0.6, ease: "back.out(2.4)" }, 1.55)
          .from("[data-cta]", { y: 30, opacity: 0, scale: 0.85, duration: 0.7, stagger: 0.1, ease: "back.out(1.6)" }, 1.5)
          .from("[data-trust] > li", { y: 12, opacity: 0, duration: 0.5, stagger: 0.07 }, 1.85);

        /* ---------- idle: slow, never busy ---------- */
        gsap.utils.toArray<HTMLElement>("[data-star]").forEach((el, i) => {
          gsap.to(el, { opacity: 0.25, scale: 0.6, duration: 1.4 + (i % 4) * 0.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.6 + (i % 7) * 0.2 });
        });
        gsap.to("[data-halo]", { scale: 1.07, opacity: 0.8, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.6 });
        gsap.to("[data-rays]", { rotation: 360, duration: 110, repeat: -1, ease: "none" });
        gsap.to("[data-jbreath]", { scaleY: 1.018, transformOrigin: "50% 100%", duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
        gsap.to("[data-friend-t] [data-sway]", { y: 9, rotation: 3, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.3 });
        gsap.to("[data-friend-l] [data-sway]", { rotation: -1.6, transformOrigin: "50% 100%", duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.2 });
        gsap.to("[data-friend-r] [data-sway]", { rotation: 1.6, transformOrigin: "50% 100%", duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.4 });
        gsap.to("[data-twinkle]", { opacity: 0.3, scale: 0.7, duration: 1.3, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.35, delay: 1.8 });

        /* a soft sheen crosses the gold frame every few seconds */
        gsap.fromTo("[data-sheen]", { xPercent: -140 }, { xPercent: 240, duration: 1.4, ease: "power2.inOut", repeat: -1, repeatDelay: 6, delay: 3 });

        /* the call to action breathes a ring, so the eye finds it */
        gsap.fromTo("[data-pulse]", { scale: 1, opacity: 0.55 }, { scale: 1.35, opacity: 0, duration: 1.6, repeat: -1, repeatDelay: 1.2, ease: "power1.out", delay: 2.6 });

        /* Jamool's bubble swaps pictures: a book, a game, a palette… */
        const cues = gsap.utils.toArray<HTMLElement>("[data-cue]");
        gsap.set(cues, { scale: 0, opacity: 0 });
        const cycle = gsap.timeline({ repeat: -1, delay: 2.4 });
        cues.forEach((c) => cycle.to(c, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2.4)" }).to(c, { scale: 0, opacity: 0, duration: 0.25, ease: "power2.in" }, "+=1.5"));

        /* the five worlds circle the doorway; they slow down when a child reaches for one */
        const path = host.querySelector<SVGPathElement>("[data-orbit-path]");
        const orbit = host.querySelector<HTMLElement>("[data-orbit]");
        const orbs = gsap.utils.toArray<HTMLElement>("[data-orb]");
        const runs: gsap.core.Tween[] = [];
        if (path && orbit && orbit.offsetParent) {
          orbs.forEach((el, i) => {
            const t = gsap.to(el, {
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: i / orbs.length, end: i / orbs.length + 1 },
              duration: 80,
              ease: "none",
              repeat: -1,
              onUpdate: () => {
                const n = gsap.utils.clamp(0, 1, (Number(gsap.getProperty(el, "y")) + el.offsetHeight / 2) / orbit.clientHeight);
                gsap.set(el.firstElementChild, { scale: 0.78 + 0.34 * n, opacity: 0.6 + 0.4 * n });
              },
            });
            runs.push(t);
            el.addEventListener("pointerenter", () => runs.forEach((r) => gsap.to(r, { timeScale: 0.04, duration: 0.5, overwrite: true })));
            el.addEventListener("pointerleave", () => runs.forEach((r) => gsap.to(r, { timeScale: 1, duration: 0.8, overwrite: true })));
          });
        }

        /* ---------- scroll: walk through the door ---------- */
        const walk = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: host, start: "top top", end: "bottom top", scrub: 0.7 } });
        walk
          .to("[data-portal]", { scale: 1.7, transformOrigin: "50% 58%" }, 0)
          .to("[data-jscroll]", { scale: 1.18, yPercent: -4, transformOrigin: "50% 100%" }, 0)
          .to("[data-title]", { yPercent: -70, opacity: 0 }, 0)
          .to("[data-scroll-l]", { xPercent: -70, opacity: 0 }, 0)
          .to("[data-scroll-r]", { xPercent: 70, opacity: 0 }, 0)
          .to("[data-scroll-t]", { yPercent: -80, opacity: 0 }, 0)
          .to("[data-orbit]", { opacity: 0 }, 0)
          .to("[data-ui]", { yPercent: 40, opacity: 0 }, 0)
          .to("[data-flood]", { opacity: 0.9, ease: "power1.in" }, 0.45);
      });

      /* ---------- pointer: depth, a friendly lean, magnetic buttons ---------- */
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        const on = (t: EventTarget, type: string, fn: EventListener) => {
          t.addEventListener(type, fn);
          cleanups.push(() => t.removeEventListener(type, fn));
        };
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]").map((el) => ({
          qx: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
          qy: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
          d: Number(el.dataset.depth),
        }));
        const tilt = host.querySelector<HTMLElement>("[data-jtilt]");
        const tiltTo = tilt ? gsap.quickTo(tilt, "rotation", { duration: 0.8, ease: "power3.out" }) : null;
        const leans = gsap.utils.toArray<HTMLElement>("[data-lean]").map((el) => gsap.quickTo(el, "rotation", { duration: 0.8, ease: "power3.out" }));

        const move = (e: Event) => {
          const r = host.getBoundingClientRect();
          const cx = gsap.utils.clamp(-1, 1, ((e as PointerEvent).clientX - (r.left + r.width / 2)) / (r.width / 2));
          const cy = gsap.utils.clamp(-1, 1, ((e as PointerEvent).clientY - (r.top + r.height / 2)) / (r.height / 2));
          layers.forEach((l) => (l.qx(-cx * l.d), l.qy(-cy * l.d * 0.6)));
          tiltTo?.(cx * 3);
          leans.forEach((q) => q(cx * 2.5));
        };
        const rest = () => {
          layers.forEach((l) => (l.qx(0), l.qy(0)));
          tiltTo?.(0);
          leans.forEach((q) => q(0));
        };
        on(host, "pointermove", move);
        on(host, "pointerleave", rest);

        /* magnetic buttons */
        host.querySelectorAll<HTMLElement>("[data-magnet]").forEach((b) => {
          const qx = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3.out" });
          const qy = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3.out" });
          on(b, "pointermove", (e) => {
            const r = b.getBoundingClientRect();
            qx(((e as PointerEvent).clientX - (r.left + r.width / 2)) * 0.25);
            qy(((e as PointerEvent).clientY - (r.top + r.height / 2)) * 0.32);
          });
          on(b, "pointerleave", () => (qx(0), qy(0)));
        });

        /* friends and worlds light up when reached */
        host.querySelectorAll<HTMLElement>("[data-hover]").forEach((el) => {
          const sc = gsap.quickTo(el, "scale", { duration: 0.4, ease: "back.out(2.2)" });
          on(el, "pointerenter", () => sc(1.08));
          on(el, "pointerleave", () => sc(1));
          on(el, "focus", () => sc(1.08));
          on(el, "blur", () => sc(1));
        });
        return () => cleanups.forEach((c) => c());
      });

      /* touch: nothing to follow, so the layers drift on their own */
      mm.add("(hover: none) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((el, i) => {
          const d = Number(el.dataset.depth);
          gsap.to(el, { x: (i % 2 ? 1 : -1) * d * 0.45, duration: 5 + (i % 3), repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.3 });
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      data-night-hero
      data-no-reveal
      aria-labelledby="hero-title"
      className="on-navy relative isolate -mt-[4.75rem] h-[100svh] min-h-[40rem] overflow-hidden bg-foreground-900 text-background-100"
    >
      {/* ---------- sky ---------- */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-[#16145F] via-[#2A2891] to-[#3C3BB0]" />
      <div data-depth="6" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {STARS.map((s, i) => (
          <span key={i} data-star className="absolute rounded-full bg-background-50" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: 0.75 }} />
        ))}
        <i data-twinkle className="ri-sparkling-2-fill absolute left-[12%] top-[26%] text-xl text-primary-300" />
        <i data-twinkle className="ri-sparkling-2-fill absolute right-[14%] top-[20%] text-2xl text-primary-200" />
        <i data-twinkle className="ri-sparkling-2-fill absolute right-[36%] top-[14%] hidden text-base text-primary-300 md:block" />
        <i className="ri-moon-fill absolute left-[7%] top-[16%] hidden text-5xl text-primary-200 drop-shadow-[0_0_24px_rgb(255_214_120/0.8)] md:block" />
      </div>
      <div data-halo aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[44%] -z-10 h-[75%] w-[75%] max-w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_196_61/0.5),rgb(255_150_61/0.16)_42%,transparent_68%)] blur-xl" />

      {/* far town on the horizon */}
      <div data-depth="10" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[17%] h-[40%]">
        <svg data-far viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" className="h-full w-full text-[#8E96FF]/[0.3]" style={{ WebkitMaskImage: "linear-gradient(to top, #000 50%, transparent)", maskImage: "linear-gradient(to top, #000 50%, transparent)" }}>
          <g fill="currentColor">
            <path d="M40 300V150h14v-16h14v16h14v-16h14v16h14v-16h14v16h12V300z" />
            <path d="M80 300V220a30 30 0 0 1 60 0V300z" opacity=".6" />
            <path d="M240 300V215h120V300zM252 215a48 48 0 0 1 96 0z" />
            <path d="M380 300V140h12V300zM374 140l12-30 12 30z" />
            <path d="M1040 300V200h110V300zM1052 200a43 43 0 0 1 86 0z" />
            <path d="M1170 300V130h13V300zM1164 130l13-32 13 32z" />
            <path d="M1260 300V150h13v-16h13v16h13v-16h13v16h13v-16h13v16h14V300z" />
            <path d="M600 300c3-60 9-110 24-150l9 3c-12 48-17 98-19 147zM624 154c-30-12-60-5-80 18 28-10 52-12 80-3zM624 154c22-19 48-21 72-7-26-2-46 3-72 7z" opacity=".8" />
            <path d="M880 300c-2-55-8-100-22-138l-8 3c11 44 16 90 18 135zM858 164c28-12 58-4 78 18-27-11-52-13-78-5z" opacity=".8" />
          </g>
        </svg>
      </div>

      {/* ---------- the five worlds, circling the doorway ---------- */}
      <div data-depth="18" className="pointer-events-none absolute inset-x-[3%] bottom-[24%] top-[max(30%,15.5rem)] max-md:hidden">
        <div data-orbit className="relative h-full w-full">
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path data-orbit-path d="M2 50a48 46 0 1 0 96 0a48 46 0 1 0 -96 0" fill="none" stroke="rgb(255 255 255 / 0.16)" strokeWidth="1.2" strokeDasharray="1 3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {WORLDS.map((w) => (
            <div key={w.to} data-orb className="pointer-events-auto absolute left-0 top-0 h-[3.2rem] w-[3.2rem] md:h-[3.9rem] md:w-[3.9rem]">
              <Link
                to={w.to}
                data-hover
                aria-label={w.label}
                className="group relative flex h-full w-full items-center justify-center rounded-full bg-background-50/[0.14] text-2xl text-background-50 outline-offset-4 backdrop-blur-md md:text-3xl"
                style={{ boxShadow: `inset 0 0 0 2px ${w.color}, 0 8px 22px -6px ${w.color}99` }}
              >
                <i className={w.icon} />
                <span className="pointer-events-none absolute -bottom-7 whitespace-nowrap rounded-full bg-background-50 px-3 py-0.5 font-heading text-xs font-bold text-foreground-900 opacity-0 shadow-card transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">{w.label}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- the doorway ---------- */}
      <div data-depth="14" className="pointer-events-none absolute inset-x-0 bottom-[19%] top-[max(26%,14rem)] flex items-end justify-center">
        <div data-portal className="relative aspect-[0.82] h-full max-w-[86vw]">
          {/* frame: gold, a thin cream line, then the light */}
          <div data-frame className="absolute inset-0 overflow-hidden rounded-t-[999px] bg-gradient-to-b from-primary-200 via-primary-400 to-primary-600 shadow-[0_0_80px_rgb(255_190_60/0.55),0_30px_60px_-20px_rgb(0_0_40/0.7)]">
            <span data-sheen aria-hidden="true" className="absolute inset-y-0 start-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
          </div>
          <div data-frame className="absolute inset-[3.5%] rounded-t-[999px] border-[3px] border-background-50/70" />
          <div data-frame className="absolute inset-[6.5%] overflow-hidden rounded-t-[999px] bg-[#1A1470] shadow-[inset_0_10px_40px_rgb(0_0_0/0.55)]">
            <div data-inside className="absolute inset-0 bg-gradient-to-t from-[#FFE9A8] via-[#FFB84A] to-[#7A4CE0]">
              <div data-rays aria-hidden="true" className="absolute -inset-[60%] bg-[repeating-conic-gradient(from_0deg_at_50%_72%,rgb(255_255_255/0.28)_0deg_6deg,transparent_6deg_18deg)]" />
              <svg aria-hidden="true" viewBox="0 0 100 130" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
                <circle cx="20" cy="34" r="6" fill="#FFF4C8" opacity=".9" />
                <circle cx="22.6" cy="32.6" r="5.2" fill="#7A4CE0" opacity=".95" />
                <g fill="#3B2A9A" opacity=".85">
                  <path d="M0 130V98q14-10 30-4t34-2 36 6V130z" />
                  <path d="M58 100V84h6v-5q3-7 6 0v5h6v16z" opacity=".9" />
                  <path d="M18 100c0-16 3-26 8-34l3 1c-3 8-5 18-5 33z" />
                  <path d="M26 67c-8-4-15-1-20 5 7-3 13-4 20-1zM26 67c6-6 13-6 19-2-7 0-13 0-19 2z" />
                </g>
                <path d="M30 130L46 96h8l16 34z" fill="#FFF2C2" opacity=".55" />
                <g fill="#fff">
                  <circle data-twinkle cx="22" cy="24" r="1.2" />
                  <circle data-twinkle cx="40" cy="14" r="1" />
                  <circle data-twinkle cx="58" cy="22" r="1.3" />
                  <circle data-twinkle cx="30" cy="42" r="0.9" />
                </g>
              </svg>
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgb(255_255_255/0.85),transparent_70%)]" />
            </div>
          </div>
          {/* the threshold */}
          <div data-frame aria-hidden="true" className="absolute -bottom-[1.2%] -inset-x-[7%] h-[5%] rounded-[50%] bg-gradient-to-b from-primary-500 to-primary-800 shadow-[0_14px_20px_-6px_rgb(0_0_30/0.65)]" />
        </div>
      </div>

      {/* ---------- the ground: dark dunes, a lit path to the first door ---------- */}
      <div data-floor aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%]">
        <div data-depth="20" className="absolute inset-0">
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-full w-full">
            <defs>
              <linearGradient id="hero-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#35339F" />
                <stop offset="0.45" stopColor="#262577" />
                <stop offset="1" stopColor="#1F2A5C" />
              </linearGradient>
              <linearGradient id="hero-path" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFC43D" stopOpacity="0.12" />
                <stop offset="0.8" stopColor="#FFC43D" stopOpacity="0.75" />
                <stop offset="1" stopColor="#FFC43D" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path d="M0 200V70C180 20 360 8 560 24s420 34 620 8c120-16 200-30 260-26V200z" fill="url(#hero-ground)" />
            <path d="M0 200V120C220 76 480 70 720 84s520 14 720-26V200z" fill="#1F2A5C" opacity=".6" />
            <path d="M600 200L668 26h104L840 200z" fill="url(#hero-path)" />
          </svg>
        </div>
      </div>

      {/* ---------- Jamool steps out of the doorway ---------- */}
      <div data-depth="26" className="pointer-events-none absolute inset-x-0 bottom-[17%] z-10 flex h-[46%] items-end justify-center md:h-[47%] md:portrait:h-[40%]">
        <div data-jscroll className="h-full">
          <div data-jtilt className="h-full">
            <div data-jamool className="h-full">
              <div data-jbreath className="h-full">
                <Character name="jamool" size="2xl" motion="wave" priority className="!h-full drop-shadow-[0_18px_22px_rgba(10,8,70,0.55)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jamool's bubble: what lies behind the doors, in pictures */}
      <div data-depth="30" aria-hidden="true" className="pointer-events-none absolute left-[calc(50%+3.2rem)] top-[33%] z-20 md:left-[calc(50%+5.5rem)] md:top-[31%]">
        <div data-scroll-t>
          <div data-bubble className="relative flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-[1.4rem] rounded-bl-md bg-background-50 shadow-[0_12px_26px_-8px_rgb(5_4_60/0.7)] md:h-[4.6rem] md:w-[4.6rem] md:rounded-[1.8rem] md:rounded-bl-md">
            {CUES.map((c) => (
              <i key={c.icon} data-cue className={`${c.icon} absolute text-[1.9rem] md:text-[2.5rem]`} style={{ color: c.color }} />
            ))}
          </div>
        </div>
      </div>

      {/* ---------- his friends ---------- */}
      {FRIENDS.map((f) => {
        const c = characters[f.id];
        return (
          <div key={f.id} data-depth={f.depth} className={`pointer-events-none absolute z-20 ${f.box} ${f.h}`}>
            <div data-scroll-l={f.side === "l" ? "" : undefined} data-scroll-r={f.side === "r" ? "" : undefined} data-scroll-t={f.side === "t" ? "" : undefined} className="h-full">
              <div data-lean className="h-full">
                <div data-friend-l={f.side === "l" ? "" : undefined} data-friend-r={f.side === "r" ? "" : undefined} data-friend-t={f.side === "t" ? "" : undefined} className="h-full">
                  <div data-sway className="h-full">
                    <Link to={c.to} data-hover aria-label={`${c.name}، ${c.role}`} className="group pointer-events-auto relative block h-full outline-offset-4">
                      <Character name={f.id} size="md" decorative className="!h-full drop-shadow-[0_14px_16px_rgba(10,8,70,0.5)]" />
                      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-background-50 px-3 py-1 font-heading text-sm font-bold text-foreground-900 opacity-0 shadow-card transition-all duration-200 group-hover:-top-11 group-hover:opacity-100 group-focus-visible:-top-11 group-focus-visible:opacity-100">
                        {c.name}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ---------- words: few and large ---------- */}
      <div data-title className="pointer-events-none absolute inset-x-0 top-[calc(4.75rem+3svh)] z-30 px-4 text-center md:top-[calc(4.75rem+2.5svh)]">
        <h1 id="hero-title" className="font-heading text-[clamp(2.5rem,6.6vw,5.8rem)] font-bold leading-[1.15] text-background-50">
          <span data-word className="inline-block overflow-hidden px-1 py-2 align-bottom">
            <span className="inline-block">ادخل</span>
          </span>{" "}
          <span data-word className="inline-block overflow-hidden px-1 py-2 align-bottom">
            <span className="inline-block">عالم</span>
          </span>{" "}
          <span data-word className="inline-block overflow-hidden px-1 py-2 align-bottom">
            <span className="inline-block bg-gradient-to-b from-primary-200 via-primary-300 to-primary-500 bg-clip-text text-transparent">جمّول</span>
          </span>
        </h1>
      </div>

      {/* ---------- the way in ---------- */}
      <div data-ui className="absolute inset-x-0 bottom-[3.2%] z-30 flex flex-col items-center gap-3 px-4">
        <div className="flex items-center justify-center gap-3">
          <div data-cta className="relative">
            <span data-pulse aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full bg-primary-300" />
            <Link to="/#worlds" data-magnet className="btn btn-primary btn-lg relative">
              <i className="ri-door-open-line text-2xl" />
              ابدأ المغامرة
            </Link>
          </div>
          <div data-cta>
            <button
              ref={mic}
              type="button"
              data-magnet
              onClick={openVoice}
              aria-label="قل ما تريد بصوتك"
              className="group flex h-[3.4rem] items-center gap-2 rounded-full bg-background-50/15 pe-5 ps-1.5 font-heading text-base font-bold text-background-50 ring-2 ring-background-50/35 backdrop-blur-md transition-colors hover:bg-background-50/25 max-sm:w-[3.4rem] max-sm:justify-center max-sm:p-0"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-primary-300 to-primary-500 text-2xl text-foreground-900 shadow-[0_3px_0_rgb(160_105_0/0.8)] transition-transform group-hover:scale-105 max-sm:h-[2.9rem] max-sm:w-[2.9rem]">
                <i className="ri-mic-fill" />
              </span>
              <span className="max-sm:hidden">قل ما تريد</span>
            </button>
          </div>
        </div>
        <ul data-trust className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[0.8rem] font-semibold text-background-100/75">
          {TRUST.map((t) => (
            <li key={t.label} className="flex items-center gap-1.5">
              <i className={`${t.icon} text-base text-primary-300`} />
              {t.label}
            </li>
          ))}
        </ul>
      </div>

      {/* the warm light that floods the screen as the doorway is reached */}
      <div data-flood aria-hidden="true" className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(ellipse_at_50%_55%,rgb(255_226_150/0.95),rgb(255_176_60/0.55)_55%,transparent_80%)] opacity-0" />
    </section>
  );
}
