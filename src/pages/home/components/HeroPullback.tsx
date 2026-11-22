import { useRef } from "react";
import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import { categories, characters, tones, type CharacterId } from "@/data/brand";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import { OPEN_VOICE_EVENT } from "@/components/feature/Navbar";

/**
 * "Pull-back" hero. The film starts in the dark with Jamool huge in the foreground, waving at the camera;
 * the camera then pulls back to the whole scene (the glowing doorway with his badge on it, his friends, the
 * street of worlds), and only then do the words, the two buttons and the rolling strip of worlds arrive.
 *
 * Nested wrappers keep every kind of motion on its own element:
 * depth (pointer) > scroll > camera (intro) > lean / tilt (pointer) > entrance + idle.
 */

const CUES = categories.slice(0, 5).map((c) => ({ icon: c.icon, color: tones[c.tone].hex }));

const FRIENDS: { id: CharacterId; box: string; h: string; depth: number }[] = [
  { id: "maha", box: "left-[5%] bottom-[18%] hidden md:block", h: "h-[40%] md:portrait:h-[28%]", depth: 34 },
  { id: "thaloob", box: "right-[3%] bottom-[17%] md:right-[6%]", h: "h-[22%] md:h-[34%] md:portrait:h-[24%]", depth: 30 },
  { id: "zizo", box: "right-[3%] top-[27%] md:right-[22%] md:top-[31%] md:portrait:right-[6%] md:portrait:top-[24%]", h: "h-[11%] md:h-[17%] md:portrait:h-[13%]", depth: 40 },
];

const TRUST = [
  { icon: "ri-shield-check-fill", label: "آمن للأطفال" },
  { icon: "ri-book-open-line", label: "بالعربية" },
  { icon: "ri-heart-line", label: "بلا إعلانات" },
];

const STARS = Array.from({ length: 34 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return { x: (a - Math.floor(a)) * 100, y: (b - Math.floor(b)) * 62, r: 1 + ((i * 7) % 3) };
});

export default function HeroPullback() {
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
        /* ---------- the film: dark, a close-up, a camera pull-back, then the words ---------- */
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.set("[data-curtain]", { opacity: 1 })
          .to("[data-curtain]", { opacity: 0, duration: 1.1, ease: "power2.out" }, 0.05)
          .from("[data-star]", { opacity: 0, duration: 1.2, stagger: { amount: 1, from: "random" } }, 0.2)
          .from("[data-halo]", { scale: 0.4, opacity: 0, duration: 1.6, ease: "power2.out" }, 0.1)
          .from("[data-frame]", { scale: 0.7, opacity: 0, transformOrigin: "50% 100%", duration: 0.9, stagger: 0.09, ease: "back.out(1.4)" }, 0.25)
          .from("[data-inside]", { scaleY: 0, transformOrigin: "50% 100%", duration: 1, ease: "power4.out" }, 0.5)
          .from("[data-badge]", { scale: 0, rotation: -90, duration: 0.8, ease: "back.out(2)" }, 1.1)
          /* the close-up: Jamool fills the frame and waves hello */
          .fromTo("[data-jamool]", { scale: 1.85, yPercent: 16, opacity: 0, transformOrigin: "50% 100%" }, { scale: 1.85, yPercent: 16, opacity: 1, duration: 0.7, ease: "power2.out" }, 0.35)
          .fromTo("[data-cam]", { scale: 1.3, transformOrigin: "50% 88%" }, { scale: 1.3, duration: 0.01 }, 0)
          /* the pull-back: the camera eases out and Jamool settles into his place */
          .to("[data-cam]", { scale: 1, duration: 1.7, ease: "power3.inOut" }, 1.55)
          .to("[data-jamool]", { scale: 1, yPercent: 0, duration: 1.7, ease: "power3.inOut" }, 1.55)
          .from("[data-floor], [data-floor-full]", { yPercent: 40, opacity: 0, duration: 1, ease: "power2.out" }, 1.4)
          /* then the world answers */
          .from("[data-word] > span", { yPercent: 125, duration: 0.85, stagger: 0.12 }, 2.5)
          .from("[data-cta]", { y: 30, opacity: 0, scale: 0.85, duration: 0.7, stagger: 0.12, ease: "back.out(1.6)" }, 3.05)
          .from("[data-trust] > li", { y: 12, opacity: 0, duration: 0.5, stagger: 0.07 }, 3.4)
          .from("[data-friend-l]", { x: -90, opacity: 0, duration: 0.9, ease: "back.out(1.5)" }, 2.9)
          .from("[data-friend-r]", { x: 90, opacity: 0, duration: 0.9, ease: "back.out(1.5)" }, 3.0)
          .from("[data-friend-t]", { y: -90, opacity: 0, duration: 1, ease: "bounce.out" }, 3.1)
          .from("[data-bubble]", { scale: 0, rotation: -10, transformOrigin: "0% 100%", duration: 0.6, ease: "back.out(2.4)" }, 3.3)
          .from("[data-rail]", { yPercent: 100, opacity: 0, duration: 0.8, ease: "power3.out" }, 3.5);

        /* ---------- idle: slow, never busy ---------- */
        gsap.utils.toArray<HTMLElement>("[data-star]").forEach((el, i) => {
          gsap.to(el, { opacity: 0.25, scale: 0.6, duration: 1.4 + (i % 4) * 0.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 + (i % 7) * 0.2 });
        });
        gsap.to("[data-halo]", { scale: 1.07, opacity: 0.8, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
        gsap.to("[data-rays]", { rotation: 360, duration: 110, repeat: -1, ease: "none" });
        gsap.to("[data-jbreath]", { scaleY: 1.018, transformOrigin: "50% 100%", duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 3.4 });
        gsap.to("[data-friend-t] [data-sway]", { y: 9, rotation: 3, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 4 });
        gsap.to("[data-friend-l] [data-sway]", { rotation: -1.6, transformOrigin: "50% 100%", duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 4 });
        gsap.to("[data-friend-r] [data-sway]", { rotation: 1.6, transformOrigin: "50% 100%", duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 4 });
        gsap.to("[data-twinkle]", { opacity: 0.3, scale: 0.7, duration: 1.3, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.35, delay: 2 });
        gsap.fromTo("[data-sheen]", { xPercent: -140 }, { xPercent: 240, duration: 1.4, ease: "power2.inOut", repeat: -1, repeatDelay: 6, delay: 4 });
        gsap.to("[data-badge-glow]", { scale: 1.25, opacity: 0.2, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
        gsap.fromTo("[data-pulse]", { scale: 1, opacity: 0.55 }, { scale: 1.35, opacity: 0, duration: 1.6, repeat: -1, repeatDelay: 1.2, ease: "power1.out", delay: 4.2 });

        /* Jamool's bubble swaps pictures: a book, a game, a palette… */
        const cues = gsap.utils.toArray<HTMLElement>("[data-cue]");
        gsap.set(cues, { scale: 0, opacity: 0 });
        const cycle = gsap.timeline({ repeat: -1, delay: 4 });
        cues.forEach((c) => cycle.to(c, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2.4)" }).to(c, { scale: 0, opacity: 0, duration: 0.25, ease: "power2.in" }, "+=1.5"));

        /* the rolling strip of worlds: it never stops, not even under the pointer */
        const track = host.querySelector<HTMLElement>("[data-track]");
        if (track) gsap.to(track, { xPercent: 50, duration: 42, ease: "none", repeat: -1 });

        /* ---------- scroll: the scene recedes, the words lift away ---------- */
        const walk = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: host, start: "top top", end: "bottom top", scrub: 0.7 } });
        walk
          .to("[data-scene]", { scale: 1.1, yPercent: -3, transformOrigin: "50% 100%" }, 0)
          .to("[data-title]", { yPercent: -45, opacity: 0 }, 0)
          .to("[data-ui]", { yPercent: -30, opacity: 0 }, 0)
          .to("[data-flood]", { opacity: 0.55, ease: "power1.in" }, 0.5);
      });

      /* ---------- pointer: depth, a friendly lean ---------- */
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
      {/* ---------- sky and far town: full width ---------- */}
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
      <div data-depth="10" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[17%] h-[40%]">
        <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" className="h-full w-full text-[#8E96FF]/[0.3]" style={{ WebkitMaskImage: "linear-gradient(to top, #000 50%, transparent)", maskImage: "linear-gradient(to top, #000 50%, transparent)" }}>
          <g fill="currentColor">
            <path d="M40 300V150h14v-16h14v16h14v-16h14v16h14v-16h14v16h12V300z" />
            <path d="M80 300V220a30 30 0 0 1 60 0V300z" opacity=".6" />
            <path d="M240 300V215h120V300zM252 215a48 48 0 0 1 96 0z" />
            <path d="M380 300V140h12V300zM374 140l12-30 12 30z" />
            <path d="M1040 300V200h110V300zM1052 200a43 43 0 0 1 86 0z" />
            <path d="M1170 300V130h13V300zM1164 130l13-32 13 32z" />
            <path d="M1260 300V150h13v-16h13v16h13v-16h13v16h13v-16h13v16h14V300z" />
            <path d="M600 300c3-60 9-110 24-150l9 3c-12 48-17 98-19 147zM624 154c-30-12-60-5-80 18 28-10 52-12 80-3zM624 154c22-19 48-21 72-7-26-2-46 3-72 7z" opacity=".8" />
          </g>
        </svg>
      </div>

      {/* the ground, full width: dark dunes that carry on into the street of doors below */}
      <div data-floor-full aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%]">
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="pb-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#35339F" />
              <stop offset="0.45" stopColor="#262577" />
              <stop offset="1" stopColor="#1F2A5C" />
            </linearGradient>
          </defs>
          <path d="M0 200V70C180 20 360 8 560 24s420 34 620 8c120-16 200-30 260-26V200z" fill="url(#pb-ground)" />
          <path d="M0 200V120C220 76 480 70 720 84s520 14 720-26V200z" fill="#1F2A5C" opacity=".6" />
        </svg>
      </div>

      {/* ---------- the scene: on the left of the words on a wide screen, the whole width on a phone ---------- */}
      <div data-scene className="absolute inset-0">
        <div data-cam className="absolute inset-0">
          <div data-halo aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[44%] h-[75%] w-[75%] max-w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_196_61/0.5),rgb(255_150_61/0.16)_42%,transparent_68%)] blur-xl" />

          {/* the doorway, with Jamool's own badge on its crown */}
          <div data-depth="14" className="pointer-events-none absolute inset-x-0 bottom-[22.5%] top-[max(26%,14rem)] flex items-end justify-center">
            <div className="relative aspect-[0.82] h-full max-w-[86vw]">
              <div data-frame className="absolute inset-0 overflow-hidden rounded-t-[999px] bg-gradient-to-b from-primary-200 via-primary-400 to-primary-600 shadow-[0_0_80px_rgb(255_190_60/0.55),0_30px_60px_-20px_rgb(0_0_40/0.7)]">
                <span data-sheen aria-hidden="true" className="absolute inset-y-0 start-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
              </div>
              <div data-frame className="absolute inset-[3.5%] rounded-t-[999px] border-[3px] border-background-50/70" />
              <div data-frame className="absolute inset-[6.5%] overflow-hidden rounded-t-[999px] bg-[#1A1470] shadow-[inset_0_10px_40px_rgb(0_0_0/0.55)]">
                <div data-inside className="absolute inset-0 bg-gradient-to-t from-[#FFE9A8] via-[#FFB84A] to-[#7A4CE0]">
                  <div data-rays aria-hidden="true" className="absolute -inset-[60%] bg-[repeating-conic-gradient(from_0deg_at_50%_72%,rgb(255_255_255/0.28)_0deg_6deg,transparent_6deg_18deg)]" />
                  <svg aria-hidden="true" viewBox="0 0 100 130" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
                    <g fill="#3B2A9A" opacity=".85">
                      <path d="M0 130V98q14-10 30-4t34-2 36 6V130z" />
                      <path d="M58 100V84h6v-5q3-7 6 0v5h6v16z" opacity=".9" />
                      <path d="M18 100c0-16 3-26 8-34l3 1c-3 8-5 18-5 33z" />
                      <path d="M26 67c-8-4-15-1-20 5 7-3 13-4 20-1zM26 67c6-6 13-6 19-2-7 0-13 0-19 2z" />
                    </g>
                    <path d="M30 130L46 96h8l16 34z" fill="#FFF2C2" opacity=".55" />
                    <g fill="#fff">
                      <circle data-twinkle cx="22" cy="24" r="1.2" />
                      <circle data-twinkle cx="78" cy="30" r="1" />
                      <circle data-twinkle cx="62" cy="18" r="1.3" />
                    </g>
                  </svg>
                  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgb(255_255_255/0.85),transparent_70%)]" />
                </div>
                {/* Jamool's badge, lit like a lamp over the door */}
                <div data-badge className="absolute inset-x-0 top-[9%] flex justify-center">
                  <span className="relative flex h-[22%] min-h-[3rem] w-auto items-center justify-center">
                    <span data-badge-glow aria-hidden="true" className="absolute -inset-3 rounded-full bg-primary-200/70 blur-md" />
                    <img src="/brand/avatar-jamool.webp" alt="" width={72} height={72} className="relative h-14 w-14 rounded-full bg-amber-100 object-cover ring-4 ring-primary-300 shadow-[0_6px_16px_rgb(0_0_0/0.35)] md:h-[4.4rem] md:w-[4.4rem]" />
                  </span>
                </div>
              </div>
              <div data-frame aria-hidden="true" className="absolute -bottom-[1.2%] -inset-x-[7%] h-[5%] rounded-[50%] bg-gradient-to-b from-primary-500 to-primary-800 shadow-[0_14px_20px_-6px_rgb(0_0_30/0.65)]" />
            </div>
          </div>

          {/* ---------- the ground: dark dunes and a lit path ---------- */}
          <div data-floor aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%]">
            <div data-depth="20" className="absolute inset-0">
              <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-full w-full">
                <defs>
                  <linearGradient id="pb-path" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FFC43D" stopOpacity="0.12" />
                    <stop offset="0.8" stopColor="#FFC43D" stopOpacity="0.7" />
                    <stop offset="1" stopColor="#FFC43D" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
                <path d="M334 200L370 20h60l36 180z" fill="url(#pb-path)" />
              </svg>
            </div>
          </div>

          {/* ---------- Jamool: close-up first, then he settles beside the doorway ---------- */}
          <div data-depth="26" className="pointer-events-none absolute inset-x-0 bottom-[20.5%] z-10 flex h-[46%] items-end justify-center md:h-[47%] md:portrait:h-[40%]">
            <div data-scroll-j className="h-full">
              <div data-jtilt className="h-full">
                <div data-jamool className="h-full">
                  <div data-jbreath className="h-full">
                    <Character name="jamool" size="2xl" motion="wave" priority className="!h-full drop-shadow-[0_18px_22px_rgba(10,8,70,0.55)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* his bubble: pictures, not sentences */}
          <div data-depth="30" aria-hidden="true" className="pointer-events-none absolute left-[calc(50%+3.2rem)] top-[36%] z-20 md:left-[calc(50%+5.5rem)] md:top-[33%]">
            <div data-bubble className="relative flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-[1.4rem] rounded-bl-md bg-background-50 shadow-[0_12px_26px_-8px_rgb(5_4_60/0.7)] md:h-[4.4rem] md:w-[4.4rem] md:rounded-[1.8rem] md:rounded-bl-md">
              {CUES.map((c) => (
                <i key={c.icon} data-cue className={`${c.icon} absolute text-[1.9rem] md:text-[2.4rem]`} style={{ color: c.color }} />
              ))}
            </div>
          </div>

          {/* ---------- his friends ---------- */}
          {FRIENDS.map((f) => {
            const c = characters[f.id];
            const side = f.id === "maha" ? "l" : f.id === "thaloob" ? "r" : "t";
            return (
              <div key={f.id} data-depth={f.depth} className={`pointer-events-none absolute z-20 ${f.box} ${f.h}`}>
                <div data-lean className="h-full">
                  <div data-friend-l={side === "l" ? "" : undefined} data-friend-r={side === "r" ? "" : undefined} data-friend-t={side === "t" ? "" : undefined} className="h-full">
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
            );
          })}
        </div>
      </div>

      {/* the dark the film starts from */}
      <div data-curtain aria-hidden="true" className="pointer-events-none absolute inset-0 z-40 bg-[#0B0A3A] opacity-0" />

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

      {/* ---------- the way in: the same two buttons ---------- */}
      <div data-ui className="absolute inset-x-0 bottom-[4.3rem] z-30 flex flex-col items-center gap-3 px-4">
        <div className="flex items-center justify-center gap-3">
          <div data-cta className="relative">
            <span data-pulse aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full bg-primary-300" />
            <Link to="/#worlds" className="btn btn-primary btn-lg relative">
              <i className="ri-door-open-line text-2xl" />
              ابدأ المغامرة
            </Link>
          </div>
          <div data-cta>
            <button
              ref={mic}
              type="button"
              onClick={openVoice}
              aria-label="قل ما تريد بصوتك"
              className="group flex h-[3.4rem] items-center gap-2 rounded-full bg-background-50/15 pe-5 ps-1.5 font-heading text-base font-bold text-background-50 ring-2 ring-background-50/35 backdrop-blur-md transition-colors hover:bg-background-50/25 max-sm:w-[3.4rem] max-sm:justify-center max-sm:p-0"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-primary-300 to-primary-500 text-2xl text-foreground-900 shadow-[0_3px_0_rgb(160_105_0/0.8)] max-sm:h-[2.9rem] max-sm:w-[2.9rem]">
                <i className="ri-mic-fill" />
              </span>
              <span className="max-sm:hidden">قل ما تريد</span>
            </button>
          </div>
        </div>
        <ul data-trust className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[0.8rem] font-semibold text-background-100/75 md:[@media(min-height:720px)]:flex">
          {TRUST.map((t) => (
            <li key={t.label} className="flex items-center gap-1.5">
              <i className={`${t.icon} text-base text-primary-300`} />
              {t.label}
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- the rolling strip of worlds ---------- */}
      <div data-rail className="absolute inset-x-0 bottom-0 z-30 h-[3.6rem] overflow-hidden border-t border-background-50/15 bg-[#1B1A6B]/70 backdrop-blur-md">
        <ul data-track className="flex h-full w-max items-center gap-3 pe-3">
          {[...categories, ...categories].map((c, i) => (
            <li key={`${c.id}-${i}`} aria-hidden={i >= categories.length ? true : undefined}>
              <Link to={c.to} tabIndex={i >= categories.length ? -1 : undefined} className="flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-background-50/10 pe-4 ps-1.5 font-heading text-sm font-bold text-background-50 ring-1 ring-background-50/20 transition-colors hover:bg-background-50/20">
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-base text-white" style={{ background: tones[c.tone].hex }}>
                  <i className={c.icon} />
                </span>
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* the warm light that floods the screen as the page moves on */}
      <div data-flood aria-hidden="true" className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(ellipse_at_50%_55%,rgb(255_226_150/0.9),rgb(255_176_60/0.5)_55%,transparent_80%)] opacity-0" />
    </section>
  );
}
