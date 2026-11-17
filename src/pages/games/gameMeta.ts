/** Presentation data for the games page (glyph, category, time, age). Game logic lives in the game components. */
export type GameCategory = "focus" | "letters" | "values";

export const GAME_CATEGORIES: { id: "all" | GameCategory; label: string; icon: string }[] = [
  { id: "all", label: "الكل", icon: "ri-apps-2-line" },
  { id: "focus", label: "ذاكرة وملاحظة", icon: "ri-eye-line" },
  { id: "letters", label: "حروف وأرقام", icon: "ri-text" },
  { id: "values", label: "قيم وطبيعة", icon: "ri-plant-line" },
];

export type GamePresentation = {
  /** Material glyph (ri-* class) shown on the coral tile; the whole games world shares one tone */
  icon: string;
  category: GameCategory;
  minutes: number;
  age: string;
};

export const GAME_PRESENTATION: Record<string, GamePresentation> = {
  memory: { icon: "ri-mind-map", category: "focus", minutes: 3, age: "٤ - ٨ سنوات" },
  color: { icon: "ri-palette-line", category: "focus", minutes: 2, age: "٣ - ٦ سنوات" },
  shadow: { icon: "ri-contrast-drop-2-line", category: "focus", minutes: 3, age: "٤ - ٨ سنوات" },
  letters: { icon: "ri-text", category: "letters", minutes: 3, age: "٤ - ٧ سنوات" },
  numbers: { icon: "ri-sort-asc", category: "letters", minutes: 2, age: "٤ - ٧ سنوات" },
  word: { icon: "ri-t-box-line", category: "letters", minutes: 4, age: "٥ - ٩ سنوات" },
  honest: { icon: "ri-shield-star-line", category: "values", minutes: 4, age: "٤ - ٩ سنوات" },
  plant: { icon: "ri-seedling-line", category: "values", minutes: 4, age: "٣ - ٧ سنوات" },
  feed: { icon: "ri-bear-smile-line", category: "values", minutes: 3, age: "٣ - ٦ سنوات" },
};

export const FALLBACK_PRESENTATION: GamePresentation = {
  icon: "ri-gamepad-line",
  category: "focus",
  minutes: 3,
  age: "٤ - ٨ سنوات",
};

export const categoryLabel = (id: GameCategory) => GAME_CATEGORIES.find((c) => c.id === id)?.label ?? "";
