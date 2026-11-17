/** Buttons of the surah journey: the shared `.btn` family (see DESIGN_SYSTEM.md section 3). */
export const BTN_ACCENT = "btn btn-primary max-w-full";

export const BTN_SECONDARY = "btn btn-ghost max-w-full";

export const BTN_TOOL = "btn btn-ghost btn-sm min-h-[2.75rem] max-w-full";

export const BTN_SOFT_ACCENT = "btn btn-sm min-h-[2.75rem] max-w-full bg-accent-100 text-accent-800 hover:bg-accent-200";

export const STAGES = [
  { label: "استمع", title: "الاستماع", icon: "ri-headphone-line" },
  { label: "ردّد", title: "الترديد", icon: "ri-repeat-line" },
  { label: "اقرأ", title: "التلاوة", icon: "ri-book-open-line" },
] as const;

export const AUDIO_ERROR_TEXT =
  "تعذّر تشغيل التلاوة الآن. تأكّد من الإنترنت وحاول مرة أخرى، أو اضغط «سمعت الآية» لتكمل.";
