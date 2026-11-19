import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoginRequiredModal from "@/components/feature/LoginRequiredModal";
import ModuleHero from "@/components/feature/ModuleHero";
import CategoryTile from "@/components/brand/CategoryTile";
import StudioCanvas from "@/pages/drawing/components/StudioCanvas";
import useScrollTop from "@/hooks/useScrollTop";
import { recordActivity } from "@/hooks/useActivityProgress";
import { artTemplates } from "@/mocks/child";
import { creativeTools } from "@/mocks/home";

export default function Drawing() {
  useScrollTop();
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | undefined>(undefined);

  const activeArt = artTemplates.find((art) => art.image === activeTemplate);

  const scrollToStudio = () => {
    recordActivity({
      key: "drawing",
      title: "استوديو الرسم",
      subtitle: "لوحة الرسم والتلوين في انتظارك",
      icon: "ri-palette-line",
      route: "/drawing",
      tone: "bg-amber-100 text-amber-700",
    });
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applyTemplate = (image: string) => {
    setActiveTemplate(image);
    scrollToStudio();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <ModuleHero
          category="art"
          badge="استوديو الإبداع"
          badgeIcon="ri-palette-line"
          title="ارسم.. لوّن.. وأطلق خيالك"
          description="مها تنتظرك بلوح رسم حقيقي وفرش وألوان وممحاة. ارسم بحرّية أو لوّن رسمة جاهزة، ثم احفظ لوحتك."
          actions={
            <button type="button" onClick={scrollToStudio} className="btn btn-primary btn-lg">
              <i className="ri-brush-line" />
              ابدأ الرسم
            </button>
          }
        />

        <section id="studio" className="w-full scroll-mt-20 bg-background-50 py-10 md:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">لوح الرسم التفاعلي</h2>
                <p className="mt-2 text-sm text-foreground-600 md:text-base">اختر لونك وسمك القلم وارسم مباشرة، أو لوّن رسمة جاهزة.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTemplate(undefined)}
                  aria-pressed={activeTemplate === undefined}
                  className={`btn btn-sm ${activeTemplate === undefined ? "btn-secondary" : "btn-ghost"}`}
                >
                  <i className="ri-file-line" />
                  لوح أبيض
                </button>
                {activeArt ? (
                  <span className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-amber-100 px-4 text-sm font-bold text-amber-700">
                    <i className="ri-image-line" />
                    {activeArt.label}
                  </span>
                ) : null}
              </div>
            </div>

            <StudioCanvas templateImage={activeTemplate} templateLabel={activeArt?.label} onSave={() => setLoginOpen(true)} />
          </div>
        </section>

        <section className="w-full bg-amber-50 py-10 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-3xl">رسومات جاهزة للتلوين</h2>
              <p className="mt-2 text-sm text-foreground-600 md:text-base">اختر رسمة ثم لوّنها بألوانك المفضلة على اللوح التفاعلي.</p>
            </div>

            <ul className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
              {artTemplates.map((art) => (
                <li key={art.id}>
                  <button
                    type="button"
                    onClick={() => applyTemplate(art.image)}
                    aria-pressed={activeTemplate === art.image}
                    className={`card card-hover group flex w-full flex-col items-center p-3 md:p-4 ${
                      activeTemplate === art.image ? "ring-4 ring-amber-500" : ""
                    }`}
                  >
                    <span className="w-full overflow-hidden rounded-2xl bg-background-50">
                      <img src={art.image} alt={art.label} loading="lazy" className="h-36 w-full object-contain md:h-44" />
                    </span>
                    <span className="mt-3 font-heading text-sm font-bold text-foreground-900 md:text-base">{art.label}</span>
                    <span className="btn btn-primary btn-sm mt-3 w-full">
                      <i className="ri-palette-line" />
                      لوّن الآن
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:gap-4">
                {creativeTools.map((tool) => (
                  <li key={tool.id}>
                    <button
                      type="button"
                      onClick={scrollToStudio}
                      className="group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 p-4 text-start shadow-[0_8px_0_oklch(var(--amber-200)/1),0_18px_26px_-18px_rgb(120_70_0/0.55)] ring-1 ring-inset ring-white/60 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <span aria-hidden="true" className="pointer-events-none absolute inset-x-3 top-0 h-1/2 rounded-b-[999px] bg-gradient-to-b from-white/50 to-transparent" />
                      <span aria-hidden="true" className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl text-amber-700 shadow-[0_6px_12px_-4px_rgb(120_70_0/0.5),inset_0_-3px_0_rgb(245_166_58/0.25)]">
                        <i className={tool.icon} />
                      </span>
                      <span className="relative flex-1 text-sm font-bold leading-snug text-foreground-900">{tool.label}</span>
                      <i aria-hidden="true" className="ri-arrow-left-line relative text-lg text-amber-700 transition-transform duration-300 group-hover:-translate-x-1" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="card flex flex-col justify-center gap-3 p-5 md:p-6">
                <CategoryTile icon="ri-user-heart-line" tone="primary" size="lg" />
                <h3 className="font-heading text-lg font-bold text-foreground-900 md:text-xl">احفظ لوحاتك وشاركها</h3>
                <p className="text-sm font-medium leading-relaxed text-foreground-600">
                  اضغط «احفظ في غرفتي» تحت اللوح لتجد رسمتك في غرفتك دائمًا. أما رفعها لمعرض الإبداع فيلزمه حساب ولي أمر مسؤول — بلا حساب للطفل.
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Link to="/room" className="btn btn-primary btn-sm w-full md:w-auto">
                    <i className="ri-door-open-line" />
                    افتح غرفتي
                  </Link>
                  <button type="button" onClick={() => setLoginOpen(true)} className="btn btn-ghost btn-sm w-full md:w-auto">
                    <i className="ri-upload-cloud-2-line" />
                    ارفع رسمتك
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <LoginRequiredModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        message="رفع لوحاتك إلى معرض الإبداع يحتاج حساب ولي أمر مسؤول وتخزينًا آمنًا للصور. سجّل الدخول لتتابع."
      />
    </div>
  );
}
