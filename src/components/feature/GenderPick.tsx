import type { Gender } from "@/pages/story/components/parse";

/** "ولد / بنت": lets the story grammar (he / she) agree with the child. */
export default function GenderPick({ value, onChange }: { value: Gender; onChange: (g: Gender) => void }) {
  const options: { id: Gender; label: string; icon: string }[] = [
    { id: "f", label: "بنت", icon: "ri-women-line" },
    { id: "m", label: "ولد", icon: "ri-men-line" },
  ];
  return (
    <div>
      <p className="mt-4 text-xs font-bold text-foreground-700">أنا في القصص</p>
      <div role="group" aria-label="ولد أو بنت" className="mt-2 flex gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={`inline-flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-full border-2 px-5 text-sm font-bold transition-colors cursor-pointer sm:flex-none ${
              value === o.id ? "border-accent-500 bg-accent-100 text-accent-800" : "border-background-300 bg-background-50 text-foreground-700 hover:border-background-400"
            }`}
          >
            <i className={o.icon} />
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
