"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles, Store } from "lucide-react";
import type { ProductAvailability } from "@/lib/database.types";
import { AppLink as Link } from "@/components/site/AppLink";
import { AvailabilityBadge } from "@/components/shops/AvailabilityBadge";
import { useSafeReducedMotion } from "@/components/fx/motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Scène produit : projecteur, sol réfléchissant et inclinaison 3D au survol. */
export function ProductStage({
  imageUrl,
  name,
  availability,
  illustrative,
  shopName,
  shopHref,
}: {
  imageUrl: string | null;
  name: string;
  availability: ProductAvailability;
  illustrative: boolean;
  shopName: string;
  shopHref: string;
}) {
  const reduce = useSafeReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 16, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 90, damping: 16, mass: 0.5 });
  const rotateY = useTransform(sx, (v) => v * 16);
  const rotateX = useTransform(sy, (v) => v * -12);
  const glare = useTransform([sx, sy], ([x, y]: number[]) => `radial-gradient(420px circle at ${50 + x * 80}% ${40 + y * 60}%, rgb(255 255 255 / .55), transparent 55%)`);

  return (
    <div
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        px.set((event.clientX - rect.left) / rect.width - 0.5);
        py.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      className="group relative isolate aspect-[4/3.4] overflow-hidden rounded-[2rem] border border-white/80 bg-[radial-gradient(ellipse_70%_60%_at_50%_38%,#ffffff,#f6efe3_62%,#ecdfca)] shadow-[inset_0_1px_0_#fff,0_40px_90px_-50px_rgb(48_34_20/.55)] sm:aspect-square sm:rounded-[2.6rem]"
      style={{ perspective: 1400 }}
    >
      {/* Ambiance : grille, halo doré et orbite. */}
      <div aria-hidden="true" className="fx-grid opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[42%] -z-10 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--faso-gold)/.32),transparent_62%)] blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
        <div className="fx-orbit aspect-square w-[82%] text-faso-gold [animation-duration:60s]"><b /></div>
      </div>

      {/* Sol : ombre portée qui respire avec l'inclinaison. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-[22%] bottom-[11%] h-[7%] rounded-[50%] bg-ink/25 blur-2xl transition-all duration-700 group-hover:inset-x-[26%] group-hover:bg-ink/15" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
        className="absolute inset-0"
      >
        <motion.div
          style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="absolute inset-[9%] sm:inset-[11%]"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 46vw"
              className="object-contain drop-shadow-[0_30px_40px_rgb(26_17_9/.25)] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center">
              <span className="grid h-28 w-28 place-items-center rounded-[2rem] bg-white/80 text-faso-gold-dark shadow-premium">
                <Store className="h-11 w-11" aria-hidden="true" />
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Reflet qui suit la souris. */}
      {!reduce && (
        <motion.div aria-hidden="true" style={{ background: glare }} className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100" />
      )}

      <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
        <AvailabilityBadge status={availability} className="fx-glass" />
      </div>
      <div className="fx-glass absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.13em] text-ink-soft sm:right-6 sm:top-6">
        <Sparkles className="h-3.5 w-3.5 text-faso-gold-dark" aria-hidden="true" />
        {illustrative ? "Photo illustrative" : "Sélection locale"}
      </div>

      <div className="absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
        <span className="fx-glass rounded-2xl px-3.5 py-2.5">
          <span className="block text-[9px] font-extrabold uppercase tracking-[.16em] text-ink-muted">Proposé par</span>
          <span className="mt-0.5 block max-w-[52vw] truncate text-xs font-bold text-ink sm:max-w-xs">{shopName}</span>
        </span>
        <Link
          href={shopHref}
          aria-label={`Découvrir la boutique ${shopName}`}
          className="fx-glass grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink transition-all duration-500 hover:rotate-45 hover:bg-ink hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
