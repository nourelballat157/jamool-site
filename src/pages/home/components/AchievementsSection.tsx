import { useRef } from "react";
import { Link } from "react-router-dom";
import useProgress from "@/store/progress";
import Medal from "@/components/brand/Medal";
import ProgressBar from "@/components/brand/ProgressBar";
import CategoryTile from "@/components/brand/CategoryTile";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import ChapterHeader from "@/pages/home/components/ChapterHeader";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";

/**
 * The child's "passport": a saffron focal card (avatar on an arch, level, progress)
 * beside a calm shelf of medals (latest earned first, the next ones waiting locked),
 * the day streak and one clear way into the child's room.
 */
export default function AchievementsSection() {
  const { child, data, level, streak, badges } = useProgress();
  const root = useRef<HTMLElement>(null);

  const earned = badges.filter((b) => b.earned).sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
  const preview = earned.slice(0, 4);
  const waiting = badges.filter((b) => !b.earned).slice(0, 4 - preview.length);
  const shelf = [...preview, ...waiting];
  const streakWord = streak > 2 && streak < 11 ? "أيام" : "يومًا";

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      /* the one ambient loop: a dashed ring slowly turns behind the saffron card */
      mm.add(MOTION_OK_QUERY, () => {
        gsap.to(el.querySelectorAll("[data-spin]"), { rotation: 360, duration: 48, repeat: -1, ease: "none" });
      });

      /* pointer devices: a medal gives a quick proud wiggle */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        el.querySelectorAll<HTMLElement>("[data-slot]").forEach((slot) => {
          const medal = slot.querySelector("[data-medal]");
          if (!medal) return;
          gsap.set(medal, { transformOrigin: "50% 100%" });
          const on = () =>
            gsap.to(medal, {
              keyframes: [
                { rotation: -8, y: -6, duration: 0.12 },
                { rotation: 6, y: -6, duration: 0.14 },
                { rotation: 0, y: 0, duration: 0.14 },
              ],
              ease: "power2.out",
              overwrite: "auto",
            });
          slot.addEventListener("pointerenter", on);
          cleanups.push(() => slot.removeEventListener("pointerenter", on));
        });
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [shelf.length], revertOnUpdate: true }
  );

  return (
    <section aria-label="إنجازاتي" ref={root} className="relative w-full overflow-hidden bg-background-50 pb-20 pt-14 md:pb-28 md:pt-20">
      <Deco kind="sparkle" data-pop className="bottom-28 start-[4%] hidden h-7 w-7 text-primary-400 md:block" />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader
          icon="ri-medal-line"
          tone="primary"
          title={`مغامراتك يا ${child.name}`}
          aside={
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-primary-100 px-4 py-2 font-heading text-base font-bold text-foreground-900 md:self-end">
              <i className="ri-star-fill text-primary-500" aria-hidden="true" />
              {data.points.toLocaleString("ar-EG")} نقطة
            </span>
          }
        />

        <div className="grid gap-5 md:gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* the focal: flat saffron, the child on a cream arch */}
          <div className="relative flex items-center gap-5 overflow-hidden rounded-[1.75rem] bg-primary-400 p-6 text-foreground-900 md:gap-7 md:p-9">
            <Deco kind="ring" data-spin className="-end-14 -top-14 h-56 w-56 text-foreground-900/20" />
            <Deco kind="sparkle" data-pop className="bottom-5 end-6 h-6 w-6 text-background-50" />

            <span className="relative block h-40 w-28 shrink-0 md:h-52 md:w-36">
              <span className="absolute inset-0 rounded-b-2xl rounded-t-[999px] bg-background-50 shadow-[0_6px_0_rgb(31_42_92/0.16)]" />
              <span className="absolute inset-x-0 top-5 flex flex-col items-center leading-none md:top-7">
                <span className="font-heading text-[0.7rem] font-semibold text-foreground-500 md:text-xs">المستوى</span>
                <span className="mt-1 font-heading text-3xl font-bold text-foreground-900 md:text-4xl">{level.level.toLocaleString("ar-EG")}</span>
              </span>
              <img
                src={child.avatar}
                alt={child.name}
                className={`absolute inset-x-2 bottom-2 aspect-square w-[calc(100%-1rem)] rounded-full border-4 bg-background-100 object-cover ${child.ring}`}
              />
            </span>

            <span className="relative min-w-0 flex-1">
              <span className="block font-heading text-2xl font-bold md:text-3xl">{level.name}</span>
              <ProgressBar value={level.pct} tone="primary" label="التقدم نحو المستوى التالي" className="mt-4" height="h-3.5" />
              <span className="mt-3 block text-sm font-medium text-foreground-800">
                {level.next !== null ? `باقٍ ${level.toNext.toLocaleString("ar-EG")} نقطة للمستوى التالي` : "وصلت لأعلى مستوى!"}
              </span>
            </span>
          </div>

          {/* the shelf: medals sit on a plank, the next ones wait locked */}
          <div className="card flex flex-col gap-6 p-6 md:p-9">
            <p className="text-xs font-medium text-foreground-500">آخر شاراتك</p>

            <ul className="grid grid-cols-4 gap-2 md:gap-6">
              {shelf.map((b) => (
                <li key={b.id} data-slot className="flex min-w-0 flex-col items-center">
                  <span className="relative flex w-full justify-center pb-3">
                    <span aria-hidden="true" className="absolute inset-x-[-0.25rem] bottom-0 h-2.5 rounded-full bg-background-300 md:inset-x-[-0.75rem]" />
                    <span data-medal className="block">
                      <Medal
                        id={b.id}
                        title={b.title}
                        earned={b.earned}
                        size="lg"
                        className="max-sm:!h-[3.75rem] max-sm:!w-[3.75rem] max-sm:!text-3xl"
                      />
                    </span>
                  </span>
                  <span aria-hidden="true" className={`mt-3 line-clamp-2 text-center text-xs font-medium leading-snug ${b.earned ? "text-foreground-700" : "text-foreground-500"}`}>
                    {b.title}
                  </span>
                </li>
              ))}
            </ul>
            {preview.length === 0 ? <p className="-mt-2 text-base text-foreground-600">أنهِ أول نشاط لتحصل على أول شارة!</p> : null}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-foreground-900/10 pt-5">
              <div className="flex items-center gap-3">
                <CategoryTile icon="ri-fire-fill" tone={streak > 0 ? "amber" : "primary"} size="md" className={streak > 0 ? "" : "opacity-50"} />
                <div>
                  <p className="font-heading text-base font-bold text-foreground-900">
                    {streak > 0 ? `${streak.toLocaleString("ar-EG")} ${streakWord} متتالية` : "ابدأ سلسلة أيامك"}
                  </p>
                  <p className="text-sm text-foreground-600">زُر عالمك كل يوم لشارة الأسبوع.</p>
                </div>
              </div>
              <Link to="/room" className="btn btn-primary">
                <i className="ri-home-smile-line text-lg" />
                غرفتي
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SectionBridge variant="dunes" className="text-violet-50" />
    </section>
  );
}
