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

/** The surahs emblem: a mihrab-shaped gold plaque holding an open Quran on its crossed stand. */
function Quran() {
  return (
    <g>
      <path d="M50 3C52 14 68 18 73 31C75 36 76 40 76 46V86Q76 93 69 93H31Q24 93 24 86V46C24 40 25 36 27 31C32 18 48 14 50 3Z" fill="rgb(0 0 0 / .16)" stroke="url(#di-gold)" strokeWidth="3.6" strokeLinejoin="round" />
      {/* the open book */}
      <path d="M30 36Q40 31 50 37V60Q40 54 30 59Z" fill="#FFF8E6" />
      <path d="M70 36Q60 31 50 37V60Q60 54 70 59Z" fill="#F3E0B4" />
      <path d="M50 37V60" stroke="#C9A96A" strokeWidth="1.4" />
      <path d="M30 36Q40 31 50 37M70 36Q60 31 50 37" fill="none" stroke="url(#di-gold)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M34 43q6-2 12 1M34 49q6-2 12 1M54 44q6-3 12-1M54 50q6-3 12-1" fill="none" stroke="#2F9E7C" strokeWidth="1.5" strokeLinecap="round" opacity=".75" />
      <path d="M29 59Q40 53 50 60Q60 53 71 59" fill="none" stroke="#0B6A54" strokeWidth="2.6" strokeLinecap="round" />
      {/* the stand */}
      <path d="M33 82L62 63" stroke="url(#di-gold)" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M67 82L38 63" stroke="url(#di-gold)" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M50 66.5l2.2 3.1 3.6-.6-1 3.6 2.8 2.3-3.6 1 .3 3.7-3.4-1.5-3.4 1.5.3-3.7-3.6-1 2.8-2.3-1-3.6 3.6.6z" fill="url(#di-gold)" opacity=".0" />
    </g>
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
