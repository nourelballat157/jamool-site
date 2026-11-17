import Character from "@/components/brand/Character";
import useArabicSpeech from "@/hooks/useArabicSpeech";
import type { ArabicLetter } from "@/data/letters";
import { BTN_PRIMARY, type ToneKit } from "./kit";

const FORM_LABELS: { key: "isolated" | "initial" | "medial" | "final"; label: string }[] = [
  { key: "isolated", label: "منفصل" },
  { key: "initial", label: "أول الكلمة" },
  { key: "medial", label: "وسط الكلمة" },
  { key: "final", label: "آخر الكلمة" },
];

export default function WatchStep({
  letter,
  tone,
  onNext,
}: {
  letter: ArabicLetter;
  tone: ToneKit;
  onNext: () => void;
}) {
  const { speaking, speak, speakSequence, stop } = useArabicSpeech();

  const playAll = () => speakSequence([letter.name, ...letter.words.map((item) => item.word)]);

  return (
    <div className="animate-rise-in">
      <div className="grid gap-5 lg:grid-cols-2">
        <div
          className={`relative flex flex-col items-center justify-center overflow-hidden rounded-4xl ${tone.soft} px-4 py-8 text-center sm:px-6 md:py-10`}
        >
          <i aria-hidden="true" className="ri-sparkling-2-fill absolute start-6 top-6 hidden text-2xl text-primary-400 animate-twinkle sm:block" />
          <i aria-hidden="true" className="ri-star-fill absolute end-7 top-10 hidden text-lg text-primary-300 animate-twinkle sm:block" />
          <span className="rounded-full bg-background-50/80 px-4 py-1.5 text-xs font-bold text-foreground-700">
            حرف {letter.name}
          </span>
          <span
            className={`mt-2 font-heading text-[9rem] font-bold leading-[1.15] md:text-[12rem] ${tone.text} motion-safe:animate-floaty`}
            lang="ar"
          >
            {letter.letter}
          </span>
          <p className="font-heading text-lg font-bold text-foreground-900">
            {letter.name} — {letter.word}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={playAll}
              className={`${BTN_PRIMARY} ${speaking ? "lj-nudge" : ""}`}
            >
              <i className={speaking ? "ri-volume-up-fill animate-pulse" : "ri-volume-up-line"} />
              استمع للحرف وكلماته
            </button>
            <button
              type="button"
              onClick={stop}
              aria-label="إيقاف الصوت"
              className="btn-icon"
            >
              <i className="ri-stop-circle-line text-xl" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <section className="card p-4 md:p-5" aria-labelledby="lj-forms">
            <h3 id="lj-forms" className="text-lg font-bold">
              أشكال الحرف في الكلمات
            </h3>
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {FORM_LABELS.map(({ key, label }) => (
                <li
                  key={key}
                  className={`flex flex-col items-center rounded-3xl ${tone.softer} px-1 py-3`}
                >
                  <span
                    dir="rtl"
                    lang="ar"
                    className={`font-heading text-4xl font-bold leading-tight md:text-5xl ${tone.text}`}
                  >
                    {letter.forms[key]}
                  </span>
                  <span className="mt-1 text-center text-[11px] font-medium leading-tight text-foreground-600">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
            {!letter.joins ? (
              <p className="mt-3 flex items-start gap-2 text-xs font-medium text-foreground-600">
                <i className="ri-information-line mt-0.5 text-base text-sky-600" />
                هذا الحرف لا يتّصل بما بعده، فيبقى بعده فراغ صغير.
              </p>
            ) : null}
          </section>

          <section className="card p-4 md:p-5" aria-labelledby="lj-words">
            <h3 id="lj-words" className="text-lg font-bold">
              كلمات تبدأ بحرف {letter.name}
            </h3>
            <ul className="mt-3 grid gap-2">
              {letter.words.map((item) => (
                <li key={item.word}>
                  <button
                    type="button"
                    onClick={() => speak(item.word)}
                    aria-label={`استمع إلى كلمة ${item.word}`}
                    className="group flex min-h-[3.5rem] w-full items-center gap-3 rounded-3xl bg-background-100 p-2 pe-4 text-start transition-transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tone.soft} ${tone.text}`}
                    >
                      {item.pic === false ? (
                        <span className="font-heading text-3xl font-bold">{letter.letter}</span>
                      ) : (
                        <i className={`${item.icon} text-3xl`} />
                      )}
                    </span>
                    <span className="flex-1 font-heading text-xl font-bold text-foreground-900">
                      <span className={tone.strong}>{item.word.charAt(0)}</span>
                      {item.word.slice(1)}
                    </span>
                    <i className="ri-volume-up-line text-xl text-foreground-500 transition-colors group-hover:text-sky-600" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="card flex items-center gap-3 bg-sky-50 p-4 md:p-5">
            <Character name="jamool" size="sm" small decorative className="shrink-0" />
            <div>
              <p className="text-xs font-bold text-sky-700">جمّول يقول: كيف ننطقه؟</p>
              <p className="mt-1 text-base leading-relaxed text-foreground-700">{letter.tip}</p>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onNext} className={BTN_PRIMARY}>
          التالي: ارسم الحرف
          <i className="ri-arrow-left-line" />
        </button>
      </div>
    </div>
  );
}
