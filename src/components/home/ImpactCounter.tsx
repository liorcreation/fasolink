"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, MapPinned, Package, Store } from "lucide-react";

function useCountUp(target: number, run: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
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
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setRun(true),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shops = useCountUp(shopCount, run);
  const products = useCountUp(productCount, run);
  const cities = useCountUp(cityCount, run);
  const verified = useCountUp(verifiedCount, run);

  const stats = [
    {
      icon: Store,
      value: shops.toLocaleString("fr-FR"),
      label: "boutiques locales à découvrir",
      accent: "text-faso-green",
    },
    {
      icon: Package,
      value: products.toLocaleString("fr-FR"),
      label: "produits et créations présentés",
      accent: "text-faso-red",
    },
    {
      icon: MapPinned,
      value: cities.toLocaleString("fr-FR"),
      label: "villes représentées",
      accent: "text-faso-gold-dark",
    },
    {
      icon: BadgeCheck,
      value: verified.toLocaleString("fr-FR"),
      label: "vendeurs dont le profil est vérifié",
      accent: "text-clay-700",
    },
  ];

  return (
    <section className="container-faso py-16 md:py-20">
      <div
        ref={ref}
        className="overflow-hidden rounded-4xl border border-clay-100 bg-white p-8 shadow-premium md:p-12"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-faso-green">
            Le Faso en vitrine
          </span>
          <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">
            Des talents d’ici. Des découvertes sans limite.
          </h2>
          <p className="mt-3 text-ink-muted">
            Explorez les boutiques, comparez les créations et échangez directement
            avec les vendeurs. Tout l’essentiel, au même endroit.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={run ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-3xl bg-clay-50 p-5 text-center"
            >
              <s.icon className={`mx-auto h-6 w-6 ${s.accent}`} />
              <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
