import { useRef } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { stories } from "@/mocks/home";
import useFavorites from "@/pages/story/favorites";
import Character from "@/components/brand/Character";
import SectionBridge from "@/components/brand/SectionBridge";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

type StoriesSectionProps = {
  onRequireLogin?: () => void;
};

/** the arch silhouette of every cover: a door on top, a soft base */
const ARCH = "rounded-t-[999px] rounded-b-3xl";

const STARS = Array.from({ length: 30 }, (_, i) => {
  const a = Math.sin(i * 17.3) * 43758.5453;
  const b = Math.sin(i * 51.9) * 12345.6789;
  return { x: (a - Math.floor(a)) * 100, y: (b - Math.floor(b)) * 70, r: 1 + ((i * 7) % 3) };
});

/**
 * Stories: the library by night. A violet sky with a moon, two swaying lanterns and a lit wooden shelf of tall
 * arch-topped book covers. The books tip up off the shelf as the section arrives; on hover a cover turns on its
 * spine like a page. The first book is the featured one (larger); Jamool stands beside the shelf reading.
 */
export default function StoriesSection(_props: StoriesSectionProps) {
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLUListElement>(null);
  const { isFav, toggle } = useFavorites();

  /* RTL: the first book sits on the right, so "next" scrolls towards negative scrollLeft */
  const scroll = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: -dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const onFav = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    toggle(id);
    if (typeof window !== "undefined" && window.matchMedia(MOTION_OK_QUERY).matches) {
      const glyph = e.currentTarget.querySelector("i");
      if (glyph) gsap.fromTo(glyph, { scale: 1.7 }, { scale: 1, duration: 0.4, ease: "back.out(3)", overwrite: true });
    }
  };

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* the books tip up off the shelf, one after another, as the shelf is reached */
        const books = gsap.utils.toArray<HTMLElement>("[data-shelf-item]");
        gsap.set(books, { opacity: 0, y: 80, rotationX: 62, transformPerspective: 900, transformOrigin: "50% 100%" });
        ScrollTrigger.batch(books, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, rotationX: 0, duration: 1, stagger: 0.14, ease: "back.out(1.3)", overwrite: true, clearProps: "transform,opacity" }),
        });
        gsap.from("[data-friend]", { x: -60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "[data-friend]", start: "top 90%", once: true } });
        gsap.from("[data-glow-shelf]", { opacity: 0, scaleX: 0.5, duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: "[data-glow-shelf]", start: "top 95%", once: true } });

        /* ambient: Jamool breathes, the lanterns sway and their flames flicker, the stars twinkle */
        gsap.to("[data-float]", { y: -9, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true });
        gsap.utils.toArray<HTMLElement>("[data-lantern]").forEach((l, i) => {
          gsap.set(l, { transformOrigin: "50% 0%" });
          gsap.to(l, { rotation: i % 2 ? 5 : -5, duration: 2.4 + i * 0.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
          gsap.to(l.querySelector("[data-flame]"), { opacity: 0.55, scale: 0.9, duration: 0.7 + i * 0.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
        });
        gsap.utils.toArray<HTMLElement>("[data-star]").forEach((s, i) => {
          gsap.to(s, { opacity: 0.25, scale: 0.6, duration: 1.4 + (i % 4) * 0.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: (i % 7) * 0.2 });
        });
        gsap.to("[data-moon]", { y: 12, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to("[data-sky]", { yPercent: 12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      });

      /* hover devices: the cover turns like a page, the book lifts, Jamool tilts */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];

        el.querySelectorAll<HTMLElement>("[data-book]").forEach((book) => {
          const card = book.querySelector("[data-card]");
          const cover = book.querySelector("[data-cover]");
          const pages = book.querySelector("[data-pages]");
          gsap.set(cover, { transformPerspective: 900, transformOrigin: "100% 50%" });
          const turn = gsap
            .timeline({ paused: true, defaults: { duration: 0.4, ease: "power3.out" } })
            .to(card, { y: -10 }, 0)
            .to(cover, { rotationY: 14 }, 0)
            .to(pages, { x: -7 }, 0);
          const on = () => turn.play();
          const off = () => turn.reverse();
          book.addEventListener("pointerenter", on);
          book.addEventListener("pointerleave", off);
          book.addEventListener("focusin", on);
          book.addEventListener("focusout", off);
          cleanups.push(() => {
            book.removeEventListener("pointerenter", on);
            book.removeEventListener("pointerleave", off);
            book.removeEventListener("focusin", on);
            book.removeEventListener("focusout", off);
          });
        });

        const friend = el.querySelector<HTMLElement>("[data-friend]");
        const tilt = el.querySelector("[data-tilt-friend]");
        if (friend && tilt) {
          const on = () => gsap.to(tilt, { rotation: -5, duration: 0.4, ease: "back.out(2)" });
          const off = () => gsap.to(tilt, { rotation: 0, duration: 0.4, ease: "power3.out" });
          friend.addEventListener("pointerenter", on);
          friend.addEventListener("pointerleave", off);
          cleanups.push(() => {
            friend.removeEventListener("pointerenter", on);
            friend.removeEventListener("pointerleave", off);
          });
        }
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="stories" data-no-reveal className="on-navy relative isolate w-full overflow-hidden bg-[linear-gradient(180deg,#24187A_0%,#33269A_55%,#4333B2_100%)] pb-24 pt-24 text-background-100 md:pb-32 md:pt-32">
      {/* the night sky, a moon, two lanterns */}
      <div data-sky aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {STARS.map((s, i) => (
          <span key={i} data-star className="absolute rounded-full bg-background-50" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: 0.7 }} />
        ))}
        <i data-moon className="ri-moon-fill absolute start-[8%] top-[12%] hidden text-6xl text-primary-200 drop-shadow-[0_0_28px_rgb(255_214_120/0.8)] md:block" />
      </div>
      <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-10 w-full text-background-50 md:h-16">
        <path d="M0 0H1440V28C1200 54 960 60 720 60S240 54 0 28z" fill="currentColor" />
      </svg>
      {[18, 74].map((x, i) => (
        <div key={x} data-lantern aria-hidden="true" className="pointer-events-none absolute top-8 hidden md:block md:top-14" style={{ left: `${x}%` }}>
          <span className="mx-auto block h-12 w-px bg-primary-200/60" />
          <span className="relative block h-12 w-9 rounded-b-2xl rounded-t-lg border-2 border-primary-300/80 bg-primary-300/20">
            <span data-flame className="absolute inset-1.5 rounded-b-xl rounded-t-md bg-gradient-to-t from-primary-300 to-primary-100 shadow-[0_0_30px_10px_rgb(255_196_61/0.5)]" style={{ opacity: i ? 0.9 : 1 }} />
          </span>
        </div>
      ))}

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader
          variant="bubble"
          onDark
          category="stories"
          title="قصص تأخذك في رحلة"
          line="اختر حكاية وانطلق مع جمّول."
          aside={
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => scroll(-1)} aria-label="السابق" className="btn-icon !bg-background-50/15 !text-background-50 ring-1 ring-background-50/25 hover:!bg-background-50/25">
                <i className="ri-arrow-right-line text-xl" />
              </button>
              <button type="button" onClick={() => scroll(1)} aria-label="التالي" className="btn-icon !bg-background-50/15 !text-background-50 ring-1 ring-background-50/25 hover:!bg-background-50/25">
                <i className="ri-arrow-left-line text-xl" />
              </button>
            </div>
          }
        />

        <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-end lg:gap-6">
          {/* Jamool, standing in the glow of the shelf, looking at the books */}
          <div data-friend className="relative h-[12rem] w-[12rem] shrink-0 md:h-[17rem] md:w-[17rem]">
            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(255_196_61/0.4),rgb(154_123_234/0.35)_55%,transparent_72%)] blur-md" />
            <span aria-hidden="true" className="absolute inset-3 rounded-full ring-1 ring-background-50/20" />
            <i aria-hidden="true" className="ri-sparkling-2-fill absolute -top-1 end-1 text-3xl text-primary-300 md:text-4xl" />
            <div data-float className="absolute inset-x-0 bottom-0 flex justify-center">
              <div data-tilt-friend className="origin-bottom">
                <Character name="jamool" size="xl" flip decorative className="!h-[14.5rem] drop-shadow-[0_14px_16px_rgba(10,8,70,0.5)] md:!h-[21rem]" />
              </div>
            </div>
          </div>

          {/* the lit shelf */}
          <div className="relative w-full min-w-0 flex-1">
            <span data-glow-shelf aria-hidden="true" className="absolute inset-x-[4%] -bottom-2 h-10 rounded-[50%] bg-primary-300/40 blur-2xl" />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-4 rounded-full bg-gradient-to-b from-[#B87A44] to-[#6B3F1E] shadow-[0_10px_20px_-6px_rgb(0_0_30/0.6)]" />
            <ul
              ref={scroller}
              aria-label="القصص"
              className="no-scrollbar relative z-10 flex snap-x snap-mandatory items-end gap-4 overflow-x-auto scroll-px-3 px-3 pb-4 pt-10 md:gap-7"
            >
              {stories.map((story, index) => {
                const fav = isFav(story.id);
                const featured = index === 0;
                return (
                  <li
                    key={story.id}
                    data-shelf-item
                    className={`shrink-0 snap-start ${featured ? "w-[15.5rem] sm:w-[18rem] md:w-[21rem]" : "w-[11.5rem] sm:w-[12.5rem] md:w-[14rem]"}`}
                  >
                    <article data-book className="relative">
                      <div data-card className="relative">
                        <span data-pages aria-hidden="true" className={`absolute inset-0 bg-background-50 shadow-card ${ARCH}`} />
                        <div
                          data-cover
                          className={`group relative flex flex-col overflow-hidden bg-violet-700 shadow-[0_22px_40px_-18px_rgb(0_0_30/0.8)] ring-1 ring-background-50/20 ${ARCH} ${featured ? "aspect-[7/10]" : "aspect-[2/3]"}`}
                        >
                          <div className="relative min-h-0 flex-1 bg-violet-200">
                            <img src={story.image} alt={story.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent" />
                            <button
                              type="button"
                              onClick={(e) => onFav(e, story.id)}
                              aria-label={fav ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
                              aria-pressed={fav}
                              className={`absolute bottom-3 start-3 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-background-50 text-xl shadow-card transition-colors duration-200 ${
                                fav ? "text-secondary-600" : "text-foreground-600 hover:text-secondary-600"
                              }`}
                            >
                              <i className={`inline-block ${fav ? "ri-heart-fill" : "ri-heart-line"}`} />
                            </button>
                          </div>

                          <div className="shrink-0 bg-gradient-to-b from-violet-700 to-[#2A1B78] px-4 pb-4 pt-3 text-center">
                            <span className="inline-flex rounded-full bg-violet-100 px-3 py-0.5 text-xs font-medium text-violet-800">{story.tag}</span>
                            <h3 className={`mt-1.5 font-heading font-bold text-background-50 ${featured ? "text-xl md:text-2xl" : "text-base md:text-lg"}`}>
                              {story.title}
                            </h3>
                            <p className={featured ? "mt-0.5 hidden text-sm text-background-200 md:block" : "sr-only"}>{story.subtitle}</p>
                            {featured ? (
                              <span className="btn btn-primary btn-sm mt-3">
                                <i className="ri-book-open-line" />
                                اقرأ القصة
                              </span>
                            ) : (
                              <span className="mt-1.5 inline-flex items-center gap-1 font-heading text-sm font-bold text-primary-300">
                                اقرأ القصة
                                <i className="ri-arrow-left-line" />
                              </span>
                            )}
                          </div>

                          {/* the whole cover opens the story (the heart sits above it) */}
                          <Link to={`/stories/${story.id}`} aria-label={`اقرأ القصة: ${story.title}`} className={`absolute inset-0 z-10 ${ARCH}`} />
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <SectionBridge variant="scallop" className="text-background-50" />
    </section>
  );
}
