import type { ReactNode } from "react";
import Deco from "@/components/brand/Deco";
import { categoryById, tones, type CategoryId, type ToneId } from "@/data/brand";

type ChapterHeaderProps = {
  category?: CategoryId;
  icon?: string;
  /** artwork shown in place of the glyph door (classic variant only) */
  image?: string;
  tone?: ToneId;
  title: string;
  line?: string;
  /** a character or controls placed at the far end of the header */
  aside?: ReactNode;
  /** set on dark / brand-colour sections so the type turns cream */
  onDark?: boolean;
  /** "bubble": the title sits in a cream speech bubble, as in «اختر بابًا» (for the night sections) */
  variant?: "classic" | "bubble";
  children?: ReactNode;
  className?: string;
};

/**
 * Header of every home chapter, in the language of «اختر بابًا»: a small arch-shaped door in the chapter's colour
 * holding the icon (with its own glow and gloss), a large Readex title, a hand-drawn line that draws itself, and
 * one short warm sentence. The "bubble" variant puts the title in the same cream speech bubble as the doors.
 */
export default function ChapterHeader({ category, icon, image, tone, title, line, aside, onDark = false, variant = "classic", children, className = "" }: ChapterHeaderProps) {
  const cat = category ? categoryById(category) : undefined;
  const t = tones[tone ?? cat?.tone ?? "primary"];
  const glyph = icon ?? cat?.icon ?? "ri-star-fill";

  /* a supplied emblem stands in for the glyph (the door's own artwork, used as it is, without the saffron arch behind it) */
  const art = image ?? (category === "surahs" ? "/brand/surahs-emblem.webp" : undefined);
  const door = art ? (
    <span aria-hidden="true" data-pop className="relative inline-flex h-24 w-[4.6rem] shrink-0 items-center justify-center md:h-28 md:w-[5.4rem]" style={{ filter: "drop-shadow(0 10px 14px rgb(0 0 0 / .35))" }}>
      <img src={art} alt="" draggable={false} className="h-full w-full object-contain" />
    </span>
  ) : (
    <span
      aria-hidden="true"
      data-pop
      className={`relative inline-flex h-[4.75rem] w-14 shrink-0 items-center justify-center overflow-hidden rounded-b-2xl rounded-t-[999px] pt-2 text-3xl shadow-[0_6px_0_rgb(31_42_92/0.18),0_14px_26px_-10px_var(--glow)] md:h-24 md:w-[4.5rem] md:text-4xl ${t.solid}`}
      style={{ ["--glow" as string]: `${t.hex}aa` }}
    >
      <span className="pointer-events-none absolute inset-x-2 top-1.5 h-1/3 rounded-t-[999px] bg-white/30" />
      <i className={`relative ${glyph}`} />
    </span>
  );

  if (variant === "bubble") {
    return (
      <header className={`relative mb-10 flex flex-col items-center gap-4 text-center md:mb-14 ${className}`}>
        <div className="flex items-center justify-center gap-3 md:gap-4">
          <span
            aria-hidden="true"
            data-pop
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-[0_6px_0_rgb(0_0_0/0.18),0_12px_24px_-8px_var(--glow)] md:h-14 md:w-14 md:text-3xl ${t.solid}`}
            style={{ ["--glow" as string]: `${t.hex}aa` }}
          >
            <i className={glyph} />
          </span>
          <h2 className="relative rounded-[2rem] bg-background-50 px-6 py-2 font-heading text-3xl font-bold leading-tight !text-foreground-900 shadow-[0_6px_0_rgb(0_0_0/0.12),0_24px_34px_-14px_rgb(0_0_30/0.6)] md:px-10 md:py-3 md:text-5xl">
            {title}
            <span aria-hidden="true" className="absolute -bottom-2 start-8 h-5 w-5 rotate-45 rounded-[3px] bg-background-50" />
          </h2>
        </div>
        {line ? <p className={`max-w-xl text-base leading-relaxed md:text-lg ${onDark ? "text-background-100/85" : "text-foreground-600"}`}>{line}</p> : null}
        {children}
        {aside ? <div className="md:absolute md:end-0 md:top-1/2 md:-translate-y-1/2">{aside}</div> : null}
      </header>
    );
  }

  return (
    <header className={`mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="flex items-start gap-4 md:gap-5">
        {door}
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
