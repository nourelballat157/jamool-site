/**
 * Values Garden journeys: every value is a small guided journey, "growing a tree".
 * Each journey has three stations the child can do in any order:
 *   story   -> opens the story reader (/stories/<id>)
 *   game    -> opens a game (/games?game=<id>)
 *   mission -> a short inline mini-activity inside the journey page
 */

export type StationKind = "story" | "game" | "mission";

export type Choice = {
  text: string;
  /** a "good" choice moves on; the other asks the child to think again (never punishes) */
  good: boolean;
  /** Jamool's gentle reply */
  reply: string;
};

export type Scenario = {
  id: string;
  icon: string;
  prompt: string;
  hint: string;
  choices: Choice[];
};

export type ChoicesMission = {
  type: "choices";
  intro: string;
  scenarios: Scenario[];
};

export type OrderMission = {
  type: "order";
  intro: string;
  prompt: string;
  /** steps in the correct order */
  steps: string[];
  /** indexes of `steps` in the order they are first shown */
  shuffle: number[];
  hint: string;
};

export type MissionContent = ChoicesMission | OrderMission;

export type Station = {
  id: "story" | "game" | "mission";
  kind: StationKind;
  title: string;
  desc: string;
  icon: string;
  cta: string;
  /** link stations only */
  to?: string;
  /** mission stations only */
  mission?: MissionContent;
};

export type Journey = {
  valueId: string;
  jamoolIntro: string;
  jamoolDone: string;
  /** accent token class pair used for the soft surface + strong text */
  tone: { soft: string; strong: string };
  /** blossom colours for the tree (SVG fill classes) */
  bloom: { main: string; light: string };
  stations: [Station, Station, Station];
};

export const STAGE_LABELS = ["بذرة صغيرة", "نبتة جديدة", "شجرة فتيّة", "شجرة مزهرة"] as const;

export const stepKey = (valueId: string, stationId: string) => `value-step:${valueId}:${stationId}`;
export const doneKey = (valueId: string) => `value-done:${valueId}`;
export const visitKey = (valueId: string, stationId: string) => `value-visit:${valueId}:${stationId}`;

export const journeys: Record<string, Journey> = {
  v1: {
    valueId: "v1",
    jamoolIntro: "أهلًا يا صديقي! سنزرع معًا شجرة الصدق. كل محطة تُنهيها تُكبّر الشجرة قليلًا.",
    jamoolDone: "أزهرت شجرة الصدق! أنت تقول الحق دائمًا، وأنا فخورة بك.",
    tone: { soft: "bg-leaf-100", strong: "text-leaf-800" },
    bloom: { main: "fill-primary-400", light: "fill-primary-200" },
    stations: [
      {
        id: "story",
        kind: "story",
        title: "حكاية الأسد الصغير",
        desc: "اقرأ الحكاية مع نور، وفكّر: كيف يشعر القلب حين نقول الحق؟",
        icon: "ri-book-open-line",
        cta: "اقرأ الحكاية",
        to: "/stories/lion",
      },
      {
        id: "game",
        kind: "game",
        title: "لعبة الصدق",
        desc: "العب لعبة صغيرة واختر دائمًا كلمة الحق.",
        icon: "ri-gamepad-line",
        cta: "العب الآن",
        to: "/games?game=honest",
      },
      {
        id: "mission",
        kind: "mission",
        title: "مهمة نور: ماذا أفعل؟",
        desc: "موقفان صغيران، وأنت تختار التصرّف الأجمل.",
        icon: "ri-lightbulb-flash-line",
        cta: "ابدأ المهمة",
        mission: {
          type: "choices",
          intro: "سأحكي لك موقفين صغيرين، واختر ما تراه أجمل.",
          scenarios: [
            {
              id: "cup",
              icon: "ri-cup-line",
              prompt: "كسرتَ كوبًا بالخطأ بينما أمّك في المطبخ. ماذا تفعل؟",
              hint: "تلميح: الصدق يجعل القلب مطمئنًا.",
              choices: [
                {
                  text: "أخبرها بهدوء بما حدث",
                  good: true,
                  reply: "أحسنت! الصدق يجعل القلب مرتاحًا، وأمّك ستفرح بصراحتك.",
                },
                {
                  text: "أُخفي القطع وأسكت",
                  good: false,
                  reply: "فكّر مرة أخرى: هل سيرتاح قلبك لو أخفيت الأمر؟",
                },
                {
                  text: "أقول إن القطّة هي التي كسرته",
                  good: false,
                  reply: "جرّب مرة أخرى: القطّة لا تستطيع الدفاع عن نفسها. ما الذي يقوله الحق؟",
                },
              ],
            },
            {
              id: "homework",
              icon: "ri-pencil-ruler-2-line",
              prompt: "سألتك معلّمتك: هل أنهيت واجبك؟ وأنت لم تُنهِه بعد.",
              hint: "تلميح: قل الحقيقة، ثم أصلح الأمر.",
              choices: [
                {
                  text: "أقول: لم أُنهِه بعد، وسأنهيه الآن",
                  good: true,
                  reply: "رائع! من يقول الحق ثم يصلح الأمر يكبر في عيون الجميع.",
                },
                {
                  text: "أقول: نعم أنهيته",
                  good: false,
                  reply: "فكّر مرة أخرى: هل هذا هو الحق؟ يمكنك أن تختار كلامًا أصدق.",
                },
              ],
            },
          ],
        },
      },
    ],
  },

  v2: {
    valueId: "v2",
    jamoolIntro: "مرحبًا بك! اليوم نزرع شجرة التعاون. حين نتعاون تكبر الأشجار أسرع.",
    jamoolDone: "أزهرت شجرة التعاون! اليد مع اليد تصنع أشياء جميلة.",
    tone: { soft: "bg-leaf-100", strong: "text-leaf-800" },
    bloom: { main: "fill-accent-300", light: "fill-accent-100" },
    stations: [
      {
        id: "story",
        kind: "story",
        title: "حكاية الغزالة والصديقة",
        desc: "اقرأ كيف يساعد الأصدقاء بعضهم، وانتبه لما يفعلونه معًا.",
        icon: "ri-book-open-line",
        cta: "اقرأ الحكاية",
        to: "/stories/deer",
      },
      {
        id: "game",
        kind: "game",
        title: "لعبة الذاكرة معًا",
        desc: "العب مع أحد أفراد عائلتك بالتناوب، وساعدا بعضكما.",
        icon: "ri-mind-map",
        cta: "العب الآن",
        to: "/games?game=memory",
      },
      {
        id: "mission",
        kind: "mission",
        title: "رتّب خطوات التعاون",
        desc: "كيف نساعد صديقًا في ترتيب الغرفة؟ رتّب الخطوات.",
        icon: "ri-sort-asc",
        cta: "ابدأ المهمة",
        mission: {
          type: "order",
          intro: "صديقك يحتاج مساعدة في ترتيب غرفته.",
          prompt: "اضغط الخطوات بالترتيب الجميل، من الأولى إلى الأخيرة.",
          steps: [
            "أنتبه أن صديقي يحتاج مساعدة",
            "أسأله بلطف: هل أساعدك؟",
            "نرتّب الألعاب معًا",
            "نبتسم ونقول: شكرًا لك",
          ],
          shuffle: [2, 0, 3, 1],
          hint: "تلميح: نبدأ بالانتباه، ثم نسأل قبل أن نمدّ يدنا.",
        },
      },
    ],
  },

  v3: {
    valueId: "v3",
    jamoolIntro: "أهلًا! سنزرع شجرة الرحمة. الرحمة لطف في القلب وفي اليدين.",
    jamoolDone: "أزهرت شجرة الرحمة! قلبك لطيف وكبير.",
    tone: { soft: "bg-leaf-100", strong: "text-leaf-800" },
    bloom: { main: "fill-primary-500", light: "fill-primary-200" },
    stations: [
      {
        id: "story",
        kind: "story",
        title: "حكاية زهرة الجدة",
        desc: "اقرأ عن العناية بالزهرة وبمن نحب، بلطف وحنان.",
        icon: "ri-book-open-line",
        cta: "اقرأ الحكاية",
        to: "/stories/garden",
      },
      {
        id: "game",
        kind: "game",
        title: "لعبة إطعام الحيوانات",
        desc: "أطعم الحيوانات الصغيرة بلطف واهتمام.",
        icon: "ri-heart-3-line",
        cta: "العب الآن",
        to: "/games?game=feed",
      },
      {
        id: "mission",
        kind: "mission",
        title: "مهمة نور: كن لطيفًا",
        desc: "موقفان صغيران، وأنت تختار ما يفرّح القلوب.",
        icon: "ri-lightbulb-flash-line",
        cta: "ابدأ المهمة",
        mission: {
          type: "choices",
          intro: "هيا نتخيّل موقفين، ونختار الرحمة فيهما.",
          scenarios: [
            {
              id: "cat",
              icon: "ri-bear-smile-line",
              prompt: "رأيتَ قطّة صغيرة جائعة قرب البيت. ماذا تفعل؟",
              hint: "تلميح: القطّة خائفة وجائعة، فما الذي يُشعرها بالأمان؟",
              choices: [
                {
                  text: "أطلب من أمي طعامًا وماءً لها",
                  good: true,
                  reply: "ما أجمل قلبك! الرحمة أن نُطعم من يحتاج بلطف.",
                },
                {
                  text: "أركض نحوها لأُخيفها",
                  good: false,
                  reply: "فكّر مرة أخرى: كيف تشعر القطّة حين نخيفها؟",
                },
                {
                  text: "أتجاهلها وأكمل لعبي",
                  good: false,
                  reply: "جرّب مرة أخرى: هي تحتاج إلى من ينتبه لها. ما الذي يفعله القلب الرحيم؟",
                },
              ],
            },
            {
              id: "toy",
              icon: "ri-emotion-sad-line",
              prompt: "صديقك حزين لأن لعبته انكسرت. ماذا تفعل؟",
              hint: "تلميح: الكلمة الطيبة تُصلح القلب قبل اللعبة.",
              choices: [
                {
                  text: "أجلس بجانبه وأقول له كلامًا لطيفًا",
                  good: true,
                  reply: "أحسنت! الكلمة الطيبة تُفرح القلب الحزين.",
                },
                {
                  text: "أعرض عليه أن نصلحها معًا",
                  good: true,
                  reply: "فكرة رائعة! الرحمة أن نساعد وأن نكون قريبين.",
                },
                {
                  text: "أضحك على لعبته",
                  good: false,
                  reply: "فكّر مرة أخرى: هل يفرح صديقك لو ضحكنا؟ اختر ما يُسعده.",
                },
              ],
            },
          ],
        },
      },
    ],
  },

  v4: {
    valueId: "v4",
    jamoolIntro: "يا مرحبًا! سنزرع شجرة المسؤولية. نعتني بأشيائنا كما نعتني بالنبتة.",
    jamoolDone: "أزهرت شجرة المسؤولية! أنت تعتني بأشيائك، وهذا جميل جدًا.",
    tone: { soft: "bg-leaf-100", strong: "text-leaf-800" },
    bloom: { main: "fill-accent-300", light: "fill-accent-100" },
    stations: [
      {
        id: "story",
        kind: "story",
        title: "حكاية الروبوت الصغير",
        desc: "اقرأ كيف أدّى الروبوت مهمّته، ولاحظ كيف شعر بعدها.",
        icon: "ri-book-open-line",
        cta: "اقرأ الحكاية",
        to: "/stories/robot",
      },
      {
        id: "game",
        kind: "game",
        title: "لعبة زرع النبتة",
        desc: "اعتنِ بالنبتة الصغيرة خطوة بخطوة حتى تكبر.",
        icon: "ri-plant-line",
        cta: "العب الآن",
        to: "/games?game=plant",
      },
      {
        id: "mission",
        kind: "mission",
        title: "رتّب أشياءك بعد اللعب",
        desc: "رتّب خطوات الاعتناء بغرفتك بعد اللعب.",
        icon: "ri-sort-asc",
        cta: "ابدأ المهمة",
        mission: {
          type: "order",
          intro: "انتهى وقت اللعب، وغرفتك تنتظر لمستك.",
          prompt: "اضغط الخطوات بالترتيب الجميل، من الأولى إلى الأخيرة.",
          steps: [
            "أنتهي من اللعب",
            "أجمع الألعاب من الأرض",
            "أضع كل لعبة في مكانها",
            "أنظر إلى غرفتي المرتّبة وأبتسم",
          ],
          shuffle: [1, 3, 0, 2],
          hint: "تلميح: نبدأ بإنهاء اللعب، ثم نجمع، ثم نرتّب.",
        },
      },
    ],
  },

  v5: {
    valueId: "v5",
    jamoolIntro: "أهلًا بك! اليوم نزرع شجرة الإتقان. الشجرة الجميلة تحتاج صبرًا وعناية.",
    jamoolDone: "أزهرت شجرة الإتقان! عملك الجميل يلمع كالنجوم.",
    tone: { soft: "bg-leaf-100", strong: "text-leaf-800" },
    bloom: { main: "fill-primary-300", light: "fill-primary-100" },
    stations: [
      {
        id: "story",
        kind: "story",
        title: "حكاية رحلة إلى الفضاء",
        desc: "اقرأ الرحلة، وانتبه كيف يستعدّ الرحّالة بإتقان لكل خطوة.",
        icon: "ri-book-open-line",
        cta: "اقرأ الحكاية",
        to: "/stories/space",
      },
      {
        id: "game",
        kind: "game",
        title: "لعبة الكلمات",
        desc: "ركّز وأتقن كتابة الكلمة خطوة بخطوة.",
        icon: "ri-text",
        cta: "العب الآن",
        to: "/games?game=word",
      },
      {
        id: "mission",
        kind: "mission",
        title: "مهمة نور: أعمل بإتقان",
        desc: "موقفان صغيران، وأنت تختار العمل الأجمل.",
        icon: "ri-lightbulb-flash-line",
        cta: "ابدأ المهمة",
        mission: {
          type: "choices",
          intro: "الإتقان أن نُكمل عملنا بعناية. هيا نجرّب.",
          scenarios: [
            {
              id: "drawing",
              icon: "ri-brush-line",
              prompt: "لوّنتَ رسمة جميلة، لكن بقيت ألوان خارج الخطوط. ماذا تفعل؟",
              hint: "تلميح: العمل المتقن يحتاج لحظة هدوء.",
              choices: [
                {
                  text: "أُصلح ما أخطأت فيه بهدوء",
                  good: true,
                  reply: "أحسنت! لمسة صغيرة بهدوء تجعل الرسمة أجمل.",
                },
                {
                  text: "أتركها وأمضي بسرعة",
                  good: false,
                  reply: "فكّر مرة أخرى: كيف تصبح الرسمة أجمل وتفخر بها؟",
                },
              ],
            },
            {
              id: "bed",
              icon: "ri-hotel-bed-line",
              prompt: "طلبت منك أمّك أن ترتّب سريرك. ماذا تفعل؟",
              hint: "تلميح: نعمل ما نعمل بعناية من أوله إلى آخره.",
              choices: [
                {
                  text: "أرتّبه بعناية وأشدّ الغطاء جيدًا",
                  good: true,
                  reply: "رائع! العمل المتقن يُفرح من يراه ويُفرحك أنت.",
                },
                {
                  text: "أرمي الغطاء فوقه وأذهب",
                  good: false,
                  reply: "جرّب مرة أخرى: هل هذا أجمل ما تستطيع فعله؟",
                },
                {
                  text: "أتركه كما هو",
                  good: false,
                  reply: "فكّر مرة أخرى: كم تحتاج من الوقت لتجعل سريرك مرتبًا؟ دقيقة واحدة فقط.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
};

export const getJourney = (valueId: string | undefined): Journey | null =>
  valueId && journeys[valueId] ? journeys[valueId] : null;
