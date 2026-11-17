/**
 * The official Jamool logo. Never stretched, recoloured or redrawn.
 * The artwork carries its own navy badge, so one file works on light and dark grounds;
 * keep a clear space of at least a quarter of its height around it.
 */
export default function Logo({
  className = "h-12",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src="/brand/jamool-logo.webp"
      alt="شعار جمّول"
      width={961}
      height={900}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={`w-auto select-none object-contain ${className}`}
    />
  );
}

/** The owning organisation's mark (الجمعية الأهلية الصالحية بعنيزة), shown on institutional surfaces. */
export function OwnerMark({ className = "h-12" }: { className?: string }) {
  return (
    <img
      src="/brand/owner-logo.webp"
      alt="شعار الجمعية الأهلية الصالحية بعنيزة"
      width={585}
      height={559}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`w-auto select-none object-contain ${className}`}
    />
  );
}
