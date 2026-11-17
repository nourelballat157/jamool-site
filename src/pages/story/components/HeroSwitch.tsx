type HeroSwitchProps = {
  on: boolean;
  onToggle: () => void;
  childName: string;
};

/** "اجعلني بطل القصة": replaces the hero's name with the active child's name. */
export default function HeroSwitch({ on, onToggle, childName }: HeroSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`inline-flex min-h-[2.75rem] items-center gap-3 rounded-full py-1 ps-2 pe-4 text-sm font-bold transition-colors cursor-pointer ${
        on
          ? "bg-violet-600 text-background-50 hover:bg-violet-700"
          : "bg-background-50 text-foreground-700 ring-1 ring-violet-200 hover:bg-violet-50"
      }`}
    >
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          on ? "bg-background-50/35" : "bg-background-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-background-50 transition-all duration-300 ${
            on ? "start-6" : "start-1"
          }`}
        />
      </span>
      <i className="ri-user-star-line text-lg" />
      <span className="text-start">{on ? `البطل الآن: ${childName}` : "اجعلني بطل القصة"}</span>
    </button>
  );
}
