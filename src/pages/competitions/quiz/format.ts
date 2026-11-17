/** Western digits -> Arabic-Indic digits for text shown to children. */
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

/** e.g. "الأربعاء ١١ نوفمبر" (falls back to an empty string if the browser has no Arabic locale data) */
export const todayLabel = (): string => {
  try {
    return new Intl.DateTimeFormat("ar", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  } catch {
    return "";
  }
};
