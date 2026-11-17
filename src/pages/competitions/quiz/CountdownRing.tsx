import "./quiz.css";
import { toAr } from "./format";

type CountdownRingProps = {
  remaining: number;
  total: number;
  /** stop the colour change / beating once the answer is revealed */
  frozen?: boolean;
  size?: number;
};

const RADIUS = 27;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Circular countdown: the ring slowly empties, green -> saffron -> coral (never loud). */
export default function CountdownRing({ remaining, total, frozen = false, size = 72 }: CountdownRingProps) {
  const fraction = Math.max(0, Math.min(1, remaining / total));
  const seconds = Math.ceil(remaining);
  const stroke = fraction > 0.5 ? "stroke-leaf-500" : fraction > 0.25 ? "stroke-primary-500" : "stroke-secondary-500";
  const text = fraction > 0.5 ? "text-leaf-700" : fraction > 0.25 ? "text-primary-700" : "text-secondary-600";

  return (
    <div
      role="timer"
      aria-label={`باقي ${toAr(seconds)} ثانية`}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 68 68" width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx="34" cy="34" r={RADIUS} fill="none" strokeWidth="6" className="qz-ring-track" />
        <circle
          cx="34"
          cy="34"
          r={RADIUS}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={`${stroke} transition-colors duration-500`}
          style={{
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: CIRCUMFERENCE * (1 - fraction),
            transition: frozen ? "stroke 0.5s" : "stroke-dashoffset 0.12s linear, stroke 0.5s",
          }}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-heading text-xl font-bold ${text} ${
          !frozen && fraction <= 0.25 && fraction > 0 ? "qz-beat" : ""
        }`}
      >
        {toAr(seconds)}
      </span>
    </div>
  );
}
