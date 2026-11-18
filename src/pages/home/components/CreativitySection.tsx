import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { creativeTools } from "@/mocks/home";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

/** The creative tools become paint swatches: door-shaped, flat amber and saffron, each with one icon and one word. */
const SWATCHES = [
  "bg-amber-500 shadow-[0_6px_0_oklch(var(--amber-700)/1)]",
  "bg-primary-400 shadow-[0_6px_0_oklch(var(--primary-700)/1)]",
  "bg-amber-300 shadow-[0_6px_0_oklch(var(--amber-700)/1)]",
  "bg-primary-300 shadow-[0_6px_0_oklch(var(--primary-700)/1)]",
] as const;

const PAINTS = ["#F0563A", "#F5A63A", "#FFC43D", "#3E9E6A", "#2F7BEA", "#8D6BEB", "#1F2A5C"];

/**
 * A little drawing board on the home page: pick a paint, draw with a finger or the mouse, wipe it, start again.
 * Nothing is stored; the full studio (/drawing) is one tap away.
 */
function MiniCanvas() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const [paint, setPaint] = useState(PAINTS[0]);
  const [erase, setErase] = useState(false);
  const paintRef = useRef(paint);
  const eraseRef = useRef(erase);
  const drawn = useRef(false);
  paintRef.current = paint;
  eraseRef.current = erase;

  useEffect(() => {
    const c = cv.current;
    const w = wrap.current;
    if (!c || !w) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const fit = () => {
      const r = w.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(w);

    let down = false;
    let lx = 0;
    let ly = 0;
    let pmx = 0;
    let pmy = 0;
    const pos = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const start = (e: PointerEvent) => {
      down = true;
      c.setPointerCapture(e.pointerId);
      [lx, ly] = pos(e);
      pmx = lx;
      pmy = ly;
      ctx.strokeStyle = eraseRef.current ? "#FFFFFF" : paintRef.current;
      ctx.lineWidth = eraseRef.current ? 22 : 7;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 0.01, ly + 0.01);
      ctx.stroke();
      if (!drawn.current) {
        drawn.current = true;
        if (hint.current) gsap.to(hint.current, { opacity: 0, y: -8, duration: 0.4, ease: "power2.out" });
      }
    };
    const move = (e: PointerEvent) => {
      if (!down) return;
      const [x, y] = pos(e);
      ctx.strokeStyle = eraseRef.current ? "#FFFFFF" : paintRef.current;
      ctx.lineWidth = eraseRef.current ? 22 : 7;
      const mx = (x + lx) / 2;
      const my = (y + ly) / 2;
      ctx.beginPath();
      ctx.moveTo(pmx, pmy);
      ctx.quadraticCurveTo(lx, ly, mx, my);
      ctx.stroke();
      pmx = mx;
      pmy = my;
      lx = x;
      ly = y;
    };
    const end = () => (down = false);
    c.addEventListener("pointerdown", start);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", end);
    c.addEventListener("pointercancel", end);
    return () => {
      ro.disconnect();
      c.removeEventListener("pointerdown", start);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", end);
      c.removeEventListener("pointercancel", end);
    };
  }, []);

  const clear = () => {
    const c = cv.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();
  };

  return (
    <div className="rounded-[1.5rem] bg-white p-2.5 shadow-[0_24px_44px_-18px_rgb(120_70_0/0.55)] ring-1 ring-amber-200 md:p-3">
      <div ref={wrap} className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[radial-gradient(rgb(245_166_58/0.18)_1.5px,transparent_2px)] [background-size:18px_18px] ring-1 ring-amber-100">
        <canvas ref={cv} aria-label="لوح رسم صغير: ارسم بإصبعك أو بالماوس" className="absolute inset-0 h-full w-full cursor-crosshair touch-none" />
        <div ref={hint} aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-amber-700/80">
          <i className="ri-brush-line text-3xl md:text-4xl" />
          <span className="font-heading text-sm font-bold md:text-base">ارسم هنا</span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-1" role="group" aria-label="ألوان الرسم">
        <div className="flex items-center gap-1.5">
          {PAINTS.map((p) => (
            <button
              key={p}
              type="button"
              aria-label={`لون ${p}`}
              aria-pressed={!erase && paint === p}
              onClick={() => {
                setPaint(p);
                setErase(false);
              }}
              className="h-5 w-5 cursor-pointer rounded-full ring-2 ring-offset-2 ring-offset-white transition-shadow md:h-6 md:w-6"
              style={{ background: p, ["--tw-ring-color" as string]: !erase && paint === p ? p : "transparent" }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="ممحاة" aria-pressed={erase} onClick={() => setErase((v) => !v)} className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-base transition-colors md:h-8 md:w-8 ${erase ? "bg-amber-500 text-foreground-900" : "bg-amber-100 text-amber-800 hover:bg-amber-200"}`}>
            <i className="ri-eraser-line" />
          </button>
          <button type="button" aria-label="امسح اللوح" onClick={clear} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-amber-100 text-base text-amber-800 transition-colors hover:bg-amber-200 md:h-8 md:w-8">
            <i className="ri-delete-bin-6-line" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Maha's studio: the gazelle stands on a big amber palette next to a sheet whose drawing draws itself;
 * the tools are paint swatches. Hovering a swatch makes it pop and Maha tilts toward it.
 */
export default function CreativitySection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* the palette blooms, Maha steps in, then she floats gently (the one ambient loop) */
        const enter = { trigger: "[data-stage]", start: "top 80%", once: true };
        gsap.from("[data-disc]", { scale: 0.6, opacity: 0, transformOrigin: "50% 50%", duration: 0.9, ease: "back.out(1.6)", scrollTrigger: enter });
        gsap.from("[data-maha-react]", { y: 56, opacity: 0, transformOrigin: "50% 100%", duration: 0.8, delay: 0.15, ease: "back.out(1.7)", scrollTrigger: enter });
        gsap.to("[data-maha]", { y: -8, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });

      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const maha = el.querySelector<HTMLElement>("[data-maha-react]");
        const swatches = gsap.utils.toArray<HTMLElement>("[data-swatch]", el);
        const cleanups: (() => void)[] = [];

        swatches.forEach((sw, i) => {
          const icon = sw.querySelector<HTMLElement>("[data-icon]");
          const dir = i % 2 ? 1 : -1;
          const on = () => {
            gsap.to(sw, { y: -8, scale: 1.05, duration: 0.3, ease: "back.out(2.2)", overwrite: "auto" });
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
            if (maha) gsap.to(maha, { rotation: dir * 4, transformOrigin: "50% 100%", duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
          };
          const off = () => {
            gsap.to(sw, { y: 0, scale: 1, duration: 0.3, ease: "power3.out", overwrite: "auto" });
            if (maha) gsap.to(maha, { rotation: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" });
          };
          sw.addEventListener("pointerenter", on);
          sw.addEventListener("pointerleave", off);
          cleanups.push(() => {
            sw.removeEventListener("pointerenter", on);
            sw.removeEventListener("pointerleave", off);
          });
        });
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative isolate w-full overflow-hidden bg-amber-50 pb-20 pt-16 md:pb-28 md:pt-24">
      <Deco kind="dots" className="-z-10 start-8 top-24 hidden h-16 w-16 text-amber-200 md:block" />
      <Deco kind="sparkle" data-pop className="-z-10 end-5 top-28 h-4 w-4 text-primary-500 md:end-20 md:h-7 md:w-7" />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader category="art" title="استوديو الخيال" line="ارسم ولوّن بحرية، وزيّن رسمتك بلمسة ذكية." />

        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
          {/* the tools, as paint swatches */}
          <div className="order-2 lg:order-1">
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-5">
              {creativeTools.map((tool, i) => (
                <li key={tool.id} className={i % 2 ? "sm:mt-8" : ""}>
                  <div
                    data-swatch
                    className={`flex min-h-[12.5rem] flex-col items-center rounded-b-[1.5rem] rounded-t-[999px] px-3 pb-5 pt-7 text-center text-foreground-900 md:min-h-[14rem] ${SWATCHES[i % SWATCHES.length]}`}
                  >
                    <span data-icon aria-hidden="true" className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-background-50 text-3xl text-amber-700 md:h-16 md:w-16 md:text-4xl">
                      <i className={tool.icon} />
                    </span>
                    <span className="mt-auto font-heading text-base font-bold leading-snug md:text-lg">{tool.label}</span>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 md:text-base">
              <i className="ri-magic-line text-xl" aria-hidden="true" />
              لمسة ذكية، بلا أي كتابة معقّدة.
            </p>

            <div className="mt-8">
              <Link to="/drawing" className="btn btn-primary btn-lg">
                <i className="ri-palette-line" />
                ادخل الاستوديو
              </Link>
            </div>
          </div>

          {/* the focal point: Maha on her palette, a sheet drawing itself */}
          <div data-stage className="relative order-1 mx-auto h-[22rem] w-full max-w-[22rem] md:h-[30rem] md:max-w-[28rem] lg:order-2">
            <Deco kind="ring" data-drift="14" className="-z-10 end-[-1.5rem] top-[-1.5rem] hidden h-[26rem] w-[26rem] text-amber-300 md:block" />
            <span data-disc aria-hidden="true" className="absolute end-0 top-3 h-[15rem] w-[15rem] rounded-full bg-amber-300 md:top-2 md:h-[22rem] md:w-[22rem]" />

            {/* paint blobs on the palette rim */}
            <span data-pop aria-hidden="true" className="absolute start-[22%] top-0 h-9 w-9 rounded-full bg-primary-500 md:h-12 md:w-12" />
            <span data-pop aria-hidden="true" className="absolute start-[10%] top-[18%] h-6 w-6 rounded-full bg-foreground-900 md:h-8 md:w-8" />
            <span data-pop aria-hidden="true" className="absolute end-[4%] bottom-[34%] h-7 w-7 rounded-full bg-amber-500 md:h-10 md:w-10" />

            {/* the easel: a real little canvas, draw on it with the paints below */}
            <div className="absolute bottom-3 start-0 z-10 w-[11.5rem] -rotate-3 md:bottom-5 md:w-[17rem]">
              <MiniCanvas />
            </div>
            <div data-maha className="absolute bottom-0 end-5 md:end-10">
              <div data-maha-react>
                <Character name="maha" decorative className="!h-[18rem] md:!h-[24.5rem]" />
              </div>
            </div>
            <Deco kind="sparkle" data-pop className="end-1 top-[34%] h-5 w-5 text-amber-600 md:h-8 md:w-8" />
          </div>
        </div>
      </div>

      <SectionBridge variant="dunes" className="text-sky-700" />
    </section>
  );
}
