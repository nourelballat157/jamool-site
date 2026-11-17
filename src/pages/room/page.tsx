import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ModuleHero from "@/components/feature/ModuleHero";
import useScrollTop from "@/hooks/useScrollTop";
import useProgress, { familyBoard, removeCreation, renameChild, selectChild } from "@/store/progress";
import Medal from "@/components/brand/Medal";
import ProgressBar from "@/components/brand/ProgressBar";
import CategoryTile from "@/components/brand/CategoryTile";
import Character from "@/components/brand/Character";
import { avatarChoices, categoryById, type CategoryId } from "@/data/brand";

const earnWays = [
  { icon: "ri-book-open-line", label: "أنهِ قصة", pts: 30 },
  { icon: "ri-text", label: "أتقن حرفًا", pts: 15 },
  { icon: "ri-book-2-line", label: "أتمّ مرحلة حفظ", pts: 20 },
  { icon: "ri-gamepad-line", label: "أنهِ لعبة", pts: 10 },
  { icon: "ri-plant-line", label: "أزهر قيمة", pts: 50 },
  { icon: "ri-trophy-line", label: "أنهِ مسابقة", pts: 40 },
];

export default function Room() {
  useScrollTop();
  const p = useProgress();
  const { child, data, level, streak, week } = p;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(child.name);
  const [avatar, setAvatar] = useState(child.avatar);
  const board = familyBoard();

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

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

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
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

        {/* Points & level */}
        <section className="w-full bg-background-50 py-12 md:py-16">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 md:px-6 lg:grid-cols-5">
            <div className="card bg-primary-50 p-5 md:p-8 lg:col-span-3">
              <div className="flex flex-wrap items-center gap-5">
                <span className="relative">
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className={`h-24 w-24 rounded-3xl border-4 bg-background-50 object-cover md:h-28 md:w-28 ${child.ring}`}
                  />
                  <span className="absolute -bottom-2 -end-2 flex h-9 min-w-9 items-center justify-center rounded-full bg-primary-500 px-2 font-heading text-base font-bold text-foreground-900 shadow-card">
                    {level.level.toLocaleString("ar-EG")}
                  </span>
                </span>
                <div className="min-w-[10rem] flex-1">
                  <p className="text-xs font-bold text-primary-800">المستوى {level.level.toLocaleString("ar-EG")}</p>
                  <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">{level.name}</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm font-bold text-foreground-700">
                    <i className="ri-star-fill text-xl text-primary-500" />
                    {data.points.toLocaleString("ar-EG")} نقطة
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <ProgressBar value={level.pct} tone="primary" label="التقدم نحو المستوى التالي" height="h-4" />
                <p className="mt-2 text-xs font-bold text-foreground-600">
                  {level.next === null ? "وصلت إلى أعلى مستوى. أنت أسطورة!" : `تبقّى ${level.toNext.toLocaleString("ar-EG")} نقطة للمستوى التالي`}
                </p>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-3xl bg-background-50 p-4">
                <img src="/brand/avatar-jamool.webp" alt="جمّول" className="h-12 w-12 shrink-0 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <p className="font-heading text-base font-bold text-foreground-900">جمّول فخور بك يا {child.name}!</p>
                  <p className="mt-0.5 text-sm font-medium leading-relaxed text-foreground-600">
                    {data.points > 0
                      ? "كل نجمة جمعتها تقرّبنا من المستوى الجديد. هيا نكمل!"
                      : "هيا نبدأ معًا! اقرأ قصة أو العب لعبة وسأجمع لك أول نجمة."}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-5 md:p-8 lg:col-span-2">
              <h3 className="font-heading text-lg font-bold text-foreground-900 md:text-xl">كيف أكسب النقاط؟</h3>
              <p className="mt-1 text-xs font-medium text-foreground-500">النقاط تأتي عندما تُنهي شيئًا، لا عندما تفتح صفحة.</p>
              <ul className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                {earnWays.map((way) => (
                  <li key={way.label} className="flex items-center gap-2 rounded-2xl bg-background-100 px-3 py-2">
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

        {/* Streak */}
        <section className="w-full bg-amber-50 py-12 md:py-16">
          <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700">
                <i className="ri-fire-fill text-base text-amber-500" />
                الأيام المتتالية
              </span>
              <h2 className="mt-3 font-heading text-2xl font-bold text-foreground-900 md:text-3xl">
                {streak > 0 ? `${streak.toLocaleString("ar-EG")} ${streak > 2 && streak < 11 ? "أيام" : "يومًا"} وراء بعض` : "ابدأ سلسلة أيامك اليوم"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground-600 md:text-base">
                زُر عالمك كل يوم لتبني سلسلة جميلة. أسبوع كامل يمنحك شارة خاصة.
              </p>
            </div>
            <ol className="grid grid-cols-7 gap-1.5 md:gap-4">
              {week.map((day) => (
                <li key={day.iso} className="flex flex-col items-center gap-2">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors md:h-16 md:w-16 md:text-2xl ${
                      day.done
                        ? "bg-amber-500 text-foreground-900"
                        : day.today
                          ? "border-2 border-dashed border-amber-500 bg-background-50 text-amber-600"
                          : "bg-background-50 text-background-400"
                    }`}
                  >
                    <i className={day.done ? "ri-fire-fill" : day.today ? "ri-sparkling-2-line" : "ri-circle-line"} />
                  </span>
                  <span className={`text-[11px] font-bold md:text-xs ${day.today ? "text-amber-700" : "text-foreground-500"}`}>
                    {day.today ? "اليوم" : day.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Badges */}
        <section className="w-full bg-background-50 py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">شاراتي</h2>
              <p className="mt-2 text-sm text-foreground-600 md:text-base">
                جمعت {earnedBadges.toLocaleString("ar-EG")} من {p.badges.length.toLocaleString("ar-EG")} شارة.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {p.badges.map((badge) => (
                <li
                  key={badge.id}
                  className={`flex flex-col items-center rounded-3xl p-4 text-center md:p-5 ${
                    badge.earned ? "card bg-primary-50" : "bg-background-100"
                  }`}
                >
                  <Medal id={badge.id} title={badge.title} earned={badge.earned} size="lg" />
                  <h3 className={`mt-4 font-heading text-base font-bold ${badge.earned ? "text-foreground-900" : "text-foreground-500"}`}>
                    {badge.title}
                  </h3>
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
          </div>
        </section>

        {/* Journeys */}
        <section className="w-full bg-background-100 py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">تقدّمي في الرحلات</h2>
              <p className="mt-2 max-w-xl text-sm text-foreground-600 md:text-base">كل رحلة تكبر معك. اضغط على أي بطاقة لتكمل من حيث توقفت.</p>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {journeys.map((j) => {
                const cat = categoryById(j.category);
                return (
                  <li key={j.id}>
                    <Link to={j.to} className="card card-hover group flex items-center gap-4 p-4 md:p-5">
                      <CategoryTile category={j.category} size="lg" className="transition-transform group-hover:-translate-y-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-heading text-base font-bold text-foreground-900">{j.title}</h3>
                          <span className="shrink-0 text-xs font-bold text-foreground-500">
                            {j.done.toLocaleString("ar-EG")} / {j.total.toLocaleString("ar-EG")} {j.unit}
                          </span>
                        </div>
                        <ProgressBar value={(j.done / j.total) * 100} tone={cat.tone} label={`تقدّمك في ${j.title}`} height="h-2.5" className="mt-3" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Creations */}
        <section className="w-full bg-background-50 py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">إبداعاتي</h2>
                <p className="mt-2 text-sm text-foreground-600 md:text-base">رسوماتك وتلويناتك المحفوظة في مكان واحد.</p>
              </div>
              <Link to="/drawing" className="btn btn-primary btn-sm">
                <i className="ri-brush-line" />
                ارسم الآن
              </Link>
            </div>

            {data.creations.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl bg-amber-50 px-6 py-8 text-center">
                <Character name="maha" size="md" motion="float" small />
                <p className="mt-3 font-heading text-lg font-bold text-foreground-900">لا توجد إبداعات بعد</p>
                <p className="mt-1 max-w-sm text-sm font-medium text-foreground-600">
                  مها تنتظر أول رسمة لك! ارسم أو لوّن شيئًا جميلًا واضغط «احفظ في غرفتي» لتظهر هنا.
                </p>
                <Link to="/drawing" className="btn btn-primary btn-sm mt-5">
                  <i className="ri-palette-line" />
                  هيا نرسم
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {data.creations.map((item) => (
                  <li key={item.id} className="card overflow-hidden">
                    <img src={item.image} alt={item.title} className="aspect-square w-full bg-background-50 object-cover" />
                    <div className="flex items-center justify-between gap-2 p-3">
                      <span className="truncate text-sm font-bold text-foreground-900">{item.title}</span>
                      <button
                        type="button"
                        onClick={() => removeCreation(item.id)}
                        aria-label={`حذف ${item.title}`}
                        className="btn-icon h-11 w-11 shrink-0 hover:bg-secondary-100 hover:text-secondary-700"
                      >
                        <i className="ri-delete-bin-6-line" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Family board */}
        <section className="w-full bg-background-100 py-12 md:py-16">
          <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
            <div className="mb-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">لوحة العائلة</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-foreground-600 md:text-base">
                نجوم هذا الجهاز. كل طفل يتقدّم بسرعته الخاصة، والجميع أبطال.
              </p>
            </div>
            <ol className="flex flex-col gap-3">
              {board.map((row, index) => (
                <li key={row.child.id}>
                  <button
                    type="button"
                    onClick={() => selectChild(row.child.id)}
                    aria-current={row.child.id === child.id ? "true" : undefined}
                    className={`flex w-full items-center gap-3 rounded-3xl border p-3 text-start transition-colors cursor-pointer md:gap-4 md:p-4 ${
                      row.child.id === child.id ? "border-primary-300 bg-primary-100" : "border-background-200 bg-background-50 hover:bg-primary-50"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 font-heading text-base font-bold text-foreground-900">
                      {(index + 1).toLocaleString("ar-EG")}
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

      {editing ? (
        <div
          className="fixed inset-0 z-[97] flex items-center justify-center bg-foreground-950/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="تعديل الاسم والصورة"
        >
          <div className="card animate-celebrate-pop max-h-[92vh] w-full max-w-md overflow-y-auto p-5 md:p-8">
            <h3 className="font-heading text-xl font-bold text-foreground-900">غيّر اسمي وصورتي</h3>
            <label htmlFor="child-name" className="mt-5 block text-xs font-bold text-foreground-700">
              اسمي (من حرفين إلى ١٤ حرفًا)
            </label>
            <input
              id="child-name"
              value={name}
              maxLength={14}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 h-12 w-full rounded-full border-2 border-background-300 bg-background-50 px-5 text-base font-bold text-foreground-900 transition-colors focus:border-primary-500"
            />
            <p className="mt-5 text-xs font-bold text-foreground-700">اختر صديقي</p>
            <ul className="mt-2 grid grid-cols-5 gap-2">
              {avatarChoices.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setAvatar(a.src)}
                    aria-label={`اختيار ${a.name}`}
                    aria-pressed={avatar === a.src}
                    className={`block aspect-square w-full overflow-hidden rounded-full border-4 transition-transform cursor-pointer ${
                      avatar === a.src ? "scale-105 border-primary-500 ring-2 ring-primary-200" : "border-background-200 hover:-translate-y-0.5"
                    }`}
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
