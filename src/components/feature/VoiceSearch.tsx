import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Character from "@/components/brand/Character";
import { gsap } from "@/lib/gsap";

type Phase = "idle" | "listening" | "heard" | "nothing" | "denied" | "unsupported";

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const QUICK: { word: string; icon: string }[] = [
  { word: "قصة", icon: "ri-book-open-line" },
  { word: "حرف", icon: "ri-text" },
  { word: "لعبة", icon: "ri-gamepad-line" },
  { word: "قرآن", icon: "ri-book-2-line" },
  { word: "رسم", icon: "ri-palette-line" },
  { word: "زيزو", icon: "ri-robot-2-line" },
];

const STATUS: Record<Phase, { title: string; hint: string }> = {
  idle: { title: "اضغط وقُل ما تريد", hint: "مثلًا: «قصة» أو «لعبة»" },
  listening: { title: "أنا أسمعك…", hint: "تكلّم الآن بصوت واضح" },
  heard: { title: "جميل! نبحث لك…", hint: "" },
  nothing: { title: "ما سمعتك، جرّب مرة ثانية", hint: "اضغط الميكروفون أو اكتب بالأسفل" },
  denied: { title: "نحتاج إذن الميكروفون", hint: "اسمح للميكروفون ثم جرّب، أو اكتب بالأسفل" },
  unsupported: { title: "متصفحك لا يسمع الصوت", hint: "اكتب ما تريد بالأسفل" },
};

const getCtor = (): (new () => RecognitionLike) | null => {
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

/**
 * Search made for a child: one huge microphone, Jamool listening, a few picture words to tap,
 * and a plain text box as the fallback. Opens from the header (or the hero) with a circular reveal.
 */
export default function VoiceSearch({
  open,
  autoListen,
  origin,
  onClose,
  onSearch,
}: {
  open: boolean;
  autoListen: boolean;
  origin: { x: number; y: number };
  onClose: () => void;
  onSearch: (q: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const micBtn = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const rec = useRef<RecognitionLike | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const timer = useRef<number | undefined>(undefined);
  const back = useRef<HTMLElement | null>(null);
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  const stopRec = useCallback(() => {
    window.clearTimeout(timer.current);
    try {
      rec.current?.abort();
    } catch {
      /* already stopped */
    }
    rec.current = null;
  }, []);

  const finish = useCallback(
    (q: string) => {
      const clean = q.trim();
      if (!clean) return;
      stopRec();
      onSearch(clean);
    },
    [onSearch, stopRec]
  );

  const close = useCallback(() => {
    stopRec();
    const el = root.current;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || calm) {
      onClose();
      return;
    }
    gsap.to(el, { clipPath: `circle(0% at ${origin.x}px ${origin.y}px)`, duration: 0.4, ease: "power3.in", onComplete: onClose });
  }, [onClose, origin.x, origin.y, stopRec]);

  const listen = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setPhase("unsupported");
      input.current?.focus();
      return;
    }
    stopRec();
    setText("");
    try {
      const r = new Ctor();
      r.lang = "ar-SA";
      r.interimResults = true;
      r.maxAlternatives = 1;
      r.continuous = false;
      r.onresult = (e) => {
        let said = "";
        let final = false;
        for (let i = 0; i < e.results.length; i++) {
          said += e.results[i][0].transcript;
          if (e.results[i].isFinal) final = true;
        }
        setText(said);
        if (final && said.trim()) {
          setPhase("heard");
          timer.current = window.setTimeout(() => finish(said), 900);
        }
      };
      r.onerror = (e) => {
        if (e.error === "aborted") return;
        setPhase(e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : "nothing");
      };
      r.onend = () => {
        if (phaseRef.current === "listening") setPhase("nothing");
      };
      rec.current = r;
      setPhase("listening");
      r.start();
    } catch {
      setPhase("nothing");
    }
  }, [finish, stopRec]);

  /* open: reveal, remember where focus was, lock the page, optionally start listening at once */
  useEffect(() => {
    if (!open) return;
    back.current = document.activeElement as HTMLElement | null;
    setPhase("idle");
    setText("");
    setTyped("");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = root.current;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (el && !calm) {
      gsap.fromTo(el, { clipPath: `circle(0% at ${origin.x}px ${origin.y}px)` }, { clipPath: `circle(150% at ${origin.x}px ${origin.y}px)`, duration: 0.7, ease: "power3.out", clearProps: "clipPath" });
      gsap.from("[data-vs-in]", { y: 26, opacity: 0, duration: 0.55, stagger: 0.07, delay: 0.25, ease: "power3.out" });
    }
    const t = window.setTimeout(() => (autoListen ? listen() : micBtn.current?.focus()), calm ? 0 : 450);
    return () => {
      window.clearTimeout(t);
      stopRec();
      document.body.style.overflow = prev;
      back.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* listening: soft rings out of the microphone and a living level meter */
  useEffect(() => {
    const el = root.current;
    if (!open || phase !== "listening" || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-vs-ring]", { scale: 1, opacity: 0.55 }, { scale: 2.5, opacity: 0, duration: 1.8, repeat: -1, stagger: 0.6, ease: "power1.out" });
      gsap.to("[data-vs-orb]", { scale: 1.07, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to("[data-vs-bar]", { scaleY: () => gsap.utils.random(0.25, 1), duration: 0.28, repeat: -1, yoyo: true, repeatRefresh: true, ease: "sine.inOut", stagger: 0.05 });
    }, el);
    return () => ctx.revert();
  }, [open, phase]);

  /* Esc closes; Tab stays inside */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !root.current) return;
      const items = Array.from(root.current.querySelectorAll<HTMLElement>("button, input, a[href]")).filter((n) => !n.hasAttribute("disabled"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    finish(typed);
  };
  const listening = phase === "listening";
  const s = STATUS[phase];

  return (
    <div ref={root} role="dialog" aria-modal="true" aria-label="البحث بالصوت أو بالكتابة" className="on-navy fixed inset-0 z-[70] overflow-y-auto bg-gradient-to-b from-[#1B1A6B] via-[#2B2A92] to-[#3F3FB8] text-background-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,rgb(255_205_90/0.28),transparent_70%)]" />
      <button type="button" onClick={close} aria-label="إغلاق" className="absolute end-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background-50/15 text-2xl text-background-50 ring-1 ring-background-50/25 transition-colors hover:bg-background-50/25 md:end-8 md:top-8">
        <i className="ri-close-line" />
      </button>

      <div className="relative mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
        <div data-vs-in className="-mb-3 flex items-end gap-2">
          <Character name="jamool" size="lg" motion={listening ? "cheer" : "wave"} decorative priority />
        </div>

        <div data-vs-in className="relative flex h-44 w-44 items-center justify-center md:h-52 md:w-52">
          {[0, 1, 2].map((i) => (
            <span key={i} data-vs-ring aria-hidden="true" className="absolute inset-4 rounded-full border-2 border-primary-300/70 opacity-0" />
          ))}
          <button
            ref={micBtn}
            data-vs-orb
            type="button"
            onClick={() => (listening ? (stopRec(), setPhase("idle")) : listen())}
            aria-label={listening ? "أوقف الاستماع" : "ابدأ الكلام"}
            aria-pressed={listening}
            className={`relative flex h-32 w-32 items-center justify-center rounded-full text-6xl shadow-[0_10px_0_rgb(120_70_0/0.55),0_30px_50px_-12px_rgb(0_0_30/0.7)] outline-offset-8 transition-colors active:translate-y-1 md:h-36 md:w-36 ${
              listening ? "bg-gradient-to-b from-secondary-300 to-secondary-500 text-white" : "bg-gradient-to-b from-primary-300 to-primary-500 text-foreground-900"
            }`}
          >
            <i className="ri-mic-fill" />
          </button>
        </div>

        <div data-vs-in className="mt-4 flex h-8 items-end justify-center gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} data-vs-bar className={`h-8 w-1.5 origin-bottom rounded-full ${listening ? "bg-primary-300" : "bg-background-50/25"}`} style={{ transform: listening ? undefined : "scaleY(0.25)" }} />
          ))}
        </div>

        <div data-vs-in className="mt-3 min-h-[5.5rem]" role="status" aria-live="polite">
          {text ? <p className="font-heading text-4xl font-bold text-primary-300 md:text-5xl">«{text}»</p> : <p className="font-heading text-3xl font-bold md:text-4xl">{s.title}</p>}
          {text && phase === "heard" ? <p className="mt-2 text-lg text-background-100/85">{s.title}</p> : !text && s.hint ? <p className="mt-2 text-base text-background-100/80 md:text-lg">{s.hint}</p> : null}
        </div>

        <ul data-vs-in className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {QUICK.map((q) => (
            <li key={q.word}>
              <button
                type="button"
                onClick={() => finish(q.word)}
                className="flex min-h-12 items-center gap-2 rounded-full bg-background-50/15 py-2 pe-5 ps-3 font-heading text-base font-bold text-background-50 ring-1 ring-background-50/25 backdrop-blur-sm transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-background-50/25 active:scale-95"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-400/25 text-lg text-primary-200">
                  <i className={q.icon} />
                </span>
                {q.word}
              </button>
            </li>
          ))}
        </ul>

        <form data-vs-in onSubmit={submit} className="mt-8 flex h-14 w-full max-w-md items-center rounded-full bg-background-50 ps-5 pe-1.5 text-foreground-900 shadow-[0_16px_30px_-14px_rgb(0_0_30/0.7)] focus-within:ring-4 focus-within:ring-primary-400/60">
          <i className="ri-keyboard-line text-xl text-foreground-400" />
          <input
            ref={input}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            type="text"
            name="q"
            aria-label="اكتب ما تبحث عنه"
            placeholder="أو اكتب هنا…"
            className="h-14 min-w-0 flex-1 bg-transparent px-3 font-body text-base placeholder:text-foreground-400 focus:outline-none"
          />
          <button type="submit" aria-label="ابحث" className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground-900 text-xl text-background-50 transition-colors hover:bg-foreground-700">
            <i className="ri-search-line" />
          </button>
        </form>
      </div>
    </div>
  );
}
