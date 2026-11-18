"use client";

import {
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  Store,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import { Backdrop } from "@/components/fx/Backdrop";
import { RevealText } from "@/components/fx/RevealText";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

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
  const reduce = useSafeReducedMotion();
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
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[2rem] border border-white/80 bg-white/55 px-6 py-10 shadow-[inset_0_1px_0_rgb(255_255_255/.9),0_30px_70px_-45px_rgb(26_17_9/.45)] md:rounded-[2.5rem] md:px-12 md:py-14",
        className,
      )}
    >
      <Backdrop />
      <span aria-hidden="true" className="faso-brand-thread absolute inset-x-0 top-0 opacity-80" />
      <div className={cn("relative z-10", centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left")}>
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE }}
          className={cn("section-kicker", centered && "justify-center")}
        >
          {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
          {eyebrow}
        </motion.span>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-[-0.055em] text-ink md:text-6xl">
          <RevealText text={title} delay={0.08} stagger={0.05} />
        </h1>
        {description && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 0.35, ease: EASE }}
            className={cn("mt-5 text-base leading-7 text-ink-soft md:text-lg", centered && "mx-auto max-w-2xl")}
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}
