import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, Camera, Heart, MapPin, MessageCircle, Package, ShieldCheck, Sparkles, Star } from "lucide-react";
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
import { ShopStatusWatcher } from "@/components/shops/ShopStatusWatcher";
import { Reveal } from "@/components/ui/Reveal";
import { FavoriteButton } from "@/components/shops/FavoriteButton";
import { OwnerShopActions } from "@/components/shops/OwnerShopActions";

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
      <ShopStatusWatcher shopId={shop.id} />
      <Suspense fallback={null}>
        <PublishedToast />
      </Suspense>

      {/* Signature visuelle de la boutique */}
      <div className="relative isolate h-[19rem] w-full overflow-hidden bg-[#241B13] sm:h-[25rem] lg:h-[31rem]">
        {shop.cover_url ? (
          <Image
            src={shop.cover_url}
            alt={`Boutique ${shop.name}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_20%,rgba(220,166,55,.38),transparent_32%),radial-gradient(ellipse_at_15%_90%,rgba(207,39,43,.34),transparent_35%),linear-gradient(125deg,#211810,#45331f_52%,#201810)]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#17120E] via-[#17120E]/20 to-[#17120E]/15" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#17120E]/55 to-transparent" />
        <div className="container-faso relative flex h-full flex-col justify-between py-5 sm:py-7">
          <div className="flex items-center justify-between gap-3">
            <Link href="/boutiques" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 text-xs font-bold text-white shadow-lg backdrop-blur-xl transition hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><ArrowLeft className="h-4 w-4" />Retour aux boutiques</Link>
            <span className="hidden items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/85 backdrop-blur-xl sm:inline-flex"><Sparkles className="h-3.5 w-3.5 text-faso-gold" /> Le savoir-faire d’ici</span>
          </div>
          <div className="mb-14 flex items-end justify-between gap-4 text-white sm:mb-24 lg:mb-32">
            <div className="max-w-xl"><p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-[#F3D88E]">La vitrine officielle</p><p className="mt-2 text-sm text-white/75 sm:text-base">Découvrez une adresse qui fait vivre le talent burkinabè.</p></div>
            {shop.gallery.length > 0 && <a href="#shop-gallery" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-bold text-white backdrop-blur-lg transition hover:bg-white/20"><Camera className="h-4 w-4" /><span className="hidden sm:inline">Voir la galerie</span><span className="sm:hidden">{shop.gallery.length} photos</span></a>}
          </div>
        </div>
      </div>

      <div className="container-faso relative">
        {/* Identité, confiance et actions */}
        <Reveal className="relative -mt-12 rounded-[2rem] border border-white/75 bg-white/95 p-5 shadow-[0_24px_70px_rgba(40,28,18,.14)] backdrop-blur-xl sm:-mt-[4.5rem] sm:p-7 lg:-mt-24 lg:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
            {shop.logo_url ? (
              <div className="relative -mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-[1.6rem] border-[5px] border-white bg-white shadow-[0_14px_36px_rgba(31,21,13,.18)] sm:-mt-16 sm:h-28 sm:w-28 lg:-mt-20 lg:h-32 lg:w-32">
              <Image
                src={shop.logo_url}
                alt=""
                fill
                sizes="128px"
                className="h-full w-full object-cover"
              />
              </div>
            ) : (
              <div className="-mt-12 grid h-24 w-24 shrink-0 place-items-center rounded-[1.6rem] border-[5px] border-white bg-faso-gradient text-3xl font-black text-white shadow-[0_14px_36px_rgba(31,21,13,.18)] sm:-mt-16 sm:h-28 sm:w-28 lg:-mt-20 lg:h-32 lg:w-32" aria-hidden="true">{shop.name.trim().charAt(0).toLocaleUpperCase("fr")}</div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${cat.accent} rounded-full px-3 py-1.5`}><CatIcon className="h-3.5 w-3.5" />{cat.label}</Badge>
                {shop.verification_status === "verified" && <VerifiedBadge label="Adresse vérifiée" />}
                <OpenStatus hours={shop.opening_hours} />
              </div>
              <h1 className="mt-3 text-[2rem] font-black leading-tight tracking-[-.045em] text-ink sm:text-4xl lg:text-[2.7rem]">{shop.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-ink-muted sm:text-sm">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-faso-red" />{shop.neighborhood ? `${shop.neighborhood}, ` : ""}{shop.city}</span>
                <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-faso-gold text-faso-gold" /><strong className="text-ink">{shop.rating.toFixed(1)}</strong> <span>({shop.rating_count} avis)</span></span>
                <span className="inline-flex items-center gap-1.5"><Package className="h-4 w-4 text-faso-red" />{shop.products.length} produit{shop.products.length === 1 ? "" : "s"}</span>
                <a href={buildWhatsAppLink(shop.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-faso-green-dark hover:underline"><MessageCircle className="h-4 w-4" />{formatPhoneBF(shop.whatsapp)}</a>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start lg:self-auto">
              <FavoriteButton shopId={shop.id} />
              <OwnerShopActions ownerId={shop.owner_id} shopId={shop.id} />
              <WhatsAppButton phone={shop.whatsapp} shopName={shop.name} shopId={shop.id} size="sm" label="Contacter" className="h-11 rounded-full px-4 shadow-[0_8px_24px_rgba(37,211,102,.2)]" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-clay-100 pt-4 sm:gap-4">
            <TrustNote icon={<ShieldCheck className="h-4 w-4" />} title="Vitrine FasoLink" detail="Commerce local" />
            <TrustNote icon={<MessageCircle className="h-4 w-4" />} title="Contact direct" detail="Sans intermédiaire" />
            <TrustNote icon={<Heart className="h-4 w-4" />} title="100 % local" detail="Le talent d’ici" />
          </div>
        </Reveal>

        <nav aria-label="Explorer la boutique" className="sticky top-2 z-30 -mx-1 mt-5 flex gap-1 overflow-x-auto rounded-2xl border border-clay-200/75 bg-[#FFFEFC]/90 p-1.5 shadow-[0_8px_28px_rgba(51,37,23,.08)] backdrop-blur-xl sm:mx-0 sm:mt-7 sm:w-fit sm:gap-2 sm:p-2">
          <ShopNavLink href="#shop-products" label="Les produits" count={shop.products.length} />
          {shop.gallery.length > 0 && <ShopNavLink href="#shop-gallery" label="La galerie" count={shop.gallery.length} />}
          <ShopNavLink href="#shop-reviews" label="Les avis" count={shop.rating_count} />
        </nav>

        {/* Description */}
        <Reveal className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-clay-200/75 bg-white p-6 shadow-[0_8px_28px_rgba(51,37,23,.045)] sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-faso-gold/10 blur-3xl" />
            <p className="relative text-[10px] font-extrabold uppercase tracking-[.2em] text-faso-red">Notre histoire</p>
            <h2 className="relative mt-2 text-2xl font-black tracking-tight text-ink">À propos de {shop.name}</h2>
            <p className="relative mt-4 whitespace-pre-line text-sm leading-7 text-ink-soft sm:text-base">{shop.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <InfoTile icon={<MapPin className="h-5 w-5" />} eyebrow="Nous trouver" title={shop.neighborhood ? `${shop.neighborhood}, ${shop.city}` : shop.city} detail="Retrouvez votre commerçant près de chez vous." />
            <InfoTile icon={<BadgeCheck className="h-5 w-5" />} eyebrow="Un échange simple" title="Directement avec la boutique" detail="Disponibilité, prix et livraison : posez vos questions au vendeur." />
          </div>
        </Reveal>

        {/* Produits */}
        <section id="shop-products" className="mt-14 scroll-mt-24 sm:mt-16">
          <Reveal>
            <SectionHeading eyebrow="Sélection de la boutique" title="À découvrir" description="Des produits et services proposés directement par votre commerçant." count={shop.products.length} />
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
            <div className="mt-6 grid justify-items-center rounded-[1.75rem] border border-dashed border-clay-200 bg-white/70 px-6 py-12 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-faso-gold-soft/40 text-faso-gold-dark"><Package className="h-6 w-6" /></span><p className="mt-4 text-sm font-bold text-ink">La sélection se prépare</p><p className="mt-1 max-w-sm text-xs leading-5 text-ink-muted">Cette boutique n&apos;a pas encore publié de produit. Contactez-la pour découvrir ses offres.</p></div>
          )}
        </section>

        {/* Galerie */}
        {shop.gallery.length > 0 && (
          <section id="shop-gallery" className="mt-14 scroll-mt-24 sm:mt-16">
            <Reveal>
              <SectionHeading eyebrow="Dans les coulisses" title="La boutique en images" description="Un aperçu du lieu, des créations et du savoir-faire." count={shop.gallery.length} />
            </Reveal>
            <div className="mt-6">
              <ShopGallery images={shop.gallery} />
            </div>
          </section>
        )}

        {/* Avis clients */}
        <section id="shop-reviews" className="mt-14 scroll-mt-24 sm:mt-16">
          <Reveal>
            <SectionHeading eyebrow="La confiance se partage" title="Les avis de la communauté" description="Notes déposées uniquement après un contact via FasoLink." count={shop.rating_count} />
          </Reveal>
          <div className="mt-6">
            <ReviewsSection
              shopId={shop.id}
              shopName={shop.name}
              ownerId={shop.owner_id}
              initialReviews={shop.reviews ?? []}
            />
          </div>
        </section>

        {/* CTA bas de page */}
        <section className="mt-16 mb-[calc(4rem+env(safe-area-inset-bottom)+6rem)] md:mb-16">
          <div className="relative isolate flex flex-col items-center gap-4 overflow-hidden rounded-[2rem] bg-[#17120E] bg-[length:200%_200%] p-8 text-center text-white shadow-premium-lg animate-gradient-pan md:p-12">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_20%,rgba(220,166,55,.27),transparent_38%),radial-gradient(ellipse_at_15%_110%,rgba(207,39,43,.24),transparent_42%)]" />
            <span className="inline-flex items-center gap-2 rounded-full border border-faso-gold/25 bg-faso-gold/[.08] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.17em] text-[#F3D88E]"><MessageCircle className="h-3.5 w-3.5" /> La conversation commence ici</span>
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">
              Un coup de cœur ? Parlons-en.
            </h2>
            <p className="max-w-md text-sm leading-6 text-white/75">
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

function TrustNote({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return <div className="flex min-w-0 items-center gap-2 sm:gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-faso-gold-soft/35 text-faso-gold-dark sm:h-9 sm:w-9">{icon}</span><span className="min-w-0"><span className="block truncate text-[10px] font-extrabold text-ink sm:text-xs">{title}</span><span className="mt-0.5 hidden truncate text-[10px] text-ink-muted sm:block">{detail}</span></span></div>;
}

function InfoTile({ icon, eyebrow, title, detail }: { icon: ReactNode; eyebrow: string; title: string; detail: string }) {
  return <div className="flex gap-4 rounded-[1.5rem] border border-clay-200/75 bg-white p-5 shadow-[0_8px_28px_rgba(51,37,23,.04)]"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-faso-red-soft/30 text-faso-red">{icon}</span><div><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-ink-muted">{eyebrow}</p><p className="mt-1 text-sm font-extrabold text-ink">{title}</p><p className="mt-1 text-xs leading-5 text-ink-muted">{detail}</p></div></div>;
}

function SectionHeading({ eyebrow, title, description, count }: { eyebrow: string; title: string; description: string; count: number }) {
  return <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-faso-red">{eyebrow}</p><h2 className="mt-1.5 text-2xl font-black tracking-tight text-ink sm:text-3xl">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-ink-muted">{description}</p></div><span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-clay-200 bg-white px-3.5 py-2 text-xs font-bold text-ink-soft"><Package className="h-3.5 w-3.5 text-faso-gold-dark" />{count} élément{count === 1 ? "" : "s"}</span></div>;
}

function ShopNavLink({ href, label, count }: { href: string; label: string; count: number }) {
  return <a href={href} className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold text-ink-soft transition hover:bg-clay-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-gold sm:px-4">{label}<span className="grid h-5 min-w-5 place-items-center rounded-full bg-clay-100 px-1 text-[10px] text-ink-muted">{count}</span><ArrowRight className="h-3 w-3 text-ink-muted/60" /></a>;
}
