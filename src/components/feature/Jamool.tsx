import type { ReactNode } from "react";
import Character from "@/components/brand/Character";
import type { CharacterId } from "@/data/brand";

type FigureSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

type JamoolProps = {
  /** how Jamool moves: wave = greets, cheer = celebrates, idle = floats gently */
  motion?: "wave" | "cheer" | "idle" | "still";
  /** official figure height step (see Character) */
  size?: FigureSize;
  className?: string;
};

const MOTION_MAP = { wave: "wave", cheer: "cheer", idle: "float", still: "still" } as const;

/** Jamool the camel, the friendly guide of the platform (official artwork only). */
export function JamoolFigure({ motion = "idle", size = "md", className = "" }: JamoolProps) {
  return <Character name="jamool" size={size} motion={MOTION_MAP[motion]} small={size === "xs" || size === "sm" || size === "md"} className={className} />;
}

type JamoolSaysProps = {
  title?: string;
  children: ReactNode;
  /** which friend speaks (Jamool by default) */
  who?: CharacterId;
  motion?: JamoolProps["motion"];
  size?: FigureSize;
  className?: string;
};

/** A character with a short speech bubble, used for tips, encouragement and empty states. The figure sits beside the bubble, never over text. */
export default function JamoolSays({ title, children, who = "jamool", motion = "wave", size = "md", className = "" }: JamoolSaysProps) {
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Character name={who} size={size} motion={MOTION_MAP[motion]} small={size === "xs" || size === "sm" || size === "md"} />
      <div className="card relative mb-2 min-w-0 flex-1 rounded-3xl rounded-es-lg p-4 text-start md:max-w-sm">
        {title ? <p className="font-heading text-base font-bold text-foreground-900">{title}</p> : null}
        <p className={`${title ? "mt-1 " : ""}text-sm font-medium leading-relaxed text-foreground-600`}>{children}</p>
      </div>
    </div>
  );
}
