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

/** The open mushaf on its carved stand: the artwork that stands in for a character on the Quran pages. */
export default function MushafArt({ size = "md", motion = "still", decorative = false, priority = false, className = "" }: MushafArtProps) {
  return (
    <img
      src="/brand/quran-mushaf.webp"
      alt={decorative ? "" : "المصحف الشريف"}
      aria-hidden={decorative ? true : undefined}
      width={703}
      height={760}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={`w-auto max-w-none select-none object-contain drop-shadow-[0_14px_14px_rgba(80,40,0,0.3)] ${HEIGHTS[size]} ${MOTIONS[motion]} ${className}`}
    />
  );
}
