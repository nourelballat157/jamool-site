import { useSound } from "@/components/feature/SoundProvider";

/**
 * The single global Sound On/Off control, reused everywhere consistently.
 */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const { soundOn, toggle } = useSound();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={soundOn ? "إيقاف الصوت" : "تشغيل الصوت"}
      aria-pressed={soundOn}
      title={soundOn ? "الصوت مفعّل" : "الصوت مغلق"}
      className={`btn-icon shrink-0 text-xl ${soundOn ? "text-foreground-900" : "text-foreground-400"} ${className}`}
    >
      <i className={soundOn ? "ri-volume-up-line" : "ri-volume-mute-line"} />
    </button>
  );
}
