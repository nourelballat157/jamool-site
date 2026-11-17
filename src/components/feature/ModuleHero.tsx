import { useRef, type ReactNode } from "react";
import Character from "@/components/brand/Character";
import { categoryById, characters, tones, type CategoryId, type CharacterId } from "@/data/brand";
import { gsap, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";

type ModuleHeroProps = {
  badge: string;
  badgeIcon: string;
  /** kept for older call sites; the category colour role replaces it when `category` is set */
  badgeTone?: string;
  title: string;
  description: string;
  /** the category world this page belongs to: picks colour role, icon and the leading character */
  category?: CategoryId;
  /** override the leading character (defaults to the category's character) */
  character?: CharacterId;
  /** legacy props, ignored: pages are illustrated by the official cast now */
  image?: string;
  imageAlt?: string;
  imageTitle?: string;
  tone?: string;
  floatIcon?: string;
  actions?: ReactNode;
};

const SPARKS = [
  { x: 8, y: 26, size: 13 },
  { x: 40, y: 14, size: 10 },
  { x: 58, y: 70, size: 9 },
  { x: 90, y: 22, size: 15 },
  { x: 76, y: 58, size: 10 },
];

/**
 * Page header of every inner page: the same night scene as the home hero, tinted by the page's
 * world, the leading character standing on its own glowing arch, then the cream ground.
 * One layout, nine colour roles; a calm entrance, pointer depth and a gentle scroll lift via GSAP.
 */
export default function ModuleHero({ badge, badgeIcon, title, description, category, character, actions }: ModuleHeroProps) {
  const root = useRef<HTMLElement>(null);
  const cat = category ? categoryById(category) : undefined;
  const who = character ?? cat?.character ?? "jamool";
  const t = tones[cat?.tone ?? characters[who].tone];
  const words = title.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK_QUERY, () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from("[data-chip]", { y: 14, opacity: 0, duration: 0.5 })
          .from("[data-word] > span", { yPercent: 120, duration: 0.75, stagger: 0.07 }, 0.08)
          .from("[data-in]", { y: 16, opacity: 0, duration: 0.6, stagger: 0.09 }, 0.4)
          .from("[data-glow]", { scale: 0.6, opacity: 0, duration: 1.1, ease: "power2.out" }, 0)
          .from("[data-arch]", { yPercent: 12, scaleY: 0.86, opacity: 0, transformOrigin: "50% 100%", duration: 0.9, ease: "back.out(1.2)" }, 0.12)
          .from("[data-who]", { y: 40, opacity: 0, duration: 0.85 }, 0.3);

        gsap.utils.toArray<HTMLElement>("[data-spark]").forEach((el, i) => {
          gsap.to(el, { opacity: 0.25, scale: 0.7, duration: 1.6 + (i % 3) * 0.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.2 });
        });
        gsap.to("[data-ring]", { rotation: 360, duration: 140, repeat: -1, ease: "none" });
        gsap.to("[data-glow]", { scale: 1.06, opacity: 0.8, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.2 });

        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 };
        gsap.to("[data-stage]", { yPercent: -8, ease: "none", scrollTrigger: st });
        gsap.to("[data-copy]", { yPercent: -5, opacity: 0.55, ease: "none", scrollTrigger: st });
      });

      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const stage = root.current?.querySelector<HTMLElement>("[data-stage]");
        if (!stage || !root.current) return;
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]").map((el) => ({
          qx: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
          qy: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
          d: Number(el.dataset.depth),
        }));
        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          const cx = gsap.utils.clamp(-1, 1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2));
          const cy = gsap.utils.clamp(-1, 1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2));
          layers.forEach((l) => (l.qx(-cx * l.d), l.qy(-cy * l.d * 0.7)));
        };
        const rest = () => layers.forEach((l) => (l.qx(0), l.qy(0)));
        const host = root.current;
        host.addEventListener("pointermove", move);
        host.addEventListener("pointerleave", rest);
        return () => {
          host.removeEventListener("pointermove", move);
          host.removeEventListener("pointerleave", rest);
        };
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} data-night-hero data-no-reveal className="on-navy relative isolate -mt-[4.75rem] w-full overflow-hidden text-background-100">
      {/* the night: royal blue lifting to a spotlight, tinted by the page's world */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-[#252385] via-[#322F9E] to-[#3B3CB2]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_0%,rgb(130_120_255/0.4),transparent_58%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -bottom-24 start-[-8%] h-[26rem] w-[26rem] rounded-full opacity-[0.22] blur-3xl" style={{ background: t.hex }} />
        {SPARKS.map((s, i) => (
          <i key={i} data-spark className="ri-sparkling-2-fill absolute text-primary-300/80" style={{ insetInlineStart: `${s.x}%`, top: `${s.y}%`, fontSize: s.size }} />
        ))}
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-4 px-4 pb-24 pt-28 md:px-6 md:pb-28 md:pt-32 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:pb-28">
        <div data-copy className="text-center lg:text-start">
          <span data-chip className="inline-flex items-center gap-2 rounded-full bg-background-100/10 py-1.5 pe-4 ps-3 font-heading text-sm font-semibold text-primary-200 ring-1 ring-background-100/20 backdrop-blur-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-sm" style={{ background: `${t.hex}55`, color: "#fff" }}>
              <i className={badgeIcon} />
            </span>
            {badge}
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.25] text-background-50 md:text-5xl lg:text-[3.4rem]">
            {words.map((w, i) => (
              <span key={i} data-word className="inline-block overflow-hidden py-1 align-bottom">
                <span className="inline-block">{w}</span>
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <svg aria-hidden="true" viewBox="0 0 220 14" preserveAspectRatio="none" data-in className="mx-auto mt-1 block h-3 w-40 text-primary-400 lg:mx-0 lg:w-52">
            <path d="M3 9C34 2 62 13 94 7s58-5 88 1 30 1 35-2" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
          <p data-in className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-background-100/80 md:text-lg lg:mx-0">{description}</p>
          {actions ? <div data-in className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">{actions}</div> : null}
        </div>

        {/* stage: a glowing arch in the world's colour, with its leading friend standing in it */}
        <div data-stage className="relative mx-auto h-72 w-full max-w-sm md:h-80 lg:h-[24rem] lg:max-w-none">
          <div data-glow aria-hidden="true" className="absolute inset-x-[10%] inset-y-[4%] rounded-full opacity-60 blur-2xl" style={{ background: `radial-gradient(circle, ${t.hex}99, transparent 68%)` }} />
          <div data-depth="8" className="absolute inset-0">
            <svg data-ring aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-[2%] h-[96%] w-[96%] text-primary-300/35">
              <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 3" />
            </svg>
          </div>
          <div data-depth="12" className="absolute inset-x-0 bottom-0 flex justify-center">
            <div data-arch className="relative h-[15rem] w-[10.5rem] rounded-b-[1.25rem] rounded-t-[999px] shadow-[0_10px_0_rgb(0_0_0/0.16),0_26px_44px_-20px_rgb(0_0_40/0.6)] md:h-[17rem] md:w-[12rem] lg:h-[20rem] lg:w-[14.5rem]" style={{ background: `linear-gradient(to bottom, ${t.hex}, ${t.hex}CC)` }}>
              <span aria-hidden="true" className="absolute inset-3 rounded-b-[0.9rem] rounded-t-[999px] border-2 border-white/45" />
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[9%] rounded-b-[1.25rem] bg-black/15" />
            </div>
          </div>
          <div data-depth="20" className="absolute inset-x-0 bottom-0 z-10 flex justify-center">
            <div data-who>
              <Character name={who} size="xl" motion="float" priority className="drop-shadow-[0_14px_16px_rgba(18,14,80,0.4)]" />
            </div>
          </div>
        </div>
      </div>

      {/* the cream ground the page continues on */}
      <svg aria-hidden="true" viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-16 w-full text-background-50 md:h-20">
        <path d="M0 60V30C240 6 480 0 720 0s480 6 720 30V60z" fill="currentColor" />
      </svg>
    </section>
  );
}
