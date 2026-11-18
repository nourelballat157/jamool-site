import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import { OPEN_VOICE_EVENT } from "@/components/feature/Navbar";

/** pages that are already a full-screen activity, or have their own bottom controls: the helper stays out of the way */
const QUIET = [/^\/$/, /^\/story\//, /^\/competitions\/quiz/, /^\/values\/journey/, /^\/child-select/, /^\/learning\/letter/];

const HINTS: [RegExp, string][] = [
  [/^\/stories/, "ابحث عن حكايتك بصوتك!"],
  [/^\/learning/, "قل اسم حرف وأنا أجده لك!"],
  [/^\/quran/, "اطلب سورتك وأنا أفتحها!"],
  [/^\/games|^\/competitions/, "أي لعبة تحب؟ قلها لي!"],
  [/^\/drawing/, "قل «رسم» وأفتح لك الألوان!"],
];

/**
 * A small Jamool that stays on every inner page. Press him and he opens the voice search, so a child who cannot
 * read the menu can still ask for what they want. He waves a little after a few seconds, says one line once per
 * page, and steps aside when the footer arrives.
 */
export default function JamoolHelper() {
  const { pathname } = useLocation();
  const quiet = QUIET.some((q) => q.test(pathname));
  const root = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState(false);
  const [gone, setGone] = useState(false);
  const hint = HINTS.find(([q]) => q.test(pathname))?.[1] ?? "تبحث عن شيء؟ اضغط وقل لي!";

  // one line per page, a few seconds after arriving
  useEffect(() => {
    setTip(false);
    if (quiet) return;
    const show = window.setTimeout(() => setTip(true), 5000);
    const hide = window.setTimeout(() => setTip(false), 13000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [pathname, quiet]);

  // step aside near the footer
  useEffect(() => {
    if (quiet) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const el = document.documentElement;
      setGone(window.scrollY + window.innerHeight > el.scrollHeight - 420);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname, quiet]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || quiet) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK_QUERY, () => {
        gsap.fromTo(el, { y: 90, scale: 0.4, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.8)", delay: 1.2 });
        gsap.to("[data-helper-bob]", { y: -6, duration: 1.9, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.2 });
        gsap.to("[data-helper-ring]", { scale: 1.35, opacity: 0, duration: 2.2, repeat: -1, ease: "power1.out", delay: 2.2 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [pathname, quiet] }
  );

  if (quiet) return null;

  const open = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip(false);
    window.dispatchEvent(new CustomEvent(OPEN_VOICE_EVENT, { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, listen: true } }));
  };

  return (
    <div ref={root} className="pointer-events-none fixed bottom-4 start-4 z-40 md:bottom-6 md:start-6">
     <div className={`flex flex-col items-start gap-2 transition-[opacity,transform] duration-500 ${gone ? "translate-y-6 opacity-0 [&_button]:!pointer-events-none" : ""}`}>
      <div role="status" aria-live="polite" className={`pointer-events-none relative max-w-[13rem] rounded-2xl rounded-es-sm bg-background-50 px-4 py-2.5 text-sm font-semibold leading-snug text-foreground-900 shadow-[0_10px_24px_rgb(10_8_60/0.35)] ring-1 ring-foreground-900/10 transition-[opacity,transform] duration-500 ${tip && !gone ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
        {hint}
      </div>
      <button type="button" onClick={open} aria-label="اسأل جمّول: ابحث بصوتك" className="pointer-events-auto relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full md:h-[4.5rem] md:w-[4.5rem]">
        <span data-helper-ring aria-hidden="true" className="absolute inset-0 rounded-full bg-primary-300/60" />
        <span data-helper-bob className="relative block h-full w-full">
          <img src="/brand/avatar-jamool.webp" alt="" width={72} height={72} draggable={false} className="h-full w-full rounded-full bg-amber-100 object-cover ring-4 ring-primary-300 shadow-[0_10px_22px_rgb(10_8_60/0.45)]" />
          <span className="absolute -bottom-1 -end-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-400 text-base text-foreground-900 shadow-[0_2px_0_rgb(160_105_0/0.8)] ring-2 ring-background-50">
            <i className="ri-mic-fill" />
          </span>
        </span>
      </button>
     </div>
    </div>
  );
}
