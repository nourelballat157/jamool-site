import { useRef } from "react";
import { createPortal } from "react-dom";
import { gsap, useGSAP } from "@/lib/gsap";

const WOOD = "linear-gradient(90deg, #A9672F 0%, #D9A064 18%, #C98B4E 50%, #D9A064 82%, #A9672F 100%)";
const PANEL = "linear-gradient(180deg, rgb(255 255 255 / .16), rgb(0 0 0 / .1))";

/**
 * Walking into the room: a wooden arched door appears, the handle turns, the door swings open onto warm light,
 * the camera steps through the doorway and the room page opens. The caller mounts it with the page to open and
 * is called back (`onDone`) the moment the light fills the screen.
 */
export default function RoomDoor({ title, onDone }: { title: string; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = (s: string) => el.querySelector(s);
      gsap.set(el, { opacity: 0 });
      gsap.set(q("[data-stage]"), { scale: 0.72, y: 24, transformOrigin: "50% 62%" });
      gsap.set(q("[data-leaf]"), { rotationY: 0, transformOrigin: "100% 50%" });
      gsap.set(q("[data-light]"), { opacity: 0.55, scale: 0.92 });
      gsap
        .timeline({ onComplete: onDone, defaults: { ease: "power2.inOut" } })
        .to(el, { opacity: 1, duration: 0.28, ease: "power1.out" }, 0)
        .to(q("[data-stage]"), { scale: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0)
        .to(q("[data-knob]"), { rotation: -28, duration: 0.16, ease: "power2.out" }, 0.42)
        .to(q("[data-leaf]"), { rotationY: -74, duration: 0.8 }, 0.55)
        .to(q("[data-shade]"), { opacity: 0, duration: 0.6 }, 0.6)
        .to(q("[data-light]"), { opacity: 1, scale: 1.04, duration: 0.8 }, 0.55)
        .to(q("[data-stage]"), { scale: 7, duration: 0.62, ease: "power3.in", transformOrigin: "50% 58%" }, 1.2)
        .to(q("[data-wash]"), { opacity: 1, duration: 0.34, ease: "power1.in" }, 1.5);
    },
    { scope: root }
  );

  return createPortal(
    <div ref={root} role="presentation" className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#4A2A18_0%,#24120A_75%)]" style={{ perspective: "1500px" }}>
      <div data-stage className="relative flex flex-col items-center">
        {/* the plate above the door */}
        <span className="mb-4 rounded-full bg-[#F3D9A4] px-5 py-1.5 font-heading text-sm font-bold text-[#6B3F17] shadow-[0_6px_14px_-4px_rgb(0_0_0/0.6)] md:text-base">{title}</span>

        <div className="relative h-[min(64vh,30rem)] w-[min(60vw,19rem)] rounded-t-[999px] border-[10px] border-[#8A5527] bg-[#8A5527] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)]">
          {/* what is behind the door: warm light, a little dust of stars */}
          <div data-light className="absolute inset-0 overflow-hidden rounded-t-[999px] bg-[radial-gradient(circle_at_50%_72%,#FFFBEC_0%,#FFE6A8_42%,#F5B85A_100%)]">
            <i className="ri-sparkling-2-fill absolute start-[22%] top-[26%] text-2xl text-white/90" />
            <i className="ri-sparkling-2-fill absolute end-[24%] top-[42%] text-lg text-white/80" />
            <i className="ri-star-fill absolute start-[40%] top-[14%] text-sm text-white/80" />
          </div>

          {/* the door itself, hinged on one side */}
          <div data-leaf className="absolute inset-0 rounded-t-[999px] shadow-[inset_0_0_0_4px_rgb(90_48_16/0.5)]" style={{ background: WOOD, transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}>
            <span className="absolute inset-x-[14%] top-[10%] h-[34%] rounded-t-[999px] rounded-b-xl shadow-[inset_0_0_0_3px_rgb(110,60,20/0.55),inset_0_6px_10px_rgb(0_0_0/0.18)]" style={{ background: PANEL }} />
            <span className="absolute inset-x-[14%] bottom-[8%] h-[40%] rounded-xl shadow-[inset_0_0_0_3px_rgb(110,60,20/0.55),inset_0_6px_10px_rgb(0_0_0/0.18)]" style={{ background: PANEL }} />
            <span data-knob className="absolute end-[9%] top-[52%] h-7 w-7 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFF1B8,#E3A21B_60%,#9A6508)] shadow-[0_3px_6px_rgb(0_0_0/0.5)]" />
            <span data-shade className="absolute inset-0 rounded-t-[999px] bg-black/10" />
          </div>
        </div>
        <span className="mt-2 h-3 w-[min(70vw,23rem)] rounded-full bg-black/40 blur-md" />
      </div>
      <div data-wash className="absolute inset-0 bg-[#FFF6E6] opacity-0" />
    </div>,
    document.body
  );
}
