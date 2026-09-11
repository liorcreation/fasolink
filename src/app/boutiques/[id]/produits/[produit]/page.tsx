import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, MapPin, Store } from "lucide-react";
import { fetchProduct } from "@/lib/shops";
import { CATEGORY_MAP } from "@/lib/constants";
import { formatCFA } from "@/lib/utils";
import { AvailabilityBadge } from "@/components/shops/AvailabilityBadge";
import { VerifiedBadge } from "@/components/shops/VerifiedBadge";
import { OpenStatus } from "@/components/shops/OpenStatus";
import { WhatsAppButton } from "@/components/shops/WhatsAppButton";
import { StickyContactBar } from "@/components/shops/StickyContactBar";
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
    <div className="container-faso py-6 pb-[calc(4rem+env(safe-area-inset-bottom)+6rem)] md:py-10 md:pb-16">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Link href="/#explorer" className="hover:text-ink">
          Boutiques
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/boutiques/${shop.id}`} className="hover:text-ink">
          {shop.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate font-semibold text-ink">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        {/* Visuel */}
        <Reveal>
          <div className="relative aspect-square overflow-hidden rounded-4xl border border-clay-100 bg-clay-100">
            {product.image_url && (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            )}
            <div className="absolute left-4 top-4">
              <AvailabilityBadge status={product.availability} />
            </div>
          </div>
        </Reveal>

        {/* Infos */}
        <Reveal delay={0.05} className="flex flex-col">
          <Link
            href={`/boutiques/${shop.id}`}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-faso-red hover:gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à {shop.name}
          </Link>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-extrabold text-faso-green">
            {formatCFA(product.price)}
          </p>

          {product.description && (
            <p className="mt-4 leading-relaxed text-ink-soft">
              {product.description}
            </p>
          )}

          {/* Carte boutique */}
          <Link
            href={`/boutiques/${shop.id}`}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-clay-100 bg-white p-3 transition-colors hover:border-faso-gold"
          >
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-clay-100">
              {shop.logo_url ? (
                <Image
                  src={shop.logo_url}
                  alt=""
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store className="m-auto mt-3 h-5 w-5 text-ink-muted" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
                {shop.name}
                {shop.verification_status === "verified" && (
                  <VerifiedBadge label="Vérifié" />
                )}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                <MapPin className="h-3.5 w-3.5" />
                {cat.label} · {shop.city}
              </span>
            </span>
            <OpenStatus hours={shop.opening_hours} compact />
          </Link>

          {/* CTA desktop (le mobile a la barre collante) */}
          <div className="mt-6 hidden md:block">
            <WhatsAppButton
              phone={shop.whatsapp}
              shopName={shop.name}
              shopId={shop.id}
              productId={product.id}
              productName={product.name}
              price={product.price}
            />
          </div>
        </Reveal>
      </div>

      {/* Autres produits */}
      {others.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-ink">
            Autres produits de {shop.name}
          </h2>
          <div className="snap-row no-scrollbar -mx-5 mt-5 flex gap-4 overflow-x-auto px-5 pb-2">
            {others.map((p) => (
              <Link
                key={p.id}
                href={`/boutiques/${shop.id}/produits/${p.id}`}
                className="snap-item group w-40 shrink-0"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-clay-100 bg-clay-100">
                  {p.image_url && (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-semibold text-ink">
                  {p.name}
                </p>
                <p className="text-sm font-bold text-faso-green">
                  {formatCFA(p.price)}
                </p>
              </Link>
            ))}
          </div>
        </section>
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
