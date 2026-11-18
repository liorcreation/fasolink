"use client";

import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
  as?: "div" | "section" | "li" | "article";
  /** Ajoute un léger flou de mise au point à l'apparition. */
  blur?: boolean;
}

/** Apparition en fondu + translation (+ mise au point), au scroll. Respecte prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
  as = "div",
  blur = true,
}: RevealProps) {
  const reduce = useSafeReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: blur ? "blur(8px)" : "blur(0px)" }}
      // `filter` est retiré à la fin : un filtre résiduel créerait un bloc
      // conteneur et décalerait les éléments `position: fixed` enfants.
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once, margin: "-80px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
