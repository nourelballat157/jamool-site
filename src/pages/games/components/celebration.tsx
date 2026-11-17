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
import Character from "@/components/brand/Character";

type CelebrationContextValue = { celebrate: () => void };

const noop = () => {};

const CelebrationContext = createContext<CelebrationContextValue>({ celebrate: noop });

const PHRASES = [
  "أحسنت! أنت بطل حقيقي",
  "رائع! استمرّ هكذا",
  "ممتاز! تفكيرك سريع",
  "مبدع! نحن فخورون بك",
  "يا سلام! شغلك جميل",
  "برافو! عقلك يعمل جيدًا",
  "تحفة! كمّل بنفس الحماس",
];

/** a tasteful palette: saffron and coral only (same two tones as the games world) */
const CONFETTI_COLORS = ["bg-primary-400", "bg-secondary-400", "bg-primary-600", "bg-secondary-300"];
type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  round: boolean;
};

const buildPieces = (): Piece[] =>
  Array.from({ length: 30 }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.6 + Math.random() * 1.8,
    size: 8 + Math.random() * 10,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    round: Math.random() > 0.5,
  }));

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [phrase, setPhrase] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);
  const piecesRef = useRef<Piece[]>([]);
  const timerRef = useRef<number | null>(null);

  const celebrate = useCallback(() => {
    piecesRef.current = buildPieces();
    setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    setRunId((value) => value + 1);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setPhrase(null), 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo(() => ({ celebrate }), [celebrate]);

  return (
    <CelebrationContext.Provider value={value}>
      {children}
      {phrase ? (
        <div key={runId} className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
          {piecesRef.current.map((piece) => (
            <span
              key={piece.id}
              aria-hidden="true"
              className={`absolute top-0 hidden motion-safe:block motion-safe:animate-confetti-fall ${piece.color} ${
                piece.round ? "rounded-full" : "rounded-[2px]"
              }`}
              style={{
                left: `${piece.left}%`,
                width: `${piece.size}px`,
                height: `${piece.size * (piece.round ? 1 : 1.7)}px`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              }}
            />
          ))}

          <div role="status" className="absolute inset-x-4 top-[14%] flex justify-center">
            <div className="card animate-celebrate-pop flex max-w-sm flex-col items-center gap-2 bg-background-50 px-8 pb-5 pt-4 text-center">
              <Character name="thaloob" size="md" motion="cheer" decorative small />
              <span className="flex items-center gap-1.5 text-2xl text-primary-500" aria-hidden="true">
                <i className="ri-star-fill" />
                <i className="ri-star-fill text-3xl" />
                <i className="ri-star-fill" />
              </span>
              <p className="font-heading text-xl font-bold text-foreground-900 md:text-2xl">{phrase}</p>
            </div>
          </div>
        </div>
      ) : null}
    </CelebrationContext.Provider>
  );
}

export function useCelebration(): CelebrationContextValue {
  return useContext(CelebrationContext);
}