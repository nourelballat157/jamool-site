/**
 * Quick quizzes for the competitions area.
 * Three themed quizzes (8 questions each) + a "تحدي اليوم" quiz that is picked
 * deterministically from the date (the same questions all day, new ones tomorrow).
 */

export type QuizQuestionType = "choice" | "truefalse" | "icon";
export type QuizLevel = "easy" | "medium";

export type QuizOption = {
  id: string;
  /** text shown on the button (choice / true-false) */
  text?: string;
  /** Remix icon class (icon questions) */
  icon?: string;
  /** read by screen readers and used in the feedback sentence */
  label: string;
  /** colour of the icon (icon questions) */
  tone?: string;
};

export type QuizQuestion = {
  id: string;
  type: QuizQuestionType;
  level: QuizLevel;
  prompt: string;
  /** optional large icon above the prompt */
  icon?: string;
  options: QuizOption[];
  /** id of the right option */
  answer: string;
  /** one gentle sentence shown after every answer */
  explain: string;
};

export type Quiz = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  tone: string;
  questions: QuizQuestion[];
  daily?: boolean;
};

export const QUIZ_SECONDS = 20;
/** max extra speed points per correct answer */
export const QUIZ_MAX_BONUS = 5;
export const QUIZ_BASE_POINTS = 10;

const text = (id: string, value: string, label = value): QuizOption => ({ id, text: value, label });
const pic = (id: string, icon: string, label: string, tone: string): QuizOption => ({ id, icon, label, tone });
const TRUE_FALSE: QuizOption[] = [
  { id: "t", text: "صح", label: "صح" },
  { id: "f", text: "خطأ", label: "خطأ" },
];

const lettersQuestions: QuizQuestion[] = [
  {
    id: "letters-1",
    type: "choice",
    level: "easy",
    prompt: "بأي حرف تبدأ كلمة «قمر»؟",
    icon: "ri-moon-fill",
    options: [text("a", "ك"), text("b", "ق"), text("c", "ف"), text("d", "ن")],
    answer: "b",
    explain: "كلمة «قمر» تبدأ بحرف القاف.",
  },
  {
    id: "letters-2",
    type: "icon",
    level: "easy",
    prompt: "اختر الصورة التي يبدأ اسمها بحرف الكاف (ك).",
    options: [
      pic("a", "ri-sun-fill", "شمس", "text-primary-500"),
      pic("b", "ri-book-fill", "كتاب", "text-accent-700"),
      pic("c", "ri-home-fill", "بيت", "text-secondary-500"),
      pic("d", "ri-moon-fill", "قمر", "text-primary-600"),
    ],
    answer: "b",
    explain: "«كتاب» تبدأ بحرف الكاف.",
  },
  {
    id: "letters-3",
    type: "truefalse",
    level: "easy",
    prompt: "حرف الباء (ب) له نقطة واحدة تحته.",
    options: TRUE_FALSE,
    answer: "t",
    explain: "نعم! الباء لها نقطة واحدة من تحت.",
  },
  {
    id: "letters-4",
    type: "choice",
    level: "medium",
    prompt: "أي كلمة تبدأ بحرف الشين (ش)؟",
    options: [text("a", "سمك"), text("b", "تمر"), text("c", "جمل"), text("d", "شمس")],
    answer: "d",
    explain: "«شمس» تبدأ بحرف الشين.",
  },
  {
    id: "letters-5",
    type: "icon",
    level: "medium",
    prompt: "أي صورة ينتهي اسمها بحرف الراء (ر)؟",
    options: [
      pic("a", "ri-sun-fill", "شمس", "text-primary-500"),
      pic("b", "ri-heart-fill", "قلب", "text-secondary-500"),
      pic("c", "ri-moon-fill", "قمر", "text-primary-600"),
      pic("d", "ri-home-fill", "بيت", "text-secondary-600"),
    ],
    answer: "c",
    explain: "«قمر» تنتهي بحرف الراء.",
  },
  {
    id: "letters-6",
    type: "truefalse",
    level: "medium",
    prompt: "كلمة «تفاحة» تبدأ بحرف التاء (ت).",
    options: TRUE_FALSE,
    answer: "t",
    explain: "صحيح، «تفاحة» تبدأ بحرف التاء.",
  },
  {
    id: "letters-7",
    type: "choice",
    level: "easy",
    prompt: "كم حرفًا في كلمة «بيت»؟",
    options: [text("a", "٢"), text("b", "٣"), text("c", "٤"), text("d", "٥")],
    answer: "b",
    explain: "ب - ي - ت: ثلاثة حروف.",
  },
  {
    id: "letters-8",
    type: "choice",
    level: "medium",
    prompt: "أي حرف يأتي بعد الجيم (ج) في الأبجدية؟",
    options: [text("a", "ب"), text("b", "د"), text("c", "ح"), text("d", "خ")],
    answer: "c",
    explain: "الترتيب: ج ثم ح ثم خ.",
  },
];

const valuesQuestions: QuizQuestion[] = [
  {
    id: "values-1",
    type: "choice",
    level: "easy",
    prompt: "وجدت لعبة ليست لك في الحديقة. ماذا تفعل؟",
    icon: "ri-gift-fill",
    options: [
      text("a", "آخذها إلى بيتي"),
      text("b", "أبحث عن صاحبها وأعيدها له"),
      text("c", "أرميها بعيدًا"),
    ],
    answer: "b",
    explain: "الأمانة جميلة: نعيد الشيء إلى صاحبه.",
  },
  {
    id: "values-2",
    type: "truefalse",
    level: "easy",
    prompt: "نقول «السلام عليكم» عندما نقابل من نحب.",
    options: TRUE_FALSE,
    answer: "t",
    explain: "السلام تحية طيبة تنشر المحبة بيننا.",
  },
  {
    id: "values-3",
    type: "icon",
    level: "easy",
    prompt: "اختر الصورة التي تدلّ على غسل اليدين.",
    options: [
      pic("a", "ri-football-fill", "كرة", "text-primary-700"),
      pic("b", "ri-gift-fill", "هدية", "text-secondary-500"),
      pic("c", "ri-hand-sanitizer-fill", "غسل اليدين", "text-accent-600"),
      pic("d", "ri-music-fill", "موسيقى", "text-secondary-600"),
    ],
    answer: "c",
    explain: "غسل اليدين بالماء والصابون يحمينا من الجراثيم.",
  },
  {
    id: "values-4",
    type: "choice",
    level: "medium",
    prompt: "ما معنى الصدق؟",
    icon: "ri-shield-check-fill",
    options: [
      text("a", "أن أقول الحقيقة دائمًا"),
      text("b", "أن أقول ما يعجب الناس"),
      text("c", "أن أسكت دائمًا"),
    ],
    answer: "a",
    explain: "الصادق يقول الحقيقة، فيثق به الجميع.",
  },
  {
    id: "values-5",
    type: "truefalse",
    level: "medium",
    prompt: "من الأدب أن أقاطع من يتكلم.",
    options: TRUE_FALSE,
    answer: "f",
    explain: "نستمع حتى ينتهي الآخرون، ثم نتكلم بهدوء.",
  },
  {
    id: "values-6",
    type: "choice",
    level: "easy",
    prompt: "صديقك الصغير حزين. ماذا تفعل؟",
    icon: "ri-emotion-sad-line",
    options: [
      text("a", "أتركه وأغادر"),
      text("b", "أواسيه وألعب معه"),
      text("c", "أضحك منه"),
    ],
    answer: "b",
    explain: "اللطف يُسعد القلوب ويقرّب الأصدقاء.",
  },
  {
    id: "values-7",
    type: "icon",
    level: "medium",
    prompt: "أي صورة تعبّر عن المشاركة مع الآخرين؟",
    options: [
      pic("a", "ri-lock-fill", "قفل", "text-foreground-500"),
      pic("b", "ri-umbrella-fill", "مظلة", "text-accent-600"),
      pic("c", "ri-cloud-fill", "غيمة", "text-foreground-400"),
      pic("d", "ri-hand-heart-fill", "يد تعطي", "text-secondary-500"),
    ],
    answer: "d",
    explain: "المشاركة تضاعف الفرحة.",
  },
  {
    id: "values-8",
    type: "choice",
    level: "medium",
    prompt: "ماذا نقول بعد أن ننتهي من الطعام؟",
    icon: "ri-restaurant-fill",
    options: [text("a", "الحمد لله"), text("b", "لا نقول شيئًا"), text("c", "بسم الله")],
    answer: "a",
    explain: "نحمد الله ونشكره على نعمة الطعام.",
  },
];

const storiesQuestions: QuizQuestion[] = [
  {
    id: "stories-1",
    type: "choice",
    level: "easy",
    prompt: "من يُسمّى ملك الغابة في الحكايات؟",
    icon: "ri-tree-fill",
    options: [text("a", "الأرنب"), text("b", "الغزال"), text("c", "الأسد"), text("d", "الدلفين")],
    answer: "c",
    explain: "الأسد قوي وشجاع، ولذلك يُسمّى ملك الغابة.",
  },
  {
    id: "stories-2",
    type: "icon",
    level: "easy",
    prompt: "بماذا نسافر إلى الفضاء؟",
    options: [
      pic("a", "ri-bus-fill", "حافلة", "text-primary-600"),
      pic("b", "ri-rocket-fill", "صاروخ", "text-secondary-500"),
      pic("c", "ri-bike-fill", "دراجة", "text-accent-600"),
      pic("d", "ri-train-fill", "قطار", "text-secondary-600"),
    ],
    answer: "b",
    explain: "الصاروخ يحملنا بين النجوم والكواكب.",
  },
  {
    id: "stories-3",
    type: "truefalse",
    level: "easy",
    prompt: "الدلفين يعيش في البحر.",
    options: TRUE_FALSE,
    answer: "t",
    explain: "نعم! الدلفين يسبح في البحر مع أصدقائه.",
  },
  {
    id: "stories-4",
    type: "choice",
    level: "medium",
    prompt: "عندما نعطي من نحب شيئًا جميلًا، نشعر بـ…",
    icon: "ri-hand-heart-fill",
    options: [text("a", "الملل"), text("b", "الفرح"), text("c", "الغضب")],
    answer: "b",
    explain: "العطاء يملأ القلب بالفرح، تمامًا كما في حكاية زهرة الجدة.",
  },
  {
    id: "stories-5",
    type: "truefalse",
    level: "medium",
    prompt: "الروبوت مصنوع من أجزاء وآلات، وليس من لحم ودم.",
    icon: "ri-robot-fill",
    options: TRUE_FALSE,
    answer: "t",
    explain: "الروبوت آلة ذكية يصنعها الناس.",
  },
  {
    id: "stories-6",
    type: "icon",
    level: "medium",
    prompt: "أي صورة تدلّ على الغابة؟",
    options: [
      pic("a", "ri-football-fill", "كرة", "text-primary-700"),
      pic("b", "ri-gift-fill", "هدية", "text-secondary-500"),
      pic("c", "ri-key-fill", "مفتاح", "text-primary-600"),
      pic("d", "ri-tree-fill", "أشجار", "text-accent-600"),
    ],
    answer: "d",
    explain: "الغابة مليئة بالأشجار والحيوانات.",
  },
  {
    id: "stories-7",
    type: "choice",
    level: "easy",
    prompt: "صديقتك تحتاج مساعدة. ماذا تفعل الصديقة الطيبة؟",
    icon: "ri-team-line",
    options: [text("a", "تساعدها"), text("b", "تتركها"), text("c", "تختبئ")],
    answer: "a",
    explain: "الصديق الطيب يقف بجانب صديقه، مثل الغزالة وصديقتها.",
  },
  {
    id: "stories-8",
    type: "choice",
    level: "medium",
    prompt: "بماذا تبدأ كثير من الحكايات الجميلة؟",
    icon: "ri-book-open-line",
    options: [text("a", "انتهت الحكاية"), text("b", "كان يا ما كان"), text("c", "شكرًا لكم")],
    answer: "b",
    explain: "نقول: «كان يا ما كان…» ثم تبدأ الحكاية.",
  },
];

export const quizzes: Quiz[] = [
  {
    id: "letters",
    title: "مسابقة الحروف",
    desc: "أسئلة عن الحروف والكلمات والصور",
    icon: "ri-text",
    tone: "bg-primary-100 text-primary-800",
    questions: lettersQuestions,
  },
  {
    id: "values",
    title: "مسابقة القيم",
    desc: "الصدق واللطف والمشاركة والنظافة",
    icon: "ri-plant-line",
    tone: "bg-accent-100 text-accent-800",
    questions: valuesQuestions,
  },
  {
    id: "stories",
    title: "مسابقة الحكايات",
    desc: "أسئلة ممتعة عن عالم القصص",
    icon: "ri-book-open-line",
    tone: "bg-secondary-100 text-secondary-800",
    questions: storiesQuestions,
  },
];

/* ---------------------------- daily challenge ---------------------------- */

const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** small deterministic generator, seeded from the date text */
function seeded(seedText: string) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i += 1) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** "تحدي اليوم": 8 questions mixed from all quizzes, the same for everyone on a given date. */
export function dailyQuiz(date: Date = new Date()): Quiz {
  const iso = isoOf(date);
  const rand = seeded(`ajyal-${iso}`);
  const pool = quizzes.flatMap((quiz) => quiz.questions);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, 8);
  // easy questions first, then medium (the shuffled order is kept inside each level)
  const questions = [...picked.filter((q) => q.level === "easy"), ...picked.filter((q) => q.level === "medium")];
  return {
    id: "daily",
    title: "تحدي اليوم",
    desc: "٨ أسئلة جديدة تتغيّر كل يوم",
    icon: "ri-calendar-event-line",
    tone: "bg-primary-100 text-primary-800",
    questions,
    daily: true,
  };
}

export function findQuiz(id: string | null | undefined): Quiz | null {
  if (!id) return null;
  if (id === "daily") return dailyQuiz();
  return quizzes.find((quiz) => quiz.id === id) ?? null;
}

/** every quiz in the order shown on the competitions page */
export const allQuizzes = (): Quiz[] => [dailyQuiz(), ...quizzes];
