import { characters, type CharacterId } from "@/data/brand";

type Motion = "still" | "float" | "wave" | "cheer";

type CharacterProps = {
  name: CharacterId;
  /** height of the figure; width follows the artwork ratio */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  motion?: Motion;
  /** use the 360px artwork (avatars, chips) instead of the 900px one */
  small?: boolean;
  /** mirror the figure so it looks toward the content */
  flip?: boolean;
  /** decorative figures are hidden from screen readers */
  decorative?: boolean;
  className?: string;
  priority?: boolean;
};

const HEIGHTS: Record<NonNullable<CharacterProps["size"]>, string> = {
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
  wave: "motion-safe:animate-jamool-wave origin-bottom",
  cheer: "motion-safe:animate-jamool-cheer",
};

/** One official character from the Jamool cast. Always the original artwork, never redrawn. */
export default function Character({
  name,
  size = "md",
  motion = "still",
  small = false,
  flip = false,
  decorative = false,
  className = "",
  priority = false,
}: CharacterProps) {
  const c = characters[name];
  const h = small ? 360 : 900;
  return (
    <img
      src={small ? c.small : c.src}
      alt={decorative ? "" : `${c.name}، ${c.role}`}
      aria-hidden={decorative ? true : undefined}
      width={Math.round(h * c.ratio)}
      height={h}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={`w-auto max-w-none select-none object-contain ${HEIGHTS[size]} ${MOTIONS[motion]} ${flip ? "-scale-x-100" : ""} ${className}`}
    />
  );
}
