import { useEffect, useRef, useState } from "react";
import { surahs } from "@/mocks/child";
import { recordActivity } from "@/hooks/useActivityProgress";
import CategoryTile from "@/components/brand/CategoryTile";

type Surah = (typeof surahs)[number];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "٠٠:٠٠";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function SurahPlayer({ onSave }: { onSave: () => void }) {
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
    <div>
      <ul className="card flex flex-col divide-y divide-accent-100 overflow-hidden">
        {surahs.map((surah) => {
          const isActive = current?.id === surah.id;
          const activePlaying = isActive && isPlaying;
          return (
            <li key={surah.id} className={`flex items-center gap-3 p-4 transition-colors md:gap-4 md:p-5 ${isActive ? "bg-accent-50" : ""}`}>
              <CategoryTile category="surahs" />
              <div className="min-w-0 flex-1">
                <p className="font-heading text-base font-bold text-foreground-900 md:text-lg">
                  سورة {surah.name}
                </p>
                <p className="mt-0.5 text-xs font-medium text-foreground-500">
                  {surah.meaning} • {surah.verses}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggle(surah)}
                  aria-label={activePlaying ? "إيقاف التلاوة" : "استمع"}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors cursor-pointer ${
                    isActive
                      ? "bg-accent-500 text-white"
                      : "bg-accent-100 text-accent-700 hover:bg-accent-200"
                  }`}
                >
                  <i className={activePlaying ? "ri-pause-fill" : "ri-play-fill"} />
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  aria-label="احفظ"
                  className="btn-icon text-foreground-600 hover:bg-primary-100 hover:text-primary-700"
                >
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
        <div className="on-navy sticky bottom-4 z-10 mt-6 rounded-4xl bg-foreground-900 p-4 text-background-100 shadow-lift md:p-5">
          <div className="flex flex-wrap items-center gap-4">
            <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-500 text-2xl text-white">
              <i className={isPlaying ? "ri-sound-module-line" : "ri-pause-circle-line"} />
            </span>
            <div className="min-w-[10rem] flex-1">
              <p className="text-xs font-medium text-background-100/70">الآن يُتلى</p>
              <p className="font-heading text-lg font-bold">
                سورة {current.name}
              </p>
            </div>
            <span className="text-xs font-medium text-background-100/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={() => toggle(current)}
              aria-label={isPlaying ? "إيقاف" : "تشغيل"}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-2xl text-foreground-900 transition-transform hover:scale-105 cursor-pointer"
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
            className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-background-100/30 accent-primary-500"
          />
        </div>
      ) : null}

      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-medium text-foreground-500">
        <i className="ri-information-line text-accent-500" />
        التلاوة بصوت الشيخ مشاري العفاسي — ولكل سورة: الاستماع، والترديد، والتلاوة، والحفظ.
      </p>
    </div>
  );
}