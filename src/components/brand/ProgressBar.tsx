import { tones, type ToneId } from "@/data/brand";

/** The single progress indicator of the product (stories, letters, surahs, values, levels, challenges). */
export default function ProgressBar({
  value,
  tone = "primary",
  label,
  height = "h-3",
  className = "",
}: {
  /** 0 to 100 */
  value: number;
  tone?: ToneId;
  /** accessible name, e.g. "تقدّمك في القصص" */
  label: string;
  height?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={`w-full overflow-hidden rounded-full bg-background-200 ${height} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${tones[tone].bar}`}
        style={{ width: `${Math.max(pct, pct > 0 ? 6 : 0)}%` }}
      />
    </div>
  );
}
