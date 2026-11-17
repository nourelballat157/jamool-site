import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navLinks } from "@/mocks/home";
import { categories, tones } from "@/data/brand";
import Logo from "@/components/brand/Logo";
import CategoryTile from "@/components/brand/CategoryTile";
import SoundToggle from "@/components/feature/SoundToggle";
import VoiceSearch from "@/components/feature/VoiceSearch";
import useProgress from "@/store/progress";
import { gsap } from "@/lib/gsap";

/** Anything can open the voice search (the hero's microphone does): dispatch this on window. */
export const OPEN_VOICE_EVENT = "jamool:voice";

type VoiceState = { open: boolean; listen: boolean; x: number; y: number };

/**
 * One header, two moods. Over a night hero it is part of the scene: transparent, light type, a gold call to
 * action. Once the page moves it settles into a clean sticky bar (cream glass, dark type) with a GSAP drop-in.
 * Pages without a night hero start in the clean mood. Quick access to the worlds, search (typing or speaking)
 * and the child's room stays in both.
 */
export default function Navbar() {
  const { child, data } = useProgress();
  const [stuck, setStuck] = useState(false);
  const [overHero, setOverHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [voice, setVoice] = useState<VoiceState>({ open: false, listen: false, x: 0, y: 0 });
  const location = useLocation();
  const navigate = useNavigate();

  const bg = useRef<HTMLSpanElement>(null);
  const navList = useRef<HTMLUListElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const first = useRef(true);

  const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* does this page open on a night hero? then the header starts as part of it */
  useLayoutEffect(() => {
    setOverHero(!!document.querySelector("[data-night-hero]"));
  }, [location.pathname]);

  /* sticky: with a little hysteresis so it never flickers at the threshold */
  useEffect(() => {
    let on = window.scrollY > 40;
    setStuck(on);
    const onScroll = () => {
      const y = window.scrollY;
      if (!on && y > 40) {
        on = true;
        setStuck(true);
      } else if (on && y < 12) {
        on = false;
        setStuck(false);
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  /* the glass bar drops in when the header becomes sticky and lifts away when it returns to the hero */
  const solid = stuck || !overHero;
  useEffect(() => {
    const el = bg.current;
    if (!el) return;
    if (first.current) {
      first.current = false;
      gsap.set(el, { opacity: solid ? 1 : 0, y: 0 });
      return;
    }
    if (calm()) {
      gsap.set(el, { opacity: solid ? 1 : 0, y: 0, scaleX: 1 });
      return;
    }
    if (solid) gsap.fromTo(el, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", overwrite: true });
    else gsap.to(el, { y: -6, opacity: 0, duration: 0.3, ease: "power2.in", overwrite: true });
  }, [solid]);

  /* the header arrives with the hero: brand, links, actions settle in one after another */
  useEffect(() => {
    if (calm() || !overHero || window.scrollY > 10) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-nv]", { y: -18, opacity: 0, duration: 0.65, stagger: 0.08, delay: 0.15, ease: "power3.out", clearProps: "transform,opacity" });
    }, bg.current?.closest("header") ?? undefined);
    return () => ctx.revert();
  }, [overHero, location.pathname]);

  /* the sliding marker behind the nav links: rests on the current page, follows hover and focus */
  const place = (target: Element | null) => {
    const el = pill.current;
    if (!el) return;
    if (!target) {
      gsap.to(el, { opacity: 0, duration: 0.25, overwrite: "auto" });
      return;
    }
    const a = target as HTMLElement;
    gsap.to(el, { x: a.offsetLeft + 14, width: a.offsetWidth - 28, opacity: 1, duration: calm() || !placed.current ? 0 : 0.4, ease: "power3.out", overwrite: "auto" });
    placed.current = true;
  };
  const rest = () => place(navList.current?.querySelector('[aria-current="page"]') ?? null);

  useLayoutEffect(() => {
    rest();
    window.addEventListener("resize", rest);
    document.fonts?.ready.then(rest).catch(() => undefined);
    return () => window.removeEventListener("resize", rest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.hash, stuck]);

  useEffect(() => {
    setMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const openVoice = useCallback((listen: boolean, from?: HTMLElement | null) => {
    const r = from?.getBoundingClientRect();
    setMenuOpen(false);
    setNotifOpen(false);
    setVoice({ open: true, listen, x: r ? r.left + r.width / 2 : window.innerWidth / 2, y: r ? r.top + r.height / 2 : 40 });
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<{ x?: number; y?: number; listen?: boolean }>).detail || {};
      setMenuOpen(false);
      setVoice({ open: true, listen: d.listen !== false, x: d.x ?? window.innerWidth / 2, y: d.y ?? 40 });
    };
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNotifOpen(false);
      } else if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        e.preventDefault();
        openVoice(false);
      }
    };
    window.addEventListener(OPEN_VOICE_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_VOICE_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [openVoice]);

  const isActive = (to: string) => {
    const hash = to.includes("#") ? `#${to.split("#")[1]}` : "";
    if (hash) return location.pathname === "/" && location.hash === hash;
    return location.pathname === to && !location.hash;
  };

  const runSearch = (q: string) => {
    setVoice((v) => ({ ...v, open: false }));
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  /* class sets for the two moods */
  const lite = overHero;
  const k = lite
    ? {
        link: "text-background-50/85 hover:text-white",
        linkOn: "text-white",
        navWrap: "",
        marker: "bg-primary-400",
        capsule: "[&_.btn-icon]:!text-white [&_.btn-icon:hover]:!bg-background-50/20",
        search: "bg-background-50/[0.12] text-background-50/90 ring-1 ring-background-50/25 hover:bg-background-50/20",
        points: "bg-background-50/[0.12] text-white ring-1 ring-background-50/25 hover:bg-background-50/20",
        star: "text-primary-300",
        login: "bg-primary-400 text-foreground-900 shadow-[0_4px_0_rgb(160_105_0/0.8)] hover:bg-primary-300",
        menu: "!bg-background-50/15 !text-white ring-1 ring-background-50/25",
        dot: "ring-[#1B1A6B]",
        rule: "bg-background-50/25",
      }
    : {
        link: "text-foreground-600 hover:text-foreground-900",
        linkOn: "text-foreground-900",
        navWrap: "",
        marker: "bg-primary-500",
        capsule: "[&_.btn-icon:hover]:!bg-background-100",
        search: "bg-background-100 text-foreground-500 ring-1 ring-foreground-900/10 hover:bg-white",
        points: "bg-primary-100 text-foreground-900 hover:bg-primary-200",
        star: "text-primary-600",
        login: "bg-foreground-900 text-background-100 hover:bg-foreground-700",
        menu: "!bg-foreground-900 !text-background-100 hover:!bg-foreground-800",
        dot: "ring-background-100",
        rule: "bg-foreground-900/10",
      };

  const barCls = overHero ? "bg-[#1B1A6B]/90 shadow-[0_14px_30px_-14px_rgb(8_6_60/0.7)]" : "bg-background-50/95 shadow-[0_10px_24px_-14px_rgb(31_42_92/0.35)]";
  const divider = overHero ? "bg-background-50/15" : "bg-foreground-900/10";
  const barH = stuck ? "h-[3.75rem] md:h-[4rem]" : "h-[4.75rem]";

  return (
    <header className="sticky top-0 z-50 h-[4.75rem] w-full">
      {/* the bar is the hero's own night: full width, flush with the hero; clear at the top, fades in when sticky */}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 transition-[height] duration-500 ease-out ${barH}`}>
        <span ref={bg} className={`absolute inset-0 opacity-0 backdrop-blur-xl ${barCls}`} />
        <span className={`absolute inset-x-0 bottom-0 h-px ${divider}`} />
        <span ref={bar} className={`absolute inset-x-0 top-0 h-[2px] origin-right scale-x-0 bg-gradient-to-l from-primary-400 to-secondary-400 transition-opacity duration-300 ${stuck ? "opacity-100" : "opacity-0"}`} />
      </div>

        <nav aria-label="التنقل الرئيسي" className={`relative mx-auto flex w-full max-w-7xl items-center gap-3 px-4 transition-[height] duration-500 ease-out md:px-6 ${barH}`}>
          {/* Brand */}
          <Link data-nv to="/" aria-label="جمّول — الرئيسية" className="relative -my-2 flex shrink-0 items-center cursor-pointer">
            <Logo className={`transition-all duration-500 ${stuck ? "h-11 md:h-12" : "h-14 md:h-16"}`} priority />
          </Link>

          {/* the worlds */}
          <ul data-nv ref={navList} onPointerLeave={rest} onBlur={rest} className={`relative mx-auto hidden h-full items-stretch gap-0.5 xl:flex ${k.navWrap}`}>
            <span ref={pill} aria-hidden="true" className={`pointer-events-none absolute bottom-0 left-0 h-[3px] rounded-full opacity-0 ${k.marker}`} />
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <li key={link.id} className="flex">
                  <Link
                    to={link.to}
                    aria-current={active ? "page" : undefined}
                    onPointerEnter={(e) => place(e.currentTarget)}
                    onFocus={(e) => place(e.currentTarget)}
                    className={`relative z-10 flex h-full items-center whitespace-nowrap px-3.5 font-heading text-sm font-semibold transition-colors duration-300 cursor-pointer ${active ? k.linkOn : k.link}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div data-nv className="ms-auto flex items-center gap-2 xl:ms-0">
            {/* search: a field you can type in, or speak to */}
            <div className={`hidden h-11 items-center rounded-full pe-1 ps-1 transition-colors duration-500 lg:flex ${k.search}`}>
              <button type="button" onClick={(e) => openVoice(false, e.currentTarget)} aria-label="البحث" className="flex h-9 items-center gap-2 rounded-full ps-3 pe-2 text-sm font-medium min-[1700px]:w-44">
                <i className="ri-search-line text-lg" />
                <span className="hidden min-[1700px]:inline">ابحث عن قصة…</span>
              </button>
              <button type="button" onClick={(e) => openVoice(true, e.currentTarget)} aria-label="ابحث بصوتك" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-primary-300 to-primary-500 text-lg text-foreground-900 shadow-[0_2px_0_rgb(160_105_0/0.8)] transition-transform hover:scale-105 active:scale-95">
                <i className="ri-mic-fill" />
              </button>
            </div>
            <button type="button" onClick={(e) => openVoice(true, e.currentTarget)} aria-label="ابحث بصوتك" className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors duration-500 sm:hidden lg:hidden ${k.search}`}>
              <i className="ri-mic-fill text-primary-500" />
            </button>
            <button type="button" onClick={(e) => openVoice(false, e.currentTarget)} aria-label="البحث" className={`hidden h-11 w-11 items-center justify-center rounded-full text-xl transition-colors duration-500 sm:flex lg:hidden ${k.search}`}>
              <i className="ri-search-line" />
            </button>

            <div className={`hidden items-center gap-0.5 xl:flex [&_.btn-icon]:!bg-transparent [&_.btn-icon]:!shadow-none [&_.btn-icon]:!ring-0 ${k.capsule}`}>
              <SoundToggle className="!h-9 !w-9" />
              <span aria-hidden="true" className={`mx-0.5 h-5 w-px ${k.rule}`} />
              <div className="relative">
                <button type="button" onClick={() => setNotifOpen((v) => !v)} aria-label="التنبيهات" aria-expanded={notifOpen} className="btn-icon relative !h-9 !w-9">
                  <i className="ri-notification-3-line text-xl" />
                  <span className={`absolute end-2 top-2 h-2.5 w-2.5 rounded-full bg-secondary-500 ring-2 ${k.dot}`} />
                </button>
                {notifOpen ? (
                  <div className="card absolute end-0 top-12 z-50 w-72 p-5 text-center text-foreground-900">
                    <span className="tile mx-auto mb-2 bg-sky-100 text-sky-600">
                      <i className="ri-notification-3-line" />
                    </span>
                    <p className="font-heading text-sm font-bold">لا توجد تنبيهات جديدة</p>
                    <p className="mt-1 text-xs text-foreground-500">ستصلك هنا أخبار المغامرات والمسابقات.</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* the child's points, always one tap from the room */}
            <Link to="/room" aria-label={`غرفتي — ${child.name}، ${data.points} نقطة`} className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-full pe-3.5 ps-1 font-heading text-sm font-semibold transition-colors duration-500 cursor-pointer ${k.points}`}>
              <img src={child.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-background-50" />
              <span className="hidden min-[1700px]:inline">{child.name}</span>
              <span className="flex items-center gap-1 text-sm">
                <i className={`ri-star-fill ${k.star}`} />
                {data.points.toLocaleString("ar-EG")}
              </span>
            </Link>

            <Link to="/login" aria-label="تسجيل الدخول" className={`hidden h-11 items-center gap-2 whitespace-nowrap rounded-full px-5 font-heading text-sm font-semibold transition-[background-color,color,transform] duration-300 active:translate-y-0.5 md:inline-flex xl:max-[1439px]:w-11 xl:max-[1439px]:justify-center xl:max-[1439px]:px-0 ${k.login}`}>
              <i className="ri-user-smile-line text-lg" />
              <span className="xl:max-[1439px]:hidden">تسجيل الدخول</span>
            </Link>

            <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label="القائمة" aria-expanded={menuOpen} className={`btn-icon xl:hidden ${k.menu}`}>
              <i className={menuOpen ? "ri-close-line text-2xl" : "ri-menu-line text-2xl"} />
            </button>
          </div>
        </nav>

      {/* Menu sheet: every world as a coloured tile */}
      {menuOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-[4.75rem] z-40 overflow-y-auto bg-background-50 xl:hidden">
          <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 md:px-6">
            <div className="flex gap-2">
              <button type="button" onClick={(e) => openVoice(false, e.currentTarget)} className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-full bg-background-100 px-5 text-start text-base text-foreground-500 ring-1 ring-foreground-900/10">
                <i className="ri-search-line text-xl" />
                ابحث عن قصة أو لعبة...
              </button>
              <button type="button" onClick={(e) => openVoice(true, e.currentTarget)} aria-label="ابحث بصوتك" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-primary-300 to-primary-500 text-2xl text-foreground-900 shadow-[0_3px_0_rgb(160_105_0/0.8)]">
                <i className="ri-mic-fill" />
              </button>
            </div>

            <p className="mb-3 mt-6 font-heading text-sm font-bold text-foreground-500">اختر عالمك</p>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={c.to} className={`flex h-full flex-col items-center gap-2 rounded-3xl p-3 text-center transition-transform active:scale-95 ${tones[c.tone].soft}`}>
                    <CategoryTile category={c.id} size="lg" />
                    <span className="font-heading text-[0.8rem] font-semibold leading-tight text-foreground-900">{c.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mb-3 mt-7 font-heading text-sm font-bold text-foreground-500">للتنقل السريع</p>
            <ul className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <Link to={link.to} className={`flex h-12 items-center rounded-2xl px-4 font-heading text-sm font-semibold ${isActive(link.to) ? "bg-foreground-900 text-background-100" : "bg-background-100 text-foreground-800"}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-background-100 px-4 py-2">
              <span className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground-700">
                <i className="ri-volume-up-line text-xl" />
                صوت الموقع
              </span>
              <SoundToggle />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link to="/parent" className="btn btn-ghost">
                <i className="ri-parent-line text-lg" />
                ركن الأهل
              </Link>
              <Link to="/login" className="btn btn-secondary">
                <i className="ri-user-smile-line text-lg" />
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <VoiceSearch open={voice.open} autoListen={voice.listen} origin={{ x: voice.x, y: voice.y }} onClose={() => setVoice((v) => ({ ...v, open: false }))} onSearch={runSearch} />
    </header>
  );
}
