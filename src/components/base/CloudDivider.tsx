type CloudDividerProps = {
  /** CSS variable (space-separated oklch channels) of the section the dune belongs to */
  colorVar?: string;
  position?: "top" | "bottom";
  className?: string;
};

/**
 * A calm, low dune line that gently lifts a section above the previous one (replaces the old cloud scallops).
 * Same props as before so existing call sites keep working.
 */
export default function CloudDivider({
  colorVar = "--background-50",
  position = "top",
  className = "",
}: CloudDividerProps) {
  const isTop = position === "top";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-10 h-6 md:h-10 ${isTop ? "bottom-full" : "top-full -scale-y-100"} ${className}`}
    >
      <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="block h-full w-full" style={{ color: `oklch(var(${colorVar}))` }}>
        <path d="M0 40V24C60 8 110 4 170 15s120 18 170 4c25-7 45-10 60-9v26z" fill="currentColor" />
      </svg>
    </div>
  );
}
