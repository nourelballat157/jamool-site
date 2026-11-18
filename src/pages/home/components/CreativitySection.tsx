import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { creativeTools } from "@/mocks/home";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import { useRewards } from "@/components/feature/RewardProvider";
import useProgress, { addCreation, getState, removeCreation } from "@/store/progress";
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
const SIZES = [
  { id: "s", px: 4, dot: "h-1.5 w-1.5", label: "قلم رفيع" },
  { id: "m", px: 8, dot: "h-2.5 w-2.5", label: "قلم متوسط" },
  { id: "l", px: 15, dot: "h-3.5 w-3.5", label: "فرشاة عريضة" },
] as const;
const STORE_KEY = "ajyal_progress_v2";
const UNDO_DEPTH = 14;

type Saved = "idle" | "ok" | "empty" | "full";

/**
 * A real little studio on the home page: three brush sizes, seven paints, an eraser, undo, clear, and
 * "save to my room" that really puts the picture in the child's room (the same place the full studio saves to).
 */
function MiniCanvas() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const history = useRef<ImageData[]>([]);
  const { notify, announce } = useRewards();
  const [paint, setPaint] = useState(PAINTS[0]);
  const [size, setSize] = useState<(typeof SIZES)[number]["id"]>("m");
  const [erase, setErase] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [saved, setSaved] = useState<Saved>("idle");
  const paintRef = useRef(paint);
  const eraseRef = useRef(erase);
  const sizeRef = useRef<number>(8);
  const drawn = useRef(false);
  paintRef.current = paint;
  eraseRef.current = erase;
  sizeRef.current = SIZES.find((s) => s.id === size)!.px;

  useEffect(() => {
    const c = cv.current;
    const w = wrap.current;
    if (!c || !w) return;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const fit = () => {
      const r = w.getBoundingClientRect();
      if (r.width < 2) return;
      /* keep what was drawn when the board is resized */
      const keep = c.width > 0 && drawn.current ? ctx.getImageData(0, 0, c.width, c.height) : null;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (keep) ctx.putImageData(keep, 0, 0);
      history.current = [];
      setCanUndo(false);
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
    const style = () => {
      ctx.globalCompositeOperation = eraseRef.current ? "destination-out" : "source-over";
      ctx.strokeStyle = paintRef.current;
      ctx.lineWidth = eraseRef.current ? sizeRef.current * 2.6 : sizeRef.current;
    };
    const start = (e: PointerEvent) => {
      down = true;
      c.setPointerCapture(e.pointerId);
      /* one undo step per stroke */
      history.current.push(ctx.getImageData(0, 0, c.width, c.height));
      if (history.current.length > UNDO_DEPTH) history.current.shift();
      setCanUndo(true);
      setSaved("idle");
      [lx, ly] = pos(e);
      pmx = lx;
      pmy = ly;
      style();
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
      style();
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

  const ctx2d = () => cv.current?.getContext("2d", { willReadFrequently: true }) ?? null;

  const undo = () => {
    const c = cv.current;
    const ctx = ctx2d();
    const last = history.current.pop();
    if (!c || !ctx || !last) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(last, 0, 0);
    ctx.restore();
    setCanUndo(history.current.length > 0);
    setSaved("idle");
  };

  const clear = () => {
    const c = cv.current;
    const ctx = ctx2d();
    if (!c || !ctx) return;
    history.current.push(ctx.getImageData(0, 0, c.width, c.height));
    if (history.current.length > UNDO_DEPTH) history.current.shift();
    setCanUndo(true);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.restore();
    setSaved("idle");
  };

  const hasInk = () => {
    const c = cv.current;
    const ctx = ctx2d();
    if (!c || !ctx) return false;
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 16) if (d[i] > 0) return true;
    return false;
  };

  /* the picture goes to the child's room: a small JPEG on white, and we check it really reached storage */
  const save = () => {
    const c = cv.current;
    if (!c || !hasInk()) {
      setSaved("empty");
      return;
    }
    const out = document.createElement("canvas");
    const w = 560;
    out.width = w;
    out.height = Math.round((c.height / c.width) * w);
    const octx = out.getContext("2d");
    if (!octx) return;
    octx.fillStyle = "#FFFFFF";
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(c, 0, 0, out.width, out.height);
    let image = "";
    try {
      image = out.toDataURL("image/jpeg", 0.72);
    } catch {
      setSaved("full");
      return;
    }
    const result = addCreation({ kind: "drawing", title: "رسمة من الصفحة الرئيسية", image });
    const state = getState();
    const newest = state.data[state.activeChildId]?.creations[0];
    let stored = false;
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      stored = Boolean(newest && raw && raw.includes(`"id":"${newest.id}"`));
    } catch {
      stored = false;
    }
    if (!stored) {
      if (newest) removeCreation(newest.id);
      setSaved("full");
      return;
    }
    announce(result);
    notify("تم حفظ رسمتك في غرفتي", "ri-image-2-line");
    setSaved("ok");
  };

  const tool = "flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-base transition-colors md:h-8 md:w-8";

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
      </div>

      <div className="mt-2 flex items-center justify-between gap-1 border-t border-amber-100 pt-2" role="group" aria-label="أدوات الرسم">
        <div className="flex items-center gap-1">
          {SIZES.map((s) => (
            <button key={s.id} type="button" aria-label={s.label} aria-pressed={size === s.id} onClick={() => setSize(s.id)} className={`${tool} ${size === s.id ? "bg-amber-500 text-foreground-900" : "bg-amber-100 text-amber-800 hover:bg-amber-200"}`}>
              <span aria-hidden="true" className={`block rounded-full bg-current ${s.dot}`} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="ممحاة" aria-pressed={erase} onClick={() => setErase((v) => !v)} className={`${tool} ${erase ? "bg-amber-500 text-foreground-900" : "bg-amber-100 text-amber-800 hover:bg-amber-200"}`}>
            <i className="ri-eraser-line" />
          </button>
          <button type="button" aria-label="تراجع عن آخر خط" onClick={undo} disabled={!canUndo} className={`${tool} bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40`}>
            <i className="ri-arrow-go-back-line" />
          </button>
          <button type="button" aria-label="امسح اللوح" onClick={clear} className={`${tool} bg-amber-100 text-amber-800 hover:bg-amber-200`}>
            <i className="ri-delete-bin-6-line" />
          </button>
        </div>
      </div>

      <div className="mt-2">
        {saved === "ok" ? (
          <Link to="/room#creations" className="flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-accent-100 px-3 font-heading text-xs font-bold text-accent-800 md:text-sm">
            <i className="ri-check-double-line text-base" />
            حُفظت! افتح غرفتي
          </Link>
        ) : (
          <button type="button" onClick={save} className="flex min-h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-foreground-900 px-3 font-heading text-xs font-bold text-background-50 transition-colors hover:bg-foreground-800 md:text-sm">
            <i className="ri-heart-line text-base text-primary-300" />
            {saved === "empty" ? "ارسم شيئًا أولًا" : saved === "full" ? "الغرفة ممتلئة قليلًا" : "احفظ في غرفتي"}
          </button>
        )}
      </div>
    </div>
  );
}

/** the child's own saved pictures, framed on a little wall; the empty frames are dashed and wait for the next drawing */
function Gallery() {
  const { data } = useProgress();
  const items = data.creations.slice(0, 4);
  const slots = Array.from({ length: 4 }, (_, i) => items[i] ?? null);
  return (
    <div className="mt-8 rounded-3xl bg-white/70 p-4 ring-1 ring-amber-200 backdrop-blur-sm md:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-heading text-base font-bold text-foreground-900">
          <i className="ri-image-line text-xl text-amber-600" aria-hidden="true" />
          معرضي
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">{data.creations.length.toLocaleString("ar-EG")} رسمة</span>
        </p>
        <Link to="/room#creations" className="inline-flex min-h-9 items-center gap-1 font-heading text-sm font-bold text-amber-800 hover:underline">
          كل رسماتي
          <i className="ri-arrow-left-line" aria-hidden="true" />
        </Link>
      </div>
      <ul className="mt-3 grid grid-cols-4 gap-2.5 md:gap-3">
        {slots.map((c, i) => (
          <li key={c?.id ?? `e${i}`}>
            {c ? (
              <Link to="/room#creations" aria-label={`افتح ${c.title}`} className="block overflow-hidden rounded-xl bg-white p-1 shadow-[0_8px_16px_-8px_rgb(120_70_0/0.5)] ring-1 ring-amber-200">
                <img src={c.image} alt={c.title} loading="lazy" className="aspect-[4/3] w-full rounded-lg bg-amber-50 object-cover" />
              </Link>
            ) : (
              <span aria-hidden="true" className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border-2 border-dashed border-amber-300/70 text-xl text-amber-400">
                <i className="ri-add-line" />
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Maha's studio: the gazelle stands on a big amber palette next to a little studio you can really draw in and save
 * from; the tools are paint swatches, and under them hangs the child's own gallery.
 * Hovering a swatch makes it pop and Maha tilts toward it.
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

            <Gallery />

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/drawing" className="btn btn-primary btn-lg">
                <i className="ri-palette-line" />
                ادخل الاستوديو
              </Link>
              <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 md:text-base">
                <i className="ri-magic-line text-xl" aria-hidden="true" />
                لمسة ذكية، بلا أي كتابة معقّدة.
              </p>
            </div>
          </div>

          {/* the focal point: Maha on her palette, a little studio to draw in */}
          <div data-stage className="relative order-1 mx-auto h-[26rem] w-full max-w-[22rem] md:h-[34rem] md:max-w-[28rem] lg:order-2">
            <Deco kind="ring" data-drift="14" className="-z-10 end-[-1.5rem] top-[-1.5rem] hidden h-[26rem] w-[26rem] text-amber-300 md:block" />
            <span data-disc aria-hidden="true" className="absolute end-0 top-3 h-[15rem] w-[15rem] rounded-full bg-amber-300 md:top-2 md:h-[22rem] md:w-[22rem]" />

            {/* paint blobs on the palette rim */}
            <span data-pop aria-hidden="true" className="absolute start-[22%] top-0 h-9 w-9 rounded-full bg-primary-500 md:h-12 md:w-12" />
            <span data-pop aria-hidden="true" className="absolute start-[10%] top-[18%] h-6 w-6 rounded-full bg-foreground-900 md:h-8 md:w-8" />
            <span data-pop aria-hidden="true" className="absolute end-[4%] bottom-[34%] h-7 w-7 rounded-full bg-amber-500 md:h-10 md:w-10" />

            {/* the easel: a real little studio, draw on it with the paints below */}
            <div className="absolute bottom-3 start-0 z-10 w-[12.5rem] -rotate-2 md:bottom-5 md:w-[18rem]">
              <MiniCanvas />
            </div>
            <div data-maha className="absolute bottom-0 end-3 md:end-8">
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
