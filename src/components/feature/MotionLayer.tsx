import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK_QUERY } from "@/lib/gsap";

/** Pages where cards and headings glide in as they enter the screen. Game / quiz runners are left alone. */
const REVEAL_ROUTES = new Set([
  "/",
  "/games",
  "/stories",
  "/learning",
  "/values",
  "/competitions",
  "/quran",
  "/drawing",
  "/room",
  "/parent",
  "/child-select",
  "/explore",
  "/ai",
]);

/**
 * The site-wide motion layer (GSAP): a brand progress line at the top, calm scroll reveals,
 * a soft tilt on illustrated icons and a magnetic pull on the main call-to-action buttons.
 * Everything is skipped for visitors who prefer reduced motion.
 */
export default function MotionLayer() {
  const { pathname } = useLocation();
  const bar = useRef<HTMLDivElement>(null);

  /* 1. reading progress, drawn in the brand gradient */
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK_QUERY, () => {
      gsap.set(bar.current, { scaleX: 0, transformOrigin: "right center" });
      gsap.to(bar.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.25, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, []);

  /* 2. scroll reveals, rebuilt for each page */
  useEffect(() => {
    if (!REVEAL_ROUTES.has(pathname)) return;
    let ctx: gsap.Context | undefined;
    const frame = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add(MOTION_OK_QUERY, () => {
          const reveal = (items: HTMLElement[], y: number, stagger: number) => {
            if (!items.length) return;
            gsap.set(items, { autoAlpha: 0, y });
            ScrollTrigger.batch(items, {
              start: "top 90%",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  stagger,
                  duration: 0.85,
                  overwrite: true,
                  clearProps: "transform,opacity,visibility",
                }),
            });
          };

          const heads = gsap
            .utils.toArray<HTMLElement>("main > section h2, main > section h2 + p")
            .filter((el) => !el.closest("[data-no-reveal]") && el.getClientRects().length > 0);
          reveal(heads, 26, 0.1);

          const cards = gsap
            .utils.toArray<HTMLElement>("main > section ul > li")
            .filter((el) => !el.parentElement?.closest("li") && !el.closest("[data-no-reveal]") && el.getClientRects().length > 0);
          reveal(cards, 38, 0.09);

          /* the shared brand motion hooks (see components/brand/Deco.tsx) */
          // seams between sections: the dunes / doors / lanterns slide sideways as you scroll past
          gsap.utils.toArray<HTMLElement | SVGElement>("[data-bridge]").forEach((el) => {
            const speed = Number(el.getAttribute("data-bridge")) || 1;
            gsap.fromTo(
              el,
              { xPercent: 0 },
              { xPercent: 22 * speed * (document.documentElement.dir === "rtl" ? -1 : 1), ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.8 } }
            );
          });
          // decorations drift at their own pace, so the page has depth
          gsap.utils.toArray<HTMLElement | SVGElement>("[data-drift]").forEach((el) => {
            const d = Number(el.getAttribute("data-drift")) || 20;
            gsap.fromTo(
              el,
              { y: -d },
              { y: d, ease: "none", scrollTrigger: { trigger: el.closest("section") ?? el, start: "top bottom", end: "bottom top", scrub: 0.8 } }
            );
          });
          // shapes spring in once
          const pops = gsap.utils.toArray<HTMLElement | SVGElement>("[data-pop]");
          if (pops.length) {
            gsap.set(pops, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
            ScrollTrigger.batch(pops, {
              start: "top 92%",
              once: true,
              onEnter: (batch) => gsap.to(batch, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.08, ease: "back.out(2.2)" }),
            });
          }
          // hand-drawn lines draw themselves
          gsap.utils.toArray<SVGElement>("[data-draw]").forEach((svg) => {
            svg.querySelectorAll<SVGGeometryElement>("path").forEach((p) => {
              const len = p.getTotalLength?.() ?? 0;
              if (!len) return;
              gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
              gsap.to(p, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", scrollTrigger: { trigger: svg, start: "top 92%", once: true } });
            });
          });

          ScrollTrigger.refresh();
        });
        return () => mm.revert();
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      ctx?.revert();
    };
  }, [pathname]);

  /* 3. pointer interactions: tilt on illustrated icons, magnetic pull on key buttons */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const tilts = new WeakMap<HTMLElement, { rx: (v: number) => void; ry: (v: number) => void }>();
    const pulls = new WeakMap<HTMLElement, { x: (v: number) => void; y: (v: number) => void }>();

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const target = e.target as Element | null;
      if (!target?.closest) return;

      const tiltZone = target.closest<HTMLElement>("[data-tilt-zone]");
      if (tiltZone) {
        const el = tiltZone.querySelector<HTMLElement>("[data-tilt]");
        if (el) {
          let q = tilts.get(el);
          if (!q) {
            gsap.set(el, { transformPerspective: 600 });
            q = {
              rx: gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" }),
              ry: gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" }),
            };
            tilts.set(el, q);
          }
          const r = tiltZone.getBoundingClientRect();
          q.ry(((e.clientX - r.left) / r.width - 0.5) * 22);
          q.rx(-((e.clientY - r.top) / r.height - 0.5) * 22);
        }
      }

      const pullZone = target.closest<HTMLElement>("[data-magnetic-zone]");
      if (pullZone) {
        const el = pullZone.querySelector<HTMLElement>("[data-magnetic]");
        if (el) {
          let q = pulls.get(el);
          if (!q) {
            q = {
              x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" }),
              y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" }),
            };
            pulls.set(el, q);
          }
          const r = pullZone.getBoundingClientRect();
          q.x((e.clientX - (r.left + r.width / 2)) * 0.12);
          q.y((e.clientY - (r.top + r.height / 2)) * 0.25);
        }
      }
    };

    const onLeave = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const tiltZone = target.closest<HTMLElement>("[data-tilt-zone]");
      if (tiltZone && !tiltZone.contains(e.relatedTarget as Node | null)) {
        const el = tiltZone.querySelector<HTMLElement>("[data-tilt]");
        if (el) gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.6, ease: "power3.out" });
      }
      const pullZone = target.closest<HTMLElement>("[data-magnetic-zone]");
      if (pullZone && !pullZone.contains(e.relatedTarget as Node | null)) {
        const el = pullZone.querySelector<HTMLElement>("[data-magnetic]");
        if (el) gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
    };
  }, []);

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] bg-gradient-to-l from-primary-500 via-secondary-500 to-sky-500"
      style={{ transform: "scaleX(0)", transformOrigin: "right center" }}
    />
  );
}
