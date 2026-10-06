"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AudioLines,
  Check,
  Laptop,
  MapPin,
  PackageSearch,
  Search,
  Smartphone,
  Sparkles,
  Store,
  Watch,
  X,
} from "lucide-react";
import type { Product, ShopWithProducts } from "@/lib/database.types";
import { ProductCard } from "@/components/shops/ProductCard";
import { usePublicShopsRealtime } from "@/components/shops/PublicShopsRealtime";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "Tout le catalogue", icon: Sparkles },
  { id: "telephone", label: "Téléphones", icon: Smartphone },
  { id: "ordinateur", label: "Ordinateurs", icon: Laptop },
  { id: "audio", label: "Audio", icon: AudioLines },
  { id: "accessoire", label: "Accessoires", icon: Watch },
] as const;

type ProductFamily = (typeof FILTERS)[number]["id"];
type AvailabilityFilter = "all" | Product["availability"];
type ProductHit = { product: Product; shop: ShopWithProducts };

function getProductFamily(product: Product): Exclude<ProductFamily, "all"> {
  const text = `${product.name} ${product.description ?? ""}`.toLocaleLowerCase("fr");
  if (/téléphone|telephone|smartphone|iphone|galaxy|redmi|pixel|tecno|infinix/.test(text)) return "telephone";
  if (/ordinateur|portable|laptop|macbook|pc |imprimante|tablette|chromebook/.test(text)) return "ordinateur";
  if (/écouteur|ecouteur|casque|enceinte|bluetooth|audio|micro|airpods/.test(text)) return "audio";
  return "accessoire";
}

function availabilityLabel(value: AvailabilityFilter) {
  if (value === "in_stock") return "En stock";
  if (value === "on_order") return "Sur commande";
  if (value === "out_of_stock") return "Indisponible";
  return "Toutes disponibilités";
}

export function ProductsCatalog({ initialShops }: { initialShops: ShopWithProducts[] }) {
  const reduceMotion = useReducedMotion();
  const shops = usePublicShopsRealtime(initialShops);
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<ProductFamily>("all");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [shopId, setShopId] = useState("all");

  const catalog = useMemo<ProductHit[]>(() => shops
    .flatMap((shop) => shop.products.map((product) => ({ product, shop })))
    .sort((a, b) => Number(a.product.availability === "out_of_stock") - Number(b.product.availability === "out_of_stock") || b.product.updated_at.localeCompare(a.product.updated_at)), [shops]);

  const shopOptions = useMemo(() => shops
    .filter((shop) => shop.products.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "fr")), [shops]);

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return catalog.filter(({ product, shop }) => {
      const matchesQuery = !normalizedQuery || `${product.name} ${product.description ?? ""} ${shop.name} ${shop.city}`.toLocaleLowerCase("fr").includes(normalizedQuery);
      const matchesFamily = family === "all" || getProductFamily(product) === family;
      const matchesAvailability = availability === "all" || product.availability === availability;
      const matchesShop = shopId === "all" || shop.id === shopId;
      return matchesQuery && matchesFamily && matchesAvailability && matchesShop;
    });
  }, [availability, catalog, family, query, shopId]);

  const hasFilters = Boolean(query.trim()) || family !== "all" || availability !== "all" || shopId !== "all";
  const clearFilters = () => {
    setQuery("");
    setFamily("all");
    setAvailability("all");
    setShopId("all");
  };

  return (
    <div className="relative overflow-hidden">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-ink px-5 py-10 text-white shadow-premium-lg sm:rounded-[2.75rem] sm:px-8 sm:py-14 lg:px-14 lg:py-20">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-faso-red/35 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-36 left-1/3 h-96 w-96 rounded-full bg-faso-green/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-faso-gold-soft backdrop-blur-sm">
            <PackageSearch className="h-3.5 w-3.5" aria-hidden="true" /> Catalogue FasoLink
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-[1.02] tracking-[-.055em] sm:text-5xl lg:text-7xl">
            La tech du Faso,<br /><span className="text-faso-gold">à portée de main.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
            Tous les téléphones, ordinateurs et accessoires publiés par les boutiques tech vérifiées de FasoLink. Comparez les offres et échangez directement avec le vendeur.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-bold text-white/65">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2"><Sparkles className="h-4 w-4 text-faso-gold" /> {catalog.length} produit{catalog.length === 1 ? "" : "s"} disponible{catalog.length === 1 ? "" : "s"}</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2"><Store className="h-4 w-4 text-faso-green-soft" /> {shops.length} boutique{shops.length === 1 ? "" : "s"} tech</span>
          </div>
        </div>
      </section>

      <section className="relative -mt-6 px-3 sm:-mt-8 sm:px-8 lg:px-14" aria-label="Rechercher dans les produits">
        <div className="rounded-[1.5rem] border border-clay-100 bg-[#fffdfa]/95 p-3 shadow-premium-lg backdrop-blur-xl sm:rounded-[2rem] sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex min-h-12 flex-1 items-center rounded-xl border border-clay-200 bg-white px-4 transition-colors focus-within:border-faso-gold focus-within:ring-2 focus-within:ring-faso-gold/15">
              <Search className="mr-3 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="sr-only">Rechercher</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un téléphone, un ordinateur, une boutique..." className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink-muted/70" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche" className="grid h-8 w-8 place-items-center rounded-full text-ink-muted transition hover:bg-clay-50 hover:text-ink"><X className="h-4 w-4" /></button>}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
              <label className="sr-only" htmlFor="product-availability">Disponibilité</label>
              <select id="product-availability" value={availability} onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)} className="min-h-11 rounded-xl border border-clay-200 bg-white px-3 text-xs font-bold text-ink outline-none transition focus:border-faso-gold focus:ring-2 focus:ring-faso-gold/15">
                {(["all", "in_stock", "on_order", "out_of_stock"] as const).map((value) => <option key={value} value={value}>{availabilityLabel(value)}</option>)}
              </select>
              <label className="sr-only" htmlFor="product-shop">Boutique</label>
              <select id="product-shop" value={shopId} onChange={(event) => setShopId(event.target.value)} className="min-h-11 min-w-0 rounded-xl border border-clay-200 bg-white px-3 text-xs font-bold text-ink outline-none transition focus:border-faso-gold focus:ring-2 focus:ring-faso-gold/15 sm:max-w-48">
                <option value="all">Toutes les boutiques</option>
                {shopOptions.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
              </select>
              {hasFilters && <button type="button" onClick={clearFilters} className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-xs font-extrabold text-white transition hover:bg-faso-green-dark sm:col-span-1"><X className="h-3.5 w-3.5" /> Réinitialiser</button>}
            </div>
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrer par famille de produits">
            {FILTERS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setFamily(id)} aria-pressed={family === id} className={cn("inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-xs font-extrabold transition-all", family === id ? "border-ink bg-ink text-white shadow-md" : "border-clay-200 bg-white text-ink-soft hover:border-faso-gold hover:text-ink")}>
                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-14" aria-live="polite">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker"><Sparkles className="h-3.5 w-3.5" /> Sélection actuelle</p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-[-.04em] text-ink sm:text-3xl">Les offres qui vous attendent</h2>
          </div>
          <p className="text-sm font-semibold text-ink-muted">{visible.length} résultat{visible.length === 1 ? "" : "s"}</p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {visible.length > 0 ? (
            <motion.div key="results" initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {visible.map(({ product, shop }, index) => <ProductCard key={`${shop.id}-${product.id}`} product={product} shopName={shop.name} shopId={shop.id} whatsapp={shop.whatsapp} index={index} />)}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 rounded-[2rem] border border-dashed border-clay-200 bg-clay-50/70 px-6 py-16 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-faso-gold-dark shadow-premium"><PackageSearch className="h-7 w-7" /></span>
              <h3 className="mt-5 text-xl font-extrabold text-ink">Aucun produit trouvé</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">Modifiez votre recherche ou réinitialisez les filtres pour parcourir toutes les offres tech disponibles.</p>
              {hasFilters && <button type="button" onClick={clearFilters} className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-extrabold text-white transition hover:bg-faso-green-dark"><Check className="h-4 w-4" /> Voir tout le catalogue</button>}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="mb-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-ink-muted"><MapPin className="h-4 w-4 text-faso-red" /> Des vendeurs tech proches de vous, au Burkina Faso.</div>
      <Link href="/boutiques" className="mx-auto mb-12 flex w-fit items-center gap-2 rounded-full border border-clay-200 bg-white px-5 py-3 text-sm font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-faso-gold hover:shadow-premium">Voir les boutiques <Store className="h-4 w-4" /></Link>
    </div>
  );
}
