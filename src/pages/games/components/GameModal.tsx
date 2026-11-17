import type { ReactNode } from "react";
import CategoryTile from "@/components/brand/CategoryTile";

type GameModalProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  soundOn?: boolean;
  onToggleSound?: () => void;
  children: ReactNode;
};

export default function GameModal({
  title,
  subtitle,
  onClose,
  soundOn = true,
  onToggleSound,
  children,
}: GameModalProps) {
  return (
    <div data-sound="off" className="fixed inset-0 z-[70] flex items-center justify-center px-3 py-4 md:px-4 md:py-6">
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-pointer bg-foreground-950/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card relative z-10 max-h-[92vh] w-full max-w-lg animate-rise-in overflow-y-auto p-4 md:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <CategoryTile category="games" size="sm" solid className="mt-0.5" />
            <div className="min-w-0">
              <h3 className="font-heading text-lg font-bold leading-snug text-foreground-900 md:text-xl">{title}</h3>
              {subtitle ? <p className="mt-1 text-sm leading-relaxed text-foreground-600">{subtitle}</p> : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onToggleSound ? (
              <button
                type="button"
                onClick={onToggleSound}
                aria-label={soundOn ? "إيقاف الصوت" : "تشغيل الصوت"}
                aria-pressed={soundOn}
                className={`btn-icon ${soundOn ? "!bg-primary-100 !text-primary-800" : ""}`}
              >
                <i className={`text-xl ${soundOn ? "ri-volume-up-line" : "ri-volume-mute-line"}`} />
              </button>
            ) : null}
            <button type="button" onClick={onClose} aria-label="إغلاق" className="btn-icon">
              <i className="ri-close-line text-xl" />
            </button>
          </div>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
