/**
 * Story content for the interactive reader.
 *
 * Text mini-markup (resolved by `@/pages/story/components/parse`):
 *   {name}            -> the hero's name (default hero, or the active child when "make me the hero" is on)
 *   {word|meaning}    -> a tappable vocabulary word with a small meaning bubble
 *   [masc|fem]        -> gendered form, first = masculine, second = feminine
 *                        (so the text still reads correctly when a child becomes the hero)
 *
 * All text is plain modern standard Arabic without diacritics.
 */

export type StoryPage = {
  text: string;
  /** Remix icon class shown on the picture */
  icon: string;
  /** CSS object-position / transform-origin so the single cover image looks like a new scene */
  focus: string;
  /** zoom factor applied to the cover image */
  zoom: number;
};

export type QuizQuestion =
  | { kind: "choice"; q: string; options: string[]; answer: number; hint: string }
  | { kind: "tf"; q: string; answer: boolean; hint: string }
  | {
      kind: "picture";
      q: string;
      options: { icon: string; label: string }[];
      answer: number;
      hint: string;
    };

export type StoryContent = {
  id: string;
  heroName: string;
  /** gender of the default hero, used when the hero is not replaced */
  heroGender: "m" | "f";
  moral: string;
  moralIcon: string;
  pages: StoryPage[];
  quiz: QuizQuestion[];
};

const pg = (text: string, icon: string, focus: string, zoom: number): StoryPage => ({
  text,
  icon,
  focus,
  zoom,
});

export const storyContent: Record<string, StoryContent> = {
  /* ------------------------------------------------------------------ lion */
  lion: {
    id: "lion",
    heroName: "ليث",
    heroGender: "m",
    moral: "الصدق شجاعة، والاعتذار يصلح الأخطاء.",
    moralIcon: "ri-heart-3-line",
    pages: [
      pg(
        "في صباح جميل، [استيقظ|استيقظت] {name} [الأسد الصغير|اللبؤة الصغيرة] في {الغابة|مكان فيه أشجار كثيرة}. كانت الشمس تضحك بين الأغصان.",
        "ri-sun-line",
        "20% 40%",
        1.05
      ),
      pg(
        "[ركض|ركضت] {name} بين الأشجار [وهو يغني|وهي تغني]، [وقفز|وقفزت] فوق الصخور الصغيرة.",
        "ri-run-line",
        "78% 55%",
        1.4
      ),
      pg(
        "فجأة، [اصطدم|اصطدمت] {name} بشجرة كبيرة، وسقط عش صغير على الأرض!",
        "ri-alert-line",
        "50% 20%",
        1.7
      ),
      pg(
        "كان العش بيت العصفورة سلمى. وقفت سلمى على غصن قريب، وصوتها حزين.",
        "ri-home-heart-line",
        "15% 75%",
        1.5
      ),
      pg(
        "[خاف|خافت] {name} [وفكر|وفكرت] قليلا: هل أهرب ولا أخبر أحدا؟ لكن [قلبه|قلبها] قال: الصدق أجمل.",
        "ri-question-line",
        "62% 30%",
        1.25
      ),
      pg(
        "[اقترب|اقتربت] {name} من العصفورة، [وقال|وقالت] بصوت هادئ: أنا آسف، أنا الذي أسقطت عشك. سأساعدك الآن.",
        "ri-chat-heart-line",
        "85% 70%",
        1.6
      ),
      pg(
        "ابتسمت العصفورة وقالت: شكرا لك، ما أجمل {الصدق|أن نقول الحقيقة دائما}! [وبنيا|وبنتا] العش معا، وعاد أجمل من قبل.",
        "ri-hearts-line",
        "40% 60%",
        1.15
      ),
    ],
    quiz: [
      {
        kind: "choice",
        q: "ماذا سقط على الأرض في القصة؟",
        options: ["عش العصفورة", "ثمرة تفاح", "حجر كبير"],
        answer: 0,
        hint: "تذكر: العصفورة كانت حزينة على بيتها.",
      },
      {
        kind: "tf",
        q: "[قال|قالت] {name} الحقيقة واعتذر من العصفورة.",
        answer: true,
        hint: "فكر: ماذا قال القلب حين خاف؟ لقد اختار الصدق.",
      },
      {
        kind: "picture",
        q: "أي صورة تشبه شعور العصفورة في آخر القصة؟",
        options: [
          { icon: "ri-emotion-happy-line", label: "سعيدة" },
          { icon: "ri-emotion-unhappy-line", label: "حزينة" },
          { icon: "ri-zzz-line", label: "نائمة" },
        ],
        answer: 0,
        hint: "في النهاية عاد العش أجمل من قبل، فابتسمت العصفورة.",
      },
    ],
  },

  /* ----------------------------------------------------------------- space */
  space: {
    id: "space",
    heroName: "سلمى",
    heroGender: "f",
    moral: "حين نتعاون نصنع النور، ونشكر الله على جمال خلقه.",
    moralIcon: "ri-sparkling-2-line",
    pages: [
      pg(
        "[كان|كانت] {name} [يحب|تحب] النجوم كثيرا. كل ليلة [يعد|تعد] النجوم من النافذة [ويتخيل|وتتخيل] كم هي بعيدة.",
        "ri-star-smile-line",
        "18% 25%",
        1.1
      ),
      pg(
        "وفي ليلة هادئة ظهرت سفينة فضاء لامعة في الحديقة، وخرجت منها نجمة صغيرة اسمها لمعة.",
        "ri-rocket-2-line",
        "70% 60%",
        1.5
      ),
      pg(
        "قالت لمعة: ضاع ضوء القمر الصغير، هل [تساعدني|تساعدينني]؟ [فقال|فقالت] {name}: نعم، هيا بنا!",
        "ri-question-answer-line",
        "40% 35%",
        1.3
      ),
      pg(
        "[ركب|ركبت] {name} السفينة، [وطارا|وطارتا] بين {الكواكب|أجسام كبيرة تدور حول الشمس مثل الأرض}.",
        "ri-planet-line",
        "85% 20%",
        1.6
      ),
      pg(
        "[رأيا|رأتا] كوكبا أحمر وكوكبا أزرق وكوكبا له حلقات جميلة. [فقال|فقالت] {name}: سبحان الله، ما أجمل خلقه!",
        "ri-earth-line",
        "30% 70%",
        1.8
      ),
      pg(
        "[وجدا|وجدتا] القمر الصغير خلف سحابة، وهو خائف من الظلام. [قال|قالت] {name}: لا تخف، نحن معك.",
        "ri-moon-clear-line",
        "58% 15%",
        1.45
      ),
      pg(
        "[تعاونا|تعاونتا] معا ورفعا القمر إلى مكانه، فأضاء الليل من جديد. [وعاد|وعادت] {name} إلى [بيته|بيتها] [سعيدا|سعيدة].",
        "ri-sun-foggy-line",
        "50% 50%",
        1.1
      ),
    ],
    quiz: [
      {
        kind: "choice",
        q: "من الصديقة التي طلبت المساعدة في القصة؟",
        options: ["لمعة النجمة الصغيرة", "الروبوت", "كوكب الأرض"],
        answer: 0,
        hint: "هي نجمة صغيرة خرجت من سفينة الفضاء.",
      },
      {
        kind: "tf",
        q: "كان القمر الصغير غاضبا.",
        answer: false,
        hint: "تذكر: كان خائفا من الظلام، ولم يكن غاضبا.",
      },
      {
        kind: "picture",
        q: "أي صورة تدل على المكان الذي سافر إليه {name}؟",
        options: [
          { icon: "ri-rocket-2-line", label: "الفضاء" },
          { icon: "ri-sailboat-line", label: "البحر" },
          { icon: "ri-plant-line", label: "الحديقة" },
        ],
        answer: 0,
        hint: "ركب في سفينة طارت بين الكواكب والنجوم.",
      },
    ],
  },

  /* ------------------------------------------------------------------ deer */
  deer: {
    id: "deer",
    heroName: "ريم",
    heroGender: "f",
    moral: "الخير الذي نقدمه للآخرين يعود إلينا.",
    moralIcon: "ri-hand-heart-line",
    pages: [
      pg(
        "[عاش|عاشت] [الغزال|الغزالة] {name} في {الغابة الذهبية|غابة تلمع أوراقها بلون الذهب}. وكان [له|لها] أصدقاء كثيرون.",
        "ri-leaf-line",
        "25% 35%",
        1.05
      ),
      pg(
        "في يوم حار جف النهر الصغير، وعطش الجميع. جلس الأصدقاء تحت الشجرة وهم حزينون.",
        "ri-sun-line",
        "80% 25%",
        1.4
      ),
      pg(
        "[ذهب|ذهبت] {name} [يبحث|تبحث] عن الماء، [فسمع|فسمعت] صوت لينا الأرنبة تبكي.",
        "ri-search-eye-line",
        "45% 65%",
        1.55
      ),
      pg(
        "كانت لينا قد وقعت في حفرة عميقة، ولا تستطيع الخروج وحدها.",
        "ri-error-warning-line",
        "12% 70%",
        1.8
      ),
      pg(
        "[فكر|فكرت] {name}: إن ساعدت لينا فسأتأخر عن الماء. لكن [قلبه|قلبها] الطيب لم {يتردد|يفكر كثيرا ولا يقرر}.",
        "ri-heart-pulse-line",
        "60% 40%",
        1.3
      ),
      pg(
        "[مد|مدت] {name} غصنا طويلا إلى الحفرة، وتمسكت به لينا، [وسحبها|وسحبتها] بقوة حتى خرجت.",
        "ri-plant-line",
        "88% 55%",
        1.7
      ),
      pg(
        "[شكرته|شكرتها] لينا وقالت: [اتبعني|اتبعيني]، أعرف نبعا فيه ماء كثير! [فشرب|فشربت] الجميع وفرحوا.",
        "ri-drop-line",
        "35% 80%",
        1.2
      ),
    ],
    quiz: [
      {
        kind: "choice",
        q: "لماذا حزن الأصدقاء في القصة؟",
        options: ["جف النهر الصغير", "نزل مطر كثير", "ضاعت ألعابهم"],
        answer: 0,
        hint: "كان الجو حارا والجميع عطشان.",
      },
      {
        kind: "tf",
        q: "[ساعد|ساعدت] {name} لينا رغم أنها ستتأخر.",
        answer: true,
        hint: "تذكر: القلب الطيب لم يتردد.",
      },
      {
        kind: "picture",
        q: "ماذا استخدمت {name} لتنقذ لينا؟",
        options: [
          { icon: "ri-leaf-line", label: "غصن شجرة" },
          { icon: "ri-umbrella-line", label: "مظلة" },
          { icon: "ri-drop-line", label: "ماء" },
        ],
        answer: 0,
        hint: "مدت شيئا طويلا من الشجرة إلى الحفرة.",
      },
    ],
  },

  /* --------------------------------------------------------------- dolphin */
  dolphin: {
    id: "dolphin",
    heroName: "زياد",
    heroGender: "m",
    moral: "نحافظ على البحر والطبيعة نظيفين، لأنها بيتنا جميعا.",
    moralIcon: "ri-earth-line",
    pages: [
      pg(
        "[عاش|عاشت] [الدلفين|الدلفينة] {name} في بحر أزرق واسع. [وكان|وكانت] [يحب|تحب] اللعب مع الأمواج.",
        "ri-sailboat-line",
        "25% 45%",
        1.05
      ),
      pg(
        "كل صباح [يسبح|تسبح] مع [أصدقائه|أصدقائها] الأسماك الملونة بين {الشعاب|صخور ملونة تنمو تحت البحر}.",
        "ri-bubble-chart-line",
        "75% 65%",
        1.5
      ),
      pg(
        "وفي يوم [رأى|رأت] {name} شيئا غريبا يطفو على الماء: كيس بلاستيك كبير!",
        "ri-eye-line",
        "50% 25%",
        1.6
      ),
      pg(
        "كانت السلحفاة الصغيرة سلوى عالقة داخل الكيس، وتبكي بصوت خافت.",
        "ri-heart-pulse-line",
        "14% 60%",
        1.8
      ),
      pg(
        "[نادى|نادت] {name} [أصدقاءه|أصدقاءها] [وقال|وقالت] لهم بصوت عال: تعالوا نساعد سلوى!",
        "ri-megaphone-line",
        "88% 30%",
        1.35
      ),
      pg(
        "تعاونت الدلافين كلها، وفتحوا الكيس بحذر فخرجت سلوى، ثم دفعوه إلى الشاطئ ليأخذه الناس.",
        "ri-team-line",
        "40% 75%",
        1.25
      ),
      pg(
        "سبحت سلوى حرة وقالت: شكرا يا أصدقاء! [قال|قالت] {name}: البحر بيتنا جميعا، فلنحافظ عليه نظيفا.",
        "ri-water-flash-line",
        "62% 50%",
        1.1
      ),
    ],
    quiz: [
      {
        kind: "choice",
        q: "من الصديقة التي علقت داخل الكيس؟",
        options: ["السلحفاة سلوى", "السمكة الصغيرة", "الحوت الكبير"],
        answer: 0,
        hint: "هي صديقة بطيئة وصغيرة، اسمها سلوى.",
      },
      {
        kind: "tf",
        q: "تعاونت الدلافين لإنقاذ السلحفاة.",
        answer: true,
        hint: "تذكر: نادى البطل أصدقاءه فجاء الجميع.",
      },
      {
        kind: "picture",
        q: "أين نضع الأكياس بعد استعمالها؟",
        options: [
          { icon: "ri-delete-bin-line", label: "سلة النفايات" },
          { icon: "ri-sailboat-line", label: "البحر" },
          { icon: "ri-tree-line", label: "الغابة" },
        ],
        answer: 0,
        hint: "نحافظ على البحر نظيفا، فلا نرمي فيه شيئا.",
      },
    ],
  },

  /* ----------------------------------------------------------------- robot */
  robot: {
    id: "robot",
    heroName: "عمر",
    heroGender: "m",
    moral: "المحاولة والصبر يحولان الخطأ إلى نجاح.",
    moralIcon: "ri-seedling-line",
    pages: [
      pg(
        "[كان|كانت] {name} [يحب|تحب] الاختراع. وفي [غرفته|غرفتها] صندوق مليء بالمسامير والأسلاك والأزرار الصغيرة.",
        "ri-tools-line",
        "20% 40%",
        1.1
      ),
      pg(
        "[قال|قالت] {name}: بسم الله، [وبدأ|وبدأت] [يصنع|تصنع] روبوتا صغيرا [بيديه|بيديها].",
        "ri-settings-3-line",
        "70% 55%",
        1.5
      ),
      pg(
        "بعد ساعات طويلة أضاء الروبوت عينيه وقال: مرحبا! أنا رامو، سعيد بلقائك.",
        "ri-robot-2-line",
        "48% 30%",
        1.6
      ),
      pg(
        "لكن رامو أخطأ، فقد حمل كوب العصير فانسكب على الأرض. حزن وقال: أنا لا {أنفع|أفيد غيري}.",
        "ri-cup-line",
        "86% 70%",
        1.75
      ),
      pg(
        "[ابتسم|ابتسمت] {name} [وقال|وقالت]: الخطأ جزء من التعلم، تعال نحاول مرة أخرى.",
        "ri-emotion-happy-line",
        "30% 20%",
        1.3
      ),
      pg(
        "تدرب رامو كل يوم، وتعلم {الصبر|أن نهدأ وننتظر ولا نتعجل}، وتعلم أن يمسك الأشياء بلطف.",
        "ri-timer-line",
        "58% 78%",
        1.4
      ),
      pg(
        "وفي صباح الجمعة حمل رامو كوب عصير إلى جدة {name}، ولم ينسكب منه شيء. فرح الجميع وصفقوا.",
        "ri-medal-line",
        "40% 50%",
        1.15
      ),
    ],
    quiz: [
      {
        kind: "choice",
        q: "ماذا انسكب على الأرض؟",
        options: ["كوب العصير", "كوب الحليب", "وعاء الماء"],
        answer: 0,
        hint: "رامو حمل شيئا حلوا وبرتقاليا.",
      },
      {
        kind: "tf",
        q: "[قال|قالت] {name} إن الخطأ جزء من التعلم.",
        answer: true,
        hint: "قال ذلك ليشجع رامو على المحاولة من جديد.",
      },
      {
        kind: "picture",
        q: "ما الذي ساعد رامو على النجاح؟",
        options: [
          { icon: "ri-run-line", label: "التدريب" },
          { icon: "ri-zzz-line", label: "النوم" },
          { icon: "ri-gamepad-line", label: "اللعب" },
        ],
        answer: 0,
        hint: "تدرب رامو كل يوم بصبر.",
      },
    ],
  },

  /* ---------------------------------------------------------------- garden */
  garden: {
    id: "garden",
    heroName: "ليلى",
    heroGender: "f",
    moral: "الاعتناء بمن نحب واللطف مع الكبار يجعلان الدنيا أجمل.",
    moralIcon: "ri-flower-line",
    pages: [
      pg(
        "[كان|كانت] {name} [يحب|تحب] زيارة [جدته|جدتها] كل يوم جمعة، فبيتها دافئ ورائحته طيبة.",
        "ri-home-heart-line",
        "22% 35%",
        1.05
      ),
      pg(
        "كانت في الحديقة زهرة صغيرة حزينة، أوراقها صفراء و{ذابلة|مائلة إلى الأرض لأنها عطشانة}.",
        "ri-plant-line",
        "75% 60%",
        1.6
      ),
      pg(
        "قالت الجدة: الزهرة تحتاج إلى ماء وحب كل يوم. هل [تعتني|تعتنين] بها [يا حبيبي|يا حبيبتي]؟",
        "ri-chat-heart-line",
        "45% 25%",
        1.3
      ),
      pg(
        "[قال|قالت] {name} بفرح: نعم يا جدتي، أعدك أن أسقيها كل صباح!",
        "ri-emotion-happy-line",
        "12% 55%",
        1.7
      ),
      pg(
        "كل صباح، [سقى|سقت] {name} الزهرة [وغنى|وغنت] لها أغنية حلوة. لم [يتعجل|تتعجل]، فالصبر جميل.",
        "ri-drop-line",
        "88% 40%",
        1.45
      ),
      pg(
        "مرت الأيام، وفي صباح جمعة تفتحت الزهرة بلون وردي جميل ورائحة طيبة.",
        "ri-flower-line",
        "52% 70%",
        1.9
      ),
      pg(
        "[أخذ|أخذت] {name} [جدته|جدتها] إلى الحديقة. ابتسمت الجدة ودعت [له|لها]: بارك الله فيك يا [بني|بنيتي].",
        "ri-hearts-line",
        "35% 45%",
        1.15
      ),
    ],
    quiz: [
      {
        kind: "choice",
        q: "ما لون الزهرة بعد أن تفتحت؟",
        options: ["وردي", "أسود", "أزرق"],
        answer: 0,
        hint: "كان لونا جميلا يشبه لون الخدود الدافئة.",
      },
      {
        kind: "tf",
        q: "تحتاج الزهرة إلى ماء وحب كل يوم.",
        answer: true,
        hint: "هذا ما قالته الجدة عن الزهرة.",
      },
      {
        kind: "picture",
        q: "أي صورة تدل على عناية {name} بالزهرة؟",
        options: [
          { icon: "ri-drop-line", label: "سقاية الماء" },
          { icon: "ri-gamepad-line", label: "اللعب فقط" },
          { icon: "ri-zzz-line", label: "النوم" },
        ],
        answer: 0,
        hint: "كل صباح كانت تفعل شيئا يرطب الزهرة.",
      },
    ],
  },
};

export const getStoryContent = (id: string): StoryContent | undefined => storyContent[id];

export const storyPageCount = (id: string): number => storyContent[id]?.pages.length ?? 0;
