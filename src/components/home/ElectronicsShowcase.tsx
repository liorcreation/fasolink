"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, AudioLines, Laptop, Smartphone, Sparkles, Watch } from "lucide-react";
import type { Product, ShopWithProducts } from "@/lib/database.types";
import { ProductCard } from "@/components/shops/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

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
  const catalog = useMemo<ProductHit[]>(() => shops
    .flatMap((shop) => shop.products.map((product) => ({ product, shop })))
    .sort((a, b) => Number(a.product.availability === "out_of_stock") - Number(b.product.availability === "out_of_stock")), [shops]);
  const visible = active === "tout" ? catalog : catalog.filter(({ product }) => getProductFamily(product) === active);

  return (
    <section id="produits" className="relative scroll-mt-24 overflow-hidden bg-white py-16 sm:py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-faso-gold/10 blur-[100px]" />
      <div className="container-faso relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <span className="section-kicker"><Sparkles className="h-3.5 w-3.5" /> Le meilleur de la tech locale</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-.045em] text-ink sm:text-4xl md:text-5xl">Le prochain coup de cœur<br className="hidden sm:block" /> est peut-être ici.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-ink-muted sm:text-base">Des appareils proposés par des boutiques burkinabè. Explorez, vérifiez les détails et contactez le vendeur en direct.</p>
          </Reveal>
          <Link href="/boutiques" className="inline-flex w-fit items-center gap-2 text-sm font-extrabold text-ink transition-colors hover:text-faso-red">Toutes les boutiques tech <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filtrer les produits électroniques">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActive(id)} aria-pressed={active === id}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${active === id ? "border-ink bg-ink text-white shadow-lg" : "border-clay-200 bg-white text-ink-soft hover:border-faso-gold hover:text-ink"}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
          <span className="ml-auto hidden self-center text-xs font-semibold text-ink-muted sm:block">{visible.length} offre{visible.length === 1 ? "" : "s"}</span>
        </div>

        {visible.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {visible.slice(0, 8).map(({ product, shop }, index) => (
              <ProductCard key={`${shop.id}-${product.id}`} product={product} shopName={shop.name} shopId={shop.id} whatsapp={shop.whatsapp} index={index} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[2rem] border border-dashed border-clay-200 bg-clay-50/70 px-6 py-12 text-center">
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
