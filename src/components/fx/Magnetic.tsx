"use client";

import { motion, useSpring } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Attire légèrement son contenu vers le curseur (souris uniquement). */
export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useSafeReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.35 });
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.35 });

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      style={reduce ? undefined : { x, y }}
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== "mouse" || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
