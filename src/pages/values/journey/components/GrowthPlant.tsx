import type { CSSProperties } from "react";
import { STAGE_LABELS } from "@/data/valueJourneys";
import "../journey.css";

export type PlantStage = 0 | 1 | 2 | 3;

type GrowthPlantProps = {
  stage: PlantStage;
  bloom: { main: string; light: string };
  /** changes every time the plant grows, to replay the sparkle burst */
  burstKey: number;
  className?: string;
};

const SPARKLES: { dx: string; dy: string; d: string; tone: string; size: string }[] = [
  { dx: "-82px", dy: "-70px", d: "0s", tone: "text-primary-500", size: "text-2xl" },
  { dx: "78px", dy: "-84px", d: "0.08s", tone: "text-amber-400", size: "text-xl" },
  { dx: "-48px", dy: "-120px", d: "0.16s", tone: "text-leaf-500", size: "text-lg" },
  { dx: "54px", dy: "-128px", d: "0.2s", tone: "text-primary-400", size: "text-2xl" },
  { dx: "-100px", dy: "-18px", d: "0.28s", tone: "text-amber-300", size: "text-lg" },
  { dx: "102px", dy: "-26px", d: "0.34s", tone: "text-leaf-400", size: "text-xl" },
  { dx: "0px", dy: "-142px", d: "0.12s", tone: "text-primary-500", size: "text-xl" },
  { dx: "-24px", dy: "-96px", d: "0.4s", tone: "text-amber-400", size: "text-base" },
];

const stateOf = (own: number, stage: number) => (own === stage ? "is-on" : own < stage ? "is-past" : "");

function Leaf({ x, y, rot, scale, cls }: { x: number; y: number; rot: number; scale: number; cls: string }) {
  return (
    <path
      d="M0 0 C 7 -9, 20 -9, 28 0 C 20 9, 7 9, 0 0 Z"
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}
      className={cls}
    />
  );
}

function Blossom({ x, y, main, light }: { x: number; y: number; main: string; light: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <circle
          key={angle}
          cx={Math.cos((angle * Math.PI) / 180) * 5}
          cy={Math.sin((angle * Math.PI) / 180) * 5}
          r="3.6"
          className={main}
        />
      ))}
      <circle r="2.8" className={light} />
    </g>
  );
}

const BLOSSOMS: [number, number][] = [
  [100, 82],
  [140, 74],
  [76, 114],
  [162, 110],
  [121, 108],
  [102, 134],
  [144, 132],
];

export default function GrowthPlant({ stage, bloom, burstKey, className = "" }: GrowthPlantProps) {
  return (
    <div className={`relative mx-auto aspect-[12/13] w-full max-w-[20rem] ${className}`}>
      <svg
        viewBox="0 0 240 260"
        role="img"
        aria-label={`شجرة القيمة: ${STAGE_LABELS[stage]}`}
        className="h-full w-full overflow-visible"
      >
        {/* soft backdrop and ground */}
        <circle cx="120" cy="128" r="110" className="fill-leaf-100" opacity="0.7" />
        <circle cx="120" cy="128" r="82" className="fill-leaf-50" opacity="0.9" />
        <circle
          cx="120"
          cy="104"
          r="70"
          className={`vj-glow ${bloom.light}`}
          style={{ opacity: stage === 3 ? 0.35 : 0 }}
        />
        <ellipse cx="120" cy="224" rx="94" ry="15" className="fill-leaf-200" />
        <ellipse cx="120" cy="219" rx="50" ry="11" className="fill-amber-800" />
        <ellipse cx="120" cy="216" rx="38" ry="7" className="fill-amber-700" />

        {/* stage 0: seed */}
        <g className={`vj-stage ${stateOf(0, stage)}`}>
          <ellipse cx="120" cy="211" rx="10" ry="6.5" transform="rotate(-18 120 211)" className="fill-primary-500" />
          <path
            d="M114 209 C116 207 119 206 122 207"
            className="stroke-amber-300"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* stage 1: sprout */}
        <g className={`vj-stage ${stateOf(1, stage)}`}>
          <g className="vj-sway">
            <path
              d="M120 218 C120 206 119 194 121 183"
              className="stroke-leaf-600"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <Leaf x={121} y={185} rot={-150} scale={0.62} cls="fill-leaf-400" />
            <Leaf x={121} y={183} rot={-32} scale={0.7} cls="fill-leaf-500" />
          </g>
        </g>

        {/* stage 2: young plant with a bud */}
        <g className={`vj-stage ${stateOf(2, stage)}`}>
          <g className="vj-sway">
            <path
              d="M120 218 C119 196 122 170 120 142"
              className="stroke-leaf-600"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <Leaf x={120} y={200} rot={-24} scale={0.85} cls="fill-leaf-500" />
            <Leaf x={120} y={191} rot={-156} scale={0.85} cls="fill-leaf-400" />
            <Leaf x={121} y={172} rot={-34} scale={0.95} cls="fill-leaf-400" />
            <Leaf x={121} y={163} rot={-146} scale={0.95} cls="fill-leaf-500" />
            <Leaf x={120} y={150} rot={-62} scale={0.78} cls="fill-leaf-500" />
            <Leaf x={120} y={150} rot={-118} scale={0.78} cls="fill-leaf-400" />
            <ellipse cx="120" cy="134" rx="7.5" ry="11" className={bloom.main} />
            <ellipse cx="120" cy="137" rx="3.5" ry="6" className={bloom.light} />
          </g>
        </g>

        {/* stage 3: blooming tree */}
        <g className={`vj-stage ${stateOf(3, stage)}`}>
          <g className="vj-sway">
            <path
              d="M108 220 C113 192 116 168 113 138 L127 138 C124 168 127 192 132 220 Z"
              className="fill-amber-800"
            />
            <path
              d="M120 164 C108 152 100 146 92 134"
              className="stroke-amber-800"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M121 158 C134 148 142 140 150 128"
              className="stroke-amber-800"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <g className="vj-canopy">
              <circle cx="84" cy="120" r="34" className="fill-leaf-600" />
              <circle cx="156" cy="120" r="34" className="fill-leaf-600" />
              <circle cx="120" cy="90" r="44" className="fill-leaf-600" />
              <circle cx="120" cy="98" r="38" className="fill-leaf-500" />
              <circle cx="92" cy="118" r="27" className="fill-leaf-500" />
              <circle cx="148" cy="118" r="27" className="fill-leaf-500" />
              <circle cx="120" cy="126" r="25" className="fill-leaf-400" />
              <circle cx="104" cy="86" r="14" className="fill-leaf-300" opacity="0.55" />
              <circle cx="142" cy="96" r="10" className="fill-leaf-300" opacity="0.45" />
              {BLOSSOMS.map(([bx, by]) => (
                <Blossom key={`${bx}-${by}`} x={bx} y={by} main={bloom.main} light="fill-primary-200" />
              ))}
            </g>
          </g>
        </g>
      </svg>

      {/* sparkles replayed on every growth */}
      {burstKey > 0 ? (
        <div key={burstKey} aria-hidden="true" className="pointer-events-none absolute inset-0">
          {SPARKLES.map((sparkle, index) => (
            <i
              key={index}
              className={`vj-spark ri-sparkling-2-fill ${sparkle.tone} ${sparkle.size}`}
              style={{ "--dx": sparkle.dx, "--dy": sparkle.dy, "--d": sparkle.d } as CSSProperties}
            />
          ))}
        </div>
      ) : null}

      {stage === 3 ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <i className="ri-star-fill animate-twinkle absolute start-[8%] top-[18%] text-xl text-primary-400" />
          <i className="ri-sparkling-2-fill animate-twinkle absolute end-[10%] top-[10%] text-2xl text-amber-400" />
          <i className="ri-star-fill animate-twinkle absolute end-[4%] top-[48%] text-base text-leaf-400" />
        </div>
      ) : null}
    </div>
  );
}
