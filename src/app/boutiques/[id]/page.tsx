import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import { AppLink as Link } from "@/components/site/AppLink";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Camera, MapPin, MessageCircle, Package, ShieldCheck, Star } from "lucide-react";
import { fetchShopById } from "@/lib/shops";
import { CATEGORY_MAP, ELECTRONICS_SUBCATEGORY_MAP } from "@/lib/constants";
import { buildWhatsAppLink, formatPhoneBF, initials } from "@/lib/utils";
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
import { CountChip, SectionHeading } from "@/components/ui/SectionHeading";
import { FavoriteButton } from "@/components/shops/FavoriteButton";
import { OwnerShopActions } from "@/components/shops/OwnerShopActions";
import { Backdrop } from "@/components/fx/Backdrop";
import { Magnetic } from "@/components/fx/Magnetic";
import { RevealText } from "@/components/fx/RevealText";
import { SectionNav, type SectionNavItem } from "@/components/fx/SectionNav";

// La vitrine dépend d'un identifiant inconnu au build : elle reste rendue à la demande.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const shop = await fetchShopById(id);
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = await fetchShopById(id);
  if (!shop) notFound();

  const cat = CATEGORY_MAP[shop.category];
  const CatIcon = cat.icon;
  const sections: SectionNavItem[] = [
    { id: "shop-products", label: "Produits", count: shop.products.length },
    ...(shop.gallery.length > 0 ? [{ id: "shop-gallery", label: "Galerie", count: shop.gallery.length }] : []),
    { id: "shop-about", label: "À propos" },
    { id: "shop-reviews", label: "Avis", count: shop.rating_count },
  ];

  return (
    <div>
      <ShopStatusWatcher shopId={shop.id} />
      <Suspense fallback={null}>
        <PublishedToast />
      </Suspense>

      {/* Signature : couverture en grand format, identité posée sur l'image. */}
      <div className="mx-auto max-w-[82rem] px-2 pt-2 sm:px-3">
        <section className="fx-night relative isolate overflow-hidden rounded-[2rem] text-white shadow-[0_50px_100px_-60px_rgb(18_13_9/.9)] sm:rounded-[2.5rem]">
          {shop.cover_url ? (
            <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
              <Image src={shop.cover_url} alt="" fill priority sizes="100vw" className="fx-kenburns object-cover opacity-75" />
            </div>
          ) : (
            <Backdrop dark className="-z-20" />
          )}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(18_13_9/.5)_0%,rgb(18_13_9/.15)_35%,rgb(18_13_9/.7)_72%,rgb(18_13_9/.96)_100%)]" />
          <div aria-hidden="true" className="fx-grain fx-grain-dark" />

          <div className="relative flex min-h-[30rem] flex-col justify-between gap-12 px-5 pb-24 pt-5 sm:min-h-[36rem] sm:px-8 sm:pb-28 sm:pt-7 lg:min-h-[40rem] lg:px-12">
            <div className="flex items-center justify-between gap-3">
              <Link href="/boutiques" className="fx-glass-dark group inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-bold text-white transition hover:bg-black/50">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                Toutes les boutiques
              </Link>
              {shop.gallery.length > 0 && (
                <a href="#shop-gallery" className="fx-glass-dark inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-bold text-white transition hover:bg-black/50">
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  {shop.gallery.length} photo{shop.gallery.length > 1 ? "s" : ""}
                </a>
              )}
            </div>

            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <Reveal>
                  <div className="flex items-end gap-4 sm:gap-5">
                    <span className="relative h-20 w-20 shrink-0 rounded-[1.6rem] bg-faso-gradient p-[2px] shadow-[0_20px_50px_-20px_rgb(244_169_60/.7)] sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                      <span className="relative grid h-full w-full place-items-center overflow-hidden rounded-[calc(1.6rem-2px)] bg-[#1d1610] text-2xl font-black text-white sm:text-3xl">
                        {shop.logo_url ? <Image src={shop.logo_url} alt="" fill sizes="112px" className="object-cover" /> : initials(shop.name)}
                      </span>
                    </span>
                    <div className="flex flex-wrap items-center gap-2 pb-1">
                      <Badge className="rounded-full bg-white/90 px-3 py-1.5 text-ink backdrop-blur">
                        <CatIcon className="h-3.5 w-3.5 text-faso-red" />
                        {cat.label}
                      </Badge>
                      {shop.subcategory && (
                        <span className="fx-glass-dark rounded-full px-3 py-1.5 text-[11px] font-bold text-white/85">
                          {ELECTRONICS_SUBCATEGORY_MAP[shop.subcategory]?.label ?? shop.subcategory}
                        </span>
                      )}
                      {shop.verification_status === "verified" && <VerifiedBadge label="Adresse vérifiée" className="bg-white/90" />}
                    </div>
                  </div>
                </Reveal>
                <h1 className="fx-display mt-6 max-w-4xl text-[clamp(2.6rem,7vw,5.8rem)]">
                  <RevealText text={shop.name} delay={0.1} />
                </h1>
                <Reveal delay={0.2}>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-faso-gold" aria-hidden="true" />
                      {shop.neighborhood ? `${shop.neighborhood}, ` : ""}
                      {shop.city}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-faso-gold text-faso-gold" aria-hidden="true" />
                      <strong className="text-white">{shop.rating.toFixed(1)}</strong> ({shop.rating_count} avis)
                    </span>
                    <OpenStatus hours={shop.opening_hours} className="bg-white/90" />
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.25} className="flex flex-wrap items-center gap-2 lg:justify-end">
                <FavoriteButton shopId={shop.id} />
                <OwnerShopActions ownerId={shop.owner_id} shopId={shop.id} />
                <WhatsAppButton
                  phone={shop.whatsapp}
                  shopName={shop.name}
                  shopId={shop.id}
                  size="sm"
                  label="Contacter la boutique"
                  className="btn-shine h-12 rounded-full px-6 shadow-[0_18px_40px_-16px_rgba(37,211,102,.75)]"
                />
              </Reveal>
            </div>
          </div>
        </section>
      </div>

      <div className="container-faso relative">
        {/* Repères clés, posés à cheval sur la couverture. */}
        <Reveal className="relative z-10 -mt-14 sm:-mt-16">
          <dl className="fx-glass grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] bg-clay-200/50 lg:grid-cols-4">
            <Metric icon={<Star className="h-4 w-4" />} label="Note moyenne" value={`${shop.rating.toFixed(1)} / 5`} detail={`${shop.rating_count} avis après contact`} />
            <Metric icon={<Package className="h-4 w-4" />} label="Catalogue" value={`${shop.products.length} produit${shop.products.length === 1 ? "" : "s"}`} detail="Prix affichés par le vendeur" />
            <Metric icon={<MapPin className="h-4 w-4" />} label="Adresse" value={shop.city} detail={shop.neighborhood ?? "Burkina Faso"} />
            <Metric
              icon={<MessageCircle className="h-4 w-4" />}
              label="WhatsApp"
              value={
                <a href={buildWhatsAppLink(shop.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {formatPhoneBF(shop.whatsapp)}
                </a>
              }
              detail="Échange direct, sans intermédiaire"
            />
          </dl>
        </Reveal>

        <div className="mt-8 flex justify-center sm:mt-10">
          <SectionNav items={sections} label="Explorer la boutique" layoutId="shop-section-pill" />
        </div>

        {/* Produits */}
        <section id="shop-products" className="mt-14 scroll-mt-40 sm:mt-20">
          <SectionHeading
            eyebrow="Sélection de la boutique"
            title="À découvrir"
            accent="chez eux."
            description="Des produits proposés directement par votre commerçant. Les prix et le stock sont annoncés par la boutique."
            aside={<CountChip count={shop.products.length} label={shop.products.length === 1 ? "offre" : "offres"} />}
          />
          {shop.products.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {shop.products.map((p, i) => (
                <ProductCard key={p.id} product={p} shopName={shop.name} shopId={shop.id} whatsapp={shop.whatsapp} index={i} />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid justify-items-center rounded-[2rem] border border-dashed border-clay-200 bg-white/70 px-6 py-14 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-faso-gold-soft/40 text-faso-gold-dark">
                <Package className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-4 text-base font-extrabold text-ink">La sélection se prépare</p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-ink-muted">
                Cette boutique n&apos;a pas encore publié de produit. Contactez-la pour découvrir ses offres.
              </p>
            </div>
          )}
        </section>

        {/* Galerie */}
        {shop.gallery.length > 0 && (
          <section id="shop-gallery" className="mt-20 scroll-mt-40 sm:mt-28">
            <SectionHeading
              eyebrow="Dans les coulisses"
              title="La boutique"
              accent="en images."
              description="Un aperçu du lieu et des produits, partagé par le commerçant."
              aside={<CountChip count={shop.gallery.length} label={shop.gallery.length === 1 ? "photo" : "photos"} />}
            />
            <div className="mt-8">
              <ShopGallery images={shop.gallery} />
            </div>
          </section>
        )}

        {/* À propos */}
        <section id="shop-about" className="mt-20 grid scroll-mt-40 gap-5 sm:mt-28 lg:grid-cols-[1.25fr_.75fr]">
          <Reveal className="h-full">
            <article className="relative isolate h-full overflow-hidden rounded-[2rem] border border-clay-100 bg-white p-7 shadow-[inset_0_1px_0_#fff,0_30px_70px_-50px_rgb(26_17_9/.5)] sm:p-10">
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-faso-gold/15 blur-3xl" />
              <span aria-hidden="true" className="font-serif-accent pointer-events-none absolute -top-8 right-6 select-none text-[11rem] leading-none text-faso-gold/25">
                &ldquo;
              </span>
              <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-faso-red">Notre histoire</p>
              <h2 className="fx-display mt-3 text-[clamp(1.8rem,3.4vw,2.6rem)] text-ink">
                À propos de <span className="font-serif-accent fx-text-gradient pr-1 text-[1.08em]">{shop.name}</span>
              </h2>
              <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-8 text-ink-soft">{shop.description}</p>
            </article>
          </Reveal>
          <div className="grid gap-4">
            <InfoTile delay={0.06} icon={<ShieldCheck className="h-5 w-5" />} eyebrow="Vitrine FasoLink" title="Un commerce local" detail="Une boutique du Burkina Faso, présentée sur FasoLink." />
            <InfoTile delay={0.12} icon={<MessageCircle className="h-5 w-5" />} eyebrow="Un échange simple" title="Directement avec la boutique" detail="Disponibilité, prix et livraison : posez vos questions au vendeur." />
            <InfoTile delay={0.18} icon={<BadgeCheck className="h-5 w-5" />} eyebrow="Avis encadrés" title="Après un contact réel" detail="Les notes sont déposées uniquement après un contact via FasoLink." />
          </div>
        </section>

        {/* Avis clients */}
        <section id="shop-reviews" className="mt-20 scroll-mt-40 sm:mt-28">
          <SectionHeading
            eyebrow="La confiance se partage"
            title="Les avis de"
            accent="la communauté."
            description="Notes déposées uniquement après un contact via FasoLink."
            aside={<CountChip count={shop.rating_count} label="avis" />}
          />
          <div className="mt-8">
            <ReviewsSection shopId={shop.id} shopName={shop.name} ownerId={shop.owner_id} initialReviews={shop.reviews ?? []} />
          </div>
        </section>

        {/* Appel final */}
        <section className="mb-[calc(4rem+env(safe-area-inset-bottom)+6rem)] mt-20 sm:mt-28 md:mb-8">
          <Reveal>
            <div className="fx-beam fx-night relative isolate overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white shadow-[0_60px_120px_-60px_rgb(19_42_28/.9)] sm:px-10 md:rounded-[2.75rem] md:py-20">
              <Backdrop dark />
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-faso-gold">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> La conversation commence ici
              </span>
              <h2 className="fx-display mx-auto mt-6 max-w-3xl text-[clamp(2.2rem,5vw,4rem)]">
                Un coup de cœur ? <span className="font-serif-accent fx-text-gradient-light pr-1 text-[1.08em]">Parlons-en.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/65">
                Échangez directement avec {shop.name} sur WhatsApp : prix, disponibilité, livraison dans votre quartier.
              </p>
              <div className="mt-8 flex justify-center">
                <Magnetic>
                  <WhatsAppButton
                    phone={shop.whatsapp}
                    shopName={shop.name}
                    shopId={shop.id}
                    className="btn-shine rounded-full bg-white text-[#0b6b52] hover:bg-white"
                  />
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </section>
      </div>

      <StickyContactBar
        shopId={shop.id}
        shopName={shop.name}
        whatsapp={shop.whatsapp}
        aboutName={shop.category === "services" ? "vos services" : "votre boutique"}
      />
    </div>
  );
}

function Metric({ icon, label, value, detail }: { icon: ReactNode; label: string; value: ReactNode; detail: string }) {
  return (
    <div className="min-w-0 bg-[#fffdfa]/90 p-4 sm:p-6">
      <dt className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-ink-muted">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-faso-gold-soft/45 text-faso-gold-dark" aria-hidden="true">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-3 truncate text-lg font-extrabold tracking-tight text-ink sm:text-xl">{value}</dd>
      <dd className="mt-0.5 truncate text-[11px] text-ink-muted sm:text-xs">{detail}</dd>
    </div>
  );
}

function InfoTile({ icon, eyebrow, title, detail, delay }: { icon: ReactNode; eyebrow: string; title: string; detail: string; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div
        data-spotlight
        className="fx-spotlight flex h-full gap-4 rounded-[1.6rem] border border-clay-100 bg-white p-5 shadow-[inset_0_1px_0_#fff,0_20px_50px_-40px_rgb(26_17_9/.5)] transition-transform duration-500 hover:-translate-y-0.5"
      >
        <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink text-white">{icon}</span>
        <div className="relative z-10">
          <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-ink-muted">{eyebrow}</p>
          <p className="mt-1 text-sm font-extrabold text-ink">{title}</p>
          <p className="mt-1 text-xs leading-5 text-ink-muted">{detail}</p>
        </div>
      </div>
    </Reveal>
  );
}
