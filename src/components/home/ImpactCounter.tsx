"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import { BadgeCheck, MapPinned, Package, Store } from "lucide-react";
import { Backdrop } from "@/components/fx/Backdrop";
import { RevealText } from "@/components/fx/RevealText";

function useCountUp(target: number, run: boolean, duration = 1800) {
  const reduce = useSafeReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 4))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration, reduce]);
  return value;
}

export function ImpactCounter({
  shopCount,
  productCount,
  cityCount,
  verifiedCount,
}: {
  shopCount: number;
  productCount: number;
  cityCount: number;
  verifiedCount: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const run = useInView(ref, { once: true, amount: 0.35 });
  const reduce = useSafeReducedMotion();

  const shops = useCountUp(shopCount, run);
  const products = useCountUp(productCount, run);
  const cities = useCountUp(cityCount, run);
  const verified = useCountUp(verifiedCount, run);

  const stats = [
    { icon: Store, value: shops, label: "boutiques locales à découvrir", glow: "from-faso-green/40" },
    { icon: Package, value: products, label: "produits tech présentés", glow: "from-faso-red/40" },
    { icon: MapPinned, value: cities, label: "villes représentées", glow: "from-faso-gold/40" },
    { icon: BadgeCheck, value: verified, label: "vendeurs dont le profil est vérifié", glow: "from-[#e7bd73]/40" },
  ];

  return (
    <section className="fx-night relative isolate overflow-hidden py-20 text-white md:py-28">
      <Backdrop dark aurora={false} />
      <div className="container-faso relative">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <h2 className="fx-display text-[clamp(2.3rem,5vw,4.2rem)]">
            <RevealText inView text="Des talents d’ici." className="block" />
            <span className="font-serif-accent fx-text-gradient-light block pb-1 text-[1.08em]">Des découvertes sans limite.</span>
          </h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md text-base leading-7 text-white/65 lg:justify-self-end"
          >
            Explorez les boutiques, comparez les offres et échangez directement avec les vendeurs. Les chiffres ci-dessous sont mis à jour en temps réel.
          </motion.p>
        </div>

        <div ref={ref} className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              data-spotlight
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={run ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="fx-spotlight fx-spotlight-dark group relative overflow-hidden bg-[#15110d] p-5 sm:p-8"
            >
              <div aria-hidden="true" className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${stat.glow} to-transparent opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
              <stat.icon className="relative z-10 h-6 w-6 text-white/60" aria-hidden="true" />
              <p className="fx-display faso-tabular relative z-10 mt-6 text-[clamp(2.6rem,6vw,4.8rem)] sm:mt-8 leading-none">
                {stat.value.toLocaleString("fr-FR")}
              </p>
              <p className="relative z-10 mt-3 max-w-[14rem] text-xs leading-5 text-white/60 sm:text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
