import { categoryById, tones, type CategoryId, type ToneId } from "@/data/brand";

type CategoryTileProps = {
  category?: CategoryId;
  /** use a raw icon + tone when the item is not one of the nine categories */
  icon?: string;
  tone?: ToneId;
  size?: "sm" | "md" | "lg";
  /** solid fill (selected / featured) instead of the soft tint */
  solid?: boolean;
  className?: string;
};

const SIZES = {
  sm: "h-9 w-9 rounded-xl text-xl",
  md: "h-12 w-12 rounded-2xl text-2xl",
  lg: "h-16 w-16 rounded-[1.35rem] text-3xl",
};

/**
 * The single icon treatment of the product: a Material Symbols Rounded glyph on a tinted rounded tile,
 * one colour role per category (brand identity, page 13).
 */
export default function CategoryTile({ category, icon, tone, size = "md", solid = false, className = "" }: CategoryTileProps) {
  const cat = category ? categoryById(category) : undefined;
  const t = tones[tone ?? cat?.tone ?? "primary"];
  const glyph = icon ?? cat?.icon ?? "ri-star-fill";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${SIZES[size]} ${solid ? t.solid : t.tile} ${className}`}
    >
      <i className={glyph} />
    </span>
  );
}
