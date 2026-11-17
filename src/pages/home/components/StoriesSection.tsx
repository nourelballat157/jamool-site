import { useRef } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { stories } from "@/mocks/home";
import useFavorites from "@/pages/story/favorites";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";
import ChapterHeader from "./ChapterHeader";

type StoriesSectionProps = {
  onRequireLogin?: () => void;
};

/** the arch silhouette of every cover: a door on top, a soft base */
const ARCH = "rounded-t-[999px] rounded-b-3xl";

/**
 * Stories: a wooden shelf of tall arch-topped book covers. The first book is the featured one (larger),
 * Jamool stands beside the shelf looking at the books. On hover a cover turns on its spine like a page.
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

      /* the one ambient loop: Jamool breathes up and down */
      mm.add(MOTION_OK_QUERY, () => {
        gsap.to(el.querySelector("[data-float]"), { y: -9, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true });
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
    <section ref={root} id="stories" className="relative w-full overflow-hidden bg-violet-50 pb-20 pt-16 md:pb-28 md:pt-24">
      <Deco kind="diamond" className="end-8 top-8 hidden h-10 w-10 text-violet-300 md:block" />

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader
          category="stories"
          title="قصص تأخذك في رحلة"
          line="اختر حكاية وانطلق مع جمّول."
          aside={
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => scroll(-1)} aria-label="السابق" className="btn-icon">
                <i className="ri-arrow-right-line text-xl" />
              </button>
              <button type="button" onClick={() => scroll(1)} aria-label="التالي" className="btn-icon">
                <i className="ri-arrow-left-line text-xl" />
              </button>
            </div>
          }
        />

        <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-end lg:gap-6">
          {/* Jamool, standing on a violet disc, looking at the shelf */}
          <div data-friend className="relative h-[12rem] w-[12rem] shrink-0 md:h-[17rem] md:w-[17rem]">
            <Deco kind="ring" className="-inset-6 hidden h-[calc(100%+3rem)] w-[calc(100%+3rem)] text-violet-300 md:block" />
            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-violet-200" />
            <Deco kind="sparkle" data-pop className="-top-1 end-1 h-7 w-7 text-primary-500 md:h-9 md:w-9" />
            <div data-float className="absolute inset-x-0 bottom-0 flex justify-center">
              <div data-tilt-friend className="origin-bottom">
                <Character name="jamool" size="xl" flip decorative className="!h-[14.5rem] md:!h-[21rem]" />
              </div>
            </div>
          </div>

          {/* the shelf */}
          <div className="relative w-full min-w-0 flex-1">
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-4 rounded-full bg-violet-200" />
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
                    className={`shrink-0 snap-start ${featured ? "w-[15.5rem] sm:w-[18rem] md:w-[21rem]" : "w-[11.5rem] sm:w-[12.5rem] md:w-[14rem]"}`}
                  >
                    <article data-book className="relative">
                      <div data-card className="relative">
                        <span data-pages aria-hidden="true" className={`absolute inset-0 bg-background-50 shadow-card ${ARCH}`} />
                        <div
                          data-cover
                          className={`group relative flex flex-col overflow-hidden bg-violet-700 shadow-card ${ARCH} ${featured ? "aspect-[7/10]" : "aspect-[2/3]"}`}
                        >
                          <div className="relative min-h-0 flex-1 bg-violet-200">
                            <img src={story.image} alt={story.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
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

                          <div className="shrink-0 px-4 pb-4 pt-3 text-center">
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
