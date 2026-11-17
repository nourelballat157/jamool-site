import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { award, markVisit, type AwardResult, type BadgeDef } from "@/store/progress";
import { useSound } from "@/components/feature/SoundProvider";
import Character from "@/components/brand/Character";
import Medal from "@/components/brand/Medal";

type Toast = { id: number; text: string; points?: number; icon: string };

type RewardContextValue = {
  /** Give points once per `key`. Shows a soft toast (+points) and, when earned, a level-up / badge card. */
  earn: (key: string, points: number, label: string) => AwardResult;
  /** A small positive message with no points (for example "تم حفظ رسمتك"). */
  notify: (text: string, icon?: string) => void;
  /** Show the cards for badges / level that were earned by a store call made elsewhere. */
  announce: (result: AwardResult) => void;
};

const noop = () => ({ gained: 0, levelUp: null, badges: [] }) as AwardResult;

const RewardContext = createContext<RewardContextValue>({ earn: noop, notify: () => {}, announce: () => {} });

type Pop = { kind: "badge"; badge: BadgeDef } | { kind: "level"; level: number; name: string };

export function RewardProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [queue, setQueue] = useState<Pop[]>([]);
  const idRef = useRef(0);
  const { play } = useSound();

  useEffect(() => {
    markVisit();
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    idRef.current += 1;
    const id = idRef.current;
    setToasts((list) => [...list.slice(-2), { ...toast, id }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);

  const announce = useCallback((result: AwardResult) => {
    const pops: Pop[] = [];
    if (result.levelUp) pops.push({ kind: "level", level: result.levelUp.level, name: result.levelUp.name });
    result.badges.forEach((badge) => pops.push({ kind: "badge", badge }));
    if (pops.length) setQueue((q) => [...q, ...pops]);
  }, []);

  const earn = useCallback<RewardContextValue["earn"]>(
    (key, points, label) => {
      const result = award(key, points);
      if (result.gained > 0) {
        pushToast({ text: label, points: result.gained, icon: "ri-star-fill" });
        try {
          play(result.badges.length || result.levelUp ? "badge" : "correct");
        } catch {
          /* sound is optional */
        }
      }
      announce(result);
      return result;
    },
    [announce, play, pushToast]
  );

  const notify = useCallback<RewardContextValue["notify"]>(
    (text, icon = "ri-checkbox-circle-fill") => pushToast({ text, icon }),
    [pushToast]
  );

  const value = useMemo(() => ({ earn, notify, announce }), [earn, notify, announce]);
  const pop = queue[0];

  useEffect(() => {
    if (!pop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQueue((q) => q.slice(1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pop]);

  return (
    <RewardContext.Provider value={value}>
      {children}

      {/* soft toast: saffron star chip + short label + points */}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 end-4 start-4 z-[95] flex flex-col items-start gap-2 sm:end-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="card animate-rise-in flex max-w-full items-center gap-3 rounded-full py-2 pe-4 ps-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-lg text-foreground-900">
              <i className={toast.icon} />
            </span>
            <span className="min-w-0 truncate text-sm font-bold text-foreground-900">{toast.text}</span>
            {toast.points ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-bold text-primary-800">
                +{toast.points.toLocaleString("ar-EG")}
                <i className="ri-star-fill text-primary-500" />
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {/* reward pop: Jamool cheers once, then the medal / level, one clear action */}
      {pop ? (
        <div
          className="fixed inset-0 z-[96] flex items-center justify-center bg-foreground-950/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-label={pop.kind === "badge" ? "شارة جديدة" : "مستوى جديد"}
        >
          <div className="card animate-celebrate-pop flex max-h-[92vh] w-full max-w-sm flex-col items-center overflow-y-auto p-6 text-center">
            <Character name="jamool" size="sm" small motion="cheer" decorative />
            {pop.kind === "badge" ? (
              <>
                <Medal id={pop.badge.id} title={pop.badge.title} size="xl" className="mt-3" />
                <p className="mt-4 text-xs font-bold text-secondary-700">شارة جديدة!</p>
                <h3 className="mt-1 font-heading text-2xl font-bold text-foreground-900">{pop.badge.title}</h3>
                <p className="mt-1 text-sm font-medium text-foreground-600">{pop.badge.hint}</p>
              </>
            ) : (
              <>
                <span className="mt-3 flex h-24 w-24 items-center justify-center rounded-full bg-primary-500 font-heading text-5xl font-bold text-foreground-900 ring-4 ring-primary-200 ring-offset-2 ring-offset-background-50">
                  {pop.level.toLocaleString("ar-EG")}
                </span>
                <p className="mt-4 text-xs font-bold text-secondary-700">مستوى جديد!</p>
                <h3 className="mt-1 font-heading text-2xl font-bold text-foreground-900">{pop.name}</h3>
                <p className="mt-1 text-sm font-medium text-foreground-600">أحسنت! جمّول فخور بك، واصل رحلتك.</p>
              </>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={() => setQueue((q) => q.slice(1))} className="btn btn-primary btn-sm">
                <i className="ri-check-line" />
                رائع
              </button>
              <Link to="/room" onClick={() => setQueue([])} className="btn btn-ghost btn-sm">
                غرفتي
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </RewardContext.Provider>
  );
}

export function useRewards(): RewardContextValue {
  return useContext(RewardContext);
}
