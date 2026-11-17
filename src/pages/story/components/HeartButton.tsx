type HeartButtonProps = {
  active: boolean;
  onToggle: () => void;
  /** show the word "المفضلة" next to the heart */
  withLabel?: boolean;
};

/** Favourite toggle, styled like the heart button on the stories cards. */
export default function HeartButton({ active, onToggle, withLabel = false }: HeartButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? "أزل من المفضلة" : "أضف إلى المفضلة"}
      className={`inline-flex h-11 min-w-[2.75rem] items-center justify-center gap-2 rounded-full transition-colors cursor-pointer ${
        withLabel ? "px-5 text-sm font-bold" : "w-11"
      } ${
        active
          ? "bg-violet-600 text-background-50 hover:bg-violet-700"
          : "bg-violet-50 text-violet-600 hover:bg-violet-100"
      }`}
    >
      <i
        key={active ? "on" : "off"}
        className={`text-xl ${active ? "ri-heart-fill story-heart-pop" : "ri-heart-line"}`}
      />
      {withLabel ? (active ? "في المفضلة" : "أضف للمفضلة") : null}
    </button>
  );
}
