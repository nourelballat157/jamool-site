import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import useProgress from "@/store/progress";
import Medal from "@/components/brand/Medal";
import Character from "@/components/brand/Character";
import Deco from "@/components/brand/Deco";
import SectionBridge from "@/components/brand/SectionBridge";
import ChapterHeader from "@/pages/home/components/ChapterHeader";
import RoomDoor from "@/pages/home/components/RoomDoor";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK_QUERY } from "@/lib/gsap";

/* a plastered wall: warm light falling in from the window, a fine tone-on-tone dot print instead of stripes, a soft vignette */
const WALL = [
  "radial-gradient(90% 75% at 82% 4%, rgb(255 246 222 / .85) 0%, rgb(255 246 222 / 0) 62%)",
  "radial-gradient(rgb(176 112 84 / .11) 1.1px, transparent 1.7px) 0 0 / 20px 20px",
  "linear-gradient(180deg, #FDEFE3 0%, #F9E1D2 100%)",
].join(", ");
/* wooden floorboards: alternating plank tones, fine seams, a sheen near the skirting */
const FLOOR = [
  "linear-gradient(180deg, rgb(255 255 255 / .2) 0%, rgb(255 255 255 / 0) 38%)",
  "repeating-linear-gradient(90deg, rgb(70 34 8 / .2) 0 1.5px, transparent 1.5px 72px)",
  "repeating-linear-gradient(90deg, rgb(255 236 200 / .07) 0 72px, transparent 72px 144px)",
  "linear-gradient(180deg, #D9A064 0%, #B97A45 100%)",
].join(", ");
/* wall panelling under the chair rail: panel seams every so often */
const PANELS = "repeating-linear-gradient(90deg, rgb(140 84 52 / .16) 0 2px, transparent 2px 132px), linear-gradient(180deg, #FFF7EE 0%, #FBEBDD 100%)";
/* curtain folds */
const FOLDS = "repeating-linear-gradient(90deg, rgb(120 20 50 / .16) 0 2px, rgb(255 255 255 / .08) 2px 5px, transparent 5px 9px)";
const STAR_SPOTS = [
  [12, 70], [38, 78], [62, 72], [24, 52], [52, 56], [76, 60], [34, 34], [66, 38],
] as const;
const WIN_STARS = [[18, 22], [62, 14], [78, 40], [32, 52], [50, 30], [14, 62]] as const;

/** a tag that names what the object opens; the whole object is a link into that part of the room */
function Obj({ to, label, onEnter, className = "", children }: { to: string; label: string; onEnter: (e: MouseEvent<HTMLElement>, to: string) => void; className?: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      data-obj
      onClick={(e) => onEnter(e, to)}
      aria-label={label}
      className={`group relative block rounded-2xl outline-offset-4 transition-shadow duration-300 hover:shadow-[0_0_0_4px_rgb(255_196_61/0.95)] focus-visible:shadow-[0_0_0_4px_rgb(255_196_61/0.95)] ${className}`}
    >
      {children}
      <span aria-hidden="true" className="absolute inset-x-0 -bottom-3.5 z-10 mx-auto flex w-max items-center gap-1 rounded-full bg-foreground-900 px-3 py-1 font-heading text-xs font-bold text-background-50 shadow-[0_6px_12px_-4px_rgb(0_0_30/0.5)] transition-colors group-hover:bg-primary-400 group-hover:text-foreground-900 md:text-sm">
        {label}
        <i className="ri-arrow-left-s-line" />
      </span>
    </Link>
  );
}

/**
 * "غرفتي": the child's room, cut open like a doll's house. A window onto the night, a calendar with the week's days,
 * a shelf of medals, framed drawings, a jar of stars, and the child standing on a rug with Jamool. Every object is
 * real (the numbers, the medals and the pictures are the child's own) and opens that part of the room page;
 * pressing anywhere else walks into the room: the scene zooms toward the thing that was pressed.
 */
export default function AchievementsSection() {
  const { child, data, level, streak, badges, week } = useProgress();
  const navigate = useNavigate();
  const root = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLDivElement>(null);
  const going = useRef(false);
  const [door, setDoor] = useState<string | null>(null);

  const earned = badges.filter((b) => b.earned).sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
  const preview = earned.slice(0, 4);
  const waiting = badges.filter((b) => !b.earned).slice(0, 4 - preview.length);
  const shelf = [...preview, ...waiting];
  const frames = [data.creations[0] ?? null, data.creations[1] ?? null];
  const starCount = Math.min(STAR_SPOTS.length, Math.max(1, Math.round(data.points / 12)));
  const streakWord = streak > 2 && streak < 11 ? "أيام" : "يومًا";
  const R = 46;
  const C = 2 * Math.PI * R;

  /* walk into the room: a door appears, swings open onto warm light, and the room page opens */
  const enter = (e: MouseEvent<HTMLElement>, to: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (going.current) return;
    going.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      navigate(to);
      return;
    }
    setDoor(to);
  };
  const enterBg = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("a")) return;
    enter(e, "/room");
  };

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        /* the room fills in as it is reached: the objects drop onto their places, the friends step in */
        gsap.set("[data-obj], [data-stand]", { opacity: 0, y: 36, scale: 0.92 });
        gsap.set("[data-win]", { opacity: 0, y: 24 });

        /* the curtains start drawn across the window and are pulled open when the room is reached */
        const curtains = gsap.utils.toArray<HTMLElement>("[data-drape]", el);
        curtains.forEach((c) => {
          const parent = c.parentElement?.getBoundingClientRect();
          const box = c.getBoundingClientRect();
          const atRight = parent ? box.left + box.width / 2 > parent.left + parent.width / 2 : false;
          gsap.set(c, { transformOrigin: atRight ? "100% 0%" : "0% 0%", scaleX: 2.6 });
        });
        ScrollTrigger.create({
          trigger: scene.current,
          start: "top 75%",
          once: true,
          onEnter: () => {
            gsap.to("[data-win]", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
            gsap.to(curtains, { scaleX: 1, duration: 1.7, ease: "power3.inOut", delay: 0.9, stagger: 0.06 });
            /* once open, a faint breeze moves them */
            curtains.forEach((c, i) => gsap.to(c, { skewX: i % 2 ? 1.8 : -1.8, duration: 3.4 + i * 0.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 3.2 }));
            gsap.to("[data-obj]", { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: "back.out(1.6)", delay: 0.1 });
            gsap.to("[data-stand]", { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.14, ease: "back.out(1.5)", delay: 0.5 });
          },
        });

        /* ambient: the window's stars twinkle, the moon drifts, Jamool breathes, the flame flickers, the jar's stars glint */
        gsap.utils.toArray<HTMLElement>("[data-wstar]").forEach((s, i) => {
          gsap.to(s, { opacity: 0.25, scale: 0.6, duration: 1.3 + (i % 3) * 0.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.2 });
        });
        gsap.to("[data-wmoon]", { y: 6, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to("[data-bob]", { y: -7, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to("[data-flame]", { scale: 1.12, opacity: 0.85, transformOrigin: "50% 100%", duration: 0.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.utils.toArray<HTMLElement>("[data-jstar]").forEach((s, i) => {
          gsap.to(s, { scale: 1.25, rotation: i % 2 ? 14 : -14, duration: 1.4 + (i % 4) * 0.35, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.18 });
        });
        gsap.to("[data-ring-arc]", { strokeDashoffset: C * (1 - level.pct / 100), duration: 1.4, ease: "power2.out", delay: 0.9 });
      });

      /* pointer devices: a medal gives a quick proud wiggle when the pointer reaches it */
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: (() => void)[] = [];
        el.querySelectorAll<HTMLElement>("[data-medal]").forEach((medal) => {
          gsap.set(medal, { transformOrigin: "50% 100%" });
          const on = () => gsap.to(medal, { keyframes: [{ rotation: -10, y: -5, duration: 0.12 }, { rotation: 8, y: -5, duration: 0.14 }, { rotation: 0, y: 0, duration: 0.14 }], ease: "power2.out", overwrite: "auto" });
          medal.addEventListener("pointerenter", on);
          cleanups.push(() => medal.removeEventListener("pointerenter", on));
        });
        return () => cleanups.forEach((c) => c());
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [shelf.length, level.pct], revertOnUpdate: true }
  );

  return (
    <section aria-label="غرفتي" ref={root} className="relative w-full overflow-hidden bg-background-50 pb-24 pt-14 md:pb-32 md:pt-20">
      <Deco kind="sparkle" data-pop className="bottom-28 start-[4%] hidden h-7 w-7 text-primary-400 md:block" />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
        <ChapterHeader
          icon="ri-home-smile-line"
          tone="primary"
          title={`غرفتك يا ${child.name}`}
          line="كل نجومك وشاراتك ورسماتك في مكان واحد. اضغط على أي شيء وادخل."
          aside={
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-primary-100 px-4 py-2 font-heading text-base font-bold text-foreground-900 md:self-end">
              <i className="ri-star-fill text-primary-500" aria-hidden="true" />
              {data.points.toLocaleString("ar-EG")} نقطة
            </span>
          }
        />

        <div ref={scene} onClick={enterBg} className="relative isolate cursor-pointer overflow-hidden rounded-[2rem] shadow-[0_34px_60px_-34px_rgb(90_40_20/0.6)] ring-1 ring-foreground-900/10 md:rounded-[2.5rem]">
          <div ref={inner} className="relative will-change-transform">
            <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: WALL }} />
            {/* crown moulding along the top of the wall */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-3.5 border-b border-[#E7C8B2] bg-gradient-to-b from-white to-[#FBEADB] shadow-[0_8px_14px_-6px_rgb(120_70_40/0.35)] md:h-4" />
            {/* soft corner shading so the room feels deep */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 shadow-[inset_0_0_90px_rgb(120_64_34/0.2)]" />

            {/* the wall */}
            <div className="grid grid-cols-2 items-stretch gap-x-3 gap-y-7 px-4 pt-6 md:grid-cols-12 md:gap-x-6 md:px-9 md:pt-9">
              {/* the window onto the night (a view, not a button) */}
              <div data-win aria-hidden="true" className="relative col-span-1 min-h-[9.5rem] md:col-span-3 md:min-h-[13rem]">
                <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-xl border-[6px] border-white bg-gradient-to-b from-[#1F2A5C] via-[#2E2CA2] to-[#5B4BC4] shadow-[0_14px_24px_-12px_rgb(60_30_20/0.5)]">
                  {WIN_STARS.map(([x, y], i) => (
                    <span key={i} data-wstar className="absolute h-1.5 w-1.5 rounded-full bg-background-50" style={{ left: `${x}%`, top: `${y}%` }} />
                  ))}
                  <i data-wmoon className="ri-moon-fill absolute end-[14%] top-[14%] text-3xl text-primary-200 drop-shadow-[0_0_14px_rgb(255_214_120/0.9)] md:text-5xl" />
                  <span className="absolute inset-x-0 bottom-0 h-1/4 bg-[#1B1A6B]/70" />
                </div>
                <span className="absolute inset-y-[18%] start-1/2 w-1.5 -translate-x-1/2 bg-white" />
                <span className="absolute inset-x-[5%] top-[55%] h-1.5 bg-white" />
                <span data-drape className="absolute -start-2 top-[10%] h-[88%] w-[20%] rounded-b-[40%] bg-gradient-to-l from-[#F27C93] to-[#E85C7A] shadow-[6px_10px_16px_-8px_rgb(80_20_40/0.5)]" style={{ backgroundImage: `${FOLDS}, linear-gradient(to left, #F27C93, #E85C7A)` }} />
                <span data-drape className="absolute -end-2 top-[10%] h-[88%] w-[20%] rounded-b-[40%] bg-gradient-to-r from-[#F27C93] to-[#E85C7A] shadow-[-6px_10px_16px_-8px_rgb(80_20_40/0.5)]" style={{ backgroundImage: `${FOLDS}, linear-gradient(to right, #F27C93, #E85C7A)` }} />
                {/* curtain rod */}
                <span className="absolute -inset-x-3 -top-0.5 h-1.5 rounded-full bg-gradient-to-b from-[#D9A064] to-[#8A5527] shadow-[0_4px_6px_-2px_rgb(60_30_10/0.5)]" />
              </div>

              {/* the calendar: this week */}
              <Obj to="/room#streak" label="أيامي" onEnter={enter} className="col-span-1 md:col-span-2">
                <span className="flex h-full min-h-[9.5rem] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_14px_24px_-12px_rgb(60_30_20/0.5)] ring-1 ring-foreground-900/10">
                  <span className="flex items-center justify-center gap-1.5 bg-amber-500 py-1.5 font-heading text-sm font-bold text-foreground-900">
                    <i className="ri-fire-fill" aria-hidden="true" />
                    أيامي
                  </span>
                  <span className="flex flex-1 flex-col items-center justify-center px-2 pb-5 pt-2 text-center">
                    <span data-flame className="inline-flex text-3xl text-amber-500 md:text-4xl">
                      <i className="ri-fire-fill" />
                    </span>
                    <span className="font-heading text-3xl font-bold leading-none text-foreground-900 md:text-4xl">{streak.toLocaleString("ar-EG")}</span>
                    <span className="mt-1 text-xs font-medium text-foreground-600">{streak > 0 ? `${streakWord} متتالية` : "ابدأ سلسلتك"}</span>
                    <span className="mt-2.5 flex items-center gap-1" aria-hidden="true">
                      {week.map((d) => (
                        <span key={d.iso} className={`h-2.5 w-2.5 rounded-full md:h-3 md:w-3 ${d.done ? "bg-amber-500" : d.today ? "border-2 border-dashed border-amber-500 bg-white" : "bg-background-200"}`} />
                      ))}
                    </span>
                  </span>
                </span>
              </Obj>

              {/* the shelf of medals */}
              <Obj to="/room#badges" label={`شاراتي · ${earned.length.toLocaleString("ar-EG")}`} onEnter={enter} className="col-span-2 md:col-span-4">
                <span className="flex h-full min-h-[9.5rem] flex-col justify-end pb-1">
                  <span className="grid grid-cols-4 items-end gap-2 px-2 md:gap-4 md:px-4">
                    {shelf.map((b) => (
                      <span key={b.id} data-medal className="flex justify-center pb-2">
                        <Medal id={b.id} title={b.title} earned={b.earned} size="md" className="!ring-offset-[#F9E0D1] max-sm:!h-14 max-sm:!w-14 max-sm:!text-3xl" />
                      </span>
                    ))}
                  </span>
                  <span aria-hidden="true" className="relative mx-1 block h-3.5 rounded-full bg-gradient-to-b from-[#C98B52] to-[#8A5527] shadow-[0_8px_14px_-4px_rgb(60_30_10/0.55)]" />
                  <span aria-hidden="true" className="mx-6 mt-0 flex justify-between">
                    <span className="h-3 w-2.5 rounded-b bg-[#8A5527]" />
                    <span className="h-3 w-2.5 rounded-b bg-[#8A5527]" />
                  </span>
                </span>
              </Obj>

              {/* framed drawings */}
              <Obj to="/room#creations" label="إبداعاتي" onEnter={enter} className="col-span-2 md:col-span-3">
                <span className="grid h-full min-h-[9.5rem] grid-cols-2 items-center gap-3 px-1 pb-3 md:gap-4">
                  {frames.map((f, i) => (
                    <span key={f?.id ?? `f${i}`} className={`relative block ${i ? "mt-4 md:mt-6" : ""}`}>
                      <span aria-hidden="true" className="absolute -top-5 left-1/2 h-5 w-px bg-foreground-900/40" />
                      <span className="block rounded-lg bg-[#C98B52] p-1.5 shadow-[0_12px_20px_-10px_rgb(60_30_10/0.6)] ring-1 ring-[#8A5527]/40">
                        {f ? (
                          <img src={f.image} alt={f.title} loading="lazy" className="aspect-[4/3] w-full rounded bg-white object-cover" />
                        ) : (
                          <span className="flex aspect-[4/3] w-full items-center justify-center rounded border-2 border-dashed border-[#8A5527]/50 bg-[#FFF3E6] text-2xl text-[#B97A45]">
                            <i className="ri-brush-line" aria-hidden="true" />
                          </span>
                        )}
                      </span>
                    </span>
                  ))}
                </span>
              </Obj>
            </div>

            {/* the floor: a jar of stars, the child on a rug, Jamool */}
            <div className="relative mt-12 px-4 pb-6 pt-0 md:mt-16 md:px-9">
              {/* wainscot: panelling under a chair rail, then the skirting board and the floor */}
              <div aria-hidden="true" className="absolute inset-x-0 -top-10 h-[4.5rem] -z-10 border-t-[6px] border-white shadow-[inset_0_10px_12px_-8px_rgb(140_84_52/0.35)]" style={{ background: PANELS }} />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-8 -z-10 border-t-[10px] border-[#FFF7EE] shadow-[inset_0_12px_16px_-8px_rgb(70_34_8/0.4)]" style={{ background: FLOOR }} />
              <div className="relative flex items-end justify-between gap-2 md:justify-around">
                <Obj to="/room#points" label={`${data.points.toLocaleString("ar-EG")} نجمة`} onEnter={enter} className="mb-4 w-[5.25rem] shrink-0 pb-6 md:w-36">
                  <span data-stand className="block">
                    <span aria-hidden="true" className="mx-auto block h-2.5 w-[62%] rounded-t-md bg-[#8A5527]" />
                    <span aria-hidden="true" className="relative block h-24 overflow-hidden rounded-b-[1.6rem] rounded-t-lg border-[3px] border-white/80 bg-white/35 shadow-[inset_0_0_18px_rgb(255_255_255/0.55),0_14px_20px_-10px_rgb(60_30_10/0.6)] backdrop-blur-sm md:h-36">
                      {STAR_SPOTS.slice(0, starCount).map(([x, y], i) => (
                        <i key={i} data-jstar className="ri-star-fill absolute text-lg text-primary-500 drop-shadow md:text-2xl" style={{ left: `${x}%`, top: `${y}%` }} />
                      ))}
                    </span>
                  </span>
                </Obj>

                <Obj to="/room#level" label={`المستوى ${level.level.toLocaleString("ar-EG")} · ${level.name}`} onEnter={enter} className="mb-2 shrink-0 !rounded-full pb-11">
                  <span data-stand className="relative block">
                    <span aria-hidden="true" className="absolute -bottom-3 -start-4 -end-4 h-7 rounded-[50%] bg-[#E0556D] shadow-[0_8px_14px_-6px_rgb(60_20_20/0.55)] md:-start-12 md:-end-12 md:h-10" />
                    <span aria-hidden="true" className="absolute -bottom-1.5 -start-1 -end-1 h-3.5 rounded-[50%] border border-dashed border-white/60 bg-[#F27C93]/80 md:-start-6 md:-end-6 md:h-5" />
                    <span className="relative block h-28 w-28 md:h-44 md:w-44">
                      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90">
                        <circle cx="50" cy="50" r={R} fill="none" stroke="rgb(255 255 255 / .6)" strokeWidth="5" />
                        <circle data-ring-arc cx="50" cy="50" r={R} fill="none" stroke="#FFC43D" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - level.pct / 100)} />
                      </svg>
                      <img src={child.avatar} alt={child.name} className={`absolute inset-[9%] h-[82%] w-[82%] rounded-full border-4 bg-background-100 object-cover ${child.ring}`} />
                      <span className="absolute -bottom-1 -end-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-400 font-heading text-lg font-bold text-foreground-900 shadow-[0_3px_0_rgb(160_105_0/0.8)] ring-2 ring-white md:h-11 md:w-11 md:text-xl">
                        {level.level.toLocaleString("ar-EG")}
                      </span>
                    </span>
                  </span>
                </Obj>

                <div data-stand aria-hidden="true" className="pointer-events-none mb-2 shrink-0">
                  <div data-bob>
                    <Character name="jamool" size="xl" decorative className="!h-28 drop-shadow-[0_12px_12px_rgba(60,30,10,0.4)] md:!h-56" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div ref={fade} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 bg-[#FFF8EE] opacity-0" />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:mt-12">
          <Link to="/room" onClick={(e) => enter(e, "/room")} className="btn btn-primary btn-lg">
            <i className="ri-home-smile-line text-lg" aria-hidden="true" />
            ادخل غرفتي
          </Link>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground-600 md:text-base">
            <i className="ri-cursor-line text-lg text-primary-500" aria-hidden="true" />
            أو اضغط أي شيء في الغرفة لتفتح قسمه
          </p>
        </div>
      </div>

      <SectionBridge variant="dunes" className="text-violet-50" />
      {door ? <RoomDoor title={`غرفتك يا ${child.name}`} onDone={() => navigate(door)} /> : null}
    </section>
  );
}
