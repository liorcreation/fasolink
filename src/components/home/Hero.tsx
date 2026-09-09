"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { ButtonLink } from "@/components/ui/Button";
import { PredictiveSearch } from "@/components/home/PredictiveSearch";

const stats = [
  { value: "500+", label: "Boutiques locales" },
  { value: "12", label: "Villes couvertes" },
  { value: "100%", label: "Made in Burkina" },
];

export function Hero({ shops }: { shops: ShopWithProducts[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-faso-radial" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-faso-red/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-48 h-72 w-72 rounded-full bg-faso-green/10 blur-3xl" />

      <div className="container-faso relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-ink-soft backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-faso-gold" />
            La marketplace du savoir-faire burkinabè
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            FasoLink —{" "}
            <span className="text-gradient-faso">Consommer Burkinabè</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-5 max-w-xl text-lg text-ink-soft"
          >
            Découvrez, contactez et soutenez les commerçants, artisans et
            producteurs du Burkina Faso. Une vitrine digitale premium, un clic
            vers WhatsApp.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-8 max-w-xl"
          >
            <PredictiveSearch shops={shops} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <ButtonLink href="/#explorer" size="lg" variant="primary">
              Explorer les boutiques
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="/vendeur/inscription" size="lg" variant="outline">
              Vendre sur FasoLink
            </ButtonLink>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-extrabold text-ink">{s.value}</dt>
                <dd className="text-xs text-ink-muted">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="card-premium overflow-hidden p-0 shadow-premium-lg">
            <div className="relative h-64 bg-faso-gradient bg-[length:200%_200%] animate-gradient-pan sm:h-80">
              <div className="absolute inset-0 grid place-items-center">
                <svg
                  viewBox="0 0 24 24"
                  className="h-24 w-24 text-white/90 drop-shadow"
                  fill="currentColor"
                >
                  <path d="M12 2l2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 14.77l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L12 2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-faso-green" />
                Boutiques vérifiées & géolocalisées
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <MapPin className="h-4 w-4 text-faso-red" />
                Ouagadougou · Bobo-Dioulasso · Koudougou…
              </div>
              <Link
                href="/inscription"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-faso-red hover:gap-2 transition-all"
              >
                Rejoindre la communauté
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
