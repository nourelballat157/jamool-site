import { useRef } from "react";
import { Link } from "react-router-dom";
import Logo, { OwnerMark } from "@/components/brand/Logo";
import Character from "@/components/brand/Character";
import { categories, tones, type CharacterId } from "@/data/brand";
import { socials } from "@/data/social";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK_QUERY } from "@/lib/gsap";

const parentLinks = [
  { to: "/parent", label: "ركن أولياء الأمور", icon: "ri-shield-user-line" },
  { to: "/room", label: "غرفتي وإنجازاتي", icon: "ri-home-smile-line" },
  { to: "/privacy", label: "سياسة الخصوصية", icon: "ri-lock-line" },
  { to: "/terms", label: "شروط الاستخدام", icon: "ri-file-line" },
  { to: "/contact", label: "تواصل معنا", icon: "ri-mail-line" },
];

/** the friends standing along the top edge of the footer */
const CREW: { id: CharacterId; h: string }[] = [
  { id: "maha", h: "h-24 md:h-32" },
  { id: "zizo", h: "h-16 md:h-20" },
  { id: "jamool", h: "h-24 md:h-36" },
  { id: "thaloob", h: "h-20 md:h-28" },
  { id: "noor", h: "h-20 md:h-28" },
];

const STARS = Array.from({ length: 24 }, (_, i) => {
  const a = Math.sin(i * 33.1) * 43758.5453;
  const b = Math.sin(i * 71.7) * 12345.6789;
  return { x: (a - Math.floor(a)) * 100, y: (b - Math.floor(b)) * 100, r: 1 + ((i * 3) % 3) };
});

/**
 * The footer is the last bit of the night: the friends stand along its top edge, the worlds, the grown-ups' links
 * and the social accounts sit on the dark sky, and a small button takes you back up. Everything rises in as it is reached.
 */
export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.set("[data-crew]", { y: 70, opacity: 0, scale: 0.8, transformOrigin: "50% 100%" });
        gsap.set("[data-col]", { y: 30, opacity: 0 });
        gsap.set("[data-soc]", { scale: 0, rotation: -60 });
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap
              .timeline({ defaults: { ease: "power3.out" } })
              .to("[data-crew]", { y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.1, ease: "back.out(1.6)" }, 0)
              .to("[data-col]", { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 }, 0.3)
              .to("[data-soc]", { scale: 1, rotation: 0, duration: 0.6, stagger: 0.07, ease: "back.out(2.2)" }, 0.8);
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-star]").forEach((s, i) => {
          gsap.to(s, { opacity: 0.25, scale: 0.6, duration: 1.4 + (i % 4) * 0.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: (i % 7) * 0.2 });
        });
        gsap.utils.toArray<HTMLElement>("[data-bob]").forEach((b, i) => {
          gsap.to(b, { y: -5, duration: 2.2 + i * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 + i * 0.25 });
        });
        gsap.to("[data-moon]", { y: 10, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const up = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

  return (
    <footer ref={root} className="on-navy relative isolate mt-16 overflow-hidden bg-gradient-to-b from-[#1F2A5C] via-[#1B1A6B] to-[#14124F] text-background-100 md:mt-24">
      {/* the end of the night: stars, a moon, a far town, and the cream of the page curving away above */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {STARS.map((s, i) => (
          <span key={i} data-star className="absolute rounded-full bg-background-50" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: 0.7 }} />
        ))}
        <i data-moon className="ri-moon-fill absolute end-[7%] top-[11%] hidden text-5xl text-primary-200 drop-shadow-[0_0_24px_rgb(255_214_120/0.7)] md:block" />
        <svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[55%] w-full text-[#8E96FF]/[0.12]">
          <g fill="currentColor">
            <path d="M60 240V130h12v-14h12v14h12v-14h12v14h12V240z" />
            <path d="M200 240V150a40 40 0 0 1 80 0V240zM280 240V90h10V240zM276 90l9-28 9 28z" />
            <path d="M640 240V140a36 36 0 0 1 72 0V240z" />
            <path d="M980 240V150a44 44 0 0 1 88 0V240zM1068 240V100h10V240zM1064 100l9-28 9 28z" />
            <path d="M1290 240V130h12v-14h12v14h12v-14h12v14h12V240z" />
          </g>
        </svg>
      </div>
      <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-8 w-full text-background-50 md:h-14">
        <path d="M0 0H1440V28C1200 54 960 60 720 60S240 54 0 28z" fill="currentColor" />
      </svg>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-8 pt-32 md:px-6 md:pt-48">
        {/* the friends, standing on the edge */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-1 flex items-end justify-center gap-3 px-4 md:gap-10">
          {CREW.map((c) => (
            <span key={c.id} data-crew className="block">
              <span data-bob className="block">
                <Character name={c.id} size="md" small decorative className={`${c.h} !w-auto drop-shadow-[0_10px_12px_rgba(0,0,0,0.4)]`} />
              </span>
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div data-col className="md:col-span-4">
            <Logo className="h-24 md:h-28" />
            <p className="mt-5 max-w-sm text-base leading-relaxed text-background-200">
              عالمٌ صغير، خيالٌ كبير. منصة عربية للأطفال تجمع القصص والحروف وقصار السور والألعاب والرسم والقيم في مكان واحد آمن.
            </p>
            <div className="mt-6 flex items-center gap-4 rounded-3xl bg-background-100/[0.07] p-4 ring-1 ring-background-100/15 backdrop-blur-sm">
              <OwnerMark className="h-14 rounded-xl bg-background-50 p-1.5" />
              <p className="text-sm leading-relaxed text-background-200">
                مبادرة وطنية برعاية
                <span className="block font-heading font-semibold text-background-50">الجمعية الأهلية الصالحية بعنيزة</span>
              </p>
            </div>
          </div>

          <div data-col className="md:col-span-4">
            <p className="mb-4 font-heading text-lg font-bold text-primary-300">عوالم جمّول</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={c.to} className="group inline-flex items-center gap-2.5 text-sm font-medium text-background-200 transition-colors hover:text-background-50">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-white" style={{ background: tones[c.tone].hex }}>
                      <i className={c.icon} />
                    </span>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-col className="md:col-span-2">
            <p className="mb-4 font-heading text-lg font-bold text-primary-300">للأهل والمعلمين</p>
            <ul className="flex flex-col gap-2.5">
              {parentLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="inline-flex items-center gap-2 text-sm font-medium text-background-200 transition-colors hover:text-background-50">
                    <i className={`${l.icon} text-base text-primary-400`} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-col className="md:col-span-2">
            <p className="mb-4 font-heading text-lg font-bold text-primary-300">تابعنا</p>
            <ul className="grid grid-cols-3 gap-2.5 md:grid-cols-2">
              {socials.map((s) => {
                const external = s.href.startsWith("http");
                const icon = (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill={s.stroke ? "none" : "currentColor"} stroke={s.stroke ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fillRule="evenodd">
                    {s.paths.map((d, i) => (
                      <path key={i} d={d} />
                    ))}
                  </svg>
                );
                const cls = "group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-background-100/10 text-background-100 ring-1 ring-background-100/15 transition-[background-color,color,box-shadow] duration-300 hover:bg-[var(--tone)] hover:text-white hover:shadow-[0_0_24px_var(--tone)] md:w-full";
                return (
                  <li key={s.id} data-soc className="block">
                    {external ? (
                      <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className={cls} style={{ ["--tone" as string]: `${s.tone}${s.id === "x" ? "33" : ""}` }}>
                        {icon}
                      </a>
                    ) : (
                      <Link to={s.href} aria-label={s.label} className={cls} style={{ ["--tone" as string]: `${s.tone}${s.id === "x" ? "33" : ""}` }}>
                        {icon}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div data-col className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-background-100/10 pt-6 text-center sm:flex-row sm:text-start">
          <p className="text-xs text-background-300">© 2026 جمّول — مشروع الجمعية الأهلية الصالحية بعنيزة، المملكة العربية السعودية</p>
          <p className="flex items-center gap-1.5 text-xs text-background-300">
            <i className="ri-shield-check-fill text-base text-primary-400" />
            بلا إعلانات · بلا بيانات شخصية · التقدّم محفوظ على جهازك
          </p>
          <button type="button" onClick={up} aria-label="العودة إلى أعلى الصفحة" className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary-400 px-5 font-heading text-sm font-bold text-foreground-900 shadow-[0_4px_0_rgb(160_105_0/0.8)] transition-colors hover:bg-primary-300">
            <i className="ri-rocket-2-line text-lg" />
            إلى الأعلى
          </button>
        </div>
      </div>
    </footer>
  );
}
