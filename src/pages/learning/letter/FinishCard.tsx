import { Link } from "react-router-dom";
import Character from "@/components/brand/Character";
import { lettersTotal, wordPic, type ArabicLetter } from "@/data/letters";
import { ar, BTN_PRIMARY, BTN_SECONDARY, type ToneKit } from "./kit";
import { Sparkles, Stars } from "./parts";

export default function FinishCard({
  letter,
  next,
  tone,
  stars,
  traceStars,
  quizStars,
  mastered,
  onRestart,
}: {
  letter: ArabicLetter;
  next: ArabicLetter | null;
  tone: ToneKit;
  stars: number;
  traceStars: number;
  quizStars: number;
  mastered: number;
  onRestart: () => void;
}) {
  return (
    <div className="animate-celebrate-pop">
      <div className={`relative overflow-hidden rounded-4xl ${tone.soft} px-4 py-8 text-center sm:px-6 md:py-12`}>
        <Sparkles run={1} />

        <div className="flex items-end justify-center gap-4">
          <Character name="jamool" size="lg" motion="cheer" decorative />
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full bg-background-50 font-heading text-5xl font-bold leading-none text-sky-700 md:h-24 md:w-24 md:text-6xl"
            lang="ar"
          >
            {letter.letter}
          </span>
        </div>
        <ul className="mt-5 flex items-center justify-center gap-2" aria-label="كلمات الحرف">
          {letter.words.map((item, i) => (
            <li key={item.word} className="flex flex-col items-center rounded-3xl bg-background-50 px-3 pb-2 pt-3 shadow-[0_5px_0_rgb(0_0_0/0.07)]" style={{ animationDelay: `${i * 120}ms` }}>
              <img src={wordPic(item)} alt="" draggable={false} className="h-14 w-14 object-contain animate-celebrate-pop md:h-16 md:w-16" />
              <span className="mt-1 font-heading text-sm font-bold text-foreground-800">{item.word}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm font-bold text-sky-700">أحسنت!</p>
        <h3 className="mt-1 text-2xl font-bold md:text-4xl">
          أتقنت حرف {letter.name}
        </h3>
        <div className="mt-4">
          <Stars value={stars} size="text-5xl" />
        </div>

        <ul className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2">
          <li className="inline-flex items-center gap-2 rounded-full bg-background-50 px-4 py-2 text-xs font-bold text-foreground-700">
            <i className="ri-brush-line text-base text-sky-600" />
            الرسم
            <Stars value={traceStars} size="text-sm" animate={false} />
          </li>
          <li className="inline-flex items-center gap-2 rounded-full bg-background-50 px-4 py-2 text-xs font-bold text-foreground-700">
            <i className="ri-image-line text-base text-sky-600" />
            اختيار الصورة
            <Stars value={quizStars} size="text-sm" animate={false} />
          </li>
          <li className="inline-flex items-center gap-2 rounded-full bg-background-50 px-4 py-2 text-xs font-bold text-foreground-700">
            <i className="ri-text text-base text-sky-600" />
            أتقنت {ar(mastered)} من {ar(lettersTotal)} حرفًا
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {next ? (
            <Link to={`/learning/letter/${next.id}`} className={BTN_PRIMARY}>
              الحرف التالي: {next.name}
              <i className="ri-arrow-left-line" />
            </Link>
          ) : null}
          <Link to="/learning" className={BTN_SECONDARY}>
            <i className="ri-apps-2-line" />
            كل الحروف
          </Link>
          <button type="button" onClick={onRestart} className={BTN_SECONDARY}>
            <i className="ri-restart-line" />
            أعد الرحلة
          </button>
        </div>
      </div>
    </div>
  );
}
