/** The eight-pointed star that carries a surah's number in the mushaf (the rub el hizb), drawn in a soft tone. */
const STAR = "50,3 60.5,22.5 82,17.5 77.5,39.5 97,50 77.5,60.5 82,82.5 60.5,77.5 50,97 39.5,77.5 17.5,82.5 22.5,60.5 3,50 22.5,39.5 17.5,17.5 39.5,22.5";

const SIZES = {
  sm: "h-[2.9rem] w-[2.9rem] text-[0.8rem]",
  md: "h-[3.4rem] w-[3.4rem] text-[0.9rem]",
  lg: "h-16 w-16 text-base",
};

export default function StarBadge({
  label,
  color = "#1E9E96",
  size = "md",
  spin = true,
  className = "",
}: {
  label: string;
  color?: string;
  size?: keyof typeof SIZES;
  /** turn a quarter-step when the surrounding `group` is hovered */
  spin?: boolean;
  className?: string;
}) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${SIZES[size]} ${className}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={`absolute inset-0 h-full w-full ${spin ? "transition-transform duration-700 ease-out group-hover:rotate-[22.5deg]" : ""}`}>
        <polygon points={STAR} fill="#fff" stroke={color} strokeWidth="4" strokeLinejoin="round" />
        <polygon points={STAR} fill={`${color}14`} stroke={color} strokeOpacity=".4" strokeWidth="1.6" strokeLinejoin="round" style={{ transformOrigin: "50% 50%", transform: "scale(.72)" }} />
      </svg>
      <span className="relative font-heading font-bold leading-none tabular-nums" style={{ color }}>
        {label}
      </span>
    </span>
  );
}
