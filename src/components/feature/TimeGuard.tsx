import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useProgress, { addMinute, grantExtraMinutes, minutesLeft } from "@/store/progress";
import CategoryTile from "@/components/brand/CategoryTile";

/**
 * Counts the minutes a child spends here (only while the tab is visible) and,
 * when the parent set a daily limit, gently stops the session at the end of
 * the time. A parent PIN gives a few extra minutes for the day.
 */
export default function TimeGuard() {
  const { state } = useProgress();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") addMinute(1);
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const left = minutesLeft();
  const locked = left !== null && left <= 0;

  useEffect(() => {
    if (!locked) {
      setPin("");
      setError("");
      setOpen(false);
    }
  }, [locked]);

  if (!locked) return null;

  const extend = () => {
    if (pin === state.settings.pin) {
      grantExtraMinutes(15);
    } else {
      setError("الرمز غير صحيح");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-background-50/95 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="انتهى وقت اليوم"
    >
      <div className="card animate-celebrate-pop w-full max-w-md bg-accent-50 p-6 text-center md:p-8">
        <CategoryTile icon="ri-moon-clear-line" tone="accent" size="lg" className="mx-auto" />
        <h2 className="mt-5 font-heading text-2xl font-bold text-foreground-900">انتهى وقت اليوم</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-foreground-600">
          أحسنت اليوم! حفظنا مكانك، وتكمل من هنا في المرة القادمة. يمكنك أن تطلب وقتًا إضافيًا من ولي أمرك.
        </p>

        {open ? (
          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              extend();
            }}
          >
            <label className="block text-xs font-bold text-foreground-700" htmlFor="parent-pin">
              رمز ولي الأمر
            </label>
            <input
              id="parent-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className="mx-auto mt-2 block h-12 w-40 rounded-full border-2 border-background-300 bg-background-50 text-center text-lg font-bold tracking-[0.5em] text-foreground-900 transition-colors focus:border-accent-500"
            />
            {error ? (
              <p role="alert" className="mt-2 text-xs font-bold text-secondary-700">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn btn-primary mt-4">
              <i className="ri-time-line" />
              أضف ١٥ دقيقة
            </button>
          </form>
        ) : (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="btn btn-primary">
              <i className="ri-lock-line" />
              وقت إضافي (ولي الأمر)
            </button>
            <Link to="/parent" className="btn btn-ghost">
              لوحة ولي الأمر
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
