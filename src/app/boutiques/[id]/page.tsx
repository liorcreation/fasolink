import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Package, Star } from "lucide-react";
import { fetchShopById } from "@/lib/shops";
import { CATEGORY_MAP } from "@/lib/constants";
import { buildWhatsAppLink, formatPhoneBF } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppButton } from "@/components/shops/WhatsAppButton";
import { ProductCard } from "@/components/shops/ProductCard";
import { ShopGallery } from "@/components/shops/ShopGallery";
import { ReviewsSection } from "@/components/shops/ReviewsSection";
import { OpenStatus } from "@/components/shops/OpenStatus";
import { VerifiedBadge } from "@/components/shops/VerifiedBadge";
import { StickyContactBar } from "@/components/shops/StickyContactBar";
import { PublishedToast } from "@/components/shops/PublishedToast";
import { Reveal } from "@/components/ui/Reveal";

// Cloudflare Pages : rendu Edge à la demande — les boutiques créées après le
// déploiement (via /vendeur/inscription) ont immédiatement leur page, fraîche.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const shop = await fetchShopById(params.id);
  if (!shop) return { title: "Boutique introuvable" };
  return {
    title: shop.name,
    description: shop.description,
    openGraph: {
      title: `${shop.name} · FasoLink`,
      description: shop.description,
      images: shop.cover_url ? [shop.cover_url] : undefined,
    },
  };
}

export default async function BoutiquePage({
  params,
}: {
  params: { id: string };
}) {
  const shop = await fetchShopById(params.id);
  if (!shop) notFound();

  const cat = CATEGORY_MAP[shop.category];
  const CatIcon = cat.icon;

  return (
    <div>
      <Suspense fallback={null}>
        <PublishedToast />
      </Suspense>

      {/* Cover */}
      <div className="relative h-64 w-full overflow-hidden bg-clay-200 sm:h-80 md:h-96">
        {shop.cover_url && (
          <Image
            src={shop.cover_url}
            alt={`Boutique ${shop.name}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
        <div className="container-faso relative flex h-full flex-col justify-between py-5">
          <Link
            href="/#explorer"
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/25"
          >
            <ArrowLeft className="h-4 w-4" />
            Toutes les boutiques
          </Link>
        </div>
      </div>

      <div className="container-faso">
        {/* En-tête boutique */}
        <div className="relative -mt-16 flex flex-col gap-5 rounded-4xl border border-clay-100 bg-white p-6 shadow-premium-lg md:-mt-20 md:flex-row md:items-end md:p-8">
          {shop.logo_url && (
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-premium md:h-28 md:w-28">
              <Image
                src={shop.logo_url}
                alt=""
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cat.accent}>
                <CatIcon className="h-3.5 w-3.5" />
                {cat.label}
              </Badge>
              {shop.verification_status === "verified" && <VerifiedBadge />}
              <OpenStatus hours={shop.opening_hours} />
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              {shop.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {shop.neighborhood ? `${shop.neighborhood}, ` : ""}
                {shop.city}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-faso-gold text-faso-gold" />
                {shop.rating.toFixed(1)} ({shop.rating_count} avis)
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                {shop.products.length} produits
              </span>
              <a
                href={buildWhatsAppLink(shop.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-faso-green-dark hover:underline"
              >
                <MessageCircle className="h-4 w-4" />
                {formatPhoneBF(shop.whatsapp)}
              </a>
            </div>
          </div>

          <div className="md:shrink-0">
            <WhatsAppButton
              phone={shop.whatsapp}
              shopName={shop.name}
              shopId={shop.id}
            />
          </div>
        </div>

        {/* Description */}
        <Reveal className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-lg font-bold text-ink">À propos</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">
            {shop.description}
          </p>
        </Reveal>

        {/* Produits */}
        <section className="mt-14">
          <Reveal>
            <h2 className="text-2xl font-bold text-ink">Nos produits</h2>
          </Reveal>
          {shop.products.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {shop.products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  shopName={shop.name}
                  shopId={shop.id}
                  whatsapp={shop.whatsapp}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-clay-200 p-8 text-center text-sm text-ink-muted">
              Cette boutique n&apos;a pas encore publié de produit.
            </p>
          )}
        </section>

        {/* Galerie */}
        {shop.gallery.length > 0 && (
          <section className="mt-14">
            <Reveal>
              <h2 className="text-2xl font-bold text-ink">En images</h2>
            </Reveal>
            <div className="mt-6">
              <ShopGallery images={shop.gallery} />
            </div>
          </section>
        )}

        {/* Avis clients */}
        <section className="mt-14">
          <Reveal>
            <h2 className="text-2xl font-bold text-ink">Avis clients</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Notes déposées uniquement après un contact vérifié via FasoLink.
            </p>
          </Reveal>
          <div className="mt-6">
            <ReviewsSection
              shopId={shop.id}
              shopName={shop.name}
              initialReviews={shop.reviews ?? []}
            />
          </div>
        </section>

        {/* CTA bas de page */}
        <section className="mt-16 mb-28 md:mb-16">
          <div className="flex flex-col items-center gap-4 rounded-4xl bg-faso-gradient bg-[length:200%_200%] p-8 text-center text-white shadow-premium-lg animate-gradient-pan md:p-12">
            <h2 className="text-2xl font-bold md:text-3xl">
              Une question sur {shop.name} ?
            </h2>
            <p className="max-w-md text-white/90">
              Échangez directement avec le commerçant sur WhatsApp — prix,
              disponibilité, livraison dans votre quartier.
            </p>
            <WhatsAppButton
              phone={shop.whatsapp}
              shopName={shop.name}
              shopId={shop.id}
              className="bg-white text-[#128C7E] hover:bg-white/90"
            />
          </div>
        </section>
      </div>

      <StickyContactBar
        shopId={shop.id}
        shopName={shop.name}
        whatsapp={shop.whatsapp}
        aboutName={
          shop.category === "services" ? "vos services" : "votre boutique"
        }
      />
    </div>
  );
}
