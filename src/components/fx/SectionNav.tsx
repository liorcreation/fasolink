"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import { cn } from "@/lib/utils";

export interface SectionNavItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

/**
 * Navigation de section collante, placée sous la barre principale, avec une
 * pastille qui suit la section réellement visible (scroll-spy).
 */
export function SectionNav({
  items,
  label,
  layoutId,
  className,
}: {
  items: SectionNavItem[];
  label: string;
  layoutId: string;
  className?: string;
}) {
  const reduce = useSafeReducedMotion();
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label={label}
      className={cn(
        // Sous la barre principale collante (4rem mobile, 4.5rem desktop).
        "no-scrollbar sticky top-[4.5rem] z-30 -mx-1 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-white/80 bg-[#fffdfa]/80 p-1 shadow-[0_1px_0_#fff_inset,0_14px_40px_-24px_rgb(26_17_9/.45)] backdrop-blur-2xl sm:mx-0 md:top-[5rem]",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => setActive(item.id)}
            className={cn(
              "relative isolate inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-xs font-bold transition-colors sm:px-4",
              isActive ? "text-white" : "text-ink-soft hover:text-ink",
            )}
          >
            {isActive && (
              <motion.span
                aria-hidden="true"
                layoutId={reduce ? undefined : layoutId}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-full bg-ink shadow-[0_8px_20px_-10px_rgb(26_17_9/.7)]"
              />
            )}
            {item.icon}
            {item.label}
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-extrabold",
                  isActive ? "bg-white/15 text-white" : "bg-clay-100 text-ink-muted",
                )}
              >
                {item.count}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}
