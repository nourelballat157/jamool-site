import { useMemo } from "react";

/**
 * The seam between two sections. Place it as the LAST child of the upper section; it is absolutely positioned
 * on that section's bottom edge and painted in the colour of the section BELOW (pass it as a text colour:
 * `text-background-50`, `text-violet-50`, `text-accent-800` ...), so the next section appears to rise into this one.
 *
 *   dunes    two soft dunes that drift sideways while you scroll   (calm → calm)
 *   arches   a row of door silhouettes, the «اختر بابًا» shape      (use out of dark sections)
 *   scallop  a string of round lantern bumps                        (playful → calm)
 *   zigzag   the najdi peaks                                        (heritage, sparing)
 */
type Variant = "dunes" | "arches" | "scallop" | "zigzag";

const W = 1440; // one tile; the svg holds two so it can drift without gaps

function tilePath(variant: Variant): string {
  const parts: string[] = [];
  for (let rep = 0; rep < 2; rep++) {
    const o = rep * W;
    if (variant === "dunes") {
      parts.push(`M${o} 80V40C${o + 240} 4 ${o + 480} 4 ${o + 720} 40S${o + 1200} 76 ${o + 1440} 40V80z`);
    } else if (variant === "arches") {
      // 12 doors per tile, 120 wide: 72 wide arch, 24 gap each side
      for (let i = 0; i < 12; i++) {
        const x = o + i * 120 + 24;
        parts.push(`M${x} 80V50a36 36 0 0 1 72 0V80z`);
      }
      parts.push(`M${o} 80V72H${o + W}V80z`);
    } else if (variant === "scallop") {
      // 24 bumps per tile, 60 wide
      for (let i = 0; i < 24; i++) {
        const x = o + i * 60;
        parts.push(`M${x} 80V50a30 30 0 0 1 60 0V80z`);
      }
    } else {
      let d = `M${o} 80V60`;
      for (let i = 0; i < 24; i++) d += `l30 -22 l30 22`;
      d += "V80z";
      parts.push(d);
    }
  }
  return parts.join("");
}

export default function SectionBridge({ variant = "dunes", className = "" }: { variant?: Variant; className?: string }) {
  const front = useMemo(() => tilePath(variant), [variant]);
  const back = useMemo(() => (variant === "dunes" ? tilePath("dunes") : ""), [variant]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-[-1px] z-10 h-10 overflow-hidden md:h-16 ${className}`}
    >
      {variant === "dunes" ? (
        <svg
          data-bridge="0.6"
          viewBox={`0 0 ${W * 2} 80`}
          preserveAspectRatio="none"
          className="absolute bottom-0 end-0 h-full w-[200%] opacity-45"
        >
          <path d={back} fill="currentColor" />
        </svg>
      ) : null}
      <svg data-bridge="1" viewBox={`0 0 ${W * 2} 80`} preserveAspectRatio="none" className="absolute bottom-0 end-0 h-full w-[200%]">
        <path d={front} fill="currentColor" />
      </svg>
    </div>
  );
}
