"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import { cn } from "@/lib/utils";

/** Fil tricolore qui se remplit avec la lecture de la page. */
export function ScrollProgress({ className }: { className?: string }) {
  const reduce = useSafeReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  return (
    <motion.span
      aria-hidden="true"
      style={{ scaleX: reduce ? scrollYProgress : scaleX, transformOrigin: "0% 50%" }}
      className={cn("faso-brand-thread pointer-events-none absolute inset-x-0 bottom-0 block", className)}
    />
  );
}
