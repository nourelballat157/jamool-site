type Motion = "still" | "float" | "cheer";

type MushafArtProps = {
  /** height of the picture; the width follows the 4:5 artwork (same scale as Character, plus "hero" for page headers) */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "hero";
  motion?: Motion;
  /** a small «القرآن الكريم» plaque across the bottom of the arch */
  label?: boolean;
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
  hero: "h-[15.5rem] md:h-[17.5rem] lg:h-[21.5rem]",
};

const MOTIONS: Record<Motion, string> = {
  still: "",
  float: "motion-safe:animate-floaty",
  cheer: "motion-safe:animate-jamool-cheer",
};

/** The green Quran on its carved stand in a quiet room, cut into an arch: stands in for a character on the Quran pages. */
export default function MushafArt({ size = "md", motion = "still", label = false, decorative = false, priority = false, className = "" }: MushafArtProps) {
  return (
    <span
      className={`relative inline-block aspect-[4/5] shrink-0 overflow-hidden rounded-b-[1.1rem] rounded-t-[999px] bg-[#2F8FA0] shadow-[0_10px_0_rgb(0_0_0/0.16),0_24px_36px_-18px_rgb(40_30_0/0.55)] ring-2 ring-[#FFE08A]/80 ${HEIGHTS[size]} ${MOTIONS[motion]} ${className}`}
    >
      <img
        src="/brand/quran-cover.webp"
        alt={decorative ? "" : "المصحف الشريف على حامل خشبي"}
        aria-hidden={decorative ? true : undefined}
        width={760}
        height={950}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
      {label ? (
        <span className="absolute inset-x-3 bottom-3 rounded-full bg-white px-3 py-1.5 ring-1 ring-[#E3B94A] text-center font-heading text-sm font-bold text-[#0E5A49] shadow-md md:text-base">
          القرآن الكريم
        </span>
      ) : null}
    </span>
  );
}
