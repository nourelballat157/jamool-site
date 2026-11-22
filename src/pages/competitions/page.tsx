import { useState } from "react";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoginRequiredModal from "@/components/feature/LoginRequiredModal";
import ModuleHero from "@/components/feature/ModuleHero";
import CategoryTile from "@/components/brand/CategoryTile";
import Medal from "@/components/brand/Medal";
import QuickQuizSection from "@/pages/competitions/quiz/QuickQuizSection";
import ContestsSection from "@/pages/competitions/contest/ContestsSection";
import useScrollTop from "@/hooks/useScrollTop";
import { useHashScroll } from "@/pages/competitions/contest/helpers";
import { tones } from "@/data/brand";
import { competitionList } from "@/mocks/child";
import { competitionSteps } from "@/mocks/home";

/** The official association competitions: static, data-free, calm. */
const OFFICIAL_STEPS = [
  { title: "إعلان المسابقة", text: "تُنشر هنا تفاصيل كل مسابقة (موضوعها، موعدها، الفئة العمرية)." },
  { title: "موافقة ولي الأمر", text: "لا يشارك الطفل في مسابقة رسمية إلا بعد موافقة ولي أمره." },
  { title: "المشاركة والتكريم", text: "تُعلن النتائج بطريقة تحفظ خصوصية الجميع." },
];

export default function Competitions() {
  useScrollTop();
  useHashScroll();
  const [loginOpen, setLoginOpen] = useState(false);
  const sky = tones.sky;

  return (
    <div className="flex min-h-screen flex-col bg-background-50">
      <Navbar />
      <main className="flex-1">
        <ModuleHero
          category="competitions"
          badge="ساحة التحدّي"
          badgeIcon="ri-trophy-line"
          title="أرني ما تعرف"
          description="أسئلة سريعة وتحديات ممتعة، وكل مشاركة تنال تقديرًا بلا مقارنة بين الأطفال."
          actions={
            <>
              <a href="#quick-quizzes" className="btn btn-primary btn-lg">
                <i className="ri-play-fill" />
                هيا نبدأ
              </a>
              <a href="#contests" className="btn btn-ghost btn-lg">
                <i className="ri-trophy-line" />
                شارك في مسابقة
              </a>
            </>
          }
        />

        <QuickQuizSection />

        <ContestsSection />

        {/* training challenges */}
        <section className="w-full bg-background-100 py-10 md:py-14">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="mb-6 text-center md:mb-8">
              <h2 className="font-heading text-2xl font-bold text-foreground-900 md:text-4xl">تحديات للتدريب</h2>
              <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-foreground-600">
                تمارين ممتعة تتدرّب بها وتبدع، وهي ليست مسابقات رسمية.
              </p>
            </div>

            <ol className="mx-auto mb-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {competitionSteps.map((step, index) => (
                <li key={step.id} className="flex items-center gap-3 rounded-3xl bg-background-50 p-3 pe-4">
                  <CategoryTile icon={step.icon} tone="primary" size="md" />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-primary-800">الخطوة {(index + 1).toLocaleString("ar-EG")}</span>
                    <span className="block text-sm font-bold leading-snug text-foreground-900">{step.label}</span>
                  </span>
                </li>
              ))}
            </ol>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              {competitionList.map((item) => (
                <li key={item.id} className="card card-hover flex items-start gap-4 p-5 md:p-6">
                  <CategoryTile icon={item.icon} tone="primary" size="lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-lg font-bold text-foreground-900 md:text-xl">{item.title}</h3>
                    <p className="mt-1 text-base leading-relaxed text-foreground-600">{item.desc}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800">
                        <i className="ri-flag-line" />
                        تحدٍّ للتدريب
                      </span>
                      <button type="button" onClick={() => setLoginOpen(true)} className="btn btn-primary btn-sm">
                        <i className="ri-send-plane-line" />
                        شارك
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs font-medium text-foreground-500">
              <i className="ri-information-line text-primary-700" />
              التحديات التدريبية بلا تصويت وبلا مقارنة. أما المسابقات المستمرة أعلاه فيصوّت فيها الأطفال، وتفوز المشاركة الأكثر أصواتًا.
            </p>
          </div>
        </section>

        {/* official association competitions: calm and trustworthy, no characters */}
        <section id="official" aria-labelledby="official-title" className="w-full bg-background-50 py-10 md:py-14">
          <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
            <div className={`rounded-4xl border p-5 md:p-8 ${sky.soft} ${sky.border}`}>
              <div className="flex items-start gap-4">
                <CategoryTile icon="ri-megaphone-line" tone="sky" size="lg" solid />
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${sky.text}`}>المسابقات الرسمية للجمعية</p>
                  <h2 id="official-title" className="mt-1 font-heading text-2xl font-bold text-foreground-900 md:text-3xl">
                    مسابقات الجمعية
                  </h2>
                  <p className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${sky.chip}`} role="status">
                    <i className="ri-information-line" />
                    لا توجد مسابقات معلنة حاليًا
                  </p>
                </div>
              </div>

              <ol className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                {OFFICIAL_STEPS.map((step, index) => (
                  <li key={step.title} className="flex flex-col gap-3 rounded-3xl bg-background-50 p-4 md:p-5">
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-heading text-xl font-bold ${sky.tile}`}
                    >
                      {(index + 1).toLocaleString("ar-EG")}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-foreground-900">{step.title}</h3>
                    <p className="text-base leading-relaxed text-foreground-600">{step.text}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-5 flex items-center gap-4 rounded-3xl bg-background-50 p-4 md:p-5">
                <Medal id="quiz-champ" earned={false} size="md" title="شارة بطل المسابقات (لم تُنَل بعد)" />
                <div className="min-w-0">
                  <h3 className="font-heading text-lg font-bold text-foreground-900">شارة بانتظارك</h3>
                  <p className="mt-1 text-base leading-relaxed text-foreground-600">
                    عندما تُعلن مسابقة وتشارك فيها بموافقة ولي أمرك، تنتظرك شارة تكريم هنا.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <LoginRequiredModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
