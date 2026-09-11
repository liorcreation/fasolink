"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  ExternalLink,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { TRIAL_DAYS } from "@/lib/constants";
import { cn, formatCFA } from "@/lib/utils";
import {
  getLocalContactStats,
  seedDemoContactEvents,
  type ContactStats,
} from "@/lib/tracking";
import { QRCodeCard } from "@/components/vendeur/QRCodeCard";
import { VerifiedBadge } from "@/components/shops/VerifiedBadge";

export function VendorDashboard({ shop }: { shop: ShopWithProducts }) {
  const [stats, setStats] = useState<ContactStats | null>(null);

  useEffect(() => {
    seedDemoContactEvents(shop.id);
    setStats(getLocalContactStats(shop.id));
    const id = setInterval(
      () => setStats(getLocalContactStats(shop.id)),
      5000,
    );
    return () => clearInterval(id);
  }, [shop.id]);

  const trialLeft = 9; // démo : jour 5/14
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
    <div className="space-y-6">
      {/* Bandeau essai gratuit */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 rounded-3xl border border-faso-gold/40 bg-faso-gold-soft/20 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-faso-gold text-white">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">
              Essai gratuit — {trialLeft} jours restants
            </p>
            <p className="text-xs text-ink-muted">
              Votre boutique est en ligne. Aucun paiement requis avant la fin de
              la période de {TRIAL_DAYS} jours.
            </p>
          </div>
        </div>
        <Link
          href="/vendeur/paiement"
          className="btn-base h-10 shrink-0 bg-faso-red px-5 text-sm text-white"
        >
          Activer mon abonnement
        </Link>
      </motion.div>

      {/* En-tête boutique */}
      <div className="card-premium flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-2xl bg-clay-100">
            {shop.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shop.logo_url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-display text-lg font-bold text-ink">
              {shop.name}
            </p>
            <p className="text-xs text-ink-muted">
              {shop.neighborhood ? `${shop.neighborhood}, ` : ""}
              {shop.city} · {shop.products.length} produits
            </p>
          </div>
        </div>
        <Link
          href={`/boutiques/${shop.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-faso-red hover:gap-2"
        >
          Voir ma vitrine
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* KPIs contacts */}
      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-premium p-5"
          >
            <k.icon className="h-5 w-5 text-faso-green" />
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
              {k.value}
            </p>
            <p className="text-sm font-semibold text-ink">{k.label}</p>
            <p className="text-xs text-ink-muted">{k.hint}</p>
          </motion.div>
        ))}
      </div>

      {/* Preuve de valeur */}
      <div className="rounded-3xl bg-faso-gradient bg-[length:200%_200%] p-5 text-white animate-gradient-pan">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ArrowUpRight className="h-4 w-4" />
          Votre boutique a généré{" "}
          <strong>{stats?.last30d ?? 0} contacts WhatsApp</strong> ce mois-ci —
          soit une valeur estimée de{" "}
          <strong>
            {formatCFA(
              (stats?.last30d ?? 0) *
                Math.round(
                  shop.products.reduce((a, p) => a + p.price, 0) /
                    Math.max(shop.products.length, 1),
                ),
            )}
          </strong>{" "}
          de paniers potentiels.
        </p>
      </div>

      {/* Graphe 14 jours */}
      <div className="card-premium p-5">
        <p className="text-sm font-bold text-ink">Contacts — 14 derniers jours</p>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {(stats?.byDay ?? []).map((d) => (
            <div
              key={d.date}
              className="group relative flex-1"
              title={`${d.date} · ${d.count}`}
            >
              <div
                className="w-full rounded-t bg-faso-green/80 transition-all group-hover:bg-faso-green"
                style={{
                  height: `${Math.max((d.count / maxDay) * 100, 4)}%`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-ink-muted">
          <span>il y a 14 j</span>
          <span>aujourd&apos;hui</span>
        </div>
      </div>

      {/* Vérification + QR */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6">
          <div className="flex items-center gap-2">
            {shop.verification_status === "verified" ? (
              <ShieldCheck className="h-5 w-5 text-faso-green" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-faso-gold-dark" />
            )}
            <h3 className="font-bold text-ink">Statut de vérification</h3>
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

      <p
        className={cn(
          "rounded-xl bg-clay-50 px-4 py-3 text-center text-xs text-ink-muted",
        )}
      >
        Démo — les contacts sont simulés localement. Connecté à Firebase, ces
        chiffres proviennent de <code>shops/&lt;id&gt;.whatsapp_clicks</code> et de
        la collection <code>contact_events</code>.
      </p>
    </div>
  );
}
