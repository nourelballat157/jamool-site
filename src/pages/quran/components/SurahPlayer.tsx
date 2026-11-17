import { useEffect, useRef, useState } from "react";
import { surahs } from "@/mocks/child";
import { recordActivity } from "@/hooks/useActivityProgress";
import StarBadge from "@/pages/quran/components/StarBadge";
import { arNum } from "@/data/quranSurahs";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK_QUERY } from "@/lib/gsap";

type Surah = (typeof surahs)[number];

const TONES = ["#2BA39A", "#4F8FE8", "#9A7BEA", "#E9A04A", "#4FA879", "#E8745C"];

/** The surah's number in the mushaf, read from its recitation file (…/ar.alafasy/78.mp3). */
const numberOf = (s: Surah) => Number(s.audio.match(/\/(\d+)\.mp3/)?.[1] ?? 0);

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "٠٠:٠٠";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/** three bars that dance while a surah is being recited */
function Equalizer({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`eq ${className}`}>
      <i />
      <i />
      <i />
    </span>
  );
}

export default function SurahPlayer({ onSave }: { onSave: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<Surah | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleTime = () => setCurrentTime(audio.currentTime);
    const handleMeta = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = () => {
      setIsPlaying(false);
      setError("تعذّر تشغيل التلاوة حاليًا، تأكد من الاتصال بالإنترنت وحاول مرة أخرى.");
    };

    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("loadedmetadata", handleMeta);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnd);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("loadedmetadata", handleMeta);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnd);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  /* the rows rise in as they are reached; the now-playing bar slides up the first time something plays */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
        gsap.set(rows, { opacity: 0, y: 20 });
        ScrollTrigger.batch(rows, {
          start: "top 96%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, ease: "power3.out", overwrite: true, clearProps: "transform,opacity" }),
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  useEffect(() => {
    if (!current || !root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bar = root.current.querySelector("[data-now]");
    if (bar) gsap.fromTo(bar, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "back.out(1.4)", clearProps: "transform,opacity" });
    // only when the player first appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current === null]);

  const toggle = (surah: Surah) => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);

    if (current?.id === surah.id) {
      if (audio.paused) {
        void audio.play().catch(() => handlePlayError());
      } else {
        audio.pause();
      }
      return;
    }

    setCurrent(surah);
    setDuration(0);
    setCurrentTime(0);
    recordActivity({
      key: "quran",
      title: "القرآن الكريم",
      subtitle: `آخر ما استمعت إليه: سورة ${surah.name}`,
      icon: "ri-book-2-line",
      route: "/quran",
      tone: "bg-accent-100 text-accent-700",
    });
    audio.src = surah.audio;
    void audio.play().catch(() => handlePlayError());
  };

  const handlePlayError = () => {
    setIsPlaying(false);
    setError("تعذّر تشغيل التلاوة حاليًا، تأكد من الاتصال بالإنترنت وحاول مرة أخرى.");
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const next = (value / 100) * duration;
    audio.currentTime = next;
    setCurrentTime(next);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={root}>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {surahs.map((surah, i) => {
          const isActive = current?.id === surah.id;
          const activePlaying = isActive && isPlaying;
          const tone = TONES[i % TONES.length];
          return (
            <li
              key={surah.id}
              data-row
              className={`group relative flex items-center gap-3 overflow-hidden rounded-[1.6rem] p-3 pe-3 ring-1 transition-[box-shadow,background-color] duration-300 md:gap-4 md:p-4 ${
                isActive ? "bg-white shadow-[0_18px_40px_-22px_rgb(31_42_92/0.5)] ring-[#2BA39A]/40" : "bg-white/85 shadow-[0_12px_28px_-24px_rgb(31_42_92/0.45)] ring-[#EADFCB]/80 hover:shadow-[0_18px_36px_-22px_rgb(31_42_92/0.5)]"
              }`}
            >
              {isActive ? <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(240px_circle_at_90%_50%,rgb(43_163_154/0.12),transparent_70%)]" /> : null}
              <StarBadge label={arNum(numberOf(surah))} color={tone} />
              <div className="relative min-w-0 flex-1">
                <p className="flex items-center gap-2 font-heading text-lg font-bold text-foreground-900">
                  <span className="truncate">سورة {surah.name}</span>
                  {activePlaying ? <Equalizer className="text-[#2BA39A]" /> : null}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-foreground-500">
                  <span className="truncate">{surah.meaning}</span>
                  <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-foreground-300" />
                  <span className="shrink-0">{surah.verses}</span>
                </p>
              </div>
              <div className="relative flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(surah)}
                  aria-label={activePlaying ? "إيقاف التلاوة" : "استمع"}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors cursor-pointer ${
                    isActive ? "bg-[#2BA39A] text-white shadow-[0_8px_16px_-8px_rgb(43_163_154/0.8)]" : "bg-[#E4F4F2] text-[#2B8A83] hover:bg-[#D2ECE9]"
                  }`}
                >
                  <i className={activePlaying ? "ri-pause-fill" : "ri-play-fill"} />
                </button>
                <button type="button" onClick={onSave} aria-label="احفظ" className="btn-icon !bg-transparent text-foreground-500 hover:!bg-[#FFF1D8] hover:text-[#C98521]">
                  <i className="ri-heart-3-line" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {error ? (
        <p role="alert" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-secondary-100 px-4 py-3 text-center text-sm font-medium text-secondary-900">
          <i className="ri-error-warning-line text-base" />
          {error}
        </p>
      ) : null}

      {current ? (
        <div data-now className="on-navy sticky bottom-4 z-10 mt-6 overflow-hidden rounded-[2rem] bg-[#1F2A5C]/95 p-4 text-background-100 shadow-lift backdrop-blur-xl md:p-5">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(360px_circle_at_8%_0%,rgb(43_163_154/0.28),transparent_70%)]" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2BA39A] text-white">
              {isPlaying ? <Equalizer className="eq-lg" /> : <i className="ri-pause-circle-line text-2xl" />}
            </span>
            <div className="min-w-[10rem] flex-1">
              <p className="text-xs font-medium text-background-100/70">الآن يُتلى</p>
              <p className="font-heading text-lg font-bold">سورة {current.name}</p>
            </div>
            <span className="text-xs font-medium tabular-nums text-background-100/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={() => toggle(current)}
              aria-label={isPlaying ? "إيقاف" : "تشغيل"}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-400 text-2xl text-foreground-900 shadow-[0_6px_14px_-6px_rgb(0_0_0/0.5)] cursor-pointer"
            >
              <i className={isPlaying ? "ri-pause-fill" : "ri-play-fill"} />
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="شريط تقدّم التلاوة"
            className="relative mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-background-100/25 accent-primary-400"
          />
        </div>
      ) : null}

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-medium text-foreground-500">
        <i className="ri-information-line text-[#2BA39A]" />
        التلاوة بصوت الشيخ مشاري العفاسي — ولكل سورة: الاستماع، والترديد، والتلاوة، والحفظ.
      </p>
    </div>
  );
}
