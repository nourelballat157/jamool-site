import { arNum } from "@/data/quranSurahs";
import ProgressBar from "@/components/brand/ProgressBar";
import { STAGES } from "./kit";

/* ------------------------------ words ---------------------------------- */

/** An ayah as separate words; `active` is the word being recited (-1 = none). */
export function WordLine({
  words,
  active = -1,
  size = "text-2xl md:text-3xl",
}: {
  words: string[];
  active?: number;
  size?: string;
}) {
  return (
    <p className={`qs-ayah ${size}`} lang="ar" dir="rtl">
      {words.map((word, index) => (
        <span key={index}>
          <span
            className={`qs-word ${index === active ? "qs-word-on" : active > index ? "qs-word-past" : ""}`}
          >
            {word}
          </span>{" "}
        </span>
      ))}
    </p>
  );
}

export function Waves() {
  return (
    <span aria-hidden="true" className="inline-flex h-4 items-center gap-0.5">
      <span className="qs-wave" />
      <span className="qs-wave" />
      <span className="qs-wave" />
      <span className="qs-wave" />
    </span>
  );
}

export function VerseBadge({ n, done = false }: { n: number; done?: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300 ${
        done ? "bg-accent-500 text-white" : "bg-accent-100 text-accent-800"
      }`}
    >
      {done ? <i className="ri-check-line text-base" /> : arNum(n)}
    </span>
  );
}

export function AudioNote({ text }: { text: string }) {
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-2xl bg-secondary-100 px-4 py-3 text-sm font-medium text-secondary-900"
    >
      <i className="ri-information-line mt-0.5 text-base" />
      <span>{text}</span>
    </p>
  );
}

/* ------------------------------ stepper -------------------------------- */

export function Stepper({
  step,
  reachable,
  finished,
  progress,
  onJump,
}: {
  /** current stage 0..2 (ignored when `finished`) */
  step: number;
  /** highest stage the child may open */
  reachable: number;
  finished: boolean;
  /** 0..1 overall progress of the surah */
  progress: number;
  onJump: (index: number) => void;
}) {
  const pct = Math.round(progress * 100);
  return (
    <nav aria-label="مراحل حفظ السورة" className="card p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-foreground-600">
        <span>{finished ? "اكتمل الحفظ" : `المرحلة ${arNum(step + 1)} من ${arNum(STAGES.length)}`}</span>
        <span>{arNum(pct)}٪</span>
      </div>
      <ProgressBar value={pct} tone="accent" label="تقدّم حفظ السورة" height="h-2.5" className="mt-2" />

      <ol className="mt-4 grid grid-cols-3 gap-2">
        {STAGES.map((stage, index) => {
          const done = finished || index < reachable || (index === reachable && index < step);
          const current = !finished && index === step;
          const open = finished || index <= reachable;
          return (
            <li key={stage.label}>
              <button
                type="button"
                disabled={!open}
                onClick={() => onJump(index)}
                aria-current={current ? "step" : undefined}
                className={`flex w-full flex-col items-center gap-1.5 rounded-3xl px-1 py-2 transition-colors ${
                  open ? "cursor-pointer hover:bg-accent-50" : "cursor-not-allowed opacity-60"
                } ${current ? "bg-accent-50" : ""}`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors duration-300 ${
                    current
                      ? "bg-accent-500 text-white"
                      : done
                        ? "bg-accent-200 text-accent-800"
                        : "bg-background-100 text-foreground-500"
                  }`}
                >
                  <i className={done && !current ? "ri-check-line" : stage.icon} />
                </span>
                <span
                  className={`text-center text-xs font-bold leading-tight ${
                    current ? "text-foreground-900" : "text-foreground-600"
                  }`}
                >
                  {index + 1}. {stage.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
