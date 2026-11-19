/**
 * The 28 Arabic letters in alphabet order, with everything the letter journey
 * needs: name, example words (each with a real colour picture), the four written
 * forms and a friendly pronunciation tip.
 *
 * Every example word is a thing a child can see and name (lion, duck, apple...),
 * drawn with the Noto Emoji set (Apache-2.0) kept in /public/img/letters.
 */

export type LetterWord = {
  word: string;
  /** file name (code point) of the picture in /img/letters */
  pic: string;
};

/** the picture of an example word */
export const wordPic = (item: LetterWord): string => `/img/letters/${item.pic}.svg`;

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

/** a word and its picture */
const w = (word: string, pic: string): LetterWord => ({ word, pic });

type Row = {
  id: string;
  letter: string;
  name: string;
  words: LetterWord[];
  joins: boolean;
  tip: string;
};

const ROWS: Row[] = [
  { id: "alef", letter: "أ", name: "ألف", joins: false, words: [w("أسد", "1f981"), w("أرنب", "1f430"), w("أرض", "1f30d"), w("ألوان", "1f3a8")], tip: "افتح فمك وقل «أَ» بصوت خفيف يخرج من أعلى الحلق." },
  { id: "baa", letter: "ب", name: "باء", joins: true, words: [w("بطة", "1f986"), w("بيت", "1f3e0"), w("باب", "1f6aa")], tip: "أطبق شفتيك معًا ثم افتحهما بسرعة وقل «بَ»." },
  { id: "taa", letter: "ت", name: "تاء", joins: true, words: [w("تفاحة", "1f34e"), w("تاج", "1f451"), w("تمساح", "1f40a")], tip: "ضع طرف لسانك خلف أسنانك العليا وانطق «تَ» بخفّة." },
  { id: "thaa", letter: "ث", name: "ثاء", joins: true, words: [w("ثعلب", "1f98a"), w("ثلج", "2744"), w("ثعبان", "1f40d")], tip: "أخرج طرف لسانك قليلًا بين أسنانك وانفخ الهواء برفق «ثَ»." },
  { id: "jeem", letter: "ج", name: "جيم", joins: true, words: [w("جمل", "1f42a"), w("جرس", "1f514"), w("جبل", "26f0")], tip: "ارفع وسط لسانك نحو سقف فمك وقل «جَ» بقوة لطيفة." },
  { id: "haa", letter: "ح", name: "حاء", joins: true, words: [w("حصان", "1f434"), w("حقيبة", "1f392"), w("حاسوب", "1f4bb")], tip: "افتح فمك واترك الهواء يخرج من وسط الحلق كأنك تنفخ على زجاج «حَ»." },
  { id: "khaa", letter: "خ", name: "خاء", joins: true, words: [w("خروف", "1f411"), w("خيمة", "26fa"), w("خبز", "1f35e")], tip: "ارفع آخر لسانك وأخرج صوتًا خشنًا من الحلق مثل «خَ»." },
  { id: "dal", letter: "د", name: "دال", joins: false, words: [w("دجاجة", "1f414"), w("دراجة", "1f6b2"), w("دب", "1f43b")], tip: "المس بطرف لسانك أسنانك العليا وقل «دَ» بصوت ثابت." },
  { id: "dhal", letter: "ذ", name: "ذال", joins: false, words: [w("ذهب", "1fa99"), w("ذبابة", "1fab0"), w("ذرة", "1f33d")], tip: "أخرج طرف لسانك بين أسنانك وقل «ذَ» مع اهتزاز في حلقك." },
  { id: "raa", letter: "ر", name: "راء", joins: false, words: [w("روبوت", "1f916"), w("ريشة", "1fab6"), w("رقم", "1f522")], tip: "ارفع طرف لسانك وحرّكه حركة خفيفة سريعة وقل «رَ»." },
  { id: "zay", letter: "ز", name: "زاي", joins: false, words: [w("زرافة", "1f992"), w("زهرة", "1f338"), w("زورق", "1f6f6")], tip: "قرّب أسنانك من بعضها وقل «زَ» كأنك نحلة تطنّ." },
  { id: "seen", letter: "س", name: "سين", joins: true, words: [w("سمكة", "1f41f"), w("سيارة", "1f697"), w("ساعة", "23f0")], tip: "قرّب أسنانك وأخرج هواءً رفيعًا كالأفعى «سسس»." },
  { id: "sheen", letter: "ش", name: "شين", joins: true, words: [w("شمس", "2600"), w("شجرة", "1f333"), w("شمعة", "1f56f")], tip: "ضمّ شفتيك قليلًا كأنك تطلب الهدوء «شششش»." },
  { id: "saad", letter: "ص", name: "صاد", joins: true, words: [w("صقر", "1f985"), w("صاروخ", "1f680"), w("صورة", "1f5bc")], tip: "قل «سَ» لكن بفم ممتلئ وصوت أثقل فتصبح «صَ»." },
  { id: "daad", letter: "ض", name: "ضاد", joins: true, words: [w("ضفدع", "1f438"), w("ضوء", "1f4a1"), w("ضباب", "1f32b")], tip: "اضغط جانب لسانك على أضراسك وقل «ضَ» بصوت قويّ." },
  { id: "taa2", letter: "ط", name: "طاء", joins: true, words: [w("طاووس", "1f99a"), w("طائرة", "2708"), w("طبق", "1f37d")], tip: "المس سقف فمك بطرف لسانك وافتح بسرعة وقل «طَ» بصوت ثقيل." },
  { id: "zaa", letter: "ظ", name: "ظاء", joins: true, words: [w("ظبي", "1f98c"), w("ظرف", "2709"), w("ظفر", "1f485")], tip: "أخرج طرف لسانك قليلًا وقل «ظَ» بصوت ثقيل ممتلئ." },
  { id: "ayn", letter: "ع", name: "عين", joins: true, words: [w("عصفور", "1f426"), w("عين", "1f441"), w("علم", "1f6a9")], tip: "اضغط حلقك برفق وقل «عَ» من عمق الحلق." },
  { id: "ghayn", letter: "غ", name: "غين", joins: true, words: [w("غزال", "1f98c"), w("غيمة", "2601"), w("غابة", "1f332")], tip: "اجعل صوتك كغرغرة خفيفة في آخر الفم «غَ»." },
  { id: "faa", letter: "ف", name: "فاء", joins: true, words: [w("فيل", "1f418"), w("فنجان", "2615"), w("فرشاة", "1f58c")], tip: "ضع أسنانك العليا على شفتك السفلى وانفخ برفق «فَ»." },
  { id: "qaaf", letter: "ق", name: "قاف", joins: true, words: [w("قمر", "1f319"), w("قلم", "270f"), w("قلب", "2764")], tip: "ارفع آخر لسانك نحو الحلق وقل «قَ» بصوت عميق." },
  { id: "kaaf", letter: "ك", name: "كاف", joins: true, words: [w("كلب", "1f436"), w("كتاب", "1f4d6"), w("كرة", "26bd")], tip: "ارفع مؤخرة لسانك قليلًا ثم أنزله بسرعة وقل «كَ»." },
  { id: "laam", letter: "ل", name: "لام", joins: true, words: [w("ليمون", "1f34b"), w("لعبة", "1f3ae"), w("لمبة", "1f4a1")], tip: "ضع طرف لسانك خلف أسنانك العليا وقل «لَ» بصوت لطيف." },
  { id: "meem", letter: "م", name: "ميم", joins: true, words: [w("مفتاح", "1f511"), w("مظلة", "2602"), w("مدرسة", "1f3eb")], tip: "أطبق شفتيك وأصدر طنينًا لطيفًا «مممَ»." },
  { id: "noon", letter: "ن", name: "نون", joins: true, words: [w("نجمة", "2b50"), w("نظارة", "1f453"), w("نار", "1f525")], tip: "المس بطرف لسانك أعلى فمك ودع الصوت يمرّ من أنفك «نَ»." },
  { id: "haa2", letter: "ه", name: "هاء", joins: true, words: [w("هلال", "1f319"), w("هاتف", "1f4f1"), w("هدية", "1f381")], tip: "افتح فمك وانفخ الهواء كأنك تدفّئ يديك «هَ»." },
  { id: "waaw", letter: "و", name: "واو", joins: false, words: [w("وردة", "1f339"), w("وجه", "1f60a"), w("ولد", "1f466")], tip: "اجعل شفتيك مدوّرتين كأنك ترسل قبلة وقل «وَ»." },
  { id: "yaa", letter: "ي", name: "ياء", joins: true, words: [w("يد", "270b"), w("يخت", "26f5"), w("يمامة", "1f54a")], tip: "ابتسم قليلًا وارفع لسانك نحو سقف فمك وقل «يَ»." },
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
