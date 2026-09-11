"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HeartHandshake, Store, TrendingUp, Users } from "lucide-react";

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
  amountCFA,
  shopCount,
}: {
  amountCFA: number;
  shopCount: number;
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

  const millions = Math.round(amountCFA / 1_000_000);
  const money = useCountUp(millions, run);
  const shops = useCountUp(shopCount, run);
  const contacts = useCountUp(shopCount * 38, run);
  const buyers = useCountUp(shopCount * 120, run);

  const stats = [
    {
      icon: TrendingUp,
      value: `${money.toLocaleString("fr-FR")} M FCFA`,
      label: "réinjectés dans l'économie locale ce mois-ci",
      accent: "text-faso-green",
    },
    {
      icon: Store,
      value: shops.toLocaleString("fr-FR"),
      label: "boutiques burkinabè référencées",
      accent: "text-faso-red",
    },
    {
      icon: Users,
      value: `${contacts.toLocaleString("fr-FR")}+`,
      label: "mises en relation via WhatsApp",
      accent: "text-faso-gold-dark",
    },
    {
      icon: HeartHandshake,
      value: `${buyers.toLocaleString("fr-FR")}+`,
      label: "acheteurs engagés « Consommer Burkinabè »",
      accent: "text-clay-700",
    },
  ];

  return (
    <section className="container-faso-wide py-16 md:py-20">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-4xl border border-clay-100 bg-white p-8 shadow-premium md:p-12"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-faso-green">
            Impact local
          </span>
          <span className="accent-line mx-auto mt-2" />
          <h2 className="mt-3 font-editorial text-display-2 font-semibold text-ink">
            Chaque achat compte pour le Faso
          </h2>
          <p className="mt-3 text-ink-muted">
            L&apos;argent dépensé sur FasoLink va directement au commerçant —
            zéro commission sur vos ventes.
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
