import type { ReactNode } from "react";
import Deco from "@/components/brand/Deco";
import { categoryById, tones, type CategoryId, type ToneId } from "@/data/brand";

type ChapterHeaderProps = {
  category?: CategoryId;
  icon?: string;
  tone?: ToneId;
  title: string;
  line?: string;
  /** a character or controls placed at the far end of the header */
  aside?: ReactNode;
  /** set on dark / brand-colour sections so the type turns cream */
  onDark?: boolean;
  children?: ReactNode;
  className?: string;
};

/**
 * Header of every home chapter, in the language of «اختر بابًا»: a small arch-shaped door in the chapter's colour
 * holding the icon, a large Readex title, a hand-drawn line that draws itself, and one short warm sentence.
 */
export default function ChapterHeader({ category, icon, tone, title, line, aside, onDark = false, children, className = "" }: ChapterHeaderProps) {
  const cat = category ? categoryById(category) : undefined;
  const t = tones[tone ?? cat?.tone ?? "primary"];
  const glyph = icon ?? cat?.icon ?? "ri-star-fill";

  return (
    <header className={`mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="flex items-start gap-4 md:gap-5">
        <span
          aria-hidden="true"
          data-pop
          className={`inline-flex h-[4.75rem] w-14 shrink-0 items-center justify-center rounded-b-2xl rounded-t-[999px] pt-2 text-3xl shadow-[0_6px_0_rgb(31_42_92/0.18)] md:h-24 md:w-[4.5rem] md:text-4xl ${t.solid}`}
        >
          <i className={glyph} />
        </span>
        <div className="min-w-0">
          <h2 className={`text-3xl font-bold leading-tight md:text-5xl ${onDark ? "!text-background-50" : ""}`}>{title}</h2>
          <span className="relative mt-2 block h-3 w-28 md:w-36" style={{ color: t.hex }}>
            <Deco kind="squiggle" data-draw className="inset-0 h-full w-full" />
          </span>
          {line ? (
            <p className={`mt-3 max-w-xl text-base leading-relaxed md:text-lg ${onDark ? "text-background-100/85" : "text-foreground-600"}`}>{line}</p>
          ) : null}
          {children}
        </div>
      </div>
      {aside}
    </header>
  );
}
