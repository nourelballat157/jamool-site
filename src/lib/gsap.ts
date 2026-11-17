import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Draggable } from "gsap/Draggable";
import { Observer } from "gsap/Observer";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

/** One place where every GSAP plugin used by the site is registered (all are free). */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip, MotionPathPlugin, Draggable, Observer, CustomEase);

/** The platform's motion signature: a soft, slightly springy settle, never bouncy. */
export const softSpring = CustomEase.create("jamoolSettle", "M0,0 C0.18,0.9 0.3,1.06 0.55,1.02 0.75,0.99 0.9,1 1,1");

gsap.defaults({ ease: "power3.out", duration: 0.7 });

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const MOTION_OK_QUERY = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, Flip, MotionPathPlugin, Draggable, Observer, useGSAP };
