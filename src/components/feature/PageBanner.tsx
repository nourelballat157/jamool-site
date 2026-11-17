import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";

/**
 * The calm sibling of ModuleHero, for the grown-up and text-first pages (parent, search, privacy, terms,
 * contact, profiles): the same night scene and cream ground, but no characters, no looping motion and no
 * parallax, only one soft entrance. Children render under the description (a search box, for instance).
 */
export default function PageBanner({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = "start",
  narrow = false,
  children,
}: {
  eyebrow: string;
  eyebrowIcon?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  narrow?: boolean;
  children?: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const center = align === "center";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.from("[data-in]", { y: 16, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} data-night-hero data-no-reveal className="on-navy relative isolate -mt-[4.75rem] w-full overflow-hidden text-background-100">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-[#252385] via-[#322F9E] to-[#3B3CB2]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_0%,rgb(130_120_255/0.4),transparent_58%),radial-gradient(ellipse_at_20%_100%,rgb(255_196_61/0.14),transparent_55%)]" />
      <i aria-hidden="true" className="ri-sparkling-2-fill absolute end-[10%] top-32 -z-10 text-2xl text-primary-300/70" />
      <i aria-hidden="true" className="ri-sparkling-2-fill absolute start-[8%] top-44 -z-10 text-lg text-primary-300/50" />

      <div className={`mx-auto w-full px-4 pb-20 pt-28 md:px-6 md:pb-24 md:pt-32 ${narrow ? "max-w-3xl" : "max-w-7xl"} ${center ? "text-center" : ""}`}>
        <span data-in className="inline-flex items-center gap-2 rounded-full bg-background-100/10 py-1.5 pe-4 ps-3 font-heading text-sm font-semibold text-primary-200 ring-1 ring-background-100/20 backdrop-blur-sm">
          {eyebrowIcon ? <i className={eyebrowIcon} /> : null}
          {eyebrow}
        </span>
        <h1 data-in className="mt-5 font-heading text-4xl font-bold leading-[1.25] text-background-50 md:text-5xl">
          {title}
        </h1>
        <svg aria-hidden="true" data-in viewBox="0 0 220 14" preserveAspectRatio="none" className={`mt-1 block h-3 w-40 text-primary-400 ${center ? "mx-auto" : ""}`}>
          <path d="M3 9C34 2 62 13 94 7s58-5 88 1 30 1 35-2" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
        {description ? (
          <p data-in className={`mt-5 max-w-2xl text-balance text-base leading-relaxed text-background-100/80 md:text-lg ${center ? "mx-auto" : ""}`}>
            {description}
          </p>
        ) : null}
        {children ? <div data-in className="mt-6">{children}</div> : null}
      </div>

      <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full text-background-50 md:h-16">
        <path d="M0 60V30C240 6 480 0 720 0s480 6 720 30V60z" fill="currentColor" />
      </svg>
    </section>
  );
}
