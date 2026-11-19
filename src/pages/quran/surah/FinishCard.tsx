import { Link } from "react-router-dom";
import { arNum, versesLabel, type SurahMeta } from "@/data/quranSurahs";
import MushafArt from "@/components/brand/MushafArt";
import Medal from "@/components/brand/Medal";
import { BTN_ACCENT, BTN_SECONDARY } from "./kit";

export type FinishKind = "learned" | "review" | "known";

export default function FinishCard({
  surah,
  next,
  kind,
  gained,
  onReview,
  onPractice,
}: {
  surah: SurahMeta;
  next: SurahMeta | null;
  kind: FinishKind;
  /** points given just now for this finish (0 when already earned) */
  gained: number;
  onReview: () => void;
  onPractice: () => void;
}) {
  const title =
    kind === "learned"
      ? `ما شاء الله! حفظتَ سورة ${surah.name}`
      : kind === "review"
        ? `أحسنت! راجعتَ سورة ${surah.name}`
        : `سورة ${surah.name} محفوظة`;

  return (
    <div className="animate-celebrate-pop">
      <div className="card relative overflow-hidden bg-accent-50 px-5 py-8 text-center md:px-8 md:py-12">
        <i aria-hidden="true" className="ri-sparkling-2-fill animate-twinkle absolute start-6 top-6 hidden text-3xl text-primary-500 md:block" />
        <i aria-hidden="true" className="ri-star-fill animate-twinkle absolute end-8 top-10 hidden text-2xl text-primary-500 md:block" />

        <div className="flex justify-center">
          <MushafArt size="lg" motion="cheer" />
        </div>
        <p className="mt-4 text-xs font-bold text-accent-700">
          {kind === "review" ? "مراجعة اليوم" : kind === "learned" ? "مبارك لك" : "حافظ صغير"}
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold text-foreground-900 md:text-4xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-foreground-600">
          {kind === "review"
            ? gained > 0
              ? "نقاط المراجعة وصلتك! عُد غدًا لتراجع من جديد."
              : "راجعتَ هذه السورة اليوم من قبل، والتكرار يُثبّت الحفظ."
            : kind === "learned"
              ? "أتممتَ الاستماع والترديد والتلاوة. تذكّر أن تراجعها كل يومين."
              : "راجعها كل يومين لتبقى ثابتة في قلبك."}
        </p>

        <ul className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2">
          {kind !== "review" ? (
            <li>
              <Medal id="hafiz" size="sm" title="وسام الحافظ الصغير" />
            </li>
          ) : null}
          <li className="inline-flex items-center gap-2 rounded-full bg-background-50 px-4 py-2 text-xs font-bold text-foreground-700">
            <i className="ri-book-2-line text-base text-accent-600" />
            {versesLabel(surah.count)}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full bg-background-50 px-4 py-2 text-xs font-bold text-foreground-700">
            <i className="ri-heart-3-line text-base text-accent-600" />
            {surah.meaning}
          </li>
          {gained > 0 ? (
            <li className="inline-flex items-center gap-2 rounded-full bg-background-50 px-4 py-2 text-xs font-bold text-foreground-700">
              <i className="ri-star-fill text-base text-primary-500" />
              +{arNum(gained)} نقطة
            </li>
          ) : null}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {kind !== "review" ? (
            <button type="button" onClick={onReview} className={BTN_ACCENT}>
              <i className="ri-refresh-line text-lg" />
              راجع الآن
            </button>
          ) : null}
          {next ? (
            <Link to={`/quran/${next.id}`} className={kind === "review" ? BTN_ACCENT : BTN_SECONDARY}>
              السورة التالية: {next.name}
              <i className="ri-arrow-left-line text-lg" />
            </Link>
          ) : null}
          <Link to="/quran#hifz" className={BTN_SECONDARY}>
            <i className="ri-apps-2-line text-lg" />
            رحلة الحفظ
          </Link>
          {kind !== "review" ? (
            <button type="button" onClick={onPractice} className={BTN_SECONDARY}>
              <i className="ri-restart-line text-lg" />
              تدرّب من جديد
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
