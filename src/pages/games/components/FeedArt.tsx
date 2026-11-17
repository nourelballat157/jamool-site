export type AnimalKind = "rabbit" | "cat" | "cow" | "bird";
export type FoodKind = "carrot" | "fish" | "grass" | "seeds";
export type Mood = "idle" | "happy" | "no";

const OUTLINE = "stroke-foreground-300";

function Eyes({ mood, y = 54, gap = 13 }: { mood: Mood; y?: number; gap?: number }) {
  const left = 50 - gap;
  const right = 50 + gap;
  if (mood === "happy") {
    return (
      <g className="stroke-foreground-900" strokeWidth="2.8" strokeLinecap="round" fill="none">
        <path d={`M${left - 4} ${y + 1} Q${left} ${y - 5} ${left + 4} ${y + 1}`} />
        <path d={`M${right - 4} ${y + 1} Q${right} ${y - 5} ${right + 4} ${y + 1}`} />
      </g>
    );
  }
  return (
    <g className="fill-foreground-900">
      <circle cx={left} cy={y} r="3.6" />
      <circle cx={right} cy={y} r="3.6" />
      <circle cx={left - 1.1} cy={y - 1.2} r="1.1" className="fill-background-50" />
      <circle cx={right - 1.1} cy={y - 1.2} r="1.1" className="fill-background-50" />
    </g>
  );
}

function Mouth({ mood, y = 68 }: { mood: Mood; y?: number }) {
  if (mood === "happy") {
    return <path d={`M42 ${y} Q50 ${y + 11} 58 ${y}Z`} className="fill-secondary-500 stroke-foreground-900" strokeWidth="1.8" strokeLinejoin="round" />;
  }
  if (mood === "no") {
    return <path d={`M43 ${y + 4} Q50 ${y - 1} 57 ${y + 4}`} className="stroke-foreground-900" strokeWidth="2.4" strokeLinecap="round" fill="none" />;
  }
  return <path d={`M43 ${y} Q50 ${y + 7} 57 ${y}`} className="stroke-foreground-900" strokeWidth="2.4" strokeLinecap="round" fill="none" />;
}

export function AnimalFace({ kind, mood = "idle", className = "h-20 w-20" }: { kind: AnimalKind; mood?: Mood; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" strokeWidth="2">
      {kind === "rabbit" ? (
        <>
          <ellipse cx="35" cy="26" rx="9" ry="22" className={`fill-background-50 ${OUTLINE}`} />
          <ellipse cx="65" cy="26" rx="9" ry="22" className={`fill-background-50 ${OUTLINE}`} />
          <ellipse cx="35" cy="28" rx="4.5" ry="15" className="fill-secondary-200" />
          <ellipse cx="65" cy="28" rx="4.5" ry="15" className="fill-secondary-200" />
          <circle cx="50" cy="60" r="31" className={`fill-background-50 ${OUTLINE}`} />
          <circle cx="32" cy="68" r="5.5" className="fill-secondary-200" />
          <circle cx="68" cy="68" r="5.5" className="fill-secondary-200" />
          <ellipse cx="50" cy="62" rx="4.2" ry="3.2" className="fill-secondary-400" />
          <Eyes mood={mood} y={54} />
          <Mouth mood={mood} y={69} />
        </>
      ) : null}
      {kind === "cat" ? (
        <>
          <polygon points="21,44 25,12 47,29" className={`fill-primary-300 ${OUTLINE}`} strokeLinejoin="round" />
          <polygon points="79,44 75,12 53,29" className={`fill-primary-300 ${OUTLINE}`} strokeLinejoin="round" />
          <polygon points="27,38 29,21 41,30" className="fill-secondary-200" />
          <polygon points="73,38 71,21 59,30" className="fill-secondary-200" />
          <circle cx="50" cy="58" r="31" className={`fill-primary-300 ${OUTLINE}`} />
          <path d="M44 30 V38 M50 28 V37 M56 30 V38" className="stroke-primary-600" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="32" cy="68" r="5.5" className="fill-secondary-200" />
          <circle cx="68" cy="68" r="5.5" className="fill-secondary-200" />
          <polygon points="46,62 54,62 50,67" className="fill-secondary-500" strokeLinejoin="round" />
          <path d="M20 60 L32 63 M20 69 L32 67 M80 60 L68 63 M80 69 L68 67" className="stroke-foreground-500" strokeWidth="1.6" strokeLinecap="round" />
          <Eyes mood={mood} y={52} />
          <Mouth mood={mood} y={69} />
        </>
      ) : null}
      {kind === "cow" ? (
        <>
          <ellipse cx="29" cy="26" rx="4.5" ry="9" transform="rotate(-18 29 26)" className="fill-background-300" />
          <ellipse cx="71" cy="26" rx="4.5" ry="9" transform="rotate(18 71 26)" className="fill-background-300" />
          <ellipse cx="14" cy="45" rx="11" ry="6.5" transform="rotate(-18 14 45)" className={`fill-background-100 ${OUTLINE}`} />
          <ellipse cx="86" cy="45" rx="11" ry="6.5" transform="rotate(18 86 45)" className={`fill-background-100 ${OUTLINE}`} />
          <rect x="22" y="26" width="56" height="62" rx="27" className={`fill-background-50 ${OUTLINE}`} />
          <circle cx="36" cy="40" r="10" className="fill-foreground-800" />
          <ellipse cx="50" cy="74" rx="21" ry="14" className="fill-secondary-200" />
          <ellipse cx="42" cy="75" rx="2.6" ry="3.4" className="fill-secondary-500" />
          <ellipse cx="58" cy="75" rx="2.6" ry="3.4" className="fill-secondary-500" />
          <Eyes mood={mood} y={52} gap={15} />
          {mood === "happy" ? (
            <path d="M43 83 Q50 89 57 83" className="stroke-foreground-900" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          ) : null}
        </>
      ) : null}
      {kind === "bird" ? (
        <>
          <path d="M50 24 Q46 12 40 14 M50 24 Q50 9 50 9 M50 24 Q56 12 62 14" className="stroke-primary-500" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="58" r="33" className={`fill-primary-300 ${OUTLINE}`} />
          <ellipse cx="50" cy="70" rx="20" ry="16" className="fill-primary-100" />
          <circle cx="30" cy="64" r="5.5" className="fill-secondary-200" />
          <circle cx="70" cy="64" r="5.5" className="fill-secondary-200" />
          <Eyes mood={mood} y={52} gap={14} />
          {mood === "happy" ? (
            <polygon points="42,61 58,61 50,76" className="fill-secondary-500" strokeLinejoin="round" />
          ) : (
            <polygon points="43,62 57,62 50,72" className="fill-secondary-500" strokeLinejoin="round" />
          )}
        </>
      ) : null}
    </svg>
  );
}

export function FoodArt({ kind, className = "h-12 w-12" }: { kind: FoodKind; className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true">
      {kind === "carrot" ? (
        <>
          <path d="M30 57 L16 24 Q30 14 44 24 Z" className="fill-primary-600" strokeLinejoin="round" />
          <path d="M22 30 H30 M30 38 H38 M26 46 H31" className="stroke-primary-800" strokeWidth="2" strokeLinecap="round" />
          <path d="M30 18 Q24 6 18 6 Q20 14 30 18Z" className="fill-leaf-500" />
          <path d="M30 18 Q30 4 30 2 Q34 10 30 18Z" className="fill-leaf-600" />
          <path d="M30 18 Q36 6 42 6 Q40 14 30 18Z" className="fill-leaf-500" />
        </>
      ) : null}
      {kind === "fish" ? (
        <>
          <polygon points="42,30 56,19 56,41" className="fill-secondary-500" strokeLinejoin="round" />
          <ellipse cx="26" cy="30" rx="19" ry="12" className="fill-secondary-300" />
          <path d="M20 19 Q26 12 33 19Z" className="fill-secondary-400" />
          <path d="M32 22 Q36 30 32 38" className="stroke-secondary-500" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="15" cy="27" r="2.6" className="fill-foreground-950" />
        </>
      ) : null}
      {kind === "grass" ? (
        <g className="stroke-leaf-500" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M30 54 Q28 34 16 14" />
          <path d="M30 54 Q31 30 30 8" className="stroke-leaf-600" />
          <path d="M30 54 Q34 34 46 14" />
          <path d="M30 54 Q22 42 10 36" className="stroke-leaf-400" />
          <path d="M30 54 Q38 42 50 36" className="stroke-leaf-400" />
        </g>
      ) : null}
      {kind === "seeds" ? (
        <>
          <path d="M8 50 Q30 30 52 50 Z" className="fill-primary-200" />
          <ellipse cx="22" cy="42" rx="4" ry="6" transform="rotate(-30 22 42)" className="fill-primary-700" />
          <ellipse cx="34" cy="37" rx="4" ry="6" transform="rotate(10 34 37)" className="fill-primary-800" />
          <ellipse cx="44" cy="44" rx="4" ry="6" transform="rotate(35 44 44)" className="fill-primary-700" />
          <ellipse cx="30" cy="47" rx="3.6" ry="5.4" transform="rotate(-8 30 47)" className="fill-primary-600" />
        </>
      ) : null}
    </svg>
  );
}

export function BowlArt({ level, fill, className = "h-16 w-24" }: { level: number; fill: string; className?: string }) {
  const uid = `bowl-${fill.replace(/[^a-z0-9]/gi, "")}-${Math.round(level * 100)}`;
  return (
    <svg viewBox="0 0 100 62" className={className} aria-hidden="true">
      <defs>
        <clipPath id={`${uid}-c`}>
          <path d="M12 22 H88 Q86 50 50 52 Q14 50 12 22 Z" />
        </clipPath>
      </defs>
      <path d="M12 22 H88 Q86 50 50 52 Q14 50 12 22 Z" className="fill-background-100" />
      <g clipPath={`url(#${uid}-c)`}>
        <rect
          x="0"
          y="20"
          width="100"
          height="34"
          className={fill}
          style={{ transform: `translateY(${(1 - level) * 32}px)`, transition: "transform .45s cubic-bezier(.34,1.4,.64,1)" }}
        />
      </g>
      <path d="M8 22 H92 Q90 58 50 58 Q10 58 8 22 Z" className="fill-none stroke-secondary-500" strokeWidth="4" strokeLinejoin="round" />
      <rect x="4" y="18" width="92" height="8" rx="4" className="fill-secondary-400" />
    </svg>
  );
}
