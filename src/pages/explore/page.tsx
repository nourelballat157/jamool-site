import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ModuleHero from "@/components/feature/ModuleHero";
import Character from "@/components/brand/Character";
import useScrollTop from "@/hooks/useScrollTop";
import useProgress, { ageOf } from "@/store/progress";
import { categories, categoryById, tones, type CategoryId } from "@/data/brand";
import { adventures, AGE_GROUPS, ageLabel, fitsAge, type AgeGroupId } from "@/data/adventures";

const groupForAge = (age: number | null): AgeGroupId => {
  if (age === null) return "all";
  if (age <= 5) return "3-5";
  if (age <= 8) return "6-8";
  return "9-12";
};

export default function Explore() {
  useScrollTop();
  const { child, isDone } = useProgress();
  const [age, setAge] = useState<AgeGroupId>(() => groupForAge(ageOf(child.birth)));
  const [world, setWorld] = useState<CategoryId | "all">("all");
  const [limit, setLimit] = useState(12);

  useEffect(() => setLimit(12), [age, world]);

  const list = useMemo(
    () => adventures.filter((a) => fitsAge(a, age) && (world === "all" || a.category === world)),
    [age, world]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <ModuleHero
          badge="استكشف"
          badgeIcon="ri-compass-3-line"
          title="كل المغامرات في مكان واحد"
          description="قصص وألعاب وأنشطة جاهزة الآن. اختر عمرك وعالمك، وابدأ بما يعجبك."
          character="jamool"
          actions={
            <a href="#adventures" className="btn btn-primary">
              <i className="ri-play-fill text-lg" />
              هيا نختار
            </a>
          }
        />

        <section id="adventures" className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16">
          {/* filters */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
            <div>
              <p className="mb-2 font-heading text-sm font-bold text-foreground-500">كم عمرك؟</p>
              <div role="radiogroup" aria-label="العمر" className="inline-flex flex-wrap gap-1.5 rounded-full bg-background-100 p-1.5">
                {AGE_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    role="radio"
                    aria-checked={age === g.id}
                    onClick={() => setAge(g.id)}
                    className={`h-11 whitespace-nowrap rounded-full px-4 font-heading text-sm font-semibold transition-colors ${
                      age === g.id ? "bg-foreground-900 text-background-100" : "text-foreground-700 hover:bg-background-200"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <p className="mb-2 font-heading text-sm font-bold text-foreground-500">اختر عالمك</p>
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
                <button
                  type="button"
                  onClick={() => setWorld("all")}
                  aria-pressed={world === "all"}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 font-heading text-sm font-semibold transition-colors ${
                    world === "all" ? "bg-foreground-900 text-background-100" : "bg-background-100 text-foreground-700 hover:bg-background-200"
                  }`}
                >
                  <i className="ri-apps-2-line text-lg" />
                  الكل
                </button>
                {categories
                  .filter((c) => c.id !== "video")
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setWorld(c.id)}
                      aria-pressed={world === c.id}
                      className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 font-heading text-sm font-semibold transition-colors ${
                        world === c.id ? tones[c.tone].solid : `${tones[c.tone].soft} text-foreground-800 hover:brightness-95`
                      }`}
                    >
                      <i className={`${c.icon} text-lg`} />
                      {c.label}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <p aria-live="polite" className="mb-6 mt-8 font-heading text-lg font-bold text-foreground-900">
            {list.length.toLocaleString("ar-EG")} مغامرة تناسبك
          </p>

          {list.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-10 text-center">
              <Character name="jamool" size="lg" motion="float" small />
              <p className="font-heading text-lg font-bold text-foreground-900">لم أجد شيئًا هنا بعد</p>
              <p className="text-foreground-600">جرّب عمرًا آخر أو عالمًا آخر، فعندي الكثير لأريك.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.slice(0, limit).map((a) => {
                const cat = categoryById(a.category);
                const t = tones[cat.tone];
                const done = a.doneKey ? isDone(a.doneKey) : false;
                return (
                  <li key={a.id}>
                    <Link to={a.to} className="card card-hover group flex h-full flex-col overflow-hidden">
                      {a.image ? (
                        <img src={a.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                      ) : (
                        <span className="relative flex aspect-[4/3] w-full items-end justify-center overflow-hidden" style={{ background: `linear-gradient(150deg, ${t.hex}2b 0%, ${t.hex}7a 100%)` }}>
                          <span aria-hidden="true" className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(rgb(255 255 255 / .55) 2px, transparent 2.5px) 0 0 / 22px 22px" }} />
                          <i aria-hidden="true" className={`${cat.icon} absolute -bottom-6 start-2 text-[9rem] leading-none opacity-25`} style={{ color: t.hex }} />
                          <span className="absolute start-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-2xl shadow-md" style={{ color: t.hex }}>
                            <i className={cat.icon} aria-hidden="true" />
                          </span>
                          <span aria-hidden="true" className="absolute bottom-0 end-4 transition-transform duration-300 group-hover:scale-105">
                            <Character name={cat.character} size="md" small decorative className="!h-[9.5rem] drop-shadow-[0_10px_10px_rgba(31,26,107,0.3)]" />
                          </span>
                        </span>
                      )}
                      <span className="flex flex-1 flex-col p-5">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`rounded-full px-3 py-1 font-heading text-xs font-semibold ${t.chip}`}>{a.kind}</span>
                          {done ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-leaf-700">
                              <i className="ri-check-line text-base" />
                              أنهيتها
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-3 font-heading text-lg font-bold text-foreground-900">{a.title}</span>
                        <span className="mt-1 text-sm leading-relaxed text-foreground-600">{a.desc}</span>
                        <span className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs font-medium text-foreground-500">
                          <span className="inline-flex items-center gap-1">
                            <i className="ri-time-line text-base" />
                            {a.minutes.toLocaleString("ar-EG")} دقائق
                          </span>
                          <span>{ageLabel(a)}</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {list.length > limit ? (
            <div className="mt-10 flex justify-center">
              <button type="button" onClick={() => setLimit((n) => n + 12)} className="btn btn-primary btn-lg">
                <i className="ri-add-line text-lg" />
                أرني المزيد ({(list.length - limit).toLocaleString("ar-EG")})
              </button>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
