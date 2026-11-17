import type { LetterToneFamily } from "@/data/letters";

/** Full literal class strings so Tailwind can see them. */
export type ToneKit = {
  /** brand tone id, used by ProgressBar */
  id: "sky" | "primary";
  soft: string;
  softer: string;
  text: string;
  strong: string;
  solid: string;
  solidHover: string;
  solidText: string;
  bar: string;
  ring: string;
  border: string;
  chip: string;
};

export const TONE_KIT: Record<LetterToneFamily, ToneKit> = {
  sky: {
    id: "sky",
    soft: "bg-sky-100",
    softer: "bg-sky-50",
    text: "text-sky-700",
    strong: "text-sky-600",
    solid: "bg-sky-600",
    solidHover: "hover:bg-sky-700",
    solidText: "text-background-50",
    bar: "bg-sky-500",
    ring: "ring-sky-300",
    border: "border-sky-200",
    chip: "bg-sky-100 text-sky-700",
  },
  primary: {
    id: "primary",
    soft: "bg-primary-100",
    softer: "bg-primary-50",
    text: "text-primary-800",
    strong: "text-primary-700",
    solid: "bg-primary-500",
    solidHover: "hover:bg-primary-600",
    solidText: "text-foreground-900",
    bar: "bg-primary-500",
    ring: "ring-primary-300",
    border: "border-primary-200",
    chip: "bg-primary-100 text-primary-800",
  },
};

export const BTN_PRIMARY = "btn btn-primary";

export const BTN_SECONDARY = "btn btn-ghost";

export const BTN_TOOL = "btn btn-ghost btn-sm min-h-[2.75rem]";

export const BTN_ACCENT = "btn btn-secondary";

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** 12 → ١٢ */
export const ar = (value: number): string =>
  String(Math.round(value)).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);

export const STEP_LABELS = ["شاهد واستمع", "ارسم الحرف", "انطق الحرف", "اختر الصورة"] as const;
export const STEP_ICONS = ["ri-eye-line", "ri-brush-line", "ri-mic-line", "ri-image-line"] as const;

/** Reads a design token (for example "primary-500") as a canvas-ready colour. */
export function tokenColor(token: string, alpha = 1): string {
  if (typeof window === "undefined") return "rgba(0,0,0,0.5)";
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();
  return raw ? `oklch(${raw} / ${alpha})` : `rgba(0,0,0,${alpha})`;
}

/** Light Arabic normalisation for comparing speech-recognition text. */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

export const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
