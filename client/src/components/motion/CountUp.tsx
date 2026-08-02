import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

import { DURATION, prefersReducedMotion } from "../../lib/motion";

interface Props {
  value: number;
  /** Appended verbatim, e.g. "%" or " hrs". */
  suffix?: string;
  decimals?: number;
}

/**
 * Counts a statistic up when it scrolls into view.
 *
 * Falls back to the final value immediately under reduced-motion, and for
 * zero, where counting to nothing just reads as a glitch.
 */
const CountUp = ({ value, suffix = "", decimals = 0 }: Props) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(() =>
    prefersReducedMotion() || value === 0 ? value : 0
  );

  useEffect(() => {
    if (!inView || prefersReducedMotion() || value === 0) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, value, {
      duration: DURATION.slow * 2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest),
    });

    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export default CountUp;
