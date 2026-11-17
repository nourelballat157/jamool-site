/**
 * A thin dune wave that closes a chapter. Pass the text colour of the NEXT section
 * (e.g. "text-background-50") so the wave melts into it.
 */
export default function ChapterWave({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 bottom-0 block h-5 w-full md:h-8 ${className}`}
    >
      <path d="M0 48V30C180 6 300 6 480 26s300 20 480 0 300-20 480 4V48z" fill="currentColor" />
    </svg>
  );
}
