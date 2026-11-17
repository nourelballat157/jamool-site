export const navLinks = [
  { id: "home", label: "الرئيسية", to: "/" },
  { id: "areas", label: "استكشف", to: "/explore" },
  { id: "stories", label: "القصص", to: "/stories" },
  { id: "learning", label: "التعليم", to: "/learning" },
  { id: "games", label: "الألعاب", to: "/games" },
  { id: "competitions", label: "المسابقات", to: "/competitions" },
  { id: "about", label: "أصدقاء جمّول", to: "/#friends" },
];

export const stories = [
  {
    id: "lion",
    title: "الأسد الصغير",
    subtitle: "مغامرة في قلب الغابة",
    tag: "مغامرة",
    image: "/img/stories/lion.webp",
  },
  {
    id: "space",
    title: "رحلة إلى الفضاء",
    subtitle: "بين النجوم والكواكب",
    tag: "خيال علمي",
    image:
      "/img/stories/space.webp",
  },
  {
    id: "deer",
    title: "الغزالة والصديقة",
    subtitle: "حكاية من الغابة الذهبية",
    tag: "صداقة",
    image:
      "/img/stories/deer.webp",
  },
  {
    id: "dolphin",
    title: "عالم الدلافين",
    subtitle: "رحلة تحت الأمواج",
    tag: "مغامرة",
    image:
      "/img/stories/dolphin.webp",
  },
];

export const learningChips = [
  { id: "l1", label: "أ", tone: "bg-primary-100 text-primary-800" },
  { id: "l2", label: "ب", tone: "bg-accent-100 text-accent-800" },
  { id: "l3", label: "ت", tone: "bg-secondary-100 text-secondary-800" },
  { id: "l4", label: "١", tone: "bg-secondary-100 text-secondary-800" },
  { id: "l5", label: "٢", tone: "bg-accent-100 text-accent-800" },
  { id: "l6", label: "٣", tone: "bg-primary-100 text-primary-800" },
];

export const quranSteps = [
  { id: "q1", label: "الاستماع", desc: "استمع للتلاوة بهدوء", icon: "ri-headphone-line" },
  { id: "q2", label: "الترديد", desc: "ردّد مع القارئ", icon: "ri-chat-voice-line" },
  { id: "q3", label: "التلاوة", desc: "اقرأ بصوت جميل", icon: "ri-book-open-line" },
  { id: "q4", label: "الحفظ", desc: "احفظ السور القصيرة", icon: "ri-heart-3-line" },
];

export const gameWorlds = [
  { id: "g1", title: "عالم الحروف", desc: "طابق الحروف واجمعها", icon: "ri-text", tone: "bg-primary-100 text-primary-800" },
  { id: "g2", title: "مغامرة الأرقام", desc: "رتّب واعدّ بمرح", icon: "ri-arrow-up-circle-line", tone: "bg-accent-100 text-accent-800" },
  { id: "g3", title: "لعبة الذاكرة", desc: "اكتشف الأزواج المتشابهة", icon: "ri-mind-map", tone: "bg-secondary-100 text-secondary-800" },
  { id: "g4", title: "طابق الأشكال", desc: "صل الشكل بمكانه", icon: "ri-shapes-line", tone: "bg-primary-100 text-primary-800" },
];

export const creativeTools = [
  { id: "c1", label: "الرسم الحر", icon: "ri-brush-line", tone: "bg-secondary-100 text-secondary-800" },
  { id: "c2", label: "التلوين", icon: "ri-palette-line", tone: "bg-primary-100 text-primary-800" },
  { id: "c3", label: "تحسين الرسم بالذكاء الاصطناعي", icon: "ri-magic-line", tone: "bg-accent-100 text-accent-800" },
  { id: "c4", label: "AI Creator", icon: "ri-star-smile-line", tone: "bg-primary-100 text-primary-800" },
];

export const values = [
  { id: "v1", title: "الصدق", desc: "أقول الحق دائمًا", icon: "ri-emotion-happy-line", toneId: "leaf" as const, tone: "bg-leaf-100", dot: "bg-leaf-500" },
  { id: "v2", title: "التعاون", desc: "نساعد بعضنا البعض", icon: "ri-team-line", toneId: "accent" as const, tone: "bg-accent-100", dot: "bg-accent-500" },
  { id: "v3", title: "الرحمة", desc: "أكون لطيفًا وحنونًا", icon: "ri-heart-3-line", toneId: "primary" as const, tone: "bg-primary-100", dot: "bg-primary-500" },
  { id: "v4", title: "المسؤولية", desc: "أعتني بأشيائي", icon: "ri-shield-check-line", toneId: "leaf" as const, tone: "bg-leaf-100", dot: "bg-leaf-500" },
  { id: "v5", title: "الإتقان", desc: "أعمل بإتقان واجتهاد", icon: "ri-award-line", toneId: "primary" as const, tone: "bg-primary-100", dot: "bg-primary-500" },
];

export const competitionSteps = [
  { id: "cp1", label: "اختر مسابقة", icon: "ri-calendar-check-line" },
  { id: "cp2", label: "أبدع مشاركتك", icon: "ri-magic-line" },
  { id: "cp3", label: "أرسل وعُدّ للنتيجة", icon: "ri-send-plane-line" },
];

export const footerLinks = [
  { id: "f1", label: "الرئيسية", to: "/" },
  { id: "f2", label: "القصص", to: "/stories" },
  { id: "f3", label: "الألعاب", to: "/games" },
  { id: "f4", label: "حديقة القيم", to: "/values" },
  { id: "f5", label: "المسابقات", to: "/competitions" },
];

export const searchSuggestions = [
  "قصص الحيوانات",
  "الحروف الهجائية",
  "سورة الفاتحة",
  "ألعاب الأرقام",
  "حديقة القيم",
  "الرسم والتلوين",
];

export const searchItems = [
  {
    id: "s1",
    type: "قصة",
    title: "الأسد الصغير",
    desc: "مغامرة ممتعة في قلب الغابة",
    route: "/stories",
  },
  {
    id: "s2",
    type: "درس",
    title: "الحروف الهجائية",
    desc: "تعرّف على الحروف بالصوت والصورة",
    route: "/learning",
  },
  {
    id: "s3",
    type: "لعبة",
    title: "مغامرة الأرقام",
    desc: "لعبة ممتعة لتعلّم الأرقام",
    route: "/games",
  },
  {
    id: "s4",
    type: "سورة",
    title: "سورة الفاتحة",
    desc: "استمع ورتّل واحفظ",
    route: "/quran",
  },
  {
    id: "s5",
    type: "درس",
    title: "حديقة القيم",
    desc: "تعلّم الصدق والتعاون والرحمة",
    route: "/values",
  },
  {
    id: "s6",
    type: "نشاط",
    title: "الرسم والتلوين",
    desc: "ارسم ولوّن وأبدع",
    route: "/drawing",
  },
];

export const childProfiles = [
  {
    id: "ch1",
    name: "سارة",
    age: "٦ سنوات",
    level: "المستوى الثاني",
    avatar:
      "/brand/avatar-maha.webp",
    ring: "border-secondary-300",
  },
  {
    id: "ch2",
    name: "يوسف",
    age: "٨ سنوات",
    level: "المستوى الثالث",
    avatar:
      "/brand/avatar-thaloob.webp",
    ring: "border-primary-300",
  },
  {
    id: "ch3",
    name: "مريم",
    age: "٥ سنوات",
    level: "المستوى الأول",
    avatar:
      "/brand/avatar-noor.webp",
    ring: "border-accent-300",
  },
];