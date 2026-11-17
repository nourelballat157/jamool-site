import { tones, type ToneId } from "@/data/brand";

/** Every badge in the product is drawn the same way: a medal with a category colour and one glyph. */
const BADGES: Record<string, { icon: string; tone: ToneId }> = {
  "first-step": { icon: "ri-footprint-line", tone: "primary" },
  "story-lover": { icon: "ri-book-open-line", tone: "violet" },
  "letter-explorer": { icon: "ri-compass-3-line", tone: "sky" },
  "alphabet-star": { icon: "ri-text", tone: "sky" },
  "game-master": { icon: "ri-gamepad-line", tone: "secondary" },
  "quiz-champ": { icon: "ri-trophy-line", tone: "primary" },
  "value-bloom": { icon: "ri-plant-line", tone: "leaf" },
  "young-artist": { icon: "ri-palette-line", tone: "amber" },
  hafiz: { icon: "ri-book-2-line", tone: "accent" },
  listener: { icon: "ri-headphone-line", tone: "accent" },
  "streak-3": { icon: "ri-fire-line", tone: "amber" },
  "streak-7": { icon: "ri-fire-line", tone: "secondary" },
};

const SIZE: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "h-14 w-14 text-2xl",
  md: "h-20 w-20 text-4xl",
  lg: "h-28 w-28 text-5xl",
  xl: "h-36 w-36 text-6xl",
};

export default function Medal({
  id,
  title,
  earned = true,
  size = "md",
  className = "",
}: {
  id: string;
  title?: string;
  earned?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const b = BADGES[id] ?? { icon: "ri-star-fill", tone: "primary" as ToneId };
  const t = tones[b.tone];
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ring-4 ring-offset-2 ring-offset-background-50 transition-colors ${SIZE[size]} ${
        earned ? `${t.solid} ${t.ring}` : "bg-background-200 text-background-500 ring-background-200"
      } ${className}`}
    >
      <span aria-hidden="true" className="absolute inset-[7%] rounded-full border-2 border-dashed border-white/55" />
      <i className={`relative ${b.icon}`} />
      {earned ? <i aria-hidden="true" className="ri-star-fill absolute -end-1 -top-1 text-[0.32em] text-primary-500 drop-shadow" /> : <i aria-hidden="true" className="ri-lock-line absolute -bottom-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-background-50 text-sm text-foreground-500" />}
    </span>
  );
}
