import { useCallback, useEffect, useRef, type ReactNode } from "react";
import Character from "@/components/brand/Character";
import ProgressBar from "@/components/brand/ProgressBar";
import type { CharacterId } from "@/data/brand";
import useProgress from "@/store/progress";
import { GAME_PRESENTATION } from "@/pages/games/gameMeta";
import "./extraGames.css";

/** Western digits -> Arabic-Indic digits (٠١٢٣…) for numbers shown to children. */
export const toAr = (value: number | string): string =>
  String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

export const shuffleList = <T,>(items: readonly T[]): T[] => {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

/** setTimeout that is cleaned up automatically when the game closes. */
export function useLater() {
  const ids = useRef<number[]>([]);
  useEffect(() => {
    const pending = ids.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);
  return useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    ids.current.push(id);
    return id;
  }, []);
}

/** How many of the games the child has finished (used by the reward screens). */
export function useGamesProgress() {
  const { isDone } = useProgress();
  const ids = Object.keys(GAME_PRESENTATION);
  const finished = ids.filter((id) => isDone(`game:${id}`)).length;
  const total = ids.length;
  return { finished, total, pct: total === 0 ? 0 : Math.round((finished / total) * 100) };
}

type RoundBarProps = {
  icon: string;
  label: string;
  /** the round the child is on now (1-based) */
  round: number;
  total: number;
  /** how many rounds are already finished */
  done: number;
  unit?: string;
};

/** "round x of y" strip with the shared progress bar. */
export function RoundBar({ icon, label, round, total, done, unit = "الجولة" }: RoundBarProps) {
  const pct = Math.min(100, Math.round((done / total) * 100));
  return (
    <div className="rounded-3xl bg-secondary-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground-800">
          <i className={`${icon} text-secondary-600`} />
          {label}
        </span>
        <span className="whitespace-nowrap text-sm font-bold text-foreground-700">
          {unit} {toAr(Math.min(round, total))} من {toAr(total)}
        </span>
      </div>
      <ProgressBar
        value={pct}
        tone="secondary"
        height="h-2.5"
        label={`${unit} ${toAr(Math.min(round, total))} من ${toAr(total)}`}
        className="mt-2.5 !bg-background-50"
      />
    </div>
  );
}

type NoticeProps = {
  tone?: "good" | "again" | "info";
  text?: string | null;
};

const NOTICE_STYLE: Record<NonNullable<NoticeProps["tone"]>, { box: string; icon: string }> = {
  good: { box: "bg-leaf-50 text-leaf-800", icon: "ri-checkbox-circle-line" },
  again: { box: "bg-primary-50 text-primary-900", icon: "ri-lightbulb-flash-line" },
  info: { box: "bg-background-100 text-foreground-700", icon: "ri-information-line" },
};

/** Always-mounted live region so hints and cheers are announced and the layout never jumps. */
export function Notice({ tone = "info", text }: NoticeProps) {
  const style = NOTICE_STYLE[tone];
  return (
    <div aria-live="polite" role="status" className="min-h-[3.25rem]">
      {text ? (
        <p
          key={text}
          className={`animate-rise-in flex items-start gap-2 rounded-3xl p-3 text-sm font-bold leading-relaxed ${style.box}`}
        >
          <i className={`${style.icon} mt-0.5 text-lg`} />
          <span>{text}</span>
        </p>
      ) : null}
    </div>
  );
}

type RewardPanelProps = {
  title: string;
  text?: string;
  /** 1 to 3 saffron stars */
  stars?: 1 | 2 | 3;
  /** the character who cheers: Thaloob leads challenges, Jamool the gentle games */
  character?: Extract<CharacterId, "thaloob" | "jamool">;
  /** semantic level of the title (h4 inside a game dialog, h2 on a page) */
  heading?: "h2" | "h4";
  /** shown as a saffron points chip; pass null to hide the chip */
  gained?: number | null;
  /** the single progress bar of the screen */
  progress?: { value: number; label: string; caption?: string };
  children?: ReactNode;
};

/**
 * The ONE reward visual of games and quizzes: saffron stars + a cheering character + a progress bar.
 */
export function RewardPanel({ title, text, stars = 3, character = "thaloob", heading = "h4", gained, progress, children }: RewardPanelProps) {
  const Title = heading;
  return (
    <div className="animate-celebrate-pop flex flex-col items-center gap-3 rounded-3xl bg-primary-50 p-5 text-center">
      <Character name={character} size="md" motion="cheer" decorative />
      <span className="flex items-center gap-1.5 text-3xl" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <i
            key={n}
            className={`${n <= stars ? "ri-star-fill text-primary-500 motion-safe:animate-twinkle" : "ri-star-line text-background-400"} ${n === 2 ? "text-4xl" : ""}`}
            style={{ animationDelay: `${(n - 1) * 0.4}s` }}
          />
        ))}
      </span>
      <p className="sr-only">حصلت على {toAr(stars)} من ٣ نجوم</p>
      <Title className="font-heading text-xl font-bold text-foreground-900 md:text-2xl">{title}</Title>
      {text ? <p className="max-w-sm text-base leading-relaxed text-foreground-600">{text}</p> : null}
      {children}
      {gained !== undefined && gained !== null ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50 px-4 py-2 text-sm font-bold text-foreground-800">
          <i className="ri-star-fill text-primary-500" />
          {gained > 0 ? `حصلت على +${toAr(gained)} نقاط` : "سبق أن حصلت على نقاط هذه اللعبة — العب للمتعة!"}
        </span>
      ) : null}
      {progress ? (
        <div className="w-full max-w-xs">
          <ProgressBar value={progress.value} tone="primary" label={progress.label} className="!bg-background-50" />
          {progress.caption ? <p className="mt-1.5 text-xs font-medium text-foreground-600">{progress.caption}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

type FinishCardProps = {
  title: string;
  text: string;
  /** points gained now (0 when the star had already been earned) */
  gained: number;
  onAgain: () => void;
  againLabel?: string;
  character?: Extract<CharacterId, "thaloob" | "jamool">;
  children?: ReactNode;
};

export function FinishCard({ title, text, gained, onAgain, againLabel = "العب مرة أخرى", character = "thaloob", children }: FinishCardProps) {
  const games = useGamesProgress();
  return (
    <div className="flex flex-col gap-4">
      <RewardPanel
        title={title}
        text={text}
        gained={gained}
        character={character}
        progress={{
          value: games.pct,
          label: "الألعاب التي أنهيتها",
          caption: `أنهيت ${toAr(games.finished)} من ${toAr(games.total)} ألعاب`,
        }}
      >
        {children}
      </RewardPanel>
      <button type="button" onClick={onAgain} className="btn btn-primary w-full">
        <i className="ri-refresh-line" />
        {againLabel}
      </button>
    </div>
  );
}

/** Wide friendly "next" button (arrow points the RTL way). */
export function NextButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="btn btn-primary btn-lg animate-rise-in w-full">
      {children}
      <i className="ri-arrow-left-line" />
    </button>
  );
}

/** Restart / secondary action used by the simple games. */
export function RestartButton({ onClick, children = "ابدأ من جديد" }: { onClick: () => void; children?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="btn btn-ghost w-full">
      <i className="ri-refresh-line" />
      {children}
    </button>
  );
}

/** Score strip at the top of the simple games (a label on one side, a value on the other). */
export function StatBar({ icon, left, right }: { icon: string; left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl bg-secondary-50 px-4 py-3">
      <span className="flex items-center gap-2 text-sm font-bold text-foreground-800">
        <i className={`${icon} text-secondary-600`} />
        {left}
      </span>
      <span className="text-sm font-bold text-foreground-700">{right}</span>
    </div>
  );
}
