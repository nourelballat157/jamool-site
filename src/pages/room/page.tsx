import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ModuleHero from "@/components/feature/ModuleHero";
import useScrollTop from "@/hooks/useScrollTop";
import useProgress, { familyBoard, removeCreation, renameChild, selectChild, type Creation } from "@/store/progress";
import Medal from "@/components/brand/Medal";
import ProgressBar from "@/components/brand/ProgressBar";
import CategoryTile from "@/components/brand/CategoryTile";
import Character from "@/components/brand/Character";
import { avatarChoices, categoryById, tones, type CategoryId } from "@/data/brand";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK_QUERY } from "@/lib/gsap";

const earnWays = [
  { icon: "ri-book-open-line", label: "أنهِ قصة", pts: 30 },
  { icon: "ri-text", label: "أتقن حرفًا", pts: 15 },
  { icon: "ri-book-2-line", label: "أتمّ مرحلة حفظ", pts: 20 },
  { icon: "ri-gamepad-line", label: "أنهِ لعبة", pts: 10 },
  { icon: "ri-plant-line", label: "أزهر قيمة", pts: 50 },
  { icon: "ri-trophy-line", label: "أنهِ مسابقة", pts: 40 },
];

const NAV = [
  { id: "level", label: "مستواي", icon: "ri-medal-line" },
  { id: "streak", label: "أيامي", icon: "ri-fire-line" },
  { id: "badges", label: "شاراتي", icon: "ri-award-line" },
  { id: "journeys", label: "رحلاتي", icon: "ri-compass-3-line" },
  { id: "creations", label: "إبداعاتي", icon: "ri-palette-line" },
  { id: "family", label: "العائلة", icon: "ri-group-line" },
];

const prefersCalm = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** a number that counts up the first time it is seen */
function CountUp({ to, className = "" }: { to: number; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const node = el.current;
      if (!node) return;
      const show = (v: number) => (node.textContent = Math.round(v).toLocaleString("ar-EG"));
      show(to);
      if (prefersCalm() || to === 0) return;
      const o = { v: 0 };
      show(0);
      ScrollTrigger.create({
        trigger: node,
        start: "top 92%",
        once: true,
        onEnter: () => gsap.to(o, { v: to, duration: 1.1, ease: "power2.out", onUpdate: () => show(o.v) }),
      });
    },
    { scope: el, dependencies: [to], revertOnUpdate: true }
  );
  return <span ref={el} className={className} />;
}

/** a circular meter with something in the middle */
function Ring({ value, size = 160, stroke = 10, track = "rgb(255 255 255 / .18)", color = "#FFC43D", children }: { value: number; size?: number; stroke?: number; track?: string; color?: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = useRef<SVGCircleElement>(null);
  useGSAP(
    () => {
      const a = arc.current;
      if (!a) return;
      const end = c * (1 - Math.min(100, Math.max(0, value)) / 100);
      if (prefersCalm()) {
        a.style.strokeDashoffset = String(end);
        return;
      }
      gsap.set(a, { strokeDashoffset: c });
      ScrollTrigger.create({ trigger: a, start: "top 92%", once: true, onEnter: () => gsap.to(a, { strokeDashoffset: end, duration: 1.2, ease: "power2.out" }) });
    },
    { scope: arc, dependencies: [value], revertOnUpdate: true }
  );
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle ref={arc} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </span>
  );
}

function SectionTitle({ kicker, icon, title, text, className = "" }: { kicker: string; icon: string; title: string; text?: string; className?: string }) {
  return (
    <div className={`mb-8 md:mb-10 ${className}`}>
      <span className="inline-flex items-center gap-2 rounded-full bg-foreground-900 px-3.5 py-1.5 font-heading text-xs font-bold text-background-50">
        <i className={`${icon} text-base text-primary-300`} aria-hidden="true" />
        {kicker}
      </span>
      <h2 className="mt-3 font-heading text-3xl font-bold text-foreground-900 md:text-4xl">{title}</h2>
      {text ? <p className="mt-2 max-w-xl text-sm text-foreground-600 md:text-base">{text}</p> : null}
    </div>
  );
}

export default function Room() {
  useScrollTop();
  const p = useProgress();
  const { child, data, level, streak, week } = p;
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(child.name);
  const [avatar, setAvatar] = useState(child.avatar);
  const [filter, setFilter] = useState<"all" | "earned" | "next">("all");
  const [view, setView] = useState<Creation | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [active, setActive] = useState("level");
  const board = familyBoard();

  useEffect(() => {
    if (!editing && !view) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditing(false);
        setView(null);
        setConfirmDel(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, view]);

  /* arrive from the home page's room (the scene zoomed in): fade in, then go to the part that was pressed */
  useEffect(() => {
    const id = location.hash.replace("#", "");
    const t = window.setTimeout(() => {
      const target = id ? document.getElementById(id) : null;
      if (target) target.scrollIntoView({ behavior: prefersCalm() ? "auto" : "smooth", block: "start" });
    }, 380);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  useGSAP(
    () => {
      const el = main.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power1.out", clearProps: "opacity" });
        gsap.utils.toArray<HTMLElement>("[data-rise]", el).forEach((n) => {
          gsap.from(n, { y: 34, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: n, start: "top 90%", once: true } });
        });
        gsap.to("[data-flame]", { scale: 1.12, transformOrigin: "50% 100%", duration: 0.7, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to("[data-bob]", { y: -8, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
      return () => mm.revert();
    },
    { scope: main }
  );

  /* which part of the room is on screen lights its tab */
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const journeys: { id: string; category: CategoryId; title: string; done: number; total: number; unit: string; to: string }[] = [
    { id: "stories", category: "stories", title: "القصص", done: p.count("story:"), total: 6, unit: "قصص", to: "/stories" },
    { id: "letters", category: "learning", title: "الحروف", done: p.count("letter:"), total: 28, unit: "حرفًا", to: "/learning" },
    { id: "quran", category: "surahs", title: "حفظ القرآن", done: p.count("quran-done:"), total: 12, unit: "سورة", to: "/quran#hifz" },
    { id: "games", category: "games", title: "الألعاب", done: p.count("game:"), total: 9, unit: "ألعاب", to: "/games" },
    { id: "values", category: "values", title: "حديقة القيم", done: p.count("value-done:"), total: 5, unit: "قيم", to: "/values" },
    { id: "quiz", category: "competitions", title: "المسابقات", done: p.count("quiz:"), total: 4, unit: "مسابقات", to: "/competitions" },
  ];

  const saveProfile = () => {
    renameChild(child.id, name, avatar);
    setEditing(false);
  };

  const earnedBadges = p.badges.filter((b) => b.earned).length;
  const shownBadges = p.badges.filter((b) => (filter === "all" ? true : filter === "earned" ? b.earned : !b.earned));
  const minutesTotal = Object.values(data.minutes).reduce((a, b) => a + b, 0);
  const stats = [
    { icon: "ri-star-fill", label: "نقطة", value: data.points, tone: "bg-primary-400 text-foreground-900" },
    { icon: "ri-medal-line", label: `المستوى · ${level.name}`, value: level.level, tone: "bg-violet-500 text-white" },
    { icon: "ri-fire-fill", label: streak > 2 && streak < 11 ? "أيام متتالية" : "يومًا متتاليًا", value: streak, tone: "bg-amber-500 text-foreground-900" },
    { icon: "ri-award-line", label: `من ${p.badges.length.toLocaleString("ar-EG")} شارة`, value: earnedBadges, tone: "bg-accent-500 text-white" },
    { icon: "ri-palette-line", label: "إبداعًا محفوظًا", value: data.creations.length, tone: "bg-secondary-500 text-white" },
  ];

  const goto = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: prefersCalm() ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main ref={main} className="flex-1">
        <ModuleHero
          badge="غرفتي"
          badgeIcon="ri-home-smile-line"
          title={`أهلًا ${child.name}! هذه غرفتك`}
          description="هنا تجد نقاطك ومستواك وشاراتك وأيامك المتتالية وكل ما أبدعته. كل خطوة صغيرة تجعل غرفتك أجمل."
          character="jamool"
          actions={
            <>
              <button
                type="button"
                onClick={() => {
                  setName(child.name);
                  setAvatar(child.avatar);
                  setEditing(true);
                }}
                className="btn btn-primary"
              >
                <i className="ri-edit-2-line" />
                غيّر اسمي وصورتي
              </button>
              <Link to="/child-select" className="btn btn-ghost">
                <i className="ri-group-line" />
                تبديل الطفل
              </Link>
            </>
          }
        />

        {/* the way around the room: every part has its tab, the one on screen is lit */}
        <nav aria-label="أقسام غرفتي" className="sticky top-14 z-30 border-b border-foreground-900/10 bg-background-50/90 backdrop-blur-md md:top-16">
          <ul className="no-scrollbar mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 md:justify-center md:px-6">
            {NAV.map((n) => (
              <li key={n.id} className="shrink-0">
                <a
                  href={`#${n.id}`}
                  onClick={goto(n.id)}
                  aria-current={active === n.id ? "true" : undefined}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 font-heading text-sm font-bold transition-colors ${active === n.id ? "bg-foreground-900 text-background-50" : "bg-background-100 text-foreground-700 hover:bg-background-200"}`}
                >
                  <i className={`${n.icon} text-base ${active === n.id ? "text-primary-300" : "text-foreground-500"}`} aria-hidden="true" />
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* the numbers at a glance */}
        <section className="w-full bg-background-50 pb-4 pt-10 md:pt-14">
          <ul className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 px-4 md:grid-cols-5 md:gap-4 md:px-6">
            {stats.map((s, i) => (
              <li key={s.label} data-rise className={`card flex items-center gap-3 p-4 md:flex-col md:items-start md:gap-4 md:p-5 ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}>
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${s.tone}`}>
                  <i className={s.icon} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <CountUp to={s.value} className="block font-heading text-3xl font-bold leading-none text-foreground-900 md:text-4xl" />
                  <span className="mt-1 block truncate text-xs font-semibold text-foreground-600 md:text-sm">{s.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* level: the player card and how points are earned */}
        <section id="level" className="w-full scroll-mt-28 bg-background-50 py-12 md:py-16">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 md:px-6 lg:grid-cols-5">
            <div data-rise className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1F2A5C] via-[#25248A] to-[#3A32B4] p-6 text-background-50 md:p-9 lg:col-span-3">
              <span aria-hidden="true" className="pointer-events-none absolute -end-16 -top-16 h-64 w-64 rounded-full bg-primary-400/20 blur-2xl" />
              <div className="relative flex flex-wrap items-center gap-6 md:gap-9">
                <Ring value={level.pct} size={176} stroke={11}>
                  <img src={child.avatar} alt={child.name} className={`h-[78%] w-[78%] rounded-full border-4 bg-background-100 object-cover ${child.ring}`} />
                </Ring>
                <div className="min-w-[12rem] flex-1">
                  <p className="font-heading text-sm font-bold text-primary-300">المستوى {level.level.toLocaleString("ar-EG")}</p>
                  <h2 className="mt-1 font-heading text-3xl font-bold !text-background-50 md:text-4xl">{level.name}</h2>
                  <p className="mt-2 flex items-center gap-2 font-heading text-lg font-bold">
                    <i className="ri-star-fill text-2xl text-primary-400" aria-hidden="true" />
                    {data.points.toLocaleString("ar-EG")} نقطة
                  </p>
                  <div className="mt-5">
                    <ProgressBar value={level.pct} tone="primary" label="التقدم نحو المستوى التالي" height="h-3.5" />
                    <p className="mt-2 text-sm font-medium text-background-200">
                      {level.next === null ? "وصلت إلى أعلى مستوى. أنت أسطورة!" : `تبقّى ${level.toNext.toLocaleString("ar-EG")} نقطة للمستوى التالي`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative mt-7 flex items-start gap-3 rounded-3xl bg-background-50/10 p-4 ring-1 ring-background-50/15 backdrop-blur-sm">
                <img src="/brand/avatar-jamool.webp" alt="جمّول" className="h-12 w-12 shrink-0 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <p className="font-heading text-base font-bold">جمّول فخور بك يا {child.name}!</p>
                  <p className="mt-0.5 text-sm font-medium leading-relaxed text-background-200">
                    {data.points > 0 ? "كل نجمة جمعتها تقرّبنا من المستوى الجديد. هيا نكمل!" : "هيا نبدأ معًا! اقرأ قصة أو العب لعبة وسأجمع لك أول نجمة."}
                  </p>
                </div>
              </div>
            </div>

            <div id="points" data-rise className="card scroll-mt-28 p-5 md:p-8 lg:col-span-2">
              <h3 className="font-heading text-xl font-bold text-foreground-900 md:text-2xl">كيف أكسب النقاط؟</h3>
              <p className="mt-1 text-sm font-medium text-foreground-500">النقاط تأتي عندما تُنهي شيئًا، لا عندما تفتح صفحة.</p>
              <ul className="mt-5 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {earnWays.map((way) => (
                  <li key={way.label} className="flex items-center gap-2.5 rounded-2xl bg-background-100 px-3 py-2.5">
                    <CategoryTile icon={way.icon} tone="primary" size="sm" />
                    <span className="flex-1 text-sm font-bold text-foreground-800">{way.label}</span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-800">
                      +{way.pts.toLocaleString("ar-EG")}
                      <i className="ri-star-fill text-primary-500" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* streak: a timeline of the week with the minutes spent */}
        <section id="streak" className="w-full scroll-mt-28 bg-amber-50 py-12 md:py-16">
          <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
              <SectionTitle className="!mb-0" kicker="الأيام المتتالية" icon="ri-fire-fill" title={streak > 0 ? `${streak.toLocaleString("ar-EG")} ${streak > 2 && streak < 11 ? "أيام" : "يومًا"} وراء بعض` : "ابدأ سلسلة أيامك اليوم"} text="زُر عالمك كل يوم لتبني سلسلة جميلة. أسبوع كامل يمنحك شارة خاصة." />
              <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-heading text-sm font-bold text-foreground-800 shadow-card">
                <i className="ri-time-line text-xl text-amber-600" aria-hidden="true" />
                {minutesTotal.toLocaleString("ar-EG")} دقيقة لعب وتعلّم
              </span>
            </div>
            <div data-rise className="card p-5 md:p-8">
              <ol className="relative grid grid-cols-7 gap-1.5 md:gap-4">
                <span aria-hidden="true" className="absolute inset-x-[7%] top-[1.375rem] h-1 rounded-full bg-amber-100 md:top-8" />
                {week.map((day) => {
                  const mins = data.minutes[day.iso] ?? 0;
                  return (
                    <li key={day.iso} className="relative flex flex-col items-center gap-2">
                      <span
                        data-flame={day.today ? "" : undefined}
                        className={`relative flex h-11 w-11 items-center justify-center rounded-full text-xl md:h-16 md:w-16 md:text-2xl ${
                          day.done ? "bg-amber-500 text-foreground-900 shadow-[0_5px_0_rgb(160_105_0/0.5)]" : day.today ? "border-2 border-dashed border-amber-500 bg-white text-amber-600" : "bg-background-100 text-background-400"
                        }`}
                      >
                        <i className={day.done ? "ri-fire-fill" : day.today ? "ri-sparkling-2-line" : "ri-circle-line"} />
                      </span>
                      <span className={`text-[11px] font-bold md:text-sm ${day.today ? "text-amber-700" : "text-foreground-600"}`}>{day.today ? "اليوم" : day.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold md:text-xs ${mins > 0 ? "bg-amber-100 text-amber-800" : "text-background-400"}`}>{mins > 0 ? `${mins.toLocaleString("ar-EG")} د` : "—"}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* badges: filter by earned / still to earn */}
        <section id="badges" className="w-full scroll-mt-28 bg-background-50 py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
              <SectionTitle className="!mb-0" kicker="الشارات" icon="ri-award-line" title="شاراتي" text={`جمعت ${earnedBadges.toLocaleString("ar-EG")} من ${p.badges.length.toLocaleString("ar-EG")} شارة.`} />
              <div role="tablist" aria-label="تصفية الشارات" className="inline-flex rounded-full bg-background-100 p-1">
                {(
                  [
                    ["all", "الكل"],
                    ["earned", "حصلت عليها"],
                    ["next", "قادمة"],
                  ] as const
                ).map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={filter === id} onClick={() => setFilter(id)} className={`min-h-10 cursor-pointer rounded-full px-4 font-heading text-sm font-bold transition-colors ${filter === id ? "bg-foreground-900 text-background-50" : "text-foreground-700 hover:text-foreground-900"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {shownBadges.length === 0 ? (
              <p className="rounded-3xl bg-background-100 px-6 py-8 text-center font-heading text-base font-bold text-foreground-600">{filter === "earned" ? "لم تحصل على شارات بعد. أنهِ أول نشاط!" : "حصلت على كل الشارات. أنت بطل!"}</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {shownBadges.map((badge) => (
                  <li key={badge.id} data-rise className={`flex flex-col items-center rounded-3xl p-4 text-center md:p-5 ${badge.earned ? "card bg-primary-50" : "bg-background-100"}`}>
                    <Medal id={badge.id} title={badge.title} earned={badge.earned} size="lg" />
                    <h3 className={`mt-4 font-heading text-base font-bold ${badge.earned ? "text-foreground-900" : "text-foreground-500"}`}>{badge.title}</h3>
                    <p className="mt-1 text-xs font-medium text-foreground-600">{badge.hint}</p>
                    {!badge.earned && badge.progress ? (
                      <div className="mt-3 w-full">
                        <ProgressBar value={(badge.progress[0] / badge.progress[1]) * 100} tone="primary" label={`تقدّمك نحو شارة ${badge.title}`} height="h-2" />
                        <p className="mt-1 text-[11px] font-bold text-foreground-500">
                          {badge.progress[0].toLocaleString("ar-EG")} / {badge.progress[1].toLocaleString("ar-EG")}
                        </p>
                      </div>
                    ) : null}
                    {badge.earned ? (
                      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent-100 px-3 py-0.5 text-[11px] font-bold text-accent-700">
                        <i className="ri-check-line" />
                        حصلت عليها
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* journeys: a ring per world */}
        <section id="journeys" className="w-full scroll-mt-28 bg-background-100 py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <SectionTitle kicker="الرحلات" icon="ri-compass-3-line" title="تقدّمي في الرحلات" text="كل رحلة تكبر معك. اضغط على أي بطاقة لتكمل من حيث توقفت." />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {journeys.map((j) => {
                const cat = categoryById(j.category);
                const pct = Math.min(100, (j.done / j.total) * 100);
                return (
                  <li key={j.id} data-rise>
                    <Link to={j.to} className="card card-hover group flex items-center gap-4 p-4 md:p-5">
                      <Ring value={pct} size={84} stroke={8} track="rgb(31 42 92 / .1)" color={tones[cat.tone].hex}>
                        <CategoryTile category={j.category} size="md" />
                      </Ring>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-lg font-bold text-foreground-900">{j.title}</h3>
                        <p className="mt-0.5 text-sm font-semibold text-foreground-600">
                          {j.done.toLocaleString("ar-EG")} / {j.total.toLocaleString("ar-EG")} {j.unit}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 font-heading text-sm font-bold text-foreground-900">
                          {j.done === 0 ? "ابدأ الرحلة" : j.done >= j.total ? "أعدها" : "أكمل"}
                          <i className="ri-arrow-left-line" aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* creations: a gallery; press a picture to see it big, keep it or let it go */}
        <section id="creations" className="w-full scroll-mt-28 bg-background-50 py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
              <SectionTitle className="!mb-0" kicker="المعرض" icon="ri-palette-line" title="إبداعاتي" text="رسوماتك وتلويناتك المحفوظة في مكان واحد. اضغط على أي رسمة لتراها كبيرة." />
              <Link to="/drawing" className="btn btn-primary btn-sm">
                <i className="ri-brush-line" />
                ارسم الآن
              </Link>
            </div>

            {data.creations.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl bg-amber-50 px-6 py-10 text-center">
                <div data-bob>
                  <Character name="maha" size="md" small />
                </div>
                <p className="mt-3 font-heading text-lg font-bold text-foreground-900">لا توجد إبداعات بعد</p>
                <p className="mt-1 max-w-sm text-sm font-medium text-foreground-600">مها تنتظر أول رسمة لك! ارسم أو لوّن شيئًا جميلًا واضغط «احفظ في غرفتي» لتظهر هنا.</p>
                <Link to="/drawing" className="btn btn-primary btn-sm mt-5">
                  <i className="ri-palette-line" />
                  هيا نرسم
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
                {data.creations.map((item, i) => (
                  <li key={item.id} data-rise>
                    <button
                      type="button"
                      onClick={() => {
                        setView(item);
                        setConfirmDel(false);
                      }}
                      aria-label={`افتح ${item.title}`}
                      className={`group block w-full cursor-pointer rounded-2xl bg-[#C98B52] p-2 text-start shadow-[0_16px_26px_-14px_rgb(60_30_10/0.6)] ring-1 ring-[#8A5527]/40 transition-shadow hover:shadow-[0_0_0_4px_rgb(255_196_61/0.95)] ${i % 2 ? "md:mt-4" : ""}`}
                    >
                      <img src={item.image} alt={item.title} loading="lazy" className="aspect-[4/3] w-full rounded-lg bg-white object-cover" />
                      <span className="mt-2 flex items-center justify-between gap-2 px-1">
                        <span className="truncate font-heading text-sm font-bold text-white">{item.title}</span>
                        <i className="ri-search-line text-lg text-white/80" aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* family board */}
        <section id="family" className="w-full scroll-mt-28 bg-background-100 py-12 md:py-16">
          <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
            <SectionTitle className="text-center [&>p]:mx-auto" kicker="العائلة" icon="ri-group-line" title="لوحة العائلة" text="نجوم هذا الجهاز. كل طفل يتقدّم بسرعته الخاصة، والجميع أبطال." />
            <ol className="flex flex-col gap-3">
              {board.map((row, index) => (
                <li key={row.child.id} data-rise>
                  <button
                    type="button"
                    onClick={() => selectChild(row.child.id)}
                    aria-current={row.child.id === child.id ? "true" : undefined}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-3xl border p-3 text-start transition-colors md:gap-4 md:p-4 ${
                      row.child.id === child.id ? "border-primary-300 bg-primary-100" : "border-background-200 bg-background-50 hover:bg-primary-50"
                    }`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-lg font-bold ${index === 0 ? "bg-primary-400 text-foreground-900" : "bg-background-200 text-foreground-700"}`}>
                      {index === 0 ? <i className="ri-trophy-line" aria-hidden="true" /> : (index + 1).toLocaleString("ar-EG")}
                    </span>
                    <img src={row.child.avatar} alt={row.child.name} className={`h-12 w-12 shrink-0 rounded-2xl border-2 object-cover ${row.child.ring}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-heading text-base font-bold text-foreground-900">{row.child.name}</span>
                      <span className="block truncate text-xs font-bold text-foreground-600">
                        المستوى {row.level.level.toLocaleString("ar-EG")} · {row.level.name}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-background-100 px-3 py-1 text-sm font-bold text-foreground-900">
                      <i className="ri-star-fill text-primary-500" />
                      {row.points.toLocaleString("ar-EG")}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-center text-xs font-bold text-foreground-500">
              هل أنت ولي الأمر؟{" "}
              <Link to="/parent" className="text-foreground-800 underline underline-offset-2 hover:text-foreground-900">
                افتح لوحة المتابعة
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />

      {view ? (
        <div className="fixed inset-0 z-[97] flex items-center justify-center bg-foreground-950/70 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={view.title} onClick={() => setView(null)}>
          <div className="card animate-celebrate-pop max-h-[92vh] w-full max-w-2xl overflow-y-auto p-3 md:p-4" onClick={(e) => e.stopPropagation()}>
            <img src={view.image} alt={view.title} className="w-full rounded-2xl bg-white object-contain" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 pb-1">
              <div className="min-w-0">
                <p className="truncate font-heading text-lg font-bold text-foreground-900">{view.title}</p>
                <p className="text-xs font-semibold text-foreground-500">{new Date(view.createdAt).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="flex items-center gap-2">
                {confirmDel ? (
                  <>
                    <span className="text-sm font-bold text-secondary-700">حذفها نهائيًا؟</span>
                    <button
                      type="button"
                      onClick={() => {
                        removeCreation(view.id);
                        setView(null);
                        setConfirmDel(false);
                      }}
                      className="btn btn-sm bg-secondary-600 text-white"
                    >
                      نعم، احذف
                    </button>
                    <button type="button" onClick={() => setConfirmDel(false)} className="btn btn-ghost btn-sm">
                      لا
                    </button>
                  </>
                ) : (
                  <>
                    <a href={view.image} download={`${view.title}.jpg`} className="btn btn-primary btn-sm">
                      <i className="ri-download-2-line" />
                      حفظ كصورة
                    </a>
                    <button type="button" onClick={() => setConfirmDel(true)} className="btn btn-ghost btn-sm">
                      <i className="ri-delete-bin-6-line" />
                      حذف
                    </button>
                    <button type="button" onClick={() => setView(null)} className="btn btn-ghost btn-sm">
                      إغلاق
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-[97] flex items-center justify-center bg-foreground-950/50 px-4" role="dialog" aria-modal="true" aria-label="تعديل الاسم والصورة">
          <div className="card animate-celebrate-pop max-h-[92vh] w-full max-w-md overflow-y-auto p-5 md:p-8">
            <h3 className="font-heading text-xl font-bold text-foreground-900">غيّر اسمي وصورتي</h3>
            <label htmlFor="child-name" className="mt-5 block text-xs font-bold text-foreground-700">
              اسمي (من حرفين إلى ١٤ حرفًا)
            </label>
            <input id="child-name" value={name} maxLength={14} onChange={(e) => setName(e.target.value)} className="mt-2 h-12 w-full rounded-full border-2 border-background-300 bg-background-50 px-5 text-base font-bold text-foreground-900 transition-colors focus:border-primary-500" />
            <p className="mt-5 text-xs font-bold text-foreground-700">اختر صديقي</p>
            <ul className="mt-2 grid grid-cols-5 gap-2">
              {avatarChoices.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setAvatar(a.src)}
                    aria-label={`اختيار ${a.name}`}
                    aria-pressed={avatar === a.src}
                    className={`block aspect-square w-full cursor-pointer overflow-hidden rounded-full border-4 transition-transform ${avatar === a.src ? "scale-105 border-primary-500 ring-2 ring-primary-200" : "border-background-200 hover:-translate-y-0.5"}`}
                  >
                    <img src={a.src} alt="" className="h-full w-full object-cover" />
                  </button>
                  <span className={`mt-1 block text-center text-[11px] font-bold ${avatar === a.src ? "text-foreground-900" : "text-foreground-500"}`}>{a.name}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost btn-sm">
                إلغاء
              </button>
              <button type="button" onClick={saveProfile} disabled={name.trim().length < 2} className="btn btn-primary btn-sm">
                <i className="ri-check-line" />
                حفظ
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
