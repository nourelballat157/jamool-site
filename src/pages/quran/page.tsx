import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoginRequiredModal from "@/components/feature/LoginRequiredModal";
import ModuleHero from "@/components/feature/ModuleHero";
import CategoryTile from "@/components/brand/CategoryTile";
import MushafArt from "@/components/brand/MushafArt";
import SurahPlayer from "@/pages/quran/components/SurahPlayer";
import HifzSection from "@/pages/quran/components/HifzSection";
import useScrollTop from "@/hooks/useScrollTop";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK_QUERY } from "@/lib/gsap";
import { quranSteps } from "@/mocks/home";

export default function Quran() {
  useScrollTop();
  const [loginOpen, setLoginOpen] = useState(false);
  const { hash } = useLocation();
  const main = useRef<HTMLElement>(null);

  /* the four steps pop in one after another, the player's heading rises as it is reached */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.set("[data-step]", { opacity: 0, y: 36, scale: 0.95 });
        ScrollTrigger.batch("[data-step]", {
          start: "top 92%",
          once: true,
          onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: "back.out(1.4)", overwrite: true, clearProps: "transform,opacity" }),
        });
        gsap.from("[data-steps-head] > *", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: "[data-steps-head]", start: "top 88%", once: true } });
        gsap.from("[data-player-head] > *", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: "[data-player-head]", start: "top 88%", once: true } });
      });
      return () => mm.revert();
    },
    { scope: main }
  );

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
      <main ref={main} className="flex-1">
        <ModuleHero
          category="surahs"
          badge="ركن هادئ"
          badgeIcon="ri-moon-clear-line"
          art={<MushafArt size="xl" motion="float" priority />}
          title="جزء عمّ بهدوء"
          description="سور جزء عمّ كاملةً: نستمع بهدوء، ثم نردّد، ثم نقرأ ونحفظ، خطوة بعد خطوة."
          actions={
            <button type="button" onClick={scrollToHifz} className="btn btn-primary btn-lg">
              <i className="ri-play-circle-line text-xl" />
              ابدأ الاستماع
            </button>
          }
        />

        <HifzSection />

        <section className="relative w-full bg-gradient-to-b from-[#FCE9DA] via-[#FFF4E6] to-[#FFFAF2] py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div data-steps-head className="mb-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-4xl">أربع خطوات نحو الحفظ</h2>
              <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">
                خطوة بعد خطوة، وبهدوء.
              </p>
            </div>

            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quranSteps.map((step, index) => (
                <li key={step.id} data-step className="flex flex-col items-center rounded-[1.7rem] bg-white/90 p-5 text-center shadow-[0_14px_34px_-24px_rgb(31_42_92/0.45)] ring-1 ring-[#EADFCB]/80 md:p-6">
                  <CategoryTile icon={step.icon} tone="accent" size="lg" />
                  <span className="mt-3 text-xs font-bold text-accent-700">الخطوة {(index + 1).toLocaleString("ar-EG")}</span>
                  <h3 className="mt-1 font-heading text-lg font-bold text-foreground-900 md:text-xl">{step.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-foreground-600">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="relative w-full bg-[linear-gradient(180deg,#FFFAF2_0%,#E8F4F5_100%)] pb-14 md:pb-20">
          <div className="mx-auto w-full max-w-5xl px-4 pt-12 md:px-6 md:pt-16">
            <div data-player-head className="mb-8 text-center">
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
