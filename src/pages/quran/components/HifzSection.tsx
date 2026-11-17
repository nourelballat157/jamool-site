import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useProgress from "@/store/progress";
import Character from "@/components/brand/Character";
import CategoryTile from "@/components/brand/CategoryTile";
import ProgressBar from "@/components/brand/ProgressBar";
import {
  arNum,
  daysSince,
  hifzSurahs,
  lastReviewOf,
  surahProgress,
  surahStatus,
  versesLabel,
  type SurahStatus,
} from "@/data/quranSurahs";

type Filter = "all" | "learning" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "learning", label: "جاري الحفظ" },
  { id: "done", label: "مكتملة" },
];

const STATUS_CHIP: Record<SurahStatus, { label: string; icon: string; tone: string }> = {
  new: { label: "لم تبدأ", icon: "ri-seedling-line", tone: "bg-background-100 text-foreground-700" },
  learning: { label: "جاري الحفظ", icon: "ri-loader-2-line", tone: "bg-primary-100 text-primary-800" },
  done: { label: "مكتملة", icon: "ri-check-double-line", tone: "bg-accent-500 text-white" },
};

const CTA: Record<SurahStatus, string> = { new: "ابدأ الرحلة", learning: "تابع الحفظ", done: "راجع السورة" };

export default function HifzSection() {
  const { data } = useProgress();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(
    () =>
      hifzSurahs.map((surah) => {
        const rec = data.quran[surah.id];
        return { surah, status: surahStatus(rec), pct: Math.round(surahProgress(rec, surah.count) * 100) };
      }),
    [data.quran]
  );

  const due = useMemo(
    () =>
      rows
        .filter((row) => row.status === "done")
        .map((row) => {
          const last = lastReviewOf(row.surah.id, data.earned);
          return { ...row, days: last ? daysSince(last) : 99 };
        })
        .filter((row) => row.days >= 2),
    [rows, data.earned]
  );

  const counts: Record<Filter, number> = {
    all: rows.length,
    learning: rows.filter((r) => r.status === "learning").length,
    done: rows.filter((r) => r.status === "done").length,
  };
  const visible = rows.filter((r) => filter === "all" || r.status === filter);

  return (
    <section id="hifz" className="relative w-full scroll-mt-20 bg-background-50 py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="mb-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-4xl">رحلة الحفظ</h2>
          <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">
            اختر سورة وتعلّمها خطوة بخطوة: استمع، ثم ردّد، ثم اقرأ من ذاكرتك. السور مرتّبة من الأسهل إلى الأطول.
          </p>
        </div>

        {due.length > 0 ? (
          <div className="mb-8 rounded-4xl bg-primary-100 p-4 md:p-6" role="region" aria-labelledby="hifz-review-title">
            <div className="flex items-center gap-3">
              <CategoryTile icon="ri-refresh-line" tone="primary" solid />
              <div>
                <h3 id="hifz-review-title" className="font-heading text-lg font-bold text-foreground-900 md:text-xl">
                  وقت المراجعة
                </h3>
                <p className="text-sm font-medium text-foreground-700">
                  راجع هذه السور لتبقى ثابتة في قلبك، وخذ نقاط المراجعة.
                </p>
              </div>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {due.map((row) => (
                <li key={row.surah.id}>
                  <Link
                    to={`/quran/${row.surah.id}?review=1`}
                    className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full bg-background-50 px-4 py-2 text-sm font-bold text-foreground-900 transition-transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <i className="ri-book-2-line text-base text-accent-600" />
                    سورة {row.surah.name}
                    <span className="text-xs font-medium text-foreground-600">
                      {row.days >= 99 ? "راجعها الآن" : `منذ ${arNum(row.days)} أيام`}
                    </span>
                    <i className="ri-arrow-left-line text-base text-primary-700" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="تصفية السور">
          {FILTERS.map((item) => {
            const on = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(item.id)}
                className={`inline-flex min-h-[2.75rem] items-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-bold transition-colors cursor-pointer ${
                  on
                    ? "bg-accent-500 text-white"
                    : "bg-background-100 text-foreground-700 hover:bg-background-200"
                }`}
              >
                {item.label}
                <span
                  className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs ${
                    on ? "bg-white/25 text-white" : "bg-background-50 text-foreground-600"
                  }`}
                >
                  {arNum(counts[item.id])}
                </span>
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-4xl bg-accent-50 px-6 py-8 text-center">
            <Character name="noor" size="md" motion="float" />
            <p className="mt-4 font-heading text-lg font-bold text-foreground-900">
              {filter === "done" ? "لا توجد سور مكتملة بعد" : "لم تبدأ سورة بعد"}
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-foreground-600">
              {filter === "done"
                ? "أكمل مراحل سورة واحدة وستظهر هنا."
                : "ابدأ بسورة الإخلاص، فهي قصيرة وجميلة."}
            </p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="btn btn-primary btn-sm mt-5"
            >
              عرض كل السور
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map(({ surah, status, pct }) => {
              const chip = STATUS_CHIP[status];
              return (
                <li key={surah.id}>
                  <Link
                    to={`/quran/${surah.id}`}
                    className="card card-hover group flex h-full flex-col p-5 md:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <CategoryTile category="surahs" />
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${chip.tone}`}
                      >
                        <i className={chip.icon} />
                        {chip.label}
                      </span>
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-bold text-foreground-900 md:text-xl">
                      سورة {surah.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-foreground-500">
                      {surah.meaning} • {versesLabel(surah.count)}
                    </p>

                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-foreground-600">
                        <span>التقدّم</span>
                        <span>{arNum(pct)}٪</span>
                      </div>
                      <ProgressBar value={pct} tone="accent" label={`تقدّم حفظ سورة ${surah.name}`} height="h-2.5" />
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-accent-700">
                      {CTA[status]}
                      <i className="ri-arrow-left-line text-base transition-transform group-hover:-translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
