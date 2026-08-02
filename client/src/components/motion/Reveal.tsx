import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { fadeInUp, staggerContainer } from "../../lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Animate when scrolled into view rather than on mount. */
  onScroll?: boolean;
  delay?: number;
}

/** Fades content up. The building block for section and card entrances. */
export const Reveal = ({
  children,
  className,
  onScroll = false,
  delay = 0,
}: RevealProps) => {
  const viewportProps = onScroll
    ? // `once` matters: re-animating on every scroll pass is the kind of
      // detail that makes a site feel gimmicky rather than considered.
      { whileInView: "visible" as const, viewport: { once: true, amount: 0.2 } }
    : { animate: "visible" as const };

  return (
    <motion.div
      className={className}
      variants={fadeInUp}
      initial="hidden"
      transition={{ delay }}
      {...viewportProps}
    >
      {children}
    </motion.div>
  );
};

interface StaggerProps {
  children: ReactNode;
  className?: string;
  onScroll?: boolean;
}

/** Parent for a group of `RevealItem`s; resolves them as a short wave. */
export const Stagger = ({
  children,
  className,
  onScroll = false,
}: StaggerProps) => {
  const viewportProps = onScroll
    ? { whileInView: "visible" as const, viewport: { once: true, amount: 0.15 } }
    : { animate: "visible" as const };

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      {...viewportProps}
    >
      {children}
    </motion.div>
  );
};

export const RevealItem = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div className={className} variants={fadeInUp}>
    {children}
  </motion.div>
);
