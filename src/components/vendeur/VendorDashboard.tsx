"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Clock3,
  ExternalLink,
  Eye,
  MapPin,
  MessageCircle,
  Package,
  Sparkles,
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
import { QRCodeCard } from "@/components/vendeur/QRCodeCard";
import { VerifiedBadge } from "@/components/shops/VerifiedBadge";
import { ProductManager } from "@/components/vendeur/ProductManager";

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
        if (mounted) setStats({ ...getLocalContactStats(shop.id), total: shop.whatsapp_clicks });
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
  const subscriptionTone = shop.status === "suspended"
    ? "border-faso-red/25 bg-faso-red/10 text-[#FFB8B8]"
    : subscription?.status === "active"
      ? "border-faso-green/25 bg-faso-green/10 text-[#A9E7BF]"
      : "border-faso-gold/25 bg-faso-gold/10 text-[#F3D88E]";
  const maxDay = useMemo(
    () => Math.max(1, ...(stats?.byDay.map((d) => d.count) ?? [1])),
    [stats],
  );

  const kpis = [
    {
      icon: MessageCircle,
      label: "Contacts WhatsApp (total)",
      value: stats?.total ?? 0,
      hint: "depuis la publication",
    },
    {
      icon: TrendingUp,
      label: "Ce mois-ci",
      value: stats?.last30d ?? 0,
      hint: "30 derniers jours",
    },
    {
      icon: CalendarClock,
      label: "7 derniers jours",
      value: stats?.last7d ?? 0,
      hint: `${Math.round(((stats?.last7d ?? 0) / 7) * 10) / 10} / jour`,
    },
  ];

  return (
    <div className="space-y-7 pb-8">
      {/* Boutique + état du compte */}
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, ease: "easeOut" }} className="relative isolate overflow-hidden rounded-[2rem] bg-[#17120E] p-5 text-white shadow-premium-lg sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_10%,rgba(220,166,55,.25),transparent_35%),radial-gradient(ellipse_at_5%_110%,rgba(207,39,43,.21),transparent_40%)]" />
        <div className="pointer-events-none absolute -right-12 -top-24 -z-10 h-72 w-72 rounded-full border border-white/[.07] sm:h-96 sm:w-96" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[1.4rem] border border-white/20 bg-white/10 text-2xl font-black text-white shadow-lg sm:h-[4.5rem] sm:w-[4.5rem]">
              {shop.logo_url ? <Image src={shop.logo_url} alt="" fill sizes="72px" className="object-cover" /> : shop.name.trim().charAt(0).toLocaleUpperCase("fr")}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#F3D88E]"><Sparkles className="h-3.5 w-3.5" /> Espace vendeur</span>{shop.verification_status === "verified" && <VerifiedBadge label="Vérifié" />}</div>
              <h2 className="mt-2 truncate text-2xl font-black tracking-tight sm:text-3xl">{shop.name}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/55"><MapPin className="h-3.5 w-3.5 text-faso-gold" />{shop.neighborhood ? `${shop.neighborhood}, ` : ""}{shop.city}<span className="text-white/25">·</span>{shop.products.length} produit{shop.products.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-extrabold ${subscriptionTone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{shop.status === "suspended" ? "Accès suspendu" : subscription?.status === "active" ? "Abonnement actif" : subscription?.status === "trialing" ? "Période d’essai" : "Abonnement à activer"}</span>
        </div>

        <div className="mt-7 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-3"><span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.07] text-faso-gold"><CalendarClock className="h-4 w-4" /></span><div><p className="text-sm font-extrabold text-white">{subscriptionLabel}</p><p className="mt-1 max-w-2xl text-xs leading-5 text-white/55">{subscriptionCopy}</p></div></div>
          <div className="flex flex-wrap gap-2">
            <Link href="/vendeur/boutiques" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-4 text-xs font-bold text-white transition hover:bg-white/10"><Store className="h-3.5 w-3.5" /> Mes boutiques</Link>
            <Link href={`/boutiques/${shop.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[.06] px-4 text-xs font-bold text-white transition hover:bg-white/10"><Eye className="h-3.5 w-3.5" /> Voir ma vitrine <ExternalLink className="h-3 w-3 text-white/50" /></Link>
            <Link href={`/vendeur/paiement?shop=${shop.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-faso-gold px-4 text-xs font-extrabold text-[#21170A] shadow-[0_8px_24px_rgba(220,166,55,.18)] transition hover:-translate-y-0.5 hover:bg-[#F1CA70]"><CalendarClock className="h-3.5 w-3.5" />{subscription?.status === "active" ? "Gérer la licence" : "Activer mon abonnement"}</Link>
          </div>
        </div>
      </motion.section>

      <SellerNavigation />

      {/* Activité */}
      <section id="seller-overview" className="scroll-mt-24">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.19em] text-faso-red">Votre activité</p><h2 className="mt-1 text-xl font-black tracking-tight text-ink sm:text-2xl">Les conversations qui comptent</h2></div><span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-ink-muted"><Activity className="h-3.5 w-3.5 text-faso-green" /> Contacts mesurés sur FasoLink</span></div>
      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-[1.5rem] border border-clay-200/80 bg-white p-5 shadow-[0_7px_25px_rgba(51,37,23,.04)] transition duration-200 hover:-translate-y-0.5 hover:border-faso-gold/35 hover:shadow-premium sm:p-6"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-faso-green-soft/35 text-faso-green-dark"><k.icon className="h-5 w-5" /></span>
            <p className="mt-4 text-3xl font-black tracking-tight text-ink">{stats ? k.value : "…"}</p>
            <p className="mt-0.5 text-sm font-extrabold text-ink">{k.label}</p>
            <p className="mt-1 text-[11px] text-ink-muted">{k.hint}</p>
          </motion.div>
        ))}
      </div>
      </section>

      {/* Catalogue vendeur */}
      <div id="seller-catalog" className="scroll-mt-24"><ProductManager shopId={shop.id} initialProducts={shop.products} demo={demo} onProductsChange={onProductsChange} /></div>

      {/* Performance — les contacts ne sont pas des ventes */}
      <section id="seller-performance" className="grid scroll-mt-24 gap-4 lg:grid-cols-[.72fr_1.28fr]">
      <div className="relative isolate flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#17120E] p-6 text-white shadow-premium-lg sm:p-7">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0,rgba(220,166,55,.26),transparent_45%)]" />
        <div><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-faso-gold/15 text-faso-gold"><ArrowUpRight className="h-5 w-5" /></span><p className="mt-5 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#F3D88E]">La prochaine opportunité</p><h3 className="mt-2 text-xl font-black leading-snug">Chaque conversation peut faire grandir votre activité.</h3><p className="mt-3 text-xs leading-5 text-white/60">{stats?.last30d ?? 0} contacts WhatsApp mesurés ces 30 derniers jours. Un contact est une mise en relation — il ne constitue pas une vente confirmée.</p></div>
        <Link href={`/boutiques/${shop.id}`} className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-extrabold text-white transition hover:text-faso-gold">Améliorer ma vitrine <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>

      {/* Graphe 14 jours */}
      <div className="rounded-[1.75rem] border border-clay-200/80 bg-white p-5 shadow-[0_7px_25px_rgba(51,37,23,.04)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-faso-red">Tendance récente</p><h3 className="mt-1 text-lg font-black tracking-tight text-ink">Contacts sur 14 jours</h3></div><span className="inline-flex items-center gap-1.5 rounded-full bg-faso-green-soft/35 px-3 py-1.5 text-[10px] font-bold text-faso-green-dark"><Clock3 className="h-3 w-3" />Mis à jour automatiquement</span></div>
        <div className="mt-5 flex h-36 items-end gap-1.5 border-b border-clay-100 pb-1 sm:gap-2">
          {(stats?.byDay ?? []).map((d) => (
            <div
              key={d.date}
              className="group relative flex h-full flex-1 items-end"
              title={`${d.date} · ${d.count}`}
              aria-label={`${d.date} : ${d.count} contacts`}
            >
              <div
                className="w-full rounded-t-md bg-[linear-gradient(180deg,#43B879,#16874D)] transition-all group-hover:brightness-110"
                style={{
                  height: `${d.count === 0 ? 4 : Math.max((d.count / maxDay) * 100, 10)}%`,
                }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-ink px-1.5 py-1 text-[9px] font-bold text-white group-hover:block">{d.count}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-medium text-ink-muted">
          <span>Il y a 14 jours</span>
          <span>Aujourd’hui</span>
        </div>
      </div>
      </section>

      {/* Vérification + QR */}
      <section id="seller-trust" className="scroll-mt-24">
      <div className="mb-4"><p className="text-[10px] font-extrabold uppercase tracking-[.19em] text-faso-red">Confiance & visibilité</p><h2 className="mt-1 text-xl font-black tracking-tight text-ink sm:text-2xl">Faites rayonner votre boutique</h2></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.6rem] border border-clay-200/80 bg-white p-5 shadow-[0_7px_25px_rgba(51,37,23,.04)] sm:p-6">
          <div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${shop.verification_status === "verified" ? "bg-faso-green-soft/35 text-faso-green-dark" : "bg-faso-gold-soft/40 text-faso-gold-dark"}`}>
            {shop.verification_status === "verified" ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
            </span><div><p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-ink-muted">Confiance vendeur</p><h3 className="mt-0.5 font-extrabold text-ink">Statut de vérification</h3></div>
          </div>

          <div className="mt-4">
            {shop.verification_status === "verified" && (
              <>
                <VerifiedBadge size="md" />
                <p className="mt-3 text-sm text-ink-soft">
                  Votre identité (CNIB / NIF) et votre localisation ont été
                  contrôlées. Le badge doré rassure vos acheteurs.
                </p>
              </>
            )}
            {shop.verification_status === "pending" && (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-faso-gold-soft/50 px-3 py-1 text-xs font-bold text-faso-gold-dark">
                  Vérification en cours
                </span>
                <p className="mt-3 text-sm text-ink-soft">
                  Nous examinons vos documents. Réponse sous 48h ouvrées.
                </p>
              </>
            )}
            {shop.verification_status === "unverified" && (
              <>
                <p className="text-sm text-ink-soft">
                  Obtenez le badge <strong>« Vendeur Vérifié FasoLink »</strong>{" "}
                  en confirmant votre pièce d&apos;identité et votre adresse.
                </p>
                <Link
                  href="/vendeur/verification"
                  className="btn-base mt-4 h-10 bg-faso-red px-5 text-sm text-white"
                >
                  <BadgeCheck className="h-4 w-4" />
                  Demander la vérification
                </Link>
              </>
            )}
          </div>
        </div>

        <QRCodeCard shopId={shop.id} shopName={shop.name} />
      </div>
      </section>

      <p className="rounded-2xl border border-clay-200/70 bg-white/70 px-4 py-3 text-center text-[10px] leading-5 text-ink-muted">
        {demo
          ? "Mode démonstration — les contacts sont simulés localement."
          : "Les indicateurs sont alimentés par les événements de contact de votre vitrine."}
      </p>
    </div>
  );
}

function SellerNavigation() {
  const items = [
    { href: "#seller-overview", label: "Activité", icon: <Activity className="h-3.5 w-3.5" /> },
    { href: "#seller-catalog", label: "Catalogue", icon: <Package className="h-3.5 w-3.5" /> },
    { href: "#seller-performance", label: "Performance", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { href: "#seller-trust", label: "Visibilité", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  ];
  return <nav aria-label="Sections du tableau de bord vendeur" className="sticky top-2 z-30 -mx-1 flex gap-1 overflow-x-auto rounded-2xl border border-clay-200/75 bg-[#FFFEFC]/90 p-1.5 shadow-[0_8px_28px_rgba(51,37,23,.08)] backdrop-blur-xl sm:mx-0 sm:w-fit sm:gap-2 sm:p-2">{items.map((item) => <a key={item.href} href={item.href} className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold text-ink-soft transition hover:bg-clay-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-gold sm:px-4">{item.icon}{item.label}<ArrowRight className="h-3 w-3 text-ink-muted/50" /></a>)}</nav>;
}
