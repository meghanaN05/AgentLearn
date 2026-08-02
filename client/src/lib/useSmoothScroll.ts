import { useEffect } from "react";
import Lenis from "lenis";

import { prefersReducedMotion } from "./motion";

/**
 * Page-level smooth scrolling.
 *
 * Lenis intercepts wheel events on the window and drives scroll from a rAF
 * loop. Nested scroll areas (the chat transcript, long modals) must opt out
 * with `data-lenis-prevent`, otherwise the wheel is swallowed by the page and
 * the inner container never scrolls -- and any programmatic scrollTo inside it
 * fights Lenis's interpolation.
 *
 * Disabled entirely when the OS asks for reduced motion.
 */
export const useSmoothScroll = () => {
  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }

    const lenis = new Lenis({
      // ~1s to settle: noticeable but not sluggish.
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch devices already have good native momentum; overriding it feels wrong.
      smoothWheel: true,
      syncTouch: false,
    });

    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
};
