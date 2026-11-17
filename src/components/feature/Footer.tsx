import { Link } from "react-router-dom";
import Logo, { OwnerMark } from "@/components/brand/Logo";
import Character from "@/components/brand/Character";
import { categories } from "@/data/brand";

const socials = [
  { id: "so1", icon: "ri-youtube-fill", label: "يوتيوب" },
  { id: "so2", icon: "ri-instagram-fill", label: "إنستغرام" },
  { id: "so3", icon: "ri-whatsapp-fill", label: "واتساب" },
];

const parentLinks = [
  { to: "/parent", label: "ركن أولياء الأمور" },
  { to: "/room", label: "غرفتي وإنجازاتي" },
  { to: "/privacy", label: "سياسة الخصوصية" },
  { to: "/terms", label: "شروط الاستخدام" },
  { to: "/contact", label: "تواصل معنا" },
];

export default function Footer() {
  return (
    <footer className="on-navy relative overflow-hidden bg-foreground-900 text-background-100">
      <div aria-hidden="true" className="pattern-diamond-navy absolute inset-0" />
      <div aria-hidden="true" className="sadu-band relative" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-8 pt-14 md:px-6 md:pt-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-end gap-4">
              <Logo className="h-24 md:h-28" />
              <Character name="jamool" size="md" small decorative className="hidden sm:block" />
            </div>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-background-200">
              عالمٌ صغير، خيالٌ كبير. منصة عربية للأطفال تجمع القصص والحروف وقصار السور والألعاب والرسم والقيم في مكان واحد آمن.
            </p>
            <div className="mt-6 flex items-center gap-4 rounded-3xl bg-background-100/[0.06] p-4 ring-1 ring-background-100/10">
              <OwnerMark className="h-14 rounded-xl bg-background-50 p-1.5" />
              <p className="text-sm leading-relaxed text-background-200">
                مبادرة وطنية برعاية
                <span className="block font-heading font-semibold text-background-50">الجمعية الأهلية الصالحية بعنيزة</span>
              </p>
            </div>
          </div>

          <div className="md:col-span-4">
            <p className="mb-4 font-heading text-base font-bold text-primary-400">عوالم جمّول</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={c.to} className="inline-flex items-center gap-2 text-sm font-medium text-background-200 transition-colors hover:text-primary-300">
                    <i className={`${c.icon} text-lg text-primary-400`} />
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="mb-4 font-heading text-base font-bold text-primary-400">للأهل والمعلمين</p>
            <ul className="flex flex-col gap-2.5">
              {parentLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm font-medium text-background-200 transition-colors hover:text-primary-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-2.5">
              {socials.map((s) => (
                <Link key={s.id} to="/contact" aria-label={s.label} className="flex h-11 w-11 items-center justify-center rounded-full bg-background-100/10 text-xl text-background-100 transition-colors hover:bg-primary-500 hover:text-foreground-900">
                  <i className={s.icon} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-background-100/10 pt-6 text-center sm:flex-row sm:text-start">
          <p className="text-xs text-background-300">© 2026 جمّول — مشروع الجمعية الأهلية الصالحية بعنيزة، المملكة العربية السعودية</p>
          <p className="flex items-center gap-1.5 text-xs text-background-300">
            <i className="ri-shield-check-fill text-base text-primary-400" />
            بلا إعلانات · بلا بيانات شخصية · التقدّم محفوظ على جهازك
          </p>
        </div>
      </div>
    </footer>
  );
}
