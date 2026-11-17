import type { CSSProperties } from "react";
import "./extraGames.css";

export type PlantKind = "flower" | "tree";
export type PlantFx = "dig" | "water" | "sun" | "wait" | null;

type PlantSceneProps = {
  kind: PlantKind;
  /** 0 = empty pot … 6 = fully grown */
  stage: number;
  fx: PlantFx;
  label: string;
};

const grow = (on: boolean): CSSProperties => ({
  opacity: on ? 1 : 0,
  transform: on ? "scale(1)" : "scale(0.55)",
  pointerEvents: "none",
});

const SPARK = "M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8Z";

function Sparkle({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={SPARK}
        className="motion-safe:animate-twinkle fill-primary-400"
        style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${delay}s` }}
      />
    </g>
  );
}

const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export default function PlantScene({ kind, stage, fx, label }: PlantSceneProps) {
  const sunOn = stage >= 5 || fx === "sun";
  const holeOn = stage === 1 || stage === 2;
  const flower = kind === "flower";

  return (
    <svg viewBox="0 0 240 230" className="mx-auto h-56 w-full max-w-[19rem] md:h-60" role="img" aria-label={label}>
      {/* warm sun in the corner once the plant has had its light */}
      <g className="xg-layer" style={{ ...grow(sunOn), transformOrigin: "50% 50%" }}>
        <g className="xg-spin">
          {RAY_ANGLES.map((angle) => (
            <line
              key={angle}
              x1="200"
              y1="12"
              x2="200"
              y2="19"
              transform={`rotate(${angle} 200 38)`}
              className="stroke-primary-400"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ))}
        </g>
        <circle cx="200" cy="38" r="15" className="fill-primary-400" />
        <circle cx="200" cy="38" r="9" className="fill-primary-300" />
      </g>

      {/* ground shadow + pot */}
      <ellipse cx="120" cy="222" rx="64" ry="6.5" className="fill-foreground-950" opacity="0.08" />
      <path
        d="M70 166 H170 L158 214 Q157 220 151 220 H89 Q83 220 82 214 Z"
        className="fill-secondary-300"
      />
      <path d="M84 172 L91 212" className="stroke-secondary-200" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="106" cy="192" r="3.6" className="fill-foreground-900" />
      <circle cx="134" cy="192" r="3.6" className="fill-foreground-900" />
      <path d="M111 200 Q120 209 129 200" className="stroke-foreground-900" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <circle cx="98" cy="200" r="4.5" className="fill-secondary-400" opacity="0.55" />
      <circle cx="142" cy="200" r="4.5" className="fill-secondary-400" opacity="0.55" />
      <rect x="62" y="150" width="116" height="18" rx="9" className="fill-secondary-400" />

      {/* soil, hole and what is inside it */}
      <ellipse cx="120" cy="152" rx="52" ry="7.5" className="fill-background-800" />
      <ellipse
        cx="120"
        cy="152"
        rx="15"
        ry="4.6"
        className="fill-background-950"
        style={{ opacity: holeOn ? 1 : 0, transition: "opacity .4s ease" }}
      />
      {flower ? (
        <g className="xg-layer" style={grow(stage === 2)}>
          <ellipse cx="120" cy="151.5" rx="5.6" ry="3.4" className="fill-primary-800" />
          <ellipse cx="118.6" cy="150.6" rx="1.8" ry="1" className="fill-primary-500" />
        </g>
      ) : (
        <g className="xg-layer" style={grow(stage === 2)}>
          <rect x="119" y="139" width="2" height="13" rx="1" className="fill-leaf-600" />
          <ellipse cx="114" cy="140" rx="6" ry="3" transform="rotate(-30 114 140)" className="fill-leaf-400" />
          <ellipse cx="126" cy="140" rx="6" ry="3" transform="rotate(30 126 140)" className="fill-leaf-400" />
        </g>
      )}

      {/* the growing plant: each stage is its own layer that grows in from its base */}
      {flower ? (
        <>
          <g className="xg-layer" style={grow(stage === 4)}>
            <rect x="118.5" y="126" width="3" height="24" rx="1.5" className="fill-leaf-600" />
            <ellipse cx="111" cy="127" rx="9" ry="4.5" transform="rotate(-28 111 127)" className="fill-leaf-400" />
            <ellipse cx="129" cy="127" rx="9" ry="4.5" transform="rotate(28 129 127)" className="fill-leaf-400" />
          </g>
          <g className="xg-layer" style={grow(stage === 5)}>
            <rect x="118.5" y="98" width="3" height="52" rx="1.5" className="fill-leaf-600" />
            <ellipse cx="107" cy="128" rx="13" ry="6" transform="rotate(-30 107 128)" className="fill-leaf-400" />
            <ellipse cx="133" cy="114" rx="13" ry="6" transform="rotate(30 133 114)" className="fill-leaf-400" />
            <ellipse cx="120" cy="94" rx="6" ry="9" className="fill-secondary-300" />
            <path d="M114 100 Q120 106 126 100 Q120 96 114 100Z" className="fill-leaf-500" />
          </g>
          <g className="xg-layer" style={grow(stage === 6)}>
            <rect x="118.5" y="84" width="3" height="66" rx="1.5" className="fill-leaf-600" />
            <ellipse cx="106" cy="130" rx="14" ry="6.5" transform="rotate(-30 106 130)" className="fill-leaf-400" />
            <ellipse cx="134" cy="112" rx="14" ry="6.5" transform="rotate(30 134 112)" className="fill-leaf-400" />
            {PETAL_ANGLES.map((angle) => (
              <ellipse
                key={angle}
                cx="120"
                cy="64"
                rx="7.5"
                ry="14"
                transform={`rotate(${angle} 120 78)`}
                className={angle % 90 === 0 ? "fill-secondary-400" : "fill-secondary-300"}
              />
            ))}
            <circle cx="120" cy="78" r="11" className="fill-primary-400" />
            <circle cx="120" cy="78" r="5.5" className="fill-primary-600" />
          </g>
        </>
      ) : (
        <>
          <g className="xg-layer" style={grow(stage === 3)}>
            <rect x="119" y="130" width="2" height="22" rx="1" className="fill-leaf-600" />
            <ellipse cx="113" cy="132" rx="7" ry="3.4" transform="rotate(-30 113 132)" className="fill-leaf-400" />
            <ellipse cx="127" cy="132" rx="7" ry="3.4" transform="rotate(30 127 132)" className="fill-leaf-400" />
          </g>
          <g className="xg-layer" style={grow(stage === 4)}>
            <rect x="117" y="110" width="6" height="40" rx="3" className="fill-primary-800" />
            <circle cx="120" cy="104" r="15" className="fill-leaf-400" />
            <circle cx="108" cy="114" r="10" className="fill-leaf-500" />
            <circle cx="132" cy="114" r="10" className="fill-leaf-500" />
          </g>
          <g className="xg-layer" style={grow(stage === 5)}>
            <rect x="114" y="90" width="12" height="60" rx="5" className="fill-primary-800" />
            <circle cx="96" cy="90" r="20" className="fill-leaf-500" />
            <circle cx="144" cy="90" r="20" className="fill-leaf-500" />
            <circle cx="120" cy="70" r="28" className="fill-leaf-400" />
            <circle cx="120" cy="92" r="18" className="fill-leaf-500" />
          </g>
          <g className="xg-layer" style={grow(stage === 6)}>
            <rect x="112" y="84" width="16" height="66" rx="6" className="fill-primary-800" />
            <circle cx="90" cy="86" r="24" className="fill-leaf-500" />
            <circle cx="150" cy="86" r="24" className="fill-leaf-500" />
            <circle cx="120" cy="58" r="34" className="fill-leaf-400" />
            <circle cx="120" cy="88" r="24" className="fill-leaf-500" />
            {[
              [102, 54],
              [138, 62],
              [86, 88],
              [152, 90],
              [122, 86],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="6" className="fill-secondary-500" />
                <circle cx={x - 1.8} cy={y - 1.8} r="1.6" className="fill-background-50" opacity="0.8" />
              </g>
            ))}
          </g>
        </>
      )}

      {/* the mound that covers the seed */}
      <path
        d="M90 154 Q120 132 150 154 Z"
        className="fill-background-700"
        style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "scaleY(1)" : "scaleY(0.4)",
          transformBox: "fill-box",
          transformOrigin: "50% 100%",
          transition: "opacity .4s ease, transform .5s cubic-bezier(.34,1.4,.64,1)",
        }}
      />

      {/* sparkles when fully grown */}
      {stage >= 6 ? (
        <>
          <Sparkle x={78} y={52} />
          <Sparkle x={166} y={40} delay={0.8} />
          <Sparkle x={160} y={110} delay={1.5} />
          <Sparkle x={72} y={112} delay={2.1} />
        </>
      ) : null}

      {/* little action effects */}
      {fx === "dig" ? (
        <g>
          {[
            { x: 104, dx: "-16px" },
            { x: 114, dx: "-6px" },
            { x: 128, dx: "8px" },
            { x: 138, dx: "18px" },
          ].map((speck, index) => (
            <circle
              key={speck.x}
              cx={speck.x}
              cy="148"
              r="3.2"
              className="xg-speck fill-background-700"
              style={{ ["--dx" as string]: speck.dx, animationDelay: `${index * 0.05}s` } as CSSProperties}
            />
          ))}
        </g>
      ) : null}
      {fx === "water" ? (
        <g>
          {[102, 120, 138].map((x, index) => (
            <g key={x} transform={`translate(${x} 92)`}>
              <path
                d="M0 0 C-5 7 -5 12 0 12 C5 12 5 7 0 0Z"
                className="xg-drop fill-background-50 stroke-foreground-400"
                strokeWidth="1.5"
                style={{ animationDelay: `${index * 0.18}s` }}
              />
            </g>
          ))}
        </g>
      ) : null}
      {fx === "wait" ? (
        <g>
          <Sparkle x={96} y={112} />
          <Sparkle x={146} y={96} delay={0.4} />
        </g>
      ) : null}
    </svg>
  );
}
