/**
 * The 28 Arabic letters in alphabet order, with everything the letter journey
 * needs: name, example words (each with a Remix icon), the four written forms
 * and a friendly pronunciation tip.
 *
 * `pic: false` marks a word whose icon is only a stand-in (Remix has no lion,
 * duck, etc.). Such words are spoken and shown with the letter itself, and are
 * never used as a picture choice in the quiz. When real art is generated, swap
 * the `icon` (or add an `image`) and drop the flag.
 */

export type LetterWord = {
  word: string;
  icon: string;
  /** false = the icon is not a faithful picture of the word */
  pic?: boolean;
};

export type LetterForms = {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
};

export type ArabicLetter = {
  id: string;
  letter: string;
  name: string;
  word: string;
  words: LetterWord[];
  forms: LetterForms;
  /** false for letters that never connect to the next letter (ا د ذ ر ز و) */
  joins: boolean;
  tip: string;
  tone: string;
};

const TATWEEL = "ـ";

const joined = (ch: string): LetterForms => ({
  isolated: ch,
  initial: ch + TATWEEL,
  medial: TATWEEL + ch + TATWEEL,
  final: TATWEEL + ch,
});

const unjoined = (ch: string): LetterForms => ({
  isolated: ch,
  initial: ch,
  medial: TATWEEL + ch,
  final: TATWEEL + ch,
});

const TONES = ["bg-sky-100 text-sky-700", "bg-primary-100 text-primary-800"];

/** a word with a faithful picture */
const w = (word: string, icon: string): LetterWord => ({ word, icon });
/** a word whose icon is only a stand-in */
const s = (word: string, icon = "ri-bear-smile-line"): LetterWord => ({ word, icon, pic: false });

type Row = {
  id: string;
  letter: string;
  name: string;
  words: LetterWord[];
  joins: boolean;
  tip: string;
};

const ROWS: Row[] = [
  { id: "alef", letter: "أ", name: "ألف", joins: false, words: [s("أسد"), w("أرض", "ri-earth-line"), w("ألوان", "ri-palette-line"), s("أرنب")], tip: "افتح فمك وقل «أَ» بصوت خفيف يخرج من أعلى الحلق." },
  { id: "baa", letter: "ب", name: "باء", joins: true, words: [s("بطة"), w("بيت", "ri-home-line"), w("باب", "ri-door-line")], tip: "أطبق شفتيك معًا ثم افتحهما بسرعة وقل «بَ»." },
  { id: "taa", letter: "ت", name: "تاء", joins: true, words: [s("تفاحة", "ri-sparkling-2-line"), w("تاج", "ri-vip-crown-line"), w("تلفاز", "ri-tv-line")], tip: "ضع طرف لسانك خلف أسنانك العليا وانطق «تَ» بخفّة." },
  { id: "thaa", letter: "ث", name: "ثاء", joins: true, words: [s("ثعلب"), w("ثلج", "ri-snowflake-line"), w("ثوب", "ri-shirt-line")], tip: "أخرج طرف لسانك قليلًا بين أسنانك وانفخ الهواء برفق «ثَ»." },
  { id: "jeem", letter: "ج", name: "جيم", joins: true, words: [s("جمل"), w("جرس", "ri-bell-line"), w("جبل", "ri-landscape-line")], tip: "ارفع وسط لسانك نحو سقف فمك وقل «جَ» بقوة لطيفة." },
  { id: "haa", letter: "ح", name: "حاء", joins: true, words: [s("حصان"), w("حقيبة", "ri-handbag-line"), w("حاسوب", "ri-computer-line")], tip: "افتح فمك واترك الهواء يخرج من وسط الحلق كأنك تنفخ على زجاج «حَ»." },
  { id: "khaa", letter: "خ", name: "خاء", joins: true, words: [s("خروف"), w("خيمة", "ri-tent-line"), w("خبز", "ri-bread-line")], tip: "ارفع آخر لسانك وأخرج صوتًا خشنًا من الحلق مثل «خَ»." },
  { id: "dal", letter: "د", name: "دال", joins: false, words: [s("دجاجة"), w("دراجة", "ri-bike-line"), w("دب", "ri-bear-smile-line")], tip: "المس بطرف لسانك أسنانك العليا وقل «دَ» بصوت ثابت." },
  { id: "dhal", letter: "ذ", name: "ذال", joins: false, words: [w("ذهب", "ri-coins-line"), w("ذبابة", "ri-bug-line"), s("ذرة", "ri-plant-line")], tip: "أخرج طرف لسانك بين أسنانك وقل «ذَ» مع اهتزاز في حلقك." },
  { id: "raa", letter: "ر", name: "راء", joins: false, words: [w("روبوت", "ri-robot-line"), w("ريشة", "ri-pen-nib-line"), s("رمان", "ri-sparkling-2-line")], tip: "ارفع طرف لسانك وحرّكه حركة خفيفة سريعة وقل «رَ»." },
  { id: "zay", letter: "ز", name: "زاي", joins: false, words: [w("زهرة", "ri-flower-line"), w("زورق", "ri-sailboat-line"), s("زرافة")], tip: "قرّب أسنانك من بعضها وقل «زَ» كأنك نحلة تطنّ." },
  { id: "seen", letter: "س", name: "سين", joins: true, words: [w("سيارة", "ri-car-line"), w("سفينة", "ri-ship-line"), w("ساعة", "ri-time-line")], tip: "قرّب أسنانك وأخرج هواءً رفيعًا كالأفعى «سسس»." },
  { id: "sheen", letter: "ش", name: "شين", joins: true, words: [w("شمس", "ri-sun-line"), w("شجرة", "ri-tree-line"), w("شمعة", "ri-candle-line")], tip: "ضمّ شفتيك قليلًا كأنك تطلب الهدوء «شششش»." },
  { id: "saad", letter: "ص", name: "صاد", joins: true, words: [w("صاروخ", "ri-rocket-line"), w("صورة", "ri-image-line"), s("صقر")], tip: "قل «سَ» لكن بفم ممتلئ وصوت أثقل فتصبح «صَ»." },
  { id: "daad", letter: "ض", name: "ضاد", joins: true, words: [w("ضوء", "ri-lightbulb-line"), w("ضباب", "ri-foggy-line"), s("ضفدع")], tip: "اضغط جانب لسانك على أضراسك وقل «ضَ» بصوت قويّ." },
  { id: "taa2", letter: "ط", name: "طاء", joins: true, words: [w("طائرة", "ri-plane-line"), w("طبق", "ri-bowl-line"), s("طاووس")], tip: "المس سقف فمك بطرف لسانك وافتح بسرعة وقل «طَ» بصوت ثقيل." },
  { id: "zaa", letter: "ظ", name: "ظاء", joins: true, words: [w("ظرف", "ri-mail-line"), s("ظبي"), s("ظفر", "ri-sparkling-2-line")], tip: "أخرج طرف لسانك قليلًا وقل «ظَ» بصوت ثقيل ممتلئ." },
  { id: "ayn", letter: "ع", name: "عين", joins: true, words: [w("عين", "ri-eye-line"), w("علم", "ri-flag-line"), s("عصفور")], tip: "اضغط حلقك برفق وقل «عَ» من عمق الحلق." },
  { id: "ghayn", letter: "غ", name: "غين", joins: true, words: [w("غيمة", "ri-cloud-line"), w("غابة", "ri-plant-line"), s("غزال")], tip: "اجعل صوتك كغرغرة خفيفة في آخر الفم «غَ»." },
  { id: "faa", letter: "ف", name: "فاء", joins: true, words: [w("فنجان", "ri-cup-line"), w("فرشاة", "ri-paint-brush-line"), s("فيل")], tip: "ضع أسنانك العليا على شفتك السفلى وانفخ برفق «فَ»." },
  { id: "qaaf", letter: "ق", name: "قاف", joins: true, words: [w("قمر", "ri-moon-line"), w("قلم", "ri-pencil-line"), w("قلب", "ri-heart-line")], tip: "ارفع آخر لسانك نحو الحلق وقل «قَ» بصوت عميق." },
  { id: "kaaf", letter: "ك", name: "كاف", joins: true, words: [w("كتاب", "ri-book-open-line"), w("كرة", "ri-basketball-line"), s("كلب")], tip: "ارفع مؤخرة لسانك قليلًا ثم أنزله بسرعة وقل «كَ»." },
  { id: "laam", letter: "ل", name: "لام", joins: true, words: [w("لعبة", "ri-gamepad-line"), w("لمبة", "ri-lightbulb-line"), s("ليمون", "ri-sparkling-2-line")], tip: "ضع طرف لسانك خلف أسنانك العليا وقل «لَ» بصوت لطيف." },
  { id: "meem", letter: "م", name: "ميم", joins: true, words: [w("مفتاح", "ri-key-line"), w("مظلة", "ri-umbrella-line"), w("مدرسة", "ri-school-line")], tip: "أطبق شفتيك وأصدر طنينًا لطيفًا «مممَ»." },
  { id: "noon", letter: "ن", name: "نون", joins: true, words: [w("نجمة", "ri-star-line"), w("نظارة", "ri-glasses-line"), w("نار", "ri-fire-line")], tip: "المس بطرف لسانك أعلى فمك ودع الصوت يمرّ من أنفك «نَ»." },
  { id: "haa2", letter: "ه", name: "هاء", joins: true, words: [w("هاتف", "ri-phone-line"), w("هدية", "ri-gift-line"), s("هلال", "ri-moon-clear-line")], tip: "افتح فمك وانفخ الهواء كأنك تدفّئ يديك «هَ»." },
  { id: "waaw", letter: "و", name: "واو", joins: false, words: [w("وردة", "ri-flower-line"), w("وجه", "ri-emotion-happy-line"), s("وسادة", "ri-sparkling-2-line")], tip: "اجعل شفتيك مدوّرتين كأنك ترسل قبلة وقل «وَ»." },
  { id: "yaa", letter: "ي", name: "ياء", joins: true, words: [w("ياقوتة", "ri-vip-diamond-line"), w("يخت", "ri-sailboat-line"), s("يمامة")], tip: "ابتسم قليلًا وارفع لسانك نحو سقف فمك وقل «يَ»." },
];

export const letters: ArabicLetter[] = ROWS.map((row, index) => ({
  id: row.id,
  letter: row.letter,
  name: row.name,
  word: row.words[0].word,
  words: row.words,
  forms: row.joins ? joined(row.letter) : unjoined(row.letter),
  joins: row.joins,
  tip: row.tip,
  tone: TONES[index % TONES.length],
}));

export const lettersTotal = letters.length;

export const getLetter = (id: string | undefined): ArabicLetter | undefined =>
  letters.find((item) => item.id === id);

export const letterIndex = (id: string): number => letters.findIndex((item) => item.id === id);

export type LetterToneFamily = "sky" | "primary";

export const toneFamily = (tone: string): LetterToneFamily => (tone.includes("sky") ? "sky" : "primary");
