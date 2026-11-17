import type { ReactElement } from "react";
import type { CategoryId } from "@/data/brand";

/**
 * Soft, glossy emblems for the doors of «اختر بابًا»: one per world, drawn in the identity colours
 * (cream, saffron, navy plus the world's own hue). Decorative only: the door link carries the name.
 */
const GOLD = ["#FFE08A", "#FFC43D", "#E89A22"];
const CREAM = ["#FFFFFF", "#FFF4DE", "#F0DDB8"];

function Defs() {
  return (
    <defs>
      <linearGradient id="di-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={GOLD[0]} />
        <stop offset=".55" stopColor={GOLD[1]} />
        <stop offset="1" stopColor={GOLD[2]} />
      </linearGradient>
      <linearGradient id="di-cream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={CREAM[0]} />
        <stop offset=".6" stopColor={CREAM[1]} />
        <stop offset="1" stopColor={CREAM[2]} />
      </linearGradient>
      <linearGradient id="di-leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8BE0A4" />
        <stop offset="1" stopColor="#2F9E5E" />
      </linearGradient>
      <linearGradient id="di-navy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2A3A8F" />
        <stop offset="1" stopColor="#141B52" />
      </linearGradient>
    </defs>
  );
}

const SHADOW = "drop-shadow(0 5px 4px rgb(0 0 30 / .28))";

function Trophy() {
  return (
    <g>
      <path d="M30 26H17c0 15 6 23 15 25" fill="none" stroke="url(#di-gold)" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M70 26h13c0 15-6 23-15 25" fill="none" stroke="url(#di-gold)" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M29 14h42v28c0 16-9 27-21 27S29 58 29 42z" fill="url(#di-gold)" />
      <path d="M36 18h6v36c-4-4-6-10-6-16z" fill="#fff" opacity=".35" />
      <path d="M50 26l3.2 6.6 7.2 1-5.3 5 1.3 7.2L50 42.4l-6.4 3.4 1.3-7.2-5.3-5 7.2-1z" fill="#FFF8E0" />
      <rect x="44" y="68" width="12" height="9" rx="2" fill="#E89A22" />
      <rect x="31" y="76" width="38" height="11" rx="3.5" fill="#5B3FA0" />
      <rect x="31" y="76" width="38" height="4" rx="2" fill="#fff" opacity=".25" />
    </g>
  );
}

function Plant() {
  return (
    <g>
      <path d="M50 58C34 58 22 46 24 28c17 0 28 10 26 30z" fill="url(#di-leaf)" />
      <path d="M50 58C66 58 78 46 76 28c-17 0-28 10-26 30z" fill="url(#di-leaf)" />
      <path d="M50 60V40" stroke="#2F9E5E" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M31 58h38l-5 27H36z" fill="url(#di-cream)" />
      <rect x="27" y="53" width="46" height="9" rx="4" fill="url(#di-cream)" />
      <rect x="27" y="53" width="46" height="3" rx="1.5" fill="#fff" opacity=".6" />
    </g>
  );
}

function Robot() {
  return (
    <g>
      <line x1="50" y1="31" x2="50" y2="19" stroke="#F0DDB8" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="50" cy="16" r="5" fill="#7DEBFF" />
      <circle cx="19" cy="55" r="8" fill="#2F7BEA" />
      <circle cx="81" cy="55" r="8" fill="#2F7BEA" />
      <rect x="22" y="30" width="56" height="46" rx="20" fill="url(#di-cream)" />
      <rect x="29" y="38" width="42" height="29" rx="13" fill="url(#di-navy)" />
      <path d="M38 53q4.5-7 9 0M53 53q4.5-7 9 0" fill="none" stroke="#7DEBFF" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M44 60q6 5 12 0" fill="none" stroke="#7DEBFF" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Palette() {
  return (
    <g>
      <path d="M50 17C27 17 12 31 12 50c0 17 13 29 29 29 8 0 9-6 6-10-3-5 0-10 6-10h14c11 0 20-8 20-19C87 28 71 17 50 17z" fill="url(#di-cream)" />
      <circle cx="31" cy="40" r="6" fill="#F0563A" />
      <circle cx="46" cy="30" r="6" fill="#FFC43D" />
      <circle cx="63" cy="32" r="6" fill="#3E9E6A" />
      <circle cx="33" cy="58" r="6" fill="#2F7BEA" />
      <path d="M62 74l22-24" stroke="#E89A22" strokeWidth="6" strokeLinecap="round" />
      <path d="M80 54l6-6" stroke="#2F7BEA" strokeWidth="7" strokeLinecap="round" />
    </g>
  );
}

function Controller() {
  return (
    <g>
      <path d="M27 32h46c10 0 17 8 19 22l3 17c1 8-10 11-15 4l-8-9H28l-8 9c-5 7-16 4-15-4l3-17c2-14 9-22 19-22z" fill="url(#di-cream)" />
      <rect x="22" y="43" width="18" height="6.5" rx="3" fill="#3A4070" />
      <rect x="27.8" y="37.5" width="6.5" height="17.5" rx="3" fill="#3A4070" />
      <circle cx="67" cy="40" r="3.6" fill="#3E9E6A" />
      <circle cx="75" cy="47" r="3.6" fill="#F0563A" />
      <circle cx="59" cy="47" r="3.6" fill="#2F7BEA" />
      <circle cx="67" cy="54" r="3.6" fill="#FFC43D" />
    </g>
  );
}

function Book() {
  return (
    <g>
      <path d="M50 29C39 22 25 22 12 27v48c13-4 26-4 38 3z" fill="url(#di-cream)" />
      <path d="M50 29c11-7 25-7 38-2v48c-13-4-26-4-38 3z" fill="#F0DDB8" />
      <path d="M50 29v49" stroke="#C9A96A" strokeWidth="2" />
      <path d="M21 38c8-2 16-2 22 1M21 47c8-2 16-2 22 1M21 56c8-2 16-2 22 1" stroke="#8D6BEB" strokeWidth="2.6" strokeLinecap="round" opacity=".55" fill="none" />
      <path d="M50 8l3.6 7.5 8.2 1.1-6 5.7 1.5 8.1L50 26.5l-7.3 3.9 1.5-8.1-6-5.7 8.2-1.1z" fill="url(#di-gold)" />
    </g>
  );
}

function Cap() {
  return (
    <g>
      <path d="M25 52v15c0 6 11 12 25 12s25-6 25-12V52L50 63z" fill="url(#di-navy)" />
      <path d="M50 22L92 40 50 58 8 40z" fill="url(#di-cream)" />
      <path d="M50 22L92 40 50 58" fill="#000" opacity=".06" />
      <path d="M84 43v22" stroke="#FFC43D" strokeWidth="3" strokeLinecap="round" />
      <circle cx="84" cy="68" r="4.5" fill="url(#di-gold)" />
    </g>
  );
}

/** The Quran on its wooden stand: emerald cover, gold frame, warm wood. */
function Quran() {
  return (
    <g>
      <defs>
        <linearGradient id="di-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#25B07A" />
          <stop offset="1" stopColor="#0B5E41" />
        </linearGradient>
        <linearGradient id="di-wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D8914E" />
          <stop offset="1" stopColor="#8A4B22" />
        </linearGradient>
      </defs>
      {/* the stand: two crossed planks and a lip */}
      <path d="M20 95L64 62" stroke="url(#di-wood)" strokeWidth="9" strokeLinecap="round" />
      <path d="M80 95L36 62" stroke="url(#di-wood)" strokeWidth="9" strokeLinecap="round" />
      <circle cx="50" cy="79" r="3.4" fill="url(#di-gold)" />
      <rect x="14" y="60" width="72" height="9" rx="4" fill="url(#di-wood)" />
      <rect x="14" y="60" width="72" height="3" rx="1.5" fill="#fff" opacity=".35" />
      {/* the book */}
      <rect x="25" y="8" width="52" height="56" rx="5" fill="#0B5E41" />
      <rect x="23" y="6" width="52" height="56" rx="5" fill="url(#di-emerald)" />
      <rect x="28" y="11" width="42" height="46" rx="3.2" fill="none" stroke="url(#di-gold)" strokeWidth="2" />
      <circle cx="49" cy="34" r="11.5" fill="none" stroke="url(#di-gold)" strokeWidth="2" />
      <path d="M49 22.5l2.9 6.4 7 .6-5.3 4.6 1.7 6.8-6.3-3.7-6.3 3.7 1.7-6.8-5.3-4.6 7-.6z" fill="url(#di-gold)" />
      <path d="M34 16.5h30M34 51.5h30" stroke="url(#di-gold)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M72 11v46" stroke="#fff" strokeWidth="2.6" opacity=".28" strokeLinecap="round" />
      <path d="M75 12c3.4.9 4 3.3 4 6v36c0 2.7-.6 5.1-4 6" fill="#F7E7C2" />    </g>
  );
}

/**
 * The surprise behind the «سور» door: an open Quran on a carved wooden stand, lit from above, with a
 * crescent, a few stars and two warm lanterns. Decorative; the door link carries the name.
 */
export function QuranScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 250" aria-hidden="true" focusable="false" className={`w-auto ${className}`}>
      <defs>
        <radialGradient id="qs-glow" cx="50%" cy="46%" r="52%">
          <stop offset="0" stopColor="#FFE9A8" stopOpacity=".95" />
          <stop offset=".55" stopColor="#FFC43D" stopOpacity=".35" />
          <stop offset="1" stopColor="#FFC43D" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="qs-wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E2A05C" />
          <stop offset="1" stopColor="#8A4B22" />
        </linearGradient>
        <linearGradient id="qs-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE6A0" />
          <stop offset=".55" stopColor="#FFC43D" />
          <stop offset="1" stopColor="#D98E1C" />
        </linearGradient>
        <linearGradient id="qs-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#25B07A" />
          <stop offset="1" stopColor="#0B5E41" />
        </linearGradient>
        <linearGradient id="qs-page" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F4E2B8" />
          <stop offset=".5" stopColor="#FFF8E6" />
          <stop offset="1" stopColor="#F4E2B8" />
        </linearGradient>
      </defs>

      <circle cx="120" cy="112" r="112" fill="url(#qs-glow)" />

      {/* crescent and stars */}
      <path d="M126 14a20 20 0 1 0 16 36 16 16 0 0 1-16-36z" fill="url(#qs-gold)" />
      <path d="M170 30l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6-5-2.9-5 2.9 1.2-5.6-4.2-3.8 5.6-.6z" fill="#FFE9A8" />
      <path d="M78 44l1.7 3.6 3.9.4-2.9 2.6.8 3.9-3.5-2-3.5 2 .8-3.9-2.9-2.6 3.9-.4z" fill="#FFE9A8" opacity=".85" />

      {/* the stand: crossed planks, a lip, a bolt */}
      <path d="M62 242L150 168" stroke="url(#qs-wood)" strokeWidth="15" strokeLinecap="round" />
      <path d="M178 242L90 168" stroke="url(#qs-wood)" strokeWidth="15" strokeLinecap="round" />
      <circle cx="120" cy="205" r="6" fill="url(#qs-gold)" />
      <rect x="52" y="150" width="136" height="16" rx="7" fill="url(#qs-wood)" />
      <rect x="52" y="150" width="136" height="5" rx="2.5" fill="#fff" opacity=".3" />

      {/* the open book: green covers, cream pages, golden headings */}
      <path d="M36 68L120 78 204 68V152L120 160 36 152z" fill="#0B5E41" />
      <path d="M44 62L120 71V150L44 142z" fill="url(#qs-page)" />
      <path d="M196 62L120 71V150L196 142z" fill="url(#qs-page)" />
      <path d="M44 62L120 71 196 62" fill="none" stroke="url(#qs-emerald)" strokeWidth="5" strokeLinecap="round" />
      <path d="M120 71V150" stroke="#C9A96A" strokeWidth="2" />
      <g fill="none" strokeLinecap="round">
        <path d="M54 92q10-4 22 0t22 0t14 1M54 106q10-4 22 0t22 0t14 1M54 120q10-4 22 0t22 0t14 1M54 134q10-4 22 0t22 0" stroke="#1E7F5C" strokeWidth="2.4" opacity=".75" />
        <path d="M142 92q10-4 22 0t22 0t6 1M142 106q10-4 22 0t22 0t6 1M142 120q10-4 22 0t22 0t6 1M142 134q10-4 22 0t22 0" stroke="#1E7F5C" strokeWidth="2.4" opacity=".75" />
        <path d="M56 78h54M130 78h54" stroke="url(#qs-gold)" strokeWidth="3" />
      </g>
      <g fill="url(#qs-gold)">
        <circle cx="62" cy="86" r="4.2" />
        <circle cx="178" cy="86" r="4.2" />
      </g>

      {/* lanterns */}
      <g>
        <circle cx="26" cy="214" r="26" fill="url(#qs-glow)" />
        <path d="M18 196h16l-3-8h-10z" fill="#8A4B22" />
        <rect x="16" y="196" width="20" height="30" rx="5" fill="#FFC43D" />
        <rect x="16" y="196" width="20" height="30" rx="5" fill="none" stroke="#8A4B22" strokeWidth="2.4" />
        <path d="M26 196v30M16 211h20" stroke="#8A4B22" strokeWidth="1.6" opacity=".7" />
        <rect x="14" y="226" width="24" height="4" rx="2" fill="#8A4B22" />
      </g>
      <g>
        <circle cx="214" cy="214" r="26" fill="url(#qs-glow)" />
        <path d="M206 196h16l-3-8h-10z" fill="#8A4B22" />
        <rect x="204" y="196" width="20" height="30" rx="5" fill="#FFC43D" />
        <rect x="204" y="196" width="20" height="30" rx="5" fill="none" stroke="#8A4B22" strokeWidth="2.4" />
        <path d="M214 196v30M204 211h20" stroke="#8A4B22" strokeWidth="1.6" opacity=".7" />
        <rect x="202" y="226" width="24" height="4" rx="2" fill="#8A4B22" />
      </g>
    </svg>
  );
}
const ICONS: Partial<Record<CategoryId, () => ReactElement>> = {
  competitions: Trophy,
  values: Plant,
  ai: Robot,
  art: Palette,
  games: Controller,
  stories: Book,
  learning: Cap,
  surahs: Quran,
};

export default function DoorIcon({ id, className = "" }: { id: CategoryId; className?: string }) {
  const Art = ICONS[id] ?? Book;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className} style={{ filter: SHADOW }}>
      <Defs />
      <Art />
    </svg>
  );
}
