import { useEffect, useMemo, useRef, useState } from "react";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import { useSound } from "@/components/feature/SoundProvider";
import type { ArabicLetter } from "@/data/letters";
import { BTN_ACCENT, BTN_PRIMARY, BTN_SECONDARY, normalizeArabic, type ToneKit } from "./kit";
import { Sparkles } from "./parts";

/* Minimal typings for the optional browser speech recognition API. */
type RecAlternative = { transcript: string };
type RecResult = { length: number; [index: number]: RecAlternative };
type RecEvent = { results: { length: number; [index: number]: RecResult } };
interface Recognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognizerCtor = new () => Recognizer;

function getRecognizerCtor(): RecognizerCtor | null {
  if (typeof window === "undefined") return null;
  const holder = window as unknown as {
    SpeechRecognition?: RecognizerCtor;
    webkitSpeechRecognition?: RecognizerCtor;
  };
  return holder.SpeechRecognition ?? holder.webkitSpeechRecognition ?? null;
}

type Listen = "idle" | "listening" | "heard" | "retry" | "blocked";

export default function SpeakStep({
  letter,
  tone,
  onBack,
  onNext,
}: {
  letter: ArabicLetter;
  tone: ToneKit;
  onBack: () => void;
  onNext: () => void;
}) {
  const { speaking, speakSequence } = useArabicSpeech();
  const { play } = useSound();
  const recRef = useRef<Recognizer | null>(null);
  const timerRef = useRef<number | null>(null);
  const supportsListening = useMemo(() => getRecognizerCtor() !== null, []);

  const [played, setPlayed] = useState(false);
  const [repeated, setRepeated] = useState(false);
  const [burst, setBurst] = useState(0);
  const [listen, setListen] = useState<Listen>("idle");

  const example = letter.words[0]?.word ?? letter.word;

  const cheer = () => {
    setRepeated(true);
    setBurst((n) => n + 1);
    try {
      play("correct");
    } catch {
      /* sound is optional */
    }
  };

  const playSound = () => {
    setPlayed(true);
    speakSequence([letter.name, example]);
  };

  const stopListening = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const rec = recRef.current;
    recRef.current = null;
    if (rec) {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* already stopped */
      }
    }
  };

  useEffect(() => stopListening, []);

  const startListening = () => {
    const Ctor = getRecognizerCtor();
    if (!Ctor) return;
    stopListening();
    const targets = [letter.name, ...letter.words.map((item) => item.word)].map(normalizeArabic);
    try {
      const rec = new Ctor();
      rec.lang = "ar-SA";
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      rec.onresult = (event) => {
        let matched = false;
        for (let i = 0; i < event.results.length; i += 1) {
          const result = event.results[i];
          for (let j = 0; j < result.length; j += 1) {
            const said = normalizeArabic(result[j].transcript);
            if (said && targets.some((target) => said.includes(target))) matched = true;
          }
        }
        stopListening();
        if (matched) {
          setListen("heard");
          cheer();
        } else {
          setListen("retry");
        }
      };
      rec.onerror = (event) => {
        stopListening();
        setListen(event.error === "not-allowed" || event.error === "service-not-allowed" ? "blocked" : "retry");
      };
      rec.onend = () => {
        recRef.current = null;
        setListen((current) => (current === "listening" ? "retry" : current));
      };
      recRef.current = rec;
      setListen("listening");
      rec.start();
      timerRef.current = window.setTimeout(() => {
        stopListening();
        setListen((current) => (current === "listening" ? "retry" : current));
      }, 7000);
    } catch {
      stopListening();
      setListen("blocked");
    }
  };

  const ringOn = (played && !repeated) || listen === "listening";

  return (
    <div className="animate-rise-in">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <h3 className="text-xl font-bold md:text-2xl">
          استمع ثم ردّد معي
        </h3>
        <p className="mt-1 text-base leading-relaxed text-foreground-600">
          اضغط على السماعة لتسمع حرف {letter.name} وكلمة «{example}»، ثم انطقه بصوتك.
        </p>

        <div className={`relative mt-6 w-full max-w-sm overflow-hidden rounded-4xl ${tone.soft} px-4 py-8 sm:px-6`}>
          <span
            className={`block font-heading text-8xl font-bold leading-[1.2] md:text-9xl ${tone.text}`}
            lang="ar"
          >
            {letter.letter}
          </span>
          <p className="font-heading text-lg font-bold text-foreground-900">
            {letter.name} — {example}
          </p>

          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={playSound}
                aria-label="استمع إلى الحرف"
                className={`relative flex h-24 w-24 items-center justify-center rounded-full ${tone.solid} ${tone.solidText} text-5xl transition-transform hover:scale-105 cursor-pointer ${
                  !played ? "lj-nudge" : ""
                }`}
              >
                <i className={speaking ? "ri-volume-up-fill animate-pulse" : "ri-volume-up-line"} />
              </button>
              <span className="text-xs font-bold text-foreground-700">اسمع</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span
                className={`relative flex h-24 w-24 items-center justify-center rounded-full text-5xl transition-colors duration-300 ${
                  repeated ? "bg-leaf-600 text-background-50" : "bg-background-50 text-sky-600"
                }`}
                aria-hidden="true"
              >
                {ringOn ? (
                  <>
                    <span className="lj-ring" />
                    <span className="lj-ring lj-ring-2" />
                  </>
                ) : null}
                <i className={repeated ? "ri-check-line" : "ri-mic-fill"} />
              </span>
              <span className="text-xs font-bold text-foreground-700">ردّد</span>
            </div>
          </div>
          {repeated ? <Sparkles run={burst} /> : null}
        </div>

        <p aria-live="polite" className="mt-4 min-h-[1.75rem] text-base font-bold text-foreground-800">
          {repeated
            ? `ما أجمل نطقك لحرف ${letter.name}!`
            : listen === "listening"
              ? "أسمعك الآن... قل اسم الحرف أو الكلمة."
              : listen === "retry"
                ? "سمعتك! جرّب مرة أخرى بصوت أوضح قليلًا."
                : listen === "blocked"
                  ? "لا مشكلة، اضغط «ردّدت الحرف» عندما تنتهي."
                  : played
                    ? "الآن دورك! انطق الحرف بصوت واضح."
                    : ""}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={cheer} className={repeated ? BTN_ACCENT : BTN_PRIMARY}>
            <i className={repeated ? "ri-check-double-line" : "ri-mic-line"} />
            ردّدت الحرف
          </button>
          {supportsListening ? (
            <button
              type="button"
              onClick={listen === "listening" ? () => { stopListening(); setListen("idle"); } : startListening}
              aria-pressed={listen === "listening"}
              className={BTN_SECONDARY}
            >
              <i className={listen === "listening" ? "ri-stop-circle-line" : "ri-mic-2-line"} />
              {listen === "listening" ? "توقف" : "استمع لي"}
            </button>
          ) : null}
        </div>
        {supportsListening ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-foreground-500">
            <i className="ri-shield-check-line text-sm" />
            الاستماع اختياري، ولا نحفظ أي تسجيل لصوتك.
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className={BTN_SECONDARY}>
          <i className="ri-arrow-right-line" />
          السابق
        </button>
        <button type="button" onClick={onNext} className={repeated ? BTN_PRIMARY : BTN_SECONDARY}>
          التالي: اختر الصورة
          <i className="ri-arrow-left-line" />
        </button>
      </div>
    </div>
  );
}
