import { useRef } from "react";
import { Link } from "react-router-dom";
import useActivityProgress, { clearActivity } from "@/hooks/useActivityProgress";
import CategoryTile from "@/components/brand/CategoryTile";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import Character from "@/components/brand/Character";
import ChapterHeader from "@/pages/home/components/ChapterHeader";
import { tones, type ToneId } from "@/data/brand";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";

/** Old activity entries carry a class string such as "bg-sky-100 text-sky-700": recover the tone from it. */
function toneFrom(cls?: string): ToneId {
  const m = cls?.match(/(?:bg|text)-([a-z]+)-\d/);
  const id = m?.[1] as ToneId | undefined;
  return id && id in tones ? id : "primary";
}

/**
 * "أكمل رحلتك": shown only when the child has an unfinished activity.
 * One big resume card (Jamool standing on a saffron arch, a dashed trail leading to play)
 * and, when there is more than one, a short list of the others beside it.
 */
export default function ContinueSection() {
  const { items } = useActivityProgress();
  const root = useRef<HTMLElement>(null);
  const leadKey = items[0]?.key ?? "";

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const lead = el.querySelector<HTMLElement>("[data-lead]");
      const mm = gsap.matchMedia();

      /* the one ambient loop: Jamool breathes on his arch */
      mm.add(MOTION_OK_QUERY, () => {
        gsap.to(el.querySelectorAll("[data-float]"), { y: -8, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });

      /* pointer devices: Jamool leans toward you, the play arrow nudges */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        if (!lead) return;
        const char = lead.querySelector("[data-tilt-char]");
        const play = lead.querySelector("[data-play]");
        gsap.set(char, { transformOrigin: "50% 100%" });
        const on = () => {
          gsap.to(char, { rotation: -4, scale: 1.04, duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
          gsap.to(play, { x: -5, duration: 0.3, ease: "power3.out", overwrite: "auto" });
        };
        const off = () => {
          gsap.to(char, { rotation: 0, scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
          gsap.to(play, { x: 0, duration: 0.3, ease: "power3.out", overwrite: "auto" });
        };
        lead.addEventListener("pointerenter", on);
        lead.addEventListener("pointerleave", off);
        lead.addEventListener("focus", on);
        lead.addEventListener("blur", off);
        return () => {
          lead.removeEventListener("pointerenter", on);
          lead.removeEventListener("pointerleave", off);
          lead.removeEventListener("focus", on);
          lead.removeEventListener("blur", off);
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [leadKey], revertOnUpdate: true }
  );

  if (items.length === 0) return null;

  const [lead, ...rest] = items.slice(0, 4);
  const leadTone = toneFrom(lead.tone);

  return (
    <section aria-label="أكمل رحلتك" ref={root} className="relative w-full overflow-hidden bg-background-50 pb-20 pt-14 md:pb-28 md:pt-20">
      <Deco kind="ring" data-pop className="-end-24 -top-24 hidden h-[22rem] w-[22rem] text-primary-300 md:block" />
      <Deco kind="sparkle" data-pop className="start-[6%] top-28 hidden h-7 w-7 text-primary-400 md:block" />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader
          icon="ri-history-line"
          tone="primary"
          title="أكمل رحلتك"
          line="جمّول مستنيك!"
          aside={
            <button type="button" onClick={clearActivity} className="btn btn-ghost btn-sm min-h-11 self-start md:self-end">
              <i className="ri-delete-bin-6-line" />
              مسح النشاط
            </button>
          }
        />

        <ul className={`grid gap-4 md:gap-5 ${rest.length > 0 ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" : ""}`}>
          <li>
            <Link
              to={lead.route}
              data-lead
              className="card-hover group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-background-100 shadow-card ring-1 ring-foreground-900/5 md:flex-row md:items-stretch"
            >
              {/* the stage: Jamool whole, standing on a saffron arch */}
              <span aria-hidden="true" className="relative flex h-64 w-full items-end justify-center md:order-last md:h-[22rem] md:w-80 md:shrink-0">
                <span className="absolute inset-x-10 bottom-0 top-8 rounded-t-[999px] bg-primary-400" />
                <span className="absolute inset-x-[3.75rem] bottom-0 top-14 rounded-t-[999px] border-2 border-dashed border-foreground-900/15" />
                <Deco kind="sparkle" data-pop className="end-8 top-6 h-6 w-6 text-primary-500 md:end-6" />
                <Deco kind="sparkle" data-pop className="bottom-24 start-7 h-4 w-4 text-primary-400 md:start-5" />
                <span className="absolute bottom-2 h-3 w-32 rounded-full bg-foreground-900/10" />
                <span data-float className="relative block pb-3">
                  <span data-tilt-char className="block">
                    <Character name="jamool" size="xl" decorative className="!h-52 md:!h-72" />
                  </span>
                </span>
              </span>

              <span className="flex flex-1 flex-col justify-center gap-4 p-6 md:p-10">
                <CategoryTile icon={lead.icon} tone={leadTone} size="lg" />
                <span className="min-w-0">
                  <span className="block font-heading text-2xl font-bold text-foreground-900 md:text-4xl">{lead.title}</span>
                  <span className="mt-2 block line-clamp-2 text-base leading-relaxed text-foreground-600 md:text-lg">{lead.subtitle}</span>
                </span>
                <span className="mt-1 flex items-center gap-3">
                  {/* a dashed trail from where you stopped to the play button */}
                  <span aria-hidden="true" className="flex flex-1 items-center gap-1.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500" />
                    <span className="h-0 flex-1 border-t-2 border-dashed border-foreground-900/20" />
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-foreground-900/25" />
                  </span>
                  <span data-play className="shrink-0">
                    <span className="btn btn-primary btn-lg">
                      <i className="ri-play-fill text-xl" aria-hidden="true" />
                      تابع
                    </span>
                  </span>
                </span>
              </span>
            </Link>
          </li>

          {rest.length > 0 ? (
            <li className="flex flex-col justify-center gap-3 lg:self-center">
              {rest.map((item) => (
                <Link key={item.key} to={item.route} className="card card-hover group flex min-h-[4.5rem] items-center gap-3 p-3 pe-4">
                  <CategoryTile icon={item.icon} tone={toneFrom(item.tone)} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-heading text-base font-bold text-foreground-900">{item.title}</span>
                    <span className="block truncate text-xs font-medium text-foreground-500">{item.subtitle}</span>
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xl text-foreground-900 transition-transform duration-200 group-hover:-translate-y-0.5">
                    <i className="ri-play-fill" aria-hidden="true" />
                    <span className="sr-only">تابع</span>
                  </span>
                </Link>
              ))}
            </li>
          ) : null}
        </ul>
      </div>

      <SectionBridge variant="dunes" className="text-background-100" />
    </section>
  );
}
