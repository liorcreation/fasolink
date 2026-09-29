"use client";

import {
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  Store,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: "lock" | "shield" | "dashboard" | "store" | "card";
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";
  const reduce = useReducedMotion();
  const Icon = icon
    ? {
        lock: LockKeyhole,
        shield: ShieldCheck,
        dashboard: LayoutDashboard,
        store: Store,
        card: CreditCard,
      }[icon]
    : null;

  return (
    <section className={cn("relative overflow-hidden rounded-[2rem] border border-clay-200/70 bg-white/65 px-6 py-8 shadow-premium md:px-10 md:py-10", className)}>
      <div className="page-ambient" aria-hidden="true" />
      <motion.div
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-faso-gold/15 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0, x: 30 }}
        animate={reduce ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.12 }}
        className="pointer-events-none absolute bottom-[-5rem] left-1/2 h-48 w-48 rounded-full bg-faso-green/10 blur-3xl"
      />
      <Reveal
        className={cn(
          "relative z-10",
          centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left",
        )}
      >
        <span className={cn("section-kicker", centered && "justify-center")}>
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
          {eyebrow}
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-[-0.05em] text-ink md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 text-base leading-7 text-ink-soft md:text-lg">
            {description}
          </p>
        )}
      </Reveal>
    </section>
  );
}
