import { useMemo, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import useProgress from "@/store/progress";
import MushafArt from "@/components/brand/MushafArt";
import StarBadge from "@/pages/quran/components/StarBadge";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK_QUERY } from "@/lib/gsap";
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

/* a soft rotation of tones: every card gets its own gentle colour, none of them loud */
const TONES = ["#2BA39A", "#4F8FE8", "#9A7BEA", "#E9A04A", "#4FA879", "#E8745C"];

const STATUS: Record<SurahStatus, { label: string; cta: string; icon: string; chip: string }> = {
  new: { label: "لم تبدأ", cta: "ابدأ الرحلة", icon: "ri-arrow-left-line", chip: "bg-white/70 text-foreground-500" },
  learning: { label: "جاري الحفظ", cta: "تابع الحفظ", icon: "ri-loader-2-line", chip: "bg-[#FFF1CF] text-[#9A6A12]" },
  done: { label: "مكتملة", cta: "راجع السورة", icon: "ri-check-double-line", chip: "bg-[#DDF3E6] text-[#2D7D52]" },
};

const RING = 2 * Math.PI * 34;

/** The memorisation journey: all of Juz' Amma as soft cards with a numbered star, over a pastel sky. */
export default function HifzSection() {
  const root = useRef<HTMLElement>(null);
  const { data } = useProgress();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      hifzSurahs.map((surah, i) => {
        const rec = data.quran[surah.id];
        return { surah, i, status: surahStatus(rec), pct: Math.round(surahProgress(rec, surah.count) * 100) };
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
  const norm = (s: string) => s.replace(/[ً-ْـ]/g, "").replace(/[إأآ]/g, "ا").replace(/^ال/, "").trim();
  const q = norm(query);
  const visible = rows.filter((r) => (filter === "all" || r.status === filter) && (!q || norm(r.surah.name).includes(q)));
  const ayahsTotal = rows.reduce((n, r) => n + r.surah.count, 0);
  const overall = rows.length ? Math.round((counts.done / rows.length) * 100) : 0;

  /* ---------- the scene: drifting stars, a slow skyline, the summary counting up ---------- */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.from("[data-head] > *", { y: 28, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: "[data-head]", start: "top 85%", once: true } });

        gsap.utils.toArray<HTMLElement>("[data-float]").forEach((el, i) => {
          gsap.to(el, { y: i % 2 ? -14 : 14, x: i % 3 ? 8 : -8, rotation: i % 2 ? 12 : -12, duration: 4 + (i % 4) * 0.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.3 });
        });
        gsap.utils.toArray<HTMLElement>("[data-twinkle]").forEach((el, i) => {
          gsap.to(el, { opacity: 0.25, scale: 0.7, duration: 1.4 + (i % 3) * 0.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.25 });
        });
        gsap.to("[data-sky]", { yPercent: 12, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 } });

        ScrollTrigger.create({
          trigger: "[data-summary]",
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.from("[data-tile]", { y: 24, opacity: 0, scale: 0.92, duration: 0.7, stagger: 0.1, ease: "back.out(1.6)" });
            gsap.fromTo("[data-ring-fill]", { strokeDashoffset: RING }, { strokeDashoffset: RING * (1 - overall / 100), duration: 1.4, ease: "power3.out", delay: 0.2 });
            gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
              const to = Number(el.dataset.count);
              const o = { v: 0 };
              gsap.to(o, { v: to, duration: 1.3, delay: 0.25, ease: "power2.out", onUpdate: () => (el.textContent = arNum(Math.round(o.v))) });
            });
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  /* ---------- the cards: rise in as they are reached, again whenever the list changes ---------- */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        gsap.set(cards, { opacity: 0, y: 28, scale: 0.96 });
        ScrollTrigger.batch(cards, {
          start: "top 95%",
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.07, ease: "power3.out", overwrite: true, clearProps: "transform,opacity" });
            gsap.fromTo(batch.map((b) => b.querySelector("[data-badge]")), { rotation: -90, scale: 0.4 }, { rotation: 0, scale: 1, duration: 0.8, stagger: 0.07, ease: "back.out(1.8)", clearProps: "transform" });
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [filter, q], revertOnUpdate: true }
  );

  /* a soft light follows the pointer across a card; nothing moves */
  const light = (e: PointerEvent<HTMLUListElement>) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>("[data-card] a");
    if (!a) return;
    const r = a.getBoundingClientRect();
    a.style.setProperty("--mx", `${e.clientX - r.left}px`);
    a.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section ref={root} id="hifz" className="relative w-full scroll-mt-20 overflow-hidden bg-[linear-gradient(180deg,#FFFAF2_0%,#E8F4F5_20%,#FFF8EC_62%,#FCE9DA_100%)] py-12 md:py-20">
      {/* the sky behind the cards: a far skyline, a crescent and a few stars, all very quiet */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <svg data-sky viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[34%] w-full text-[#2BA39A]/[0.10]">
          <g fill="currentColor">
            <path d="M60 220V120h10V104h10v16h10V104h10v16h10V220z" />
            <path d="M120 220V150a26 26 0 0 1 52 0V220zM172 220V80h8V220zM168 80l8-24 8 24z" />
            <path d="M420 220V140a40 40 0 0 1 80 0V220zM500 220V90h9V220zM496 90l8-26 8 26z" />
            <path d="M760 220V130a34 34 0 0 1 68 0V220zM828 220V70h9V220zM824 70l8-24 8 24z" />
            <path d="M1100 220V150a46 46 0 0 1 92 0V220zM1192 220V96h9V220zM1188 96l8-26 8 26z" />
            <path d="M1330 220V130h10v-14h10v14h10v-14h10v14h10V220z" />
          </g>
        </svg>
        <i data-float className="ri-moon-fill absolute start-[6%] top-[9%] text-5xl text-[#F2C86B]/70 md:text-6xl" />
        <i data-float className="ri-sparkling-2-fill absolute end-[8%] top-[14%] text-3xl text-[#7FB7D9]/70" />
        <i data-float className="ri-sparkling-2-fill absolute end-[22%] top-[44%] hidden text-2xl text-[#E9A04A]/50 md:block" />
        <i data-float className="ri-sparkling-2-fill absolute start-[10%] top-[52%] hidden text-2xl text-[#9A7BEA]/50 md:block" />
        <i data-twinkle className="ri-sparkling-2-fill absolute start-[30%] top-[6%] text-lg text-[#F2C86B]/80" />
        <i data-twinkle className="ri-sparkling-2-fill absolute end-[40%] top-[30%] text-base text-[#7FB7D9]/80" />
        <i data-twinkle className="ri-sparkling-2-fill absolute start-[48%] top-[70%] hidden text-lg text-[#E8745C]/50 md:block" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <div data-head className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 font-heading text-sm font-bold text-[#2B8A83] ring-1 ring-[#CFE8E6]">
            <i className="ri-moon-clear-line" />
            جزء عمّ
          </span>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground-900 md:text-5xl">رحلة الحفظ</h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-foreground-600">
            اختر سورة وتعلّمها خطوة بخطوة: استمع، ثم ردّد، ثم اقرأ من ذاكرتك. نبدأ بالسور القصيرة المحبّبة، ثم نكمل جزء عمّ كاملًا حتى الأطول.
          </p>
        </div>

        {/* the whole journey at a glance */}
        <div data-summary className="mx-auto mb-8 grid max-w-4xl items-center gap-4 rounded-[2rem] bg-white/70 p-4 shadow-[0_18px_40px_-26px_rgb(31_42_92/0.35)] ring-1 ring-white backdrop-blur-md md:grid-cols-[auto_1fr] md:gap-6 md:p-6">
          <div data-tile className="relative mx-auto flex h-28 w-28 items-center justify-center">
            <svg viewBox="0 0 80 80" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#2BA39A" strokeOpacity=".14" strokeWidth="7" />
              <circle data-ring-fill cx="40" cy="40" r="34" fill="none" stroke="#2BA39A" strokeWidth="7" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING * (1 - overall / 100)} />
            </svg>
            <div className="text-center">
              <p className="font-heading text-2xl font-bold text-foreground-900">{arNum(overall)}٪</p>
              <p className="text-[0.7rem] font-bold text-foreground-500">من جزء عمّ</p>
            </div>
          </div>
          <ul className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { icon: "ri-book-2-line", value: rows.length, label: "سورة", tint: "bg-[#E4F4F2]", ink: "text-[#2B8A83]" },
              { icon: "ri-text", value: ayahsTotal, label: "آية", tint: "bg-[#FFF1D8]", ink: "text-[#C98521]" },
              { icon: "ri-check-double-line", value: counts.done, label: "مكتملة", tint: "bg-[#E3F3EA]", ink: "text-[#2D7D52]" },
            ].map((s) => (
              <li key={s.label} data-tile className={`flex flex-col items-center rounded-3xl px-2 py-3 text-center ${s.tint}`}>
                <i className={`${s.icon} text-xl ${s.ink}`} />
                <span data-count={s.value} className="mt-1 font-heading text-2xl font-bold text-foreground-900 md:text-3xl">{arNum(s.value)}</span>
                <span className="text-xs font-bold text-foreground-600">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {due.length > 0 ? (
          <div className="mx-auto mb-8 max-w-4xl rounded-[2rem] bg-[#FFF3D6]/85 p-4 ring-1 ring-[#F6DFA6] md:p-6" role="region" aria-labelledby="hifz-review-title">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-[#C98521]">
                <i className="ri-refresh-line" />
              </span>
              <div>
                <h3 id="hifz-review-title" className="font-heading text-lg font-bold text-foreground-900 md:text-xl">
                  وقت المراجعة
                </h3>
                <p className="text-sm font-medium text-foreground-700">راجع هذه السور لتبقى ثابتة في قلبك، وخذ نقاط المراجعة.</p>
              </div>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {due.map((row) => (
                <li key={row.surah.id}>
                  <Link to={`/quran/${row.surah.id}?review=1`} className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-foreground-900 shadow-sm transition-shadow hover:shadow-md">
                    <i className="ri-book-2-line text-base text-[#2B8A83]" />
                    سورة {row.surah.name}
                    <span className="text-xs font-medium text-foreground-600">{row.days >= 99 ? "راجعها الآن" : `منذ ${arNum(row.days)} أيام`}</span>
                    <i className="ri-arrow-left-line text-base text-[#C98521]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* find a surah */}
        <div className="mx-auto mb-4 flex h-12 max-w-md items-center rounded-full bg-white/80 pe-2 ps-4 shadow-[0_10px_26px_-20px_rgb(31_42_92/0.4)] ring-1 ring-[#EADFCB] focus-within:ring-2 focus-within:ring-[#2BA39A]">
          <i className="ri-search-line text-lg text-foreground-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            aria-label="ابحث عن سورة"
            placeholder="ابحث عن سورة…"
            className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none"
          />
        </div>
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="تصفية السور">
          {FILTERS.map((item) => {
            const on = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(item.id)}
                className={`inline-flex min-h-[2.75rem] items-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-bold transition-colors cursor-pointer ${
                  on ? "bg-[#2BA39A] text-white shadow-[0_8px_18px_-8px_rgb(43_163_154/0.7)]" : "bg-white/80 text-foreground-700 ring-1 ring-[#EADFCB] hover:bg-white"
                }`}
              >
                {item.label}
                <span className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs ${on ? "bg-white/25 text-white" : "bg-[#F4EBDB] text-foreground-600"}`}>{arNum(counts[item.id])}</span>
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-[2rem] bg-white/80 px-6 py-8 text-center ring-1 ring-[#EADFCB]">
            <MushafArt size="md" motion="float" />
            <p className="mt-4 font-heading text-lg font-bold text-foreground-900">
              {q ? "لا توجد سورة بهذا الاسم" : filter === "done" ? "لا توجد سور مكتملة بعد" : "لم تبدأ سورة بعد"}
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-foreground-600">
              {q ? "جرّب كلمة أخرى، أو اعرض كل السور." : filter === "done" ? "أكمل مراحل سورة واحدة وستظهر هنا." : "ابدأ بسورة الإخلاص، فهي قصيرة وجميلة."}
            </p>
            <button type="button" onClick={() => (setFilter("all"), setQuery(""))} className="btn btn-primary btn-sm mt-5">
              عرض كل السور
            </button>
          </div>
        ) : (
          <ul onPointerMove={light} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {visible.map(({ surah, i, status, pct }) => {
              const tone = TONES[i % TONES.length];
              const st = STATUS[status];
              return (
                <li key={surah.id} data-card>
                  <Link
                    to={`/quran/${surah.id}`}
                    className="group relative block overflow-hidden rounded-[1.7rem] bg-white/90 p-4 shadow-[0_14px_34px_-24px_rgb(31_42_92/0.45)] ring-1 ring-[#EADFCB]/80 transition-shadow duration-300 hover:shadow-[0_22px_44px_-22px_rgb(31_42_92/0.5)] md:p-5"
                  >
                    {/* the light that follows the pointer, tinted by the card's own tone */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: `radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), ${tone}26, transparent 65%)` }}
                    />
                    <div className="relative flex items-center gap-4">
                      <span data-badge className="inline-flex">
                        <StarBadge label={arNum(Number(surah.id))} color={tone} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-heading text-xl font-bold text-foreground-900">سورة {surah.name}</h3>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-foreground-500">
                          <span>{versesLabel(surah.count)}</span>
                          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-foreground-300" />
                          <span className="truncate">{surah.meaning}</span>
                        </p>
                      </div>
                      <span className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold ${st.chip}`}>
                        <i className={`${st.icon} text-base ${status === "new" ? "transition-transform duration-300 group-hover:-translate-x-1" : ""}`} />
                        <span className={status === "new" ? "sr-only" : ""}>{st.label}</span>
                        {status === "new" ? <span className="sr-only">، {st.cta}</span> : null}
                      </span>
                    </div>
                    <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full" style={{ background: `${tone}22` }} role="progressbar" aria-label={`تقدّم حفظ سورة ${surah.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                      <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: tone }} />
                    </div>
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
