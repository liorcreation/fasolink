"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  MapPin,
  MoveUpRight,
  Sparkles,
  Store,
} from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { CATEGORY_MAP } from "@/lib/constants";
import { formatCFA } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "@/components/site/Logo";
import { PredictiveSearch } from "@/components/home/PredictiveSearch";

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export function Hero({ shops }: { shops: ShopWithProducts[] }) {
  const reduce = useReducedMotion();
  const heroShop =
    shops.find((shop) => shop.is_featured && (shop.cover_url || shop.gallery?.[0])) ??
    shops.find((shop) => shop.cover_url || shop.gallery?.[0]) ??
    shops[0];
  const heroImage = heroShop?.cover_url || heroShop?.gallery?.[0] || null;
  const category = heroShop ? CATEGORY_MAP[heroShop.category] : null;
  const heroProduct = heroShop?.products.find((product) => product.image_url);
  const verifiedCount = shops.filter((shop) => shop.verification_status === "verified").length;
  const cityCount = new Set(shops.map((shop) => shop.city).filter(Boolean)).size;

  return (
    <section className="relative isolate overflow-hidden bg-[#fbf6ef]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-48 -top-40 h-[32rem] w-[32rem] rounded-full bg-[#f1aa47]/15 blur-[110px]" />
        <div className="absolute -right-40 top-12 h-[34rem] w-[34rem] rounded-full bg-[#278c58]/10 blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-clay-200 to-transparent" />
      </div>

      <div className="container-faso grid min-h-[min(760px,calc(100svh-5rem))] items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_0.94fr] lg:gap-16 lg:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.08 } },
          }}
          className="relative z-10"
        >
          <motion.div variants={reveal} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e8d9c7] bg-white/75 px-4 py-2 text-xs font-bold tracking-wide text-ink-soft shadow-[0_8px_24px_-20px_rgba(26,17,9,.35)] backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-faso-green opacity-40 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-faso-green" />
              </span>
              Le savoir-faire burkinabè, tout près de vous
            </span>
          </motion.div>

          <motion.h1
            variants={reveal}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-3xl text-[clamp(3.15rem,8vw,6.3rem)] font-extrabold leading-[0.96] tracking-[-0.065em] text-ink"
          >
            Le meilleur
            <br />
            du Faso,
            <br />
            <span className="relative inline-block pl-[0.08em] text-gradient-faso">
              juste ici.
              <svg className="absolute -bottom-2 left-1 h-3 w-[94%] text-faso-gold/80" viewBox="0 0 300 16" fill="none" aria-hidden="true">
                <path d="M4 11C66 3 178 1 295 8" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8"
          >
            Les bonnes adresses, les beaux produits, les talents d’ici.
            Découvrez les boutiques locales et contactez-les directement —
            simplement, en toute confiance.
          </motion.p>

          <motion.div
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-xl"
          >
            <PredictiveSearch shops={shops} />
          </motion.div>

          <motion.div
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 flex flex-col gap-3 min-[420px]:flex-row"
          >
            <ButtonLink href="/#explorer" size="lg" variant="primary" className="group shadow-[0_14px_30px_-16px_rgba(215,38,42,.72)]">
              Découvrir les boutiques <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink href="/vendeur/inscription" size="lg" variant="outline" className="border-clay-300 bg-white/65">
              <Store className="h-4 w-4" /> Vendre sur FasoLink
            </ButtonLink>
          </motion.div>

          <motion.div
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-clay-200/80 pt-5"
          >
            <Stat value={shops.length.toLocaleString("fr-FR")} label="boutiques à découvrir" />
            <span className="hidden h-8 w-px bg-clay-200 min-[420px]:block" />
            <Stat value={cityCount.toLocaleString("fr-FR")} label="villes représentées" />
            <span className="hidden h-8 w-px bg-clay-200 min-[650px]:block" />
            <Stat value={verifiedCount.toLocaleString("fr-FR")} label="vendeurs vérifiés" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[590px] lg:ml-auto"
        >
          <div aria-hidden className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-faso-gold/20 via-transparent to-faso-green/15 blur-2xl" />
          <div className="relative grid grid-cols-[1fr_0.58fr] grid-rows-[minmax(0,1fr)_auto] gap-3 sm:gap-4">
            <Link
              href={heroShop ? `/boutiques/${heroShop.id}` : "/#explorer"}
              className="group relative col-span-2 min-h-[370px] overflow-hidden rounded-[2rem] border border-white/70 bg-[#d8a55f] shadow-[0_35px_90px_-42px_rgba(26,17,9,.6)] sm:min-h-[480px] lg:col-span-1 lg:row-span-2"
            >
              {heroImage ? (
                <Image src={heroImage} alt={heroShop?.name ?? "Boutique locale FasoLink"} fill priority sizes="(max-width: 1024px) 90vw, 44vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#efbd72,transparent_38%),linear-gradient(145deg,#d74222,#c98716_55%,#267a4b)]">
                  <LogoMark mono className="h-28 w-28 text-white drop-shadow-xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#17120e]/85 via-[#17120e]/5 to-[#17120e]/10" />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                {category && <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-ink shadow-lg backdrop-blur">{category.label}</span>}
                {heroShop?.verification_status === "verified" && <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-faso-green-dark shadow-lg backdrop-blur"><BadgeCheck className="h-3.5 w-3.5" /> Vérifiée</span>}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-white/80"><MapPin className="h-3.5 w-3.5" />{heroShop?.city ?? "Partout au Burkina Faso"}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-faso-gold">À découvrir</p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{heroShop?.name ?? "Les talents du Faso"}</h2>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-ink transition-transform group-hover:rotate-45"><MoveUpRight className="h-5 w-5" /></span>
                </div>
              </div>
            </Link>

            <motion.div
              animate={reduce ? undefined : { y: [0, -7, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative col-span-1 min-h-[156px] overflow-hidden rounded-[1.5rem] border border-white/75 bg-white shadow-[0_24px_55px_-35px_rgba(26,17,9,.55)] sm:min-h-[210px] lg:col-span-1"
            >
              {heroProduct?.image_url ? (
                <Image src={heroProduct.image_url} alt={heroProduct.name} fill sizes="(max-width: 640px) 42vw, 200px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(145deg,#f8e9d1,#f2c86f)]"><Sparkles className="h-10 w-10 text-faso-red" /></div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-3 pt-10 text-white sm:p-4 sm:pt-12">
                <p className="line-clamp-1 text-xs font-bold">{heroProduct?.name ?? "Le goût des belles découvertes"}</p>
                {heroProduct && <p className="mt-0.5 text-[11px] font-semibold text-faso-gold">{formatCFA(heroProduct.price)}</p>}
              </div>
            </motion.div>

            <motion.div
              animate={reduce ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
              className="relative col-span-1 flex min-h-[156px] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-[#1d2921] p-4 text-white shadow-[0_24px_55px_-35px_rgba(26,17,9,.65)] sm:min-h-[210px] sm:p-5"
            >
              <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/10" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-faso-green text-white"><BadgeCheck className="h-5 w-5" /></div>
              <div className="relative">
                <p className="text-3xl font-extrabold tracking-tight">{verifiedCount.toLocaleString("fr-FR")}</p>
                <p className="mt-1 text-xs leading-5 text-white/70">vendeurs vérifiés, proches de vous</p>
                <Link href="/#explorer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-faso-gold hover:gap-2">Explorer <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </motion.div>
          </div>

          <Link href="/#explorer" className="mx-auto mt-5 hidden w-fit items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-ink-muted transition-colors hover:text-faso-red lg:flex">
            Faire défiler pour découvrir <ArrowDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{value}</dt>
      <dd className="mt-0.5 text-[11px] font-medium text-ink-muted sm:text-xs">{label}</dd>
    </div>
  );
}
