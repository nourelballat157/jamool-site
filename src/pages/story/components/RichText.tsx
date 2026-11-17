import { Fragment } from "react";
import type { Token } from "./parse";

export const TEXT_SIZES = [
  "text-xl leading-[2.2] md:text-2xl",
  "text-2xl leading-[2.2] md:text-3xl",
  "text-3xl leading-[2.15] md:text-4xl",
];

type RichTextProps = {
  tokens: Token[];
  /** index of the word being read aloud, -1 when not reading */
  active: number;
  /** true while a read-aloud session is running (dims the words not read yet) */
  reading: boolean;
  size: number;
  openVocab: number | null;
  onVocab: (index: number) => void;
};

/** Story text as separate words: the read-aloud highlight and the tappable vocabulary live here. */
export default function RichText({ tokens, active, reading, size, openVocab, onVocab }: RichTextProps) {
  return (
    <p className={`font-heading font-bold text-foreground-900 ${TEXT_SIZES[size] ?? TEXT_SIZES[1]}`}>
      {tokens.map((token, index) => {
        const isNow = reading && index === active;
        const isNext = reading && index > active;
        const tone = isNow
          ? "bg-primary-200 text-foreground-950"
          : isNext
            ? "text-foreground-500"
            : "text-foreground-900";

        return (
          <Fragment key={`${index}-${token.text}`}>
            {index > 0 ? " " : null}
            {token.meaning ? (
              <>
                <button
                  type="button"
                  onClick={() => onVocab(index)}
                  aria-expanded={openVocab === index}
                  aria-label={`${token.text}: اضغط لتعرف المعنى`}
                  className={`inline-block rounded-xl border-b-2 border-dashed border-violet-500 px-1.5 transition-colors cursor-pointer ${
                    isNow
                      ? "bg-primary-200 text-foreground-950"
                      : openVocab === index
                        ? "bg-violet-200 text-violet-900"
                        : "bg-violet-50 text-violet-800 hover:bg-violet-100"
                  }`}
                >
                  {token.text}
                </button>
                {token.suffix ?? null}
              </>
            ) : (
              <span className={`inline-block rounded-xl px-1.5 transition-colors duration-200 ${tone}`}>
                {token.text}
              </span>
            )}
          </Fragment>
        );
      })}
    </p>
  );
}

type VocabBubbleProps = {
  word: string;
  meaning: string;
  canSpeak: boolean;
  onSpeak: () => void;
  onClose: () => void;
};

/** The small meaning bubble that appears under the text when a vocabulary word is tapped. */
export function VocabBubble({ word, meaning, canSpeak, onSpeak, onClose }: VocabBubbleProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-rise-in relative mt-5 flex flex-wrap items-start gap-3 rounded-3xl bg-violet-100 p-4 pe-4 sm:flex-nowrap md:p-5"
    >
      <span aria-hidden="true" className="absolute -top-2 start-8 h-4 w-4 rotate-45 rounded-sm bg-violet-100" />
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background-50 text-xl text-violet-700">
        <i className="ri-lightbulb-line" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-lg font-bold text-foreground-900">{word}</p>
        <p className="mt-0.5 text-base leading-relaxed text-foreground-700">
          {meaning}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canSpeak ? (
          <button
            type="button"
            onClick={onSpeak}
            aria-label="اسمع المعنى"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-background-50 text-xl text-violet-700 transition-colors hover:bg-violet-600 hover:text-background-50 cursor-pointer"
          >
            <i className="ri-volume-up-line" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-background-50 text-xl text-foreground-700 transition-colors hover:bg-background-200 cursor-pointer"
        >
          <i className="ri-close-line" />
        </button>
      </div>
    </div>
  );
}
