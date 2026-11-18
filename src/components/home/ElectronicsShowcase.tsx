"use client";

import { useMemo, useState } from "react";
import { AppLink as Link } from "@/components/site/AppLink";
import { ArrowRight, AudioLines, Laptop, Smartphone, Sparkles, Watch } from "lucide-react";
import type { Product, ShopWithProducts } from "@/lib/database.types";
import { ProductCard } from "@/components/shops/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/fx/RevealText";
import { AnimatePresence, motion } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";

const FILTERS = [
  { id: "tout", label: "Tout voir", icon: Sparkles },
  { id: "telephone", label: "Téléphones", icon: Smartphone },
  { id: "ordinateur", label: "Ordinateurs", icon: Laptop },
  { id: "audio", label: "Audio", icon: AudioLines },
  { id: "accessoire", label: "Accessoires", icon: Watch },
] as const;

type ProductHit = { product: Product; shop: ShopWithProducts };
type ProductFilter = (typeof FILTERS)[number]["id"];

function getProductFamily(product: Product): Exclude<ProductFilter, "tout"> {
  const text = `${product.name} ${product.description ?? ""}`.toLocaleLowerCase("fr");
  if (/téléphone|telephone|smartphone|iphone|galaxy|redmi|pixel/.test(text)) return "telephone";
  if (/ordinateur|portable|laptop|macbook|pc |imprimante|tablette/.test(text)) return "ordinateur";
  if (/écouteur|ecouteur|casque|enceinte|bluetooth|audio|micro/.test(text)) return "audio";
  return "accessoire";
}

export function ElectronicsShowcase({ shops }: { shops: ShopWithProducts[] }) {
  const [active, setActive] = useState<ProductFilter>("tout");
  const reduce = useSafeReducedMotion();
  const catalog = useMemo<ProductHit[]>(() => shops
    .flatMap((shop) => shop.products.map((product) => ({ product, shop })))
    .sort((a, b) => Number(a.product.availability === "out_of_stock") - Number(b.product.availability === "out_of_stock")), [shops]);
  const visible = active === "tout" ? catalog : catalog.filter(({ product }) => getProductFamily(product) === active);

  return (
    <section id="produits" className="relative isolate scroll-mt-24 overflow-hidden bg-white py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-faso-gold/10 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-[24rem] w-[24rem] rounded-full bg-faso-green/[.07] blur-[110px]" />
      <div className="container-faso relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <span className="section-kicker"><Sparkles className="h-3.5 w-3.5" /> Le meilleur de la tech locale</span>
            </Reveal>
            <h2 className="fx-display mt-5 text-[clamp(2.3rem,5vw,4rem)] text-ink">
              <RevealText inView text="Le prochain coup de cœur" className="block" />
              <span className="font-serif-accent fx-text-gradient block pb-1 text-[1.08em]">est peut-être ici.</span>
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">Des appareils proposés par des boutiques burkinabè. Explorez, vérifiez les détails et contactez le vendeur en direct.</p>
            </Reveal>
          </div>
          <Link href="/produits" className="group inline-flex w-fit items-center gap-2 rounded-full border border-clay-200 bg-white px-4 py-2.5 text-sm font-extrabold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-premium">
            Tout le catalogue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-full border border-clay-200/80 bg-clay-50/80 p-1 backdrop-blur" role="group" aria-label="Filtrer les produits électroniques">
            {FILTERS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setActive(id)} aria-pressed={active === id}
                className={`relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-colors sm:text-sm ${active === id ? "text-white" : "text-ink-soft hover:text-ink"}`}>
                {active === id && (
                  <motion.span layoutId={reduce ? undefined : "showcase-filter"} className="absolute inset-0 -z-0 rounded-full bg-ink shadow-[0_10px_24px_-12px_rgb(26_17_9/.7)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <Icon className="relative h-4 w-4" /><span className="relative">{label}</span>
              </button>
            ))}
          </div>
          <span className="ml-auto hidden shrink-0 text-xs font-semibold text-ink-muted sm:block" aria-live="polite">{visible.length} offre{visible.length === 1 ? "" : "s"}</span>
        </div>

        {visible.length > 0 ? (
          <motion.div layout={!reduce} className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.slice(0, 8).map(({ product, shop }, index) => (
                <motion.div
                  key={`${shop.id}-${product.id}`}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  <ProductCard product={product} shopName={shop.name} shopId={shop.id} whatsapp={shop.whatsapp} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="mt-6 rounded-[2rem] border border-dashed border-clay-200 bg-clay-50/70 px-6 py-14 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-faso-gold-dark shadow-premium"><Smartphone className="h-6 w-6" /></span>
            <p className="mt-4 text-lg font-extrabold text-ink">Les nouvelles offres arrivent</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">Aucun article de cette catégorie n’est encore publié. Parcourez les autres offres tech ou revenez bientôt.</p>
            <button type="button" onClick={() => setActive("tout")} className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-faso-green-dark">Voir toutes les offres <ArrowRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </section>
  );
}
