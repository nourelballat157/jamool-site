/**
 * Newer educational games. They are appended to the original `gameList`
 * (`[...gameList, ...extraGames]`) so the original mock file stays untouched.
 * Shape matches the items of `gameList`.
 */
export type GameInfo = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  tone: string;
};

export const extraGames: GameInfo[] = [
  {
    id: "plant",
    title: "ازرع نبتة",
    desc: "رتّب الخطوات وشاهد البذرة تكبر",
    icon: "ri-seedling-line",
    tone: "bg-accent-100 text-accent-800",
  },
  {
    id: "feed",
    title: "أطعم الحيوانات",
    desc: "أعطِ كل حيوان طعامه المفضّل",
    icon: "ri-bear-smile-line",
    tone: "bg-secondary-100 text-secondary-800",
  },
  {
    id: "honest",
    title: "ماذا يفعل الصادق؟",
    desc: "اختر التصرف الجميل في كل موقف",
    icon: "ri-shield-star-line",
    tone: "bg-primary-100 text-primary-800",
  },
  {
    id: "word",
    title: "كوّن الكلمة",
    desc: "رتّب الحروف لتكوّن كلمة مع صورتها",
    icon: "ri-t-box-line",
    tone: "bg-secondary-100 text-secondary-800",
  },
  {
    id: "shadow",
    title: "تحدي الظلال",
    desc: "طابق كل صورة مع ظلها",
    icon: "ri-contrast-drop-2-line",
    tone: "bg-accent-100 text-accent-800",
  },
];
