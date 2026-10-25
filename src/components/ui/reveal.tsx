"use client";

/**
 * Scroll-entrance wrapper (framer-motion v14).
 *
 * Fades/slides children in once when they first enter the viewport. When the
 * user prefers reduced motion, children render statically with no animation.
 * Keep usage at section-block level — do not wrap individual <li> elements of
 * a <ul>/<ol> (the wrapper renders a div, which would be invalid inside a
 * list).
 */

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Extra delay in seconds, for staggering sibling blocks. */
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
