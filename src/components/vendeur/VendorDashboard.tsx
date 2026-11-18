"use client";

import { AppLink as Link } from "@/components/site/AppLink";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  ExternalLink,
  Eye,
  MapPin,
  MessageCircle,
  Package,
  ShieldAlert,
  ShieldCheck,
  Store,
  TrendingUp,
} from "lucide-react";
import type { ShopWithProducts, Subscription } from "@/lib/database.types";
import { TRIAL_DAYS } from "@/lib/constants";
import {
  fetchContactStats,
  getLocalContactStats,
  seedDemoContactEvents,
  type ContactStats,
} from "@/lib/tracking";
import { initials } from "@/lib/utils";
import { QRCodeCard } from "@/components/vendeur/QRCodeCard";
import { VerifiedBadge } from "@/components/shops/VerifiedBadge";
import { ProductManager } from "@/components/vendeur/ProductManager";
import { ContactsChart } from "@/components/vendeur/ContactsChart";
import { Backdrop } from "@/components/fx/Backdrop";
import { SectionNav } from "@/components/fx/SectionNav";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function VendorDashboard({
  shop,
  subscription = null,
  demo = false,
  onProductsChange,
}: {
  shop: ShopWithProducts;
  subscription?: Subscription | null;
  demo?: boolean;
  onProductsChange?: (products: ShopWithProducts["products"]) => void;
}) {
  const [stats, setStats] = useState<ContactStats | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (demo) {
        seedDemoContactEvents(shop.id);
        if (mounted) setStats(getLocalContactStats(shop.id));
        return;
      }
      try {
        const next = await fetchContactStats(shop.id);
        if (mounted) setStats(next);
      } catch (error) {
        console.warn("[FasoLink] dashboard stats:", error);
        if (mounted) setStats(getLocalContactStats(shop.id));
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 15000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [demo, shop.id, shop.whatsapp_clicks]);

  const trialLeft = subscription?.expires_at
    ? Math.max(0, Math.ceil((Date.parse(subscription.expires_at) - Date.now()) / 864e5))
    : 0;
  const subscriptionLabel = demo
    ? `Essai gratuit — ${TRIAL_DAYS} jours de démonstration`
    : shop.status === "suspended"
      ? "Boutique suspendue — abonnement à régulariser"
      : subscription?.status === "trialing"
        ? `Essai gratuit — ${trialLeft} jours restants`
        : subscription?.status === "active"
          ? "Abonnement actif"
          : "Abonnement à activer";
  const subscriptionCopy = demo
    ? "Mode démonstration : configurez Firebase pour activer les données réelles."
    : shop.status === "suspended"
      ? "Votre vitrine est masquée aux clients jusqu’à l’activation d’une licence valide."
      : subscription?.status === "trialing"
        ? `Aucun paiement requis avant la fin de la période de ${TRIAL_DAYS} jours.`
        : subscription?.status === "active"
          ? `Votre formule ${subscription.plan} est active jusqu’au ${new Date(subscription.expires_at ?? Date.now()).toLocaleDateString("fr-FR")}.`
          : "Activez votre abonnement pour conserver votre vitrine publiée.";
  const statusTone =
    shop.status === "suspended"
      ? "border-faso-red/30 bg-faso-red/15 text-[#ffb3a8]"
      : subscription?.status === "active"
        ? "border-faso-green/35 bg-faso-green/15 text-[#9fe7bb]"
        : "border-faso-gold/35 bg-faso-gold/15 text-[#f8d08a]";
  const statusLabel =
    shop.status === "suspended"
      ? "Accès suspendu"
      : subscription?.status === "active"
        ? "Abonnement actif"
        : subscription?.status === "trialing"
          ? "Période d’essai"
          : "Abonnement à activer";

  const byDay = stats?.byDay ?? [];
  const last14 = byDay.reduce((total, day) => total + day.count, 0);
  const perDay = Math.round(((stats?.last7d ?? 0) / 7) * 10) / 10;

  const tiles = [
    { icon: MessageCircle, label: "Contacts depuis la publication", value: stats?.total ?? 0, hint: "Total des mises en relation" },
    { icon: CalendarClock, label: "7 derniers jours", value: stats?.last7d ?? 0, hint: `${perDay.toLocaleString("fr-FR")} contact${perDay > 1 ? "s" : ""} par jour en moyenne` },
    { icon: TrendingUp, label: "14 derniers jours", value: last14, hint: "Période du graphique ci-dessous" },
  ];

  return (
    <div className="space-y-10 pb-8">
      {/* Cockpit : identité, abonnement, chiffre-clé. */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="fx-night relative isolate overflow-hidden rounded-[2rem] text-white shadow-[0_50px_100px_-60px_rgb(18_13_9/.9)] sm:rounded-[2.5rem]"
      >
        <Backdrop dark />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 -z-10 h-[24rem] w-[24rem] rounded-full border border-white/[.07]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-12 -z-10 h-[16rem] w-[16rem] rounded-full border border-white/[.05]" />

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)] lg:items-end lg:p-10">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-4">
              <span className="relative h-16 w-16 shrink-0 rounded-[1.4rem] bg-faso-gradient p-[2px] sm:h-[4.5rem] sm:w-[4.5rem]">
                <span className="relative grid h-full w-full place-items-center overflow-hidden rounded-[calc(1.4rem-2px)] bg-[#1d1610] text-xl font-black">
                  {shop.logo_url ? <Image src={shop.logo_url} alt="" fill sizes="72px" className="object-cover" /> : initials(shop.name)}
                </span>
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold", statusTone)}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                    {statusLabel}
                  </span>
                  {shop.verification_status === "verified" && <VerifiedBadge label="Vérifié" className="bg-white/90" />}
                </div>
                <h2 className="fx-display mt-2 truncate text-[clamp(1.8rem,4vw,2.8rem)]">{shop.name}</h2>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/60">
                  <MapPin className="h-3.5 w-3.5 text-faso-gold" aria-hidden="true" />
                  {shop.neighborhood ? `${shop.neighborhood}, ` : ""}
                  {shop.city}
                  <span className="text-white/25" aria-hidden="true">·</span>
                  {shop.products.length} produit{shop.products.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.07] text-faso-gold">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-extrabold">{subscriptionLabel}</p>
                <p className="mt-1 max-w-xl text-xs leading-5 text-white/60">{subscriptionCopy}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/vendeur/paiement?shop=${shop.id}`}
                className="btn-shine inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f8c46e,rgb(var(--faso-gold))_55%,#e59a31)] px-5 text-xs font-extrabold text-ink shadow-[0_14px_34px_-16px_rgb(var(--faso-gold)/.9)] transition hover:-translate-y-0.5"
              >
                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                {subscription?.status === "active" ? "Gérer la licence" : "Activer mon abonnement"}
              </Link>
              <Link href={`/boutiques/${shop.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-4 text-xs font-bold transition hover:bg-white/10">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" /> Voir ma vitrine <ExternalLink className="h-3 w-3 text-white/50" aria-hidden="true" />
              </Link>
              <Link href="/vendeur/boutiques" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-4 text-xs font-bold transition hover:bg-white/10">
                <Store className="h-3.5 w-3.5" aria-hidden="true" /> Mes boutiques
              </Link>
            </div>
          </div>

          {/* Chiffre de tête : un seul par vue, en police de texte. */}
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[.05] p-6 backdrop-blur" aria-busy={!stats}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-white/55">Contacts WhatsApp · 30 jours</p>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#9fe7bb]">
                <span className="fx-live-dot" aria-hidden="true" /> Actualisé
              </span>
            </div>
            {stats ? (
              <p className="mt-4 font-sans text-[clamp(3.5rem,8vw,5rem)] font-semibold leading-none tracking-[-.04em]">
                {stats.last30d.toLocaleString("fr-FR")}
              </p>
            ) : (
              <span aria-hidden="true" className="mt-4 block h-16 w-28 animate-pulse rounded-xl bg-white/10" />
            )}
            <p className="mt-3 text-xs leading-5 text-white/55">
              Mises en relation mesurées sur votre vitrine. Un contact n’est pas une vente confirmée. Mise à jour toutes les 15 secondes.
            </p>
          </div>
        </div>
      </motion.section>

      <SectionNav
        layoutId="seller-section-pill"
        label="Sections du tableau de bord vendeur"
        items={[
          { id: "seller-overview", label: "Activité", icon: <Activity className="h-3.5 w-3.5" aria-hidden="true" /> },
          { id: "seller-catalog", label: "Catalogue", count: shop.products.length, icon: <Package className="h-3.5 w-3.5" aria-hidden="true" /> },
          { id: "seller-trust", label: "Visibilité", icon: <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> },
        ]}
      />

      {/* Activité : tuiles + tendance. */}
      <section id="seller-overview" aria-busy={!stats} className="scroll-mt-40">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[.19em] text-faso-red">Votre activité</p>
            <h2 className="fx-display mt-2 text-[clamp(1.7rem,3.4vw,2.4rem)] text-ink">
              Les conversations <span className="font-serif-accent fx-text-gradient pr-1 text-[1.08em]">qui comptent.</span>
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
            <Activity className="h-3.5 w-3.5 text-faso-green" aria-hidden="true" /> Contacts mesurés sur FasoLink
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {tiles.map((tile, index) => (
            <motion.div
              key={tile.label}
              data-spotlight
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 + index * 0.08 }}
              className="fx-spotlight rounded-[1.6rem] border border-clay-100 bg-white p-5 shadow-[inset_0_1px_0_#fff,0_20px_50px_-40px_rgb(26_17_9/.5)] sm:p-6"
            >
              <div className="relative z-10 flex items-center justify-between">
                <p className="text-sm font-bold text-ink-soft">{tile.label}</p>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-clay-100 text-ink-soft" aria-hidden="true">
                  <tile.icon className="h-4 w-4" />
                </span>
              </div>
              {stats ? (
                <p className="relative z-10 mt-4 text-4xl font-semibold tracking-tight text-ink">{tile.value.toLocaleString("fr-FR")}</p>
              ) : (
                <span aria-hidden="true" className="mt-4 block h-10 w-20 animate-pulse rounded-lg bg-clay-100" />
              )}
              <p className="relative z-10 mt-1.5 text-xs text-ink-muted">{tile.hint}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,.65fr)]">
          <div className="rounded-[1.75rem] border border-clay-100 bg-white p-5 shadow-[inset_0_1px_0_#fff,0_20px_50px_-40px_rgb(26_17_9/.5)] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-faso-red">Tendance récente</p>
                <h3 className="mt-1 text-lg font-extrabold tracking-tight text-ink">Contacts WhatsApp par jour, sur 14 jours</h3>
              </div>
              <span className="rounded-full bg-clay-100 px-3 py-1.5 text-[11px] font-bold text-ink-soft">
                {last14.toLocaleString("fr-FR")} au total
              </span>
            </div>
            <ContactsChart days={byDay} loading={!stats} />
          </div>

          <div className="fx-night relative isolate flex flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 text-white sm:p-7">
            <Backdrop dark grid={false} />
            <div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-faso-gold/15 text-faso-gold" aria-hidden="true">
                <ArrowUpRight className="h-5 w-5" />
              </span>
              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[.18em] text-faso-gold">La prochaine opportunité</p>
              <h3 className="mt-2 text-xl font-extrabold leading-snug">Chaque conversation peut faire grandir votre activité.</h3>
              <p className="mt-3 text-xs leading-5 text-white/60">
                Des photos nettes, un prix clair et un stock à jour donnent aux acheteurs une bonne raison de vous écrire.
              </p>
            </div>
            <Link href={`/boutiques/${shop.id}`} className="group mt-6 inline-flex w-fit items-center gap-2 text-xs font-extrabold text-white transition hover:text-faso-gold">
              Améliorer ma vitrine <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Catalogue vendeur */}
      <div id="seller-catalog" className="scroll-mt-40">
        <ProductManager shopId={shop.id} initialProducts={shop.products} demo={demo} onProductsChange={onProductsChange} />
      </div>

      {/* Vérification + QR */}
      <section id="seller-trust" className="scroll-mt-40">
        <div className="mb-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[.19em] text-faso-red">Confiance & visibilité</p>
          <h2 className="fx-display mt-2 text-[clamp(1.7rem,3.4vw,2.4rem)] text-ink">
            Faites rayonner <span className="font-serif-accent fx-text-gradient pr-1 text-[1.08em]">votre boutique.</span>
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div
            data-spotlight
            className="fx-spotlight rounded-[1.75rem] border border-clay-100 bg-white p-5 shadow-[inset_0_1px_0_#fff,0_20px_50px_-40px_rgb(26_17_9/.5)] sm:p-7"
          >
            <div className="relative z-10 flex items-center gap-3">
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-2xl",
                  shop.verification_status === "verified" ? "bg-faso-green/10 text-faso-green-dark" : "bg-faso-gold-soft/45 text-faso-gold-dark",
                )}
                aria-hidden="true"
              >
                {shop.verification_status === "verified" ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-ink-muted">Confiance vendeur</p>
                <h3 className="mt-0.5 font-extrabold text-ink">Statut de vérification</h3>
              </div>
            </div>

            <div className="relative z-10 mt-5">
              {shop.verification_status === "verified" && (
                <>
                  <VerifiedBadge size="md" />
                  <p className="mt-3 text-sm leading-6 text-ink-soft">
                    Votre identité (CNIB / NIF) et votre localisation ont été contrôlées. Le badge doré rassure vos acheteurs.
                  </p>
                </>
              )}
              {shop.verification_status === "pending" && (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-faso-gold-soft/50 px-3 py-1 text-xs font-bold text-faso-gold-dark">
                    Vérification en cours
                  </span>
                  <p className="mt-3 text-sm leading-6 text-ink-soft">Nous examinons vos documents. Réponse sous 48h ouvrées.</p>
                </>
              )}
              {shop.verification_status === "unverified" && (
                <>
                  <p className="text-sm leading-6 text-ink-soft">
                    Obtenez le badge <strong>« Vendeur Vérifié FasoLink »</strong> en confirmant votre pièce d&apos;identité et votre adresse.
                  </p>
                  <Link href="/vendeur/verification" className="btn-base btn-shine mt-4 min-h-11 bg-faso-red px-5 text-sm text-white hover:-translate-y-0.5">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    Demander la vérification
                  </Link>
                </>
              )}
            </div>
          </div>

          <QRCodeCard shopId={shop.id} shopName={shop.name} />
        </div>
      </section>

      <p className="rounded-2xl border border-clay-100 bg-white/70 px-4 py-3 text-center text-[11px] leading-5 text-ink-muted">
        {demo
          ? "Mode démonstration — les contacts sont simulés localement."
          : "Les indicateurs sont alimentés par les événements de contact de votre vitrine."}
      </p>
    </div>
  );
}
