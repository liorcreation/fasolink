import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { AppLink as Link } from "@/components/site/AppLink";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Cpu,
  HardDrive,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { fetchProduct } from "@/lib/shops";
import { CATEGORY_MAP } from "@/lib/constants";
import { formatCFA, initials } from "@/lib/utils";
import { VerifiedBadge } from "@/components/shops/VerifiedBadge";
import { OpenStatus } from "@/components/shops/OpenStatus";
import { WhatsAppButton } from "@/components/shops/WhatsAppButton";
import { ShareProductButton } from "@/components/shops/ShareProductButton";
import { StickyContactBar } from "@/components/shops/StickyContactBar";
import { ShopStatusWatcher } from "@/components/shops/ShopStatusWatcher";
import { ProductCard } from "@/components/shops/ProductCard";
import { ProductStage } from "@/components/shops/ProductStage";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Backdrop } from "@/components/fx/Backdrop";
import { RevealText } from "@/components/fx/RevealText";

// La fiche dépend d'identifiants inconnus au build : rendu à la demande.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; produit: string }>;
}): Promise<Metadata> {
  const { id, produit } = await params;
  const data = await fetchProduct(id, produit);
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
  params: Promise<{ id: string; produit: string }>;
}) {
  const { id, produit } = await params;
  const data = await fetchProduct(id, produit);
  if (!data) notFound();
  const { shop, product } = data;
  const cat = CATEGORY_MAP[shop.category];
  const soldOut = product.availability === "out_of_stock";
  const specs = product.specifications;
  const hasSpecs = Boolean(specs && Object.values(specs).some(Boolean));
  const illustrative = Boolean(product.image_source_url);
  const showCredit =
    product.image_credit &&
    (product.image_source_url?.startsWith("https://commons.wikimedia.org/") ||
      product.image_source_url?.startsWith("https://www.pexels.com/") ||
      product.image_source_url?.startsWith("https://pexels.com/"));

  const others = shop.products.filter((p) => p.id !== product.id).slice(0, 6);

  return (
    <div className="relative isolate overflow-hidden">
      <Backdrop className="h-[56rem]" />
      <div className="container-faso pb-[calc(4rem+env(safe-area-inset-bottom)+6rem)] pt-5 sm:pt-8 md:pb-16">
        <ShopStatusWatcher shopId={shop.id} />

        {/* Fil d'Ariane */}
        <nav
          aria-label="Fil d’Ariane"
          className="fx-glass flex w-fit max-w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-full px-4 py-2 text-[11px] text-ink-muted sm:text-xs"
        >
          <Link href="/boutiques" className="shrink-0 font-semibold transition hover:text-faso-red">
            Boutiques
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <Link href={`/boutiques/${shop.id}`} className="max-w-[34vw] truncate font-semibold transition hover:text-faso-red sm:max-w-none">
            {shop.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span aria-current="page" className="truncate font-bold text-ink">
            {product.name}
          </span>
        </nav>

        <div className="mt-6 grid items-start gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:gap-12 xl:gap-16">
          {/* Visuel */}
          <div className="lg:sticky lg:top-24">
            <ProductStage
              imageUrl={product.image_url}
              name={product.name}
              availability={product.availability}
              illustrative={illustrative}
              shopName={shop.name}
              shopHref={`/boutiques/${shop.id}`}
            />
            <div className="mt-4 flex items-center justify-between gap-3 px-1 text-[11px] font-semibold text-ink-muted sm:text-xs">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-faso-green" aria-hidden="true" /> Achat en direct auprès du commerçant
              </span>
              <span className="hidden sm:inline">Burkina Faso · FasoLink</span>
            </div>
            {showCredit && (
              <p className="mt-2 px-1 text-[10px] leading-4 text-ink-muted">
                Photo illustrative · {product.image_credit} · {product.image_license || "Licence"}
                {product.image_license_url?.startsWith("https://") && (
                  <>
                    {" · "}
                    <a href={product.image_license_url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                      Licence
                    </a>
                  </>
                )}
                {" · "}
                <a href={product.image_source_url!} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Source
                </a>
              </p>
            )}
          </div>

          {/* Informations */}
          <div className="flex min-w-0 flex-col lg:pt-2">
            <Reveal>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/boutiques/${shop.id}`}
                  className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-clay-200 bg-white/80 px-3.5 py-2 text-[11px] font-bold text-ink-soft shadow-sm backdrop-blur transition hover:border-ink/25 hover:text-ink"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                  Retour à la boutique
                </Link>
                <ShareProductButton title={product.name} shopName={shop.name} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-faso-red-soft/35 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-faso-red-dark">
                  <cat.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {cat.label}
                </span>
                {specs?.brand && (
                  <span className="rounded-full border border-clay-200 bg-white/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-ink-soft">
                    {specs.brand}
                  </span>
                )}
                {shop.verification_status === "verified" && <VerifiedBadge label="Vendeur vérifié" />}
              </div>
            </Reveal>

            <h1 className="fx-display mt-4 text-[clamp(2.2rem,4.6vw,3.9rem)] text-ink">
              <RevealText text={product.name} delay={0.05} stagger={0.05} />
            </h1>

            {/* Prix */}
            <Reveal delay={0.12}>
              <div className="mt-6 rounded-[1.75rem] bg-gradient-to-r from-faso-green/45 via-faso-gold/50 to-faso-red/35 p-px shadow-[0_30px_60px_-40px_rgb(26_17_9/.55)]">
                <div className="flex flex-wrap items-end justify-between gap-4 rounded-[calc(1.75rem-1px)] bg-[#fffdfa]/95 p-5 backdrop-blur sm:p-6">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-ink-muted">Prix affiché par le vendeur</p>
                    <p className="mt-1.5 font-display text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold leading-none tracking-[-.04em] text-faso-green-dark">
                      {formatCFA(product.price)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-faso-green/10 px-3 py-2 text-[11px] font-bold text-faso-green-dark">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Échange direct
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Action principale (le mobile a aussi la barre collante) */}
            <Reveal delay={0.16}>
              <div className="mt-5">
                <WhatsAppButton
                  phone={shop.whatsapp}
                  shopName={shop.name}
                  shopId={shop.id}
                  productId={product.id}
                  productName={product.name}
                  price={product.price}
                  label={soldOut ? "Demander la disponibilité" : "Commander sur WhatsApp"}
                  className="btn-shine w-full justify-center rounded-full shadow-[0_20px_44px_-18px_rgba(37,211,102,.8)]"
                />
                <p className="mt-2.5 text-center text-[11px] text-ink-muted">
                  Vous échangez directement avec le commerçant, sans intermédiaire.
                </p>
              </div>
            </Reveal>

            {hasSpecs && specs && (
              <Reveal delay={0.08}>
                <section aria-labelledby="product-specifications" className="mt-8">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <h2 id="product-specifications" className="text-lg font-extrabold tracking-tight text-ink">
                      Caractéristiques annoncées
                    </h2>
                    <span className="rounded-full bg-clay-100 px-2.5 py-1 text-[10px] font-bold text-ink-muted">Déclarées par le vendeur</span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {specs.brand && <Specification icon={<Tag className="h-4 w-4" />} label="Marque" value={specs.brand} />}
                    {specs.model && <Specification icon={<Smartphone className="h-4 w-4" />} label="Modèle" value={specs.model} />}
                    {specs.condition && <Specification icon={<Sparkles className="h-4 w-4" />} label="État" value={conditionLabel(specs.condition)} />}
                    {specs.ram && <Specification icon={<Cpu className="h-4 w-4" />} label="Mémoire vive" value={specs.ram} />}
                    {specs.storage && <Specification icon={<HardDrive className="h-4 w-4" />} label="Stockage" value={specs.storage} />}
                    {specs.warranty && <Specification icon={<ShieldCheck className="h-4 w-4" />} label="Garantie annoncée" value={specs.warranty} />}
                  </dl>
                  {specs.warranty && (
                    <p className="mt-3 text-[11px] leading-5 text-ink-muted">
                      La garantie est renseignée par le vendeur. Confirmez ses conditions directement avec lui avant l’achat.
                    </p>
                  )}
                </section>
              </Reveal>
            )}

            <Reveal delay={0.08}>
              <div className="mt-6 rounded-[1.6rem] border border-clay-100 bg-white/90 p-5 shadow-[inset_0_1px_0_#fff,0_20px_50px_-40px_rgb(26_17_9/.5)] sm:p-6">
                <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-faso-red">Description & détails</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-soft">
                  {product.description ||
                    "Demandez au vendeur les caractéristiques complètes, l’état exact de l’appareil, les accessoires inclus et les conditions de garantie avant votre achat."}
                </p>
              </div>
            </Reveal>

            {/* Carte boutique */}
            <Reveal delay={0.1}>
              <Link
                href={`/boutiques/${shop.id}`}
                data-spotlight
                className="fx-spotlight group mt-4 flex items-center gap-3 rounded-[1.6rem] border border-clay-100 bg-white p-4 shadow-[inset_0_1px_0_#fff,0_20px_50px_-40px_rgb(26_17_9/.5)] transition duration-300 hover:-translate-y-0.5 sm:gap-4"
              >
                <span className="relative z-10 h-14 w-14 shrink-0 rounded-2xl bg-faso-gradient p-[2px]">
                  <span className="relative grid h-full w-full place-items-center overflow-hidden rounded-[calc(1rem-2px)] bg-[#1d1610] text-base font-black text-white">
                    {shop.logo_url ? <Image src={shop.logo_url} alt="" fill sizes="56px" className="object-cover" /> : initials(shop.name)}
                  </span>
                </span>
                <span className="relative z-10 min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-ink">
                    <span className="truncate">{shop.name}</span>
                    {shop.verification_status === "verified" && <BadgeCheck className="h-4 w-4 shrink-0 text-faso-gold-dark" aria-label="Vendeur vérifié" />}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-faso-red" aria-hidden="true" />
                    <span className="truncate">
                      {shop.neighborhood ? `${shop.neighborhood}, ` : ""}
                      {shop.city}
                    </span>
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
                    <Star className="h-3 w-3 fill-faso-gold text-faso-gold" aria-hidden="true" />
                    {shop.rating.toFixed(1)} · {shop.rating_count} avis
                  </span>
                </span>
                <span className="relative z-10 hidden shrink-0 sm:block">
                  <OpenStatus hours={shop.opening_hours} compact />
                </span>
                <ArrowRight className="relative z-10 h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-faso-red" aria-hidden="true" />
              </Link>
            </Reveal>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <ProductPromise icon={<ShieldCheck className="h-4 w-4" />} title="Vendeur identifié" detail="Vitrine FasoLink" />
              <ProductPromise icon={<MessageCircle className="h-4 w-4" />} title="Questions directes" detail="Prix & disponibilité" />
            </div>
          </div>
        </div>

        {/* Autres produits de la boutique */}
        {others.length > 0 && (
          <section className="mt-20 sm:mt-28">
            <SectionHeading
              eyebrow="Continuer l’exploration"
              title="D’autres pépites"
              accent={`de ${shop.name}.`}
              aside={
                <Link
                  href={`/boutiques/${shop.id}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white px-4 py-2.5 text-sm font-extrabold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-premium"
                >
                  Voir la vitrine <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              }
            />
            <div className="snap-row no-scrollbar -mx-5 mt-8 flex gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0">
              {others.map((p, i) => (
                <div key={p.id} className="snap-item w-[46vw] shrink-0 sm:w-60">
                  <ProductCard product={p} shopName={shop.name} shopId={shop.id} whatsapp={shop.whatsapp} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <StickyContactBar
        shopId={shop.id}
        shopName={shop.name}
        whatsapp={shop.whatsapp}
        productId={product.id}
        aboutName={product.name}
        priceLabel={formatCFA(product.price)}
        contactMessage={`Bonjour ${shop.name}, je suis intéressé(e) par le produit « ${product.name} » (${formatCFA(product.price)}) vu sur FasoLink. ${soldOut ? "Est-il bientôt disponible ?" : "Est-il toujours disponible ?"}`}
        actionLabel={soldOut ? "Demander la disponibilité" : "Commander"}
      />
    </div>
  );
}

function ProductPromise({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-clay-100 bg-white/80 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-faso-green/10 text-faso-green-dark" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-extrabold text-ink">{title}</span>
        <span className="mt-0.5 block truncate text-[10px] text-ink-muted">{detail}</span>
      </span>
    </div>
  );
}

function Specification({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div
      data-spotlight
      className="fx-spotlight min-w-0 rounded-2xl border border-clay-100 bg-white/90 p-3.5 transition-transform duration-300 hover:-translate-y-0.5"
    >
      <dt className="relative z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-ink-muted">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-clay-100 text-ink-soft" aria-hidden="true">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="relative z-10 mt-2 break-words text-sm font-extrabold text-ink">{value}</dd>
    </div>
  );
}

function conditionLabel(condition: string) {
  if (condition === "new") return "Neuf";
  if (condition === "used") return "Occasion";
  if (condition === "refurbished") return "Reconditionné";
  return condition;
}
