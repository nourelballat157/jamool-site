import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageBanner from "@/components/feature/PageBanner";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import Character from "@/components/brand/Character";
import CategoryTile from "@/components/brand/CategoryTile";
import useProgress, { ageOf, levelOf, selectChild, type Child } from "@/store/progress";
import type { CategoryId } from "@/data/brand";

const DESTINATIONS: { to: string; label: string; category: CategoryId }[] = [
  { to: "/stories", label: "القصص", category: "stories" },
  { to: "/games", label: "الألعاب", category: "games" },
  { to: "/learning", label: "التعلّم", category: "learning" },
  { to: "/drawing", label: "الرسم", category: "art" },
];

export default function ChildSelect() {
  const { state } = useProgress();
  const [selected, setSelected] = useState<Child | null>(null);
  const childProfiles = state.children.map((c) => {
    const age = ageOf(c.birth);
    return {
      ...c,
      age: age === null ? "" : `${age.toLocaleString("ar-EG")} سنوات`,
      level: `المستوى ${levelOf(state.data[c.id]?.points ?? 0).level.toLocaleString("ar-EG")}`,
    };
  });

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <PageBanner eyebrow="ملفات الأطفال" eyebrowIcon="ri-group-line" title="اختر ملف الطفل للدخول إلى عالمه" description="لا نحتاج أي بيانات خاصة بالطفل." align="center" narrow />
        <section className="mx-auto w-full max-w-4xl px-4 py-10 text-center md:px-6 md:py-14">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-5">
            <Character name="jamool" size="lg" motion="wave" priority />
            <div className="card rounded-3xl p-4 text-start sm:max-w-xs">
              <p className="font-heading text-lg font-bold text-foreground-900">أهلًا بك! أنا جمّول</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-foreground-600">اضغط على صورتك لنبدأ الرحلة معًا.</p>
            </div>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 md:grid-cols-3">
            {childProfiles.map((child) => (
              <li key={child.id}>
                <button
                  type="button"
                  onClick={() => {
                    selectChild(child.id);
                    setSelected(child);
                  }}
                  className="card card-hover group flex w-full cursor-pointer flex-col items-center p-5"
                >
                  <img
                    src={child.avatar}
                    alt={child.name}
                    className={`h-32 w-32 rounded-3xl border-4 bg-background-100 object-cover transition-transform duration-200 group-hover:-translate-y-0.5 md:h-36 md:w-36 ${child.ring}`}
                  />
                  <h2 className="mt-4 font-heading text-xl font-bold text-foreground-900">{child.name}</h2>
                  {child.age ? <p className="text-sm font-medium text-foreground-600">{child.age}</p> : null}
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-0.5 text-[11px] font-bold text-primary-800">
                    <i className="ri-star-fill text-primary-500" />
                    {child.level}
                  </span>
                  <span className="btn btn-primary btn-sm mt-4">
                    <i className="ri-play-fill" />
                    ادخل عالمه
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <Link to="/parent" className="btn btn-ghost mt-10">
            <i className="ri-add-line" />
            إضافة ملف طفل جديد
          </Link>
        </section>
      </main>
      <Footer />

      {selected ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label={`أهلًا ${selected.name}`}>
          <button type="button" aria-label="إغلاق" onClick={() => setSelected(null)} className="absolute inset-0 h-full w-full cursor-pointer bg-foreground-950/50" />
          <div className="card relative z-10 max-h-[92vh] w-full max-w-sm overflow-y-auto p-6 text-center animate-rise-in md:p-7">
            <img src={selected.avatar} alt={selected.name} className={`mx-auto h-24 w-24 rounded-3xl border-4 bg-background-100 object-cover ${selected.ring}`} />
            <h3 className="mt-4 font-heading text-2xl font-bold text-foreground-900">أهلًا {selected.name}!</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground-600">اختر أين تريد أن تبدأ رحلتك اليوم.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link to="/room" className="btn btn-primary col-span-2">
                <i className="ri-home-smile-line" />
                غرفتي ونقاطي
              </Link>
              {DESTINATIONS.map((d) => (
                <Link key={d.to} to={d.to} className="card card-hover flex min-h-14 items-center gap-2 p-2">
                  <CategoryTile category={d.category} size="sm" />
                  <span className="text-sm font-bold text-foreground-800">{d.label}</span>
                </Link>
              ))}
            </div>
            <button type="button" onClick={() => setSelected(null)} className="btn btn-ghost btn-sm mt-3 w-full">
              اختر طفلًا آخر
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
