import type { CSSProperties } from "react";
import ProgressBar from "@/components/brand/ProgressBar";
import { ar, STEP_ICONS, STEP_LABELS, type ToneKit } from "./kit";

/* ----------------------------- stars ---------------------------------- */

export function Stars({
  value,
  size = "text-3xl",
  animate = true,
  label,
}: {
  value: number;
  size?: string;
  animate?: boolean;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${size}`}
      role="img"
      aria-label={label ?? `${ar(value)} من ٣ نجوم`}
    >
      {[1, 2, 3].map((n) => {
        const on = n <= value;
        return (
          <i
            key={n}
            className={`${on ? "ri-star-fill text-primary-500" : "ri-star-line text-foreground-300"} ${
              on && animate ? "lj-star-in" : ""
            }`}
            style={on && animate ? { animationDelay: `${(n - 1) * 0.18}s` } : undefined}
          />
        );
      })}
    </span>
  );
}

/* ----------------------------- sparkles -------------------------------- */

const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const radius = 90 + (i % 3) * 22;
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius, delay: (i % 5) * 0.06 };
});

/** A one-shot burst of little stars, centred in its relatively-positioned parent. */
export function Sparkles({ run }: { run: number }) {
  return (
    <span key={run} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {SPARKS.map((spark, i) => (
        <i
          key={i}
          className={`lj-spark ${i % 2 ? "ri-sparkling-2-fill text-2xl" : "ri-star-fill text-xl"}`}
          style={
            {
              "--dx": `${spark.dx}px`,
              "--dy": `${spark.dy}px`,
              animationDelay: `${spark.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}

/* ----------------------------- step indicator -------------------------- */

export function StepIndicator({
  step,
  maxStep,
  finished,
  tone,
  onJump,
}: {
  step: number;
  maxStep: number;
  finished: boolean;
  tone: ToneKit;
  onJump: (index: number) => void;
}) {
  const progress = finished ? 100 : (step / STEP_LABELS.length) * 100;
  return (
    <nav aria-label="خطوات رحلة الحرف" className="card p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-foreground-600">
        <span>
          {finished ? "اكتملت الرحلة" : `الخطوة ${ar(step + 1)} من ${ar(STEP_LABELS.length)}`}
        </span>
        <span>{ar(progress)}٪</span>
      </div>
      <ProgressBar value={progress} tone={tone.id} label="تقدّم الرحلة" height="h-2.5" className="mt-2" />

      <ol className="mt-4 grid grid-cols-4 gap-2">
        {STEP_LABELS.map((label, index) => {
          const done = finished || index < step;
          const current = !finished && index === step;
          const reachable = finished || index <= maxStep;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onJump(index)}
                aria-current={current ? "step" : undefined}
                className={`flex w-full flex-col items-center gap-1.5 rounded-3xl px-1 py-2 transition-colors ${
                  reachable ? "cursor-pointer hover:bg-background-100" : "cursor-not-allowed opacity-60"
                } ${current ? "bg-background-100" : ""}`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors duration-300 ${
                    current
                      ? `${tone.solid} ${tone.solidText}`
                      : done
                        ? "bg-leaf-600 text-background-50"
                        : "bg-background-100 text-foreground-500"
                  }`}
                >
                  <i className={done && !current ? "ri-check-line" : STEP_ICONS[index]} />
                </span>
                <span
                  className={`text-center text-[11px] font-bold leading-tight md:text-xs ${
                    current ? "text-foreground-900" : "text-foreground-600"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
