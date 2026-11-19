type Motion = "still" | "float" | "cheer";

type MushafArtProps = {
  /** height of the figure; the width follows the artwork ratio (same scale as Character) */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  motion?: Motion;
  /** decorative copies are hidden from screen readers */
  decorative?: boolean;
  priority?: boolean;
  className?: string;
};

const HEIGHTS: Record<NonNullable<MushafArtProps["size"]>, string> = {
  xs: "h-12",
  sm: "h-20",
  md: "h-32",
  lg: "h-44 md:h-52",
  xl: "h-60 md:h-72",
  "2xl": "h-72 md:h-96",
};

const MOTIONS: Record<Motion, string> = {
  still: "",
  float: "motion-safe:animate-floaty",
  cheer: "motion-safe:animate-jamool-cheer",
};

/**
 * «القرآن الكريم» written across the two open pages, laid on the same perspective as the artwork
 * (the right page falls to the right, the left page to the left). Scales with the image: same viewBox.
 */
export function MushafTitle() {
  const ink = "#0E5A49";
  const rule = "#C99A2E";
  return (
    <svg aria-hidden="true" viewBox="0 0 703 760" className="pointer-events-none absolute inset-0 h-full w-full">
      <g transform="translate(482 372) skewY(-21)">
        <text x="0" y="14" textAnchor="middle" fontSize="64" fontWeight="700" fill={ink} style={{ fontFamily: "var(--font-heading)" }}>القرآن</text>
        <path d="M-62 40H62" stroke={rule} strokeWidth="4" strokeLinecap="round" />
      </g>
      <g transform="translate(222 368) skewY(17)">
        <text x="0" y="14" textAnchor="middle" fontSize="64" fontWeight="700" fill={ink} style={{ fontFamily: "var(--font-heading)" }}>الكريم</text>
        <path d="M-62 40H62" stroke={rule} strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** The open mushaf on its carved stand, titled «القرآن الكريم»: the artwork that stands in for a character on the Quran pages. */
export default function MushafArt({ size = "md", motion = "still", decorative = false, priority = false, className = "" }: MushafArtProps) {
  return (
    <span className={`relative inline-block shrink-0 ${MOTIONS[motion]} ${className}`}>
      <img
        src="/brand/quran-mushaf.webp"
        alt={decorative ? "" : "المصحف الشريف: القرآن الكريم"}
        aria-hidden={decorative ? true : undefined}
        width={703}
        height={760}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={`block w-auto max-w-none select-none object-contain drop-shadow-[0_14px_14px_rgba(80,40,0,0.3)] ${HEIGHTS[size]}`}
      />
      <MushafTitle />
    </span>
  );
}
