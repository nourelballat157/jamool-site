import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import ProgressBar from "@/components/brand/ProgressBar";
import { useSound } from "@/components/feature/SoundProvider";
import type { ArabicLetter, LetterToneFamily } from "@/data/letters";
import { ar, BTN_PRIMARY, BTN_SECONDARY, BTN_TOOL, tokenColor, type ToneKit } from "./kit";
import { Sparkles, Stars } from "./parts";
import {
  EASY_THRESHOLD,
  THRESHOLD,
  buildGlyphMask,
  paintGlyph,
  paintStrokes,
  scoreStrokes,
  starsFor,
  type GlyphMask,
  type Pt,
  type Stroke,
} from "./tracing";

type Status = "drawing" | "done";

const MIN_STEP = 0.004;

export default function TraceStep({
  letter,
  tone,
  toneName,
  initialStars,
  onComplete,
  onBack,
  onNext,
}: {
  letter: ArabicLetter;
  tone: ToneKit;
  toneName: LetterToneFamily;
  initialStars: number | null;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { play } = useSound();
  const wrapRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const maskRef = useRef<GlyphMask | null>(null);
  const dprRef = useRef(1);
  const frameRef = useRef(0);
  const lastEvalRef = useRef(0);

  const family = useMemo(
    () =>
      typeof window === "undefined"
        ? "sans-serif"
        : getComputedStyle(document.body).fontFamily || "Cairo, sans-serif",
    []
  );

  const [size, setSize] = useState(0);
  const [fontReady, setFontReady] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [strokeCount, setStrokeCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<Status>(initialStars ? "done" : "drawing");
  const [stars, setStars] = useState<number | null>(initialStars);
  const [score, setScore] = useState(0);
  const [burst, setBurst] = useState(0);
  const [message, setMessage] = useState("تتبّع الحرف الباهت بإصبعك، وسأعدّ معك الحبر.");

  const threshold = attempts >= 3 ? EASY_THRESHOLD : THRESHOLD;
  const ratio = Math.min(1, score / threshold);

  /* ----- fonts ---------------------------------------------------------- */
  useEffect(() => {
    let alive = true;
    const ready = () => {
      if (alive) setFontReady(true);
    };
    const timer = window.setTimeout(ready, 1800);
    if (document.fonts && typeof document.fonts.load === "function") {
      document.fonts
        .load(`800 120px ${family}`, letter.letter)
        .then(ready)
        .catch(ready);
    } else {
      ready();
    }
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [family, letter.letter]);

  /* ----- sizing --------------------------------------------------------- */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      setSize((prev) => (prev === next ? prev : next));
    };
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ----- drawing -------------------------------------------------------- */
  const renderInk = useCallback(() => {
    const canvas = inkRef.current;
    if (!canvas || !size) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = dprRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const all = currentRef.current ? [...strokesRef.current, currentRef.current] : strokesRef.current;
    paintStrokes(ctx, all, size, tokenColor(`${toneName}-500`, 0.95), tokenColor(`${toneName}-300`, 0.45));
  }, [size, toneName]);

  const scheduleRender = useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0;
      renderInk();
    });
  }, [renderInk]);

  useEffect(() => {
    if (!size || !fontReady) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    dprRef.current = dpr;
    const px = Math.round(size * dpr);

    const guide = guideRef.current;
    const ink = inkRef.current;
    if (!guide || !ink) return;
    guide.width = px;
    guide.height = px;
    ink.width = px;
    ink.height = px;

    const ctx = guide.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      paintGlyph(
        ctx,
        letter.letter,
        size,
        family,
        tokenColor("foreground-950", 0.1),
        tokenColor("foreground-600", 0.55)
      );
    }
    maskRef.current = buildGlyphMask(letter.letter, family);
    renderInk();
  }, [size, fontReady, letter.letter, family, renderInk]);

  useEffect(
    () => () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    },
    []
  );

  /* ----- scoring -------------------------------------------------------- */
  const evaluate = useCallback(() => {
    const mask = maskRef.current;
    const all = currentRef.current ? [...strokesRef.current, currentRef.current] : strokesRef.current;
    if (!mask) return { coverage: 0, stray: 0, score: 0, inkCells: 0 };
    const result = scoreStrokes(all, mask);
    setScore(result.score);
    return result;
  }, []);

  const succeed = useCallback(
    (finalScore: number) => {
      const earned = starsFor(finalScore);
      setStatus("done");
      setStars(earned);
      setBurst((n) => n + 1);
      setMessage(
        earned === 3
          ? `رائع! رسمت حرف ${letter.name} بإتقان.`
          : earned === 2
            ? `أحسنت! حرف ${letter.name} جميل جدًا.`
            : `أحسنت! أتممت حرف ${letter.name}، ويمكنك المحاولة لنجوم أكثر.`
      );
      try {
        play("correct");
      } catch {
        /* sound is optional */
      }
      onComplete(earned);
    },
    [letter.name, onComplete, play]
  );

  const failAttempt = useCallback(
    (coverage: number) => {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 3) {
        setMessage("لا بأس، خفّضنا الهدف قليلًا. جرّب مرة أخرى أو تخطَّ هذه الخطوة.");
        const mask = maskRef.current;
        const all = strokesRef.current;
        if (mask && all.length > 0) {
          const retry = scoreStrokes(all, mask);
          if (retry.score >= EASY_THRESHOLD) succeed(retry.score);
        }
      } else if (coverage < 0.4) {
        setMessage("ابدأ من أول الحرف وتتبّعه ببطء فوق الخطوط الباهتة.");
      } else {
        setMessage("اقتربت جدًا! أكمل الأجزاء الناقصة من الحرف.");
      }
    },
    [attempts, succeed]
  );

  /* ----- pointer handling ------------------------------------------------ */
  const toPoint = (event: { clientX: number; clientY: number }): Pt => {
    const rect = inkRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return { x: 0, y: 0 };
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  };

  const handleDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (status !== "drawing" || !event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* capture is a nicety */
    }
    currentRef.current = [toPoint(event)];
    scheduleRender();
  };

  const handleMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const stroke = currentRef.current;
    if (!stroke) return;
    event.preventDefault();
    const native = event.nativeEvent;
    const samples =
      typeof native.getCoalescedEvents === "function" && native.getCoalescedEvents().length > 0
        ? native.getCoalescedEvents()
        : [native];
    for (const sample of samples) {
      const point = toPoint(sample);
      const last = stroke[stroke.length - 1];
      if (Math.hypot(point.x - last.x, point.y - last.y) >= MIN_STEP) stroke.push(point);
    }
    scheduleRender();
    const now = performance.now();
    if (now - lastEvalRef.current > 160) {
      lastEvalRef.current = now;
      evaluate();
    }
  };

  const handleUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const stroke = currentRef.current;
    if (!stroke) return;
    event.preventDefault();
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    strokesRef.current = [...strokesRef.current, stroke];
    currentRef.current = null;
    setStrokeCount(strokesRef.current.length);
    renderInk();
    const result = evaluate();
    if (status === "drawing" && result.score >= threshold) succeed(result.score);
  };

  /* ----- buttons -------------------------------------------------------- */
  const clearAll = () => {
    if (strokesRef.current.length > 0 && status === "drawing" && score < threshold) {
      failAttempt(score);
    }
    strokesRef.current = [];
    currentRef.current = null;
    setStrokeCount(0);
    setScore(0);
    renderInk();
  };

  const undo = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    evaluate();
    renderInk();
  };

  const check = () => {
    if (strokesRef.current.length === 0) {
      setMessage("ابدأ بتتبّع الحرف بإصبعك فوق الخطوط الباهتة.");
      return;
    }
    const result = evaluate();
    if (result.score >= threshold) succeed(result.score);
    else failAttempt(result.coverage);
  };

  const again = () => {
    strokesRef.current = [];
    currentRef.current = null;
    setStrokeCount(0);
    setScore(0);
    setAttempts(0);
    setStatus("drawing");
    setMessage("تتبّع الحرف مرة أخرى لتجمع نجومًا أكثر.");
    renderInk();
  };

  const skip = () => {
    onComplete(1);
    onNext();
  };

  const resumed = status === "done" && strokeCount === 0;

  return (
    <div className="animate-rise-in">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,28rem)_1fr] lg:items-start">
        <div className="card p-3 md:p-4">
          <div
            ref={wrapRef}
            className="relative mx-auto aspect-square w-full max-w-[26rem] overflow-hidden rounded-3xl bg-background-50 ring-1 ring-sky-200"
          >
            <canvas
              ref={guideRef}
              aria-hidden="true"
              style={{ width: size || "100%", height: size || "100%" }}
              className={`absolute inset-0 transition-opacity duration-300 ${showGuide ? "opacity-100" : "opacity-0"}`}
            />
            <canvas
              ref={inkRef}
              role="img"
              aria-label={`مساحة الرسم: تتبّع حرف ${letter.name} بإصبعك`}
              style={{ width: size || "100%", height: size || "100%" }}
              className={`lj-canvas absolute inset-0 ${status === "drawing" ? "cursor-crosshair" : "cursor-default"}`}
              onPointerDown={handleDown}
              onPointerMove={handleMove}
              onPointerUp={handleUp}
              onPointerCancel={handleUp}
              onContextMenu={(event) => event.preventDefault()}
            />
            {strokeCount === 0 && status === "drawing" ? (
              <span className="pointer-events-none absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                <i className="ri-hand-heart-line" />
                ارسم هنا
              </span>
            ) : null}
            {!fontReady ? (
              <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-foreground-500">
                <i className="ri-loader-4-line me-2 animate-spin text-xl" />
                نجهّز الحرف...
              </span>
            ) : null}
            {status === "done" && burst > 0 ? <Sparkles run={burst} /> : null}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-bold md:text-2xl">
              تتبّع حرف {letter.name}
            </h3>
            <p className="mt-1 text-base leading-relaxed text-foreground-600">
              سر بإصبعك (أو الفأرة أو القلم) فوق الحرف الباهت حتى يمتلئ مقياس الحبر.
            </p>
          </div>

          <div className="card p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-bold text-foreground-900">
                <i className={`ri-drop-line text-xl ${tone.strong}`} />
                مقياس الحبر
              </span>
              <span className="text-sm font-bold text-foreground-700">{ar(ratio * 100)}٪</span>
            </div>
            <ProgressBar
              value={ratio * 100}
              tone={ratio >= 1 ? "leaf" : tone.id}
              label="مقياس الحبر"
              height="h-3.5"
              className="mt-3"
            />
            <p aria-live="polite" className="mt-3 min-h-[2.5rem] text-base leading-relaxed text-foreground-700">
              {message}
            </p>
          </div>

          {status === "drawing" ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={clearAll} className={`${BTN_TOOL}`}>
                  <i className="ri-eraser-line" />
                  امسح وأعد
                </button>
                <button
                  type="button"
                  onClick={undo}
                  disabled={strokeCount === 0}
                  className={`${BTN_TOOL}`}
                >
                  <i className="ri-arrow-go-back-line" />
                  تراجع
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuide((value) => !value)}
                  aria-pressed={showGuide}
                  className={`${BTN_TOOL}`}
                >
                  <i className={showGuide ? "ri-eye-line" : "ri-eye-off-line"} />
                  {showGuide ? "إخفاء الحرف" : "عرض الحرف"}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={check} className={BTN_PRIMARY}>
                  <i className="ri-check-double-line" />
                  أنهيت الرسم
                </button>
                {attempts >= 3 ? (
                  <button type="button" onClick={skip} className={BTN_SECONDARY}>
                    <i className="ri-skip-left-line" />
                    تخطَّ هذه الخطوة
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="animate-celebrate-pop card bg-leaf-50 p-5 text-center">
              <Stars value={stars ?? 1} size="text-4xl" animate={!resumed} />
              <p className="mt-2 font-heading text-lg font-bold text-foreground-900">
                {resumed ? `أتممت رسم حرف ${letter.name} من قبل` : `أتقنت رسم حرف ${letter.name}`}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button type="button" onClick={onNext} className={BTN_PRIMARY}>
                  التالي: انطق الحرف
                  <i className="ri-arrow-left-line" />
                </button>
                <button type="button" onClick={again} className={BTN_SECONDARY}>
                  <i className="ri-restart-line" />
                  ارسم من جديد
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-start">
        <button type="button" onClick={onBack} className={BTN_SECONDARY}>
          <i className="ri-arrow-right-line" />
          السابق
        </button>
      </div>
    </div>
  );
}
