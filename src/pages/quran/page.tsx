import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoginRequiredModal from "@/components/feature/LoginRequiredModal";
import ModuleHero from "@/components/feature/ModuleHero";
import CategoryTile from "@/components/brand/CategoryTile";
import SurahPlayer from "@/pages/quran/components/SurahPlayer";
import HifzSection from "@/pages/quran/components/HifzSection";
import useScrollTop from "@/hooks/useScrollTop";
import { quranSteps } from "@/mocks/home";

export default function Quran() {
  useScrollTop();
  const [loginOpen, setLoginOpen] = useState(false);
  const { hash } = useLocation();

  const scrollToHifz = () => {
    document.getElementById("hifz")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // arriving from "/quran#hifz" (for example the back link of a surah)
  useEffect(() => {
    if (hash !== "#hifz") return undefined;
    const timer = window.setTimeout(() => document.getElementById("hifz")?.scrollIntoView({ behavior: "instant" }), 80);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <ModuleHero
          category="surahs"
          badge="ركن هادئ"
          badgeIcon="ri-moon-clear-line"
          title="جزء عمّ مع نور"
          description="سور جزء عمّ كاملةً: نستمع بهدوء، ثم نردّد، ثم نقرأ ونحفظ. نور ترافقك في كل خطوة."
          actions={
            <button type="button" onClick={scrollToHifz} className="btn btn-primary btn-lg">
              <i className="ri-play-circle-line text-xl" />
              ابدأ الاستماع
            </button>
          }
        />

        <HifzSection />

        <section className="relative w-full bg-background-100 py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-4xl">أربع خطوات نحو الحفظ</h2>
              <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">
                خطوة بعد خطوة، وبهدوء.
              </p>
            </div>

            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quranSteps.map((step, index) => (
                <li key={step.id} className="card flex flex-col items-center p-5 text-center md:p-6">
                  <CategoryTile icon={step.icon} tone="accent" size="lg" />
                  <span className="mt-3 text-xs font-bold text-accent-700">الخطوة {(index + 1).toLocaleString("ar-EG")}</span>
                  <h3 className="mt-1 font-heading text-lg font-bold text-foreground-900 md:text-xl">{step.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-foreground-600">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="relative w-full bg-accent-50 pb-14 md:pb-20">
          <div aria-hidden="true" className="najdi-zigzag hidden md:block" />
          <div className="mx-auto w-full max-w-5xl px-4 pt-12 md:px-6 md:pt-16">
            <div className="mb-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-4xl">استمع إلى السور</h2>
              <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">
                اختر سورة، واضغط تشغيل، وردّد بهدوء.
              </p>
            </div>

            <SurahPlayer onSave={() => setLoginOpen(true)} />
          </div>
        </section>
      </main>
      <Footer />
      <LoginRequiredModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
