/**
 * Jamool's small shape vocabulary: the same few forms everywhere, always in identity colours.
 * Colour comes from the text colour (use text-primary-400, text-accent-500 ...), size from the class.
 *
 *   arch     the door of «اختر بابًا»   (use as a flat backdrop behind a character)
 *   sparkle  four-point star            (joy, discovery)
 *   ring     thin dashed circle         (orbit, slow rotation)
 *   dots     3×3 dot grid               (rhythm, texture)
 *   squiggle hand-drawn wave line       (play, underline)
 *   diamond  rounded sadu diamond       (heritage accent)
 *   crescent moon                       (night / Quran moments)
 *
 * Motion hooks (handled by MotionLayer, all optional):
 *   data-drift="24"   slow vertical parallax while the page scrolls
 *   data-pop          springs in the first time it enters the screen
 *   data-draw         strokes draw themselves in (squiggle / ring)
 */
type Kind = "arch" | "sparkle" | "ring" | "dots" | "squiggle" | "diamond" | "crescent";

export default function Deco({ kind, className = "", ...rest }: { kind: Kind; className?: string } & Record<`data-${string}`, string | boolean | undefined>) {
  const common = { "aria-hidden": true, focusable: false, className: `pointer-events-none absolute block ${className}`, ...rest } as const;

  switch (kind) {
    case "arch":
      return (
        <svg viewBox="0 0 100 130" {...common}>
          <path d="M0 130V50a50 50 0 0 1 100 0v80z" fill="currentColor" />
        </svg>
      );
    case "sparkle":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 0c.9 6.4 4.6 10.1 12 12-7.4 1.9-11.1 5.6-12 12-.9-6.4-4.6-10.1-12-12C7.4 10.1 11.1 6.4 12 0z" fill="currentColor" />
        </svg>
      );
    case "ring":
      return (
        <svg viewBox="0 0 100 100" {...common}>
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      );
    case "dots":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          {[8, 24, 40].flatMap((y) => [8, 24, 40].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="currentColor" />))}
        </svg>
      );
    case "squiggle":
      return (
        <svg viewBox="0 0 120 16" preserveAspectRatio="none" {...common}>
          <path d="M3 9c10-9 17 9 27 0s17 9 27 0 17 9 27 0 17 9 33 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 40 40" {...common}>
          <path d="M20 3 37 20 20 37 3 20z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          <path d="M20 14.5 25.5 20 20 25.5 14.5 20z" fill="currentColor" />
        </svg>
      );
    case "crescent":
      return (
        <svg viewBox="0 0 40 40" {...common}>
          <path d="M26 3a17 17 0 1 0 11 29A14 14 0 0 1 26 3z" fill="currentColor" />
        </svg>
      );
  }
}
