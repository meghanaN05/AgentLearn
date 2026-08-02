import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion tokens.
 *
 * Every animated surface pulls from this file so the app reads as one system.
 * Durations are deliberately short and easing is a single custom curve --
 * varied, bouncy, per-component animation is what makes an interface feel
 * improvised rather than designed.
 */

/** Standard ease-out curve. Fast start, gentle settle. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.18,
  base: 0.32,
  slow: 0.5,
} as const;

export const transition: Transition = {
  duration: DURATION.base,
  ease: EASE,
};

/** Respects the OS "reduce motion" setting. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Content entering the viewport or the page. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition },
};

/**
 * Parent for lists of cards. Children inherit `fadeInUp` and are offset so the
 * group resolves as a wave rather than all at once.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** Route-level transition. Subtle: the page should not appear to slide. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: DURATION.fast, ease: EASE } },
};

/** Consistent affordance for interactive cards and buttons. */
export const interactive = {
  whileHover: { y: -2, transition: { duration: DURATION.fast, ease: EASE } },
  whileTap: { scale: 0.985 },
};
