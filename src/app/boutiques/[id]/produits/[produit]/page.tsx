import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, MapPin, MessageCircle, ShieldCheck, Sparkles, Star, Store } from "lucide-react";
import { fetchProduct } from "@/lib/shops";
import { CATEGORY_MAP } from "@/lib/constants";
import { formatCFA } from "@/lib/utils";
import { AvailabilityBadge } from "@/components/shops/AvailabilityBadge";
import { VerifiedBadge } from "@/components/shops/VerifiedBadge";
import { OpenStatus } from "@/components/shops/OpenStatus";
import { WhatsAppButton } from "@/components/shops/WhatsAppButton";
import { StickyContactBar } from "@/components/shops/StickyContactBar";
import { ShopStatusWatcher } from "@/components/shops/ShopStatusWatcher";
import { Reveal } from "@/components/ui/Reveal";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string; produit: string };
}): Promise<Metadata> {
  const data = await fetchProduct(params.id, params.produit);
  if (!data) return { title: "Produit introuvable" };
  return {
    title: `${data.product.name} — ${data.shop.name}`,
    description:
      data.product.description ??
      `${data.product.name} chez ${data.shop.name}, ${data.shop.city}.`,
    openGraph: {
      title: `${data.product.name} · ${data.shop.name}`,
      images: data.product.image_url ? [data.product.image_url] : undefined,
    },
  };
}

export default async function ProduitPage({
  params,
}: {
  params: { id: string; produit: string };
}) {
  const data = await fetchProduct(params.id, params.produit);
  if (!data) notFound();
  const { shop, product } = data;
  const cat = CATEGORY_MAP[shop.category];

  const others = shop.products.filter((p) => p.id !== product.id).slice(0, 6);

  return (
    <div className="container-faso py-5 pb-[calc(4rem+env(safe-area-inset-bottom)+6rem)] sm:py-8 md:pb-16">
      <ShopStatusWatcher shopId={shop.id} />
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d’Ariane" className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-ink-muted sm:text-xs">
        <Link href="/" className="shrink-0 transition hover:text-faso-red">
          Boutiques
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/boutiques/${shop.id}`} className="max-w-[34vw] truncate transition hover:text-faso-red sm:max-w-none">
          {shop.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span aria-current="page" className="truncate font-bold text-ink">{product.name}</span>
      </nav>

      <div className="mt-5 grid items-start gap-7 lg:mt-8 lg:grid-cols-[1.04fr_.96fr] lg:gap-10 xl:gap-14">
        {/* Visuel */}
        <Reveal className="lg:sticky lg:top-24">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-[1.8rem] border border-clay-200/70 bg-[radial-gradient(ellipse_at_50%_35%,#fff,#f5efe5_74%)] shadow-[0_20px_65px_rgba(48,34,20,.1)] sm:aspect-square sm:rounded-[2.2rem]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,.5),transparent_44%,rgba(220,166,55,.08))]" />
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-[1.035] sm:p-9"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center"><span className="grid h-24 w-24 place-items-center rounded-[2rem] bg-white/80 text-faso-gold-dark shadow-premium"><Store className="h-10 w-10" /></span></div>
            )}
            <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
              <AvailabilityBadge status={product.availability} />
            </div>
            <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.13em] text-ink-soft shadow-sm backdrop-blur-md sm:right-6 sm:top-6"><Sparkles className="h-3.5 w-3.5 text-faso-gold-dark" />{product.image_source_url ? "Photo illustrative" : "Sélection locale"}</div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
              <span className="rounded-2xl border border-white/70 bg-white/85 px-3.5 py-2.5 shadow-lg backdrop-blur-xl"><span className="block text-[9px] font-extrabold uppercase tracking-[.16em] text-ink-muted">Proposé par</span><span className="mt-0.5 block max-w-[58vw] truncate text-xs font-bold text-ink sm:max-w-xs">{shop.name}</span></span>
              <Link href={`/boutiques/${shop.id}`} aria-label={`Découvrir la boutique ${shop.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/70 bg-white/90 text-ink shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:text-faso-red"><ArrowUpRightIcon /></Link>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 px-1 text-[10px] font-semibold text-ink-muted sm:mt-4 sm:text-xs"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-faso-green" /> Achat en direct auprès du commerçant</span><span className="hidden sm:inline">Burkina Faso · FasoLink</span></div>
          {product.image_credit && (product.image_source_url?.startsWith("https://commons.wikimedia.org/") || product.image_source_url?.startsWith("https://www.pexels.com/") || product.image_source_url?.startsWith("https://pexels.com/")) && (
            <p className="mt-2 px-1 text-[10px] leading-4 text-ink-muted">
              Photo illustrative · {product.image_credit} · {product.image_license || "Licence"}{product.image_license_url?.startsWith("https://") && <> · <a href={product.image_license_url} target="_blank" rel="noreferrer" className="underline underline-offset-2">Licence</a></>}{" · "}<a href={product.image_source_url} target="_blank" rel="noreferrer" className="underline underline-offset-2">Source</a>
            </p>
          )}
        </Reveal>

        {/* Infos */}
        <Reveal delay={0.05} className="flex flex-col lg:pt-2">
          <Link href={`/boutiques/${shop.id}`} className="group inline-flex w-fit items-center gap-2 rounded-full border border-clay-200 bg-white px-3.5 py-2 text-[11px] font-bold text-ink-soft shadow-sm transition hover:border-faso-gold hover:text-ink"><ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />Retour à la boutique</Link>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-faso-red-soft/35 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-faso-red-dark"><cat.icon className="h-3.5 w-3.5" />{cat.label}</span>
            {shop.verification_status === "verified" && <VerifiedBadge label="Vendeur vérifié" />}
          </div>
          <h1 className="mt-3 text-[2rem] font-black leading-[1.08] tracking-[-.045em] text-ink sm:text-4xl lg:text-[2.8rem]">{product.name}</h1>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 rounded-[1.5rem] border border-faso-gold/20 bg-[linear-gradient(120deg,rgba(249,241,219,.72),rgba(255,255,255,.92))] p-4 sm:p-5">
            <div><p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-ink-muted">Prix affiché par le vendeur</p><p className="mt-1 text-3xl font-black tracking-tight text-faso-green-dark sm:text-4xl">{formatCFA(product.price)}</p></div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-2 text-[10px] font-bold text-ink-soft shadow-sm"><CheckCircle2 className="h-3.5 w-3.5 text-faso-green" />Échange direct</span>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-clay-200/75 bg-white p-5 shadow-[0_8px_26px_rgba(51,37,23,.035)] sm:p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-faso-red">À propos de ce produit</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-ink-soft">{product.description || "Contactez directement la boutique pour en savoir plus sur ce produit, ses caractéristiques et sa disponibilité."}</p>
          </div>

          {/* Carte boutique */}
          <Link href={`/boutiques/${shop.id}`} className="group mt-4 flex items-center gap-3 rounded-[1.4rem] border border-clay-200/75 bg-white p-3.5 shadow-[0_8px_26px_rgba(51,37,23,.035)] transition duration-200 hover:-translate-y-0.5 hover:border-faso-gold/60 hover:shadow-premium sm:gap-4 sm:p-4">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-faso-gradient text-lg font-black text-white shadow-sm sm:h-14 sm:w-14">
              {shop.logo_url ? <Image src={shop.logo_url} alt="" fill sizes="56px" className="object-cover" /> : shop.name.trim().charAt(0).toLocaleUpperCase("fr")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-ink"><span className="truncate">{shop.name}</span>{shop.verification_status === "verified" && <VerifiedBadge label="Vérifié" className="shrink-0" />}</span>
              <span className="mt-1 flex items-center gap-1 text-xs text-ink-muted"><MapPin className="h-3.5 w-3.5 shrink-0 text-faso-red" /><span className="truncate">{cat.label} · {shop.neighborhood ? `${shop.neighborhood}, ` : ""}{shop.city}</span></span>
              <span className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-faso-green-dark"><Star className="h-3 w-3 fill-faso-gold text-faso-gold" />{shop.rating.toFixed(1)} · {shop.rating_count} avis</span>
            </span>
            <span className="hidden shrink-0 sm:block"><OpenStatus hours={shop.opening_hours} compact /></span>
            <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-faso-red" />
          </Link>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
            <ProductPromise icon={<ShieldCheck className="h-4 w-4" />} title="Vendeur identifié" detail="Vitrine FasoLink" />
            <ProductPromise icon={<MessageCircle className="h-4 w-4" />} title="Questions directes" detail="Prix & disponibilité" />
          </div>

          {/* CTA desktop (le mobile a la barre collante) */}
          <div className="mt-5 hidden md:block">
            <WhatsAppButton phone={shop.whatsapp} shopName={shop.name} shopId={shop.id} productId={product.id} productName={product.name} price={product.price} label={product.availability === "out_of_stock" ? "Demander la disponibilité" : "Commander sur WhatsApp"} className="w-full justify-center rounded-full" />
            <p className="mt-2 text-center text-[10px] text-ink-muted">Vous échangez directement avec le commerçant, sans intermédiaire.</p>
          </div>
        </Reveal>
      </div>

      {/* Autres produits */}
      {others.length > 0 && (
        <Reveal as="section" className="mt-14 sm:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-faso-red">Continuer l’exploration</p><h2 className="mt-1.5 text-2xl font-black tracking-tight text-ink sm:text-3xl">D’autres pépites de {shop.name}</h2><p className="mt-1 text-sm text-ink-muted">À découvrir dans la même boutique.</p></div><Link href={`/boutiques/${shop.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-faso-red hover:underline">Voir la vitrine <ArrowRight className="h-3.5 w-3.5" /></Link></div>
          <div className="snap-row no-scrollbar -mx-5 mt-5 flex gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0">
            {others.map((p) => (
              <Link
                key={p.id}
                href={`/boutiques/${shop.id}/produits/${p.id}`}
                className="snap-item group w-44 shrink-0 overflow-hidden rounded-[1.4rem] border border-clay-200/75 bg-white shadow-[0_7px_25px_rgba(51,37,23,.045)] transition duration-200 hover:-translate-y-1 hover:border-faso-gold/40 hover:shadow-premium sm:w-52"
              >
                <div className="relative aspect-[1.12] overflow-hidden bg-clay-50">
                  {p.image_url && (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="160px"
                      className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute left-2 top-2"><AvailabilityBadge status={p.availability} /></span>
                </div>
                <div className="p-3"><p className="line-clamp-1 text-sm font-bold text-ink group-hover:text-faso-red">{p.name}</p><p className="mt-1 text-sm font-extrabold text-faso-green-dark">{formatCFA(p.price)}</p></div>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      <StickyContactBar
        shopId={shop.id}
        shopName={shop.name}
        whatsapp={shop.whatsapp}
        productId={product.id}
        aboutName={product.name}
        priceLabel={formatCFA(product.price)}
      />
    </div>
  );
}

function ProductPromise({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return <div className="flex items-center gap-2.5 rounded-2xl border border-clay-200/65 bg-white/80 p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-faso-green-soft/35 text-faso-green-dark">{icon}</span><span className="min-w-0"><span className="block truncate text-[10px] font-extrabold text-ink sm:text-xs">{title}</span><span className="mt-0.5 block truncate text-[9px] text-ink-muted sm:text-[10px]">{detail}</span></span></div>;
}

function ArrowUpRightIcon() {
  return <ArrowRight className="h-4 w-4 -rotate-45" />;
}
