"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  LayoutGrid,
  LogIn,
  MapPin,
  Package,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { ButtonLink } from "@/components/ui/Button";
import { fetchOwnedShops, fetchLatestSubscription } from "@/lib/vendor-data";
import { fetchShops } from "@/lib/shops";
import type { ShopStatus, ShopWithProducts, Subscription } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type ShopRecord = { shop: ShopWithProducts; subscription: Subscription | null };

const STATUS_META: Record<ShopStatus, { label: string; className: string }> = {
  active: { label: "En ligne", className: "bg-faso-green-soft/45 text-faso-green-dark" },
  pending: { label: "En attente", className: "bg-faso-gold/20 text-[#8A5B00]" },
  suspended: { label: "Suspendue", className: "bg-faso-red/10 text-faso-red-dark" },
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Récemment" : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function categoryLabel(value: string) {
  return value === "electronique" ? "Électronique" : value.charAt(0).toUpperCase() + value.slice(1);
}

function statusFor(shop: ShopWithProducts, subscription: Subscription | null) {
  if (shop.status === "suspended") return "Accès suspendu";
  if (subscription?.status === "active") return "Licence active";
  if (subscription?.status === "trialing") return "Période d’essai";
  return shop.status === "active" ? "Publication à confirmer" : "Configuration en cours";
}

function MiniMetric({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return <div className="text-center"><span className="inline-flex items-center gap-1 text-faso-red"><span className="text-sm font-black text-ink">{value}</span>{icon}</span><p className="mt-0.5 text-[10px] font-semibold text-ink-muted">{label}</p></div>;
}

function ShopCard({ record, index }: { record: ShopRecord; index: number }) {
  const { shop, subscription } = record;
  const status = STATUS_META[shop.status];
  return (
    <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.06, 0.3), duration: 0.4, ease: "easeOut" }} className="group overflow-hidden rounded-[1.75rem] border border-clay-200/80 bg-white shadow-[0_12px_36px_rgba(51,37,23,.06)] transition duration-300 hover:-translate-y-1 hover:border-faso-gold/45 hover:shadow-premium-lg">
      <div className="relative h-36 overflow-hidden bg-[#17120E]">
        {shop.cover_url ? <Image src={shop.cover_url} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(220,166,55,.55),transparent_35%),linear-gradient(135deg,#302015,#17120E_62%,#1F6C4B)]" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#17120E]/75 via-[#17120E]/10 to-transparent" />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3"><span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold", status.className)}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status.label}</span><span className="rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[10px] font-bold text-white/85 backdrop-blur-sm">{categoryLabel(shop.category)}</span></div>
        <div className="absolute inset-x-4 bottom-4 flex items-end gap-3 text-white"><span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/25 bg-white/15 text-lg font-black backdrop-blur-sm">{shop.logo_url ? <Image src={shop.logo_url} alt="" fill sizes="48px" className="object-cover" /> : shop.name.trim().charAt(0).toLocaleUpperCase("fr")}</span><div className="min-w-0"><h2 className="truncate text-lg font-black tracking-tight">{shop.name}</h2><p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/70"><MapPin className="h-3 w-3 text-faso-gold" />{shop.city}</p></div></div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-3 divide-x divide-clay-100 rounded-2xl bg-clay-50/75 py-3"><MiniMetric icon={<Package className="h-3.5 w-3.5" />} value={shop.products.length} label="Produits" /><MiniMetric icon={<TrendingUp className="h-3.5 w-3.5" />} value={shop.whatsapp_clicks ?? 0} label="Contacts" /><MiniMetric icon={<CheckCircle2 className="h-3.5 w-3.5" />} value={shop.rating_count ?? 0} label="Avis" /></div>
        <div className="mt-5 flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-faso-red">État commercial</p><p className="mt-1 text-sm font-bold text-ink">{statusFor(shop, subscription)}</p></div><span className="text-right text-[11px] text-ink-muted">Modifiée<br />{formatDate(shop.updated_at)}</span></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2"><Link href={`/boutiques/${shop.id}/parametres`} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-faso-red px-4 text-xs font-extrabold text-white shadow-premium transition hover:-translate-y-0.5 hover:bg-faso-red-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red"><Settings2 className="h-4 w-4" /> Modifier</Link><Link href={`/boutiques/${shop.id}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-clay-200 bg-white px-4 text-xs font-extrabold text-ink transition hover:border-faso-gold hover:bg-clay-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red">Voir la vitrine <ExternalLink className="h-3.5 w-3.5 text-ink-muted" /></Link></div>
      </div>
    </motion.article>
  );
}

function LoadingGrid() {
  return <div className="grid gap-5 md:grid-cols-2"><div className="h-[25rem] animate-pulse rounded-[1.75rem] bg-clay-100" /><div className="h-[25rem] animate-pulse rounded-[1.75rem] bg-clay-100" /></div>;
}

export function OwnedShopsLoader() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const reduceMotion = useReducedMotion();
  const [records, setRecords] = useState<ShopRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!isConfigured) {
          const demoShops = await fetchShops();
          if (mounted) setRecords(demoShops.map((shop) => ({ shop, subscription: null })));
          return;
        }
        if (!user || user.isAnonymous) return;
        const owned = await fetchOwnedShops(user.uid);
        const next = await Promise.all(owned.map(async (shop) => ({ shop, subscription: await fetchLatestSubscription(shop.id) })));
        if (mounted) setRecords(next);
      } catch (cause) {
        if (mounted) setError(cause instanceof Error ? cause.message : "Impossible de charger vos boutiques.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [authLoading, isConfigured, user]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    if (!normalized) return records;
    return records.filter(({ shop }) => `${shop.name} ${shop.city} ${shop.category}`.toLocaleLowerCase("fr").includes(normalized));
  }, [query, records]);

  if (authLoading || loading) return <LoadingGrid />;
  if (isConfigured && (!user || user.isAnonymous)) return <div className="card-premium mx-auto max-w-xl p-8 text-center sm:p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-faso-red/10 text-faso-red"><LogIn className="h-6 w-6" /></span><h2 className="mt-5 text-2xl font-black tracking-tight text-ink">Connectez-vous pour voir vos boutiques</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">Cet espace affiche uniquement les vitrines créées avec votre compte vendeur.</p><ButtonLink href="/connexion" className="mt-6"><LogIn className="h-4 w-4" /> Ouvrir ma session</ButtonLink></div>;
  if (error) return <p role="alert" className="rounded-2xl bg-faso-red/10 px-5 py-4 text-sm font-medium text-faso-red-dark">{error}</p>;

  return <div className="space-y-7">
    <motion.section initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative isolate overflow-hidden rounded-[2rem] bg-[#17120E] p-6 text-white shadow-premium-lg sm:p-8"><div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_90%_0%,rgba(220,166,55,.28),transparent_35%),radial-gradient(ellipse_at_0%_100%,rgba(31,146,84,.24),transparent_42%)]" /><div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border border-white/[.08]" /><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#F3D88E]"><Sparkles className="h-3.5 w-3.5" /> Vue portefeuille</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Vos vitrines, au même endroit.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/60">Passez d’une boutique à l’autre, ajustez vos informations publiques et gardez une vision claire de votre activité.</p></div><div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3"><LayoutGrid className="h-5 w-5 text-faso-gold" /><div><p className="text-2xl font-black">{records.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-white/50">boutique{records.length > 1 ? "s" : ""}</p></div></div></div></motion.section>
    {records.length > 0 && <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative min-w-0 sm:w-80"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une boutique…" aria-label="Rechercher une boutique" className="h-11 w-full rounded-full border border-clay-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-faso-gold focus:ring-2 focus:ring-faso-gold/15" /></div><Link href="/vendeur/inscription" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-clay-200 bg-white px-5 text-xs font-extrabold text-ink transition hover:border-faso-red hover:text-faso-red"><Plus className="h-4 w-4" /> Ouvrir une boutique</Link></div>}
    {filtered.length === 0 ? <div className="card-premium p-10 text-center sm:p-14"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-faso-gold/15 text-faso-gold-dark"><Store className="h-6 w-6" /></span><h2 className="mt-5 text-2xl font-black tracking-tight text-ink">{records.length ? "Aucun résultat" : "Votre portefeuille est prêt"}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">{records.length ? "Essayez un autre nom, une autre ville ou une autre catégorie." : "Créez votre première boutique électronique et gérez-la ici dès sa publication."}</p><ButtonLink href={records.length ? "/vendeur/boutiques" : "/vendeur/inscription"} className="mt-6">{records.length ? "Réinitialiser la recherche" : "Créer ma boutique"}<ArrowRight className="h-4 w-4" /></ButtonLink></div> : <div className="grid gap-5 md:grid-cols-2">{filtered.map((record, index) => <ShopCard key={record.shop.id} record={record} index={index} />)}</div>}
    <div className="flex items-start gap-3 rounded-2xl border border-clay-200/80 bg-white/70 px-4 py-4 text-xs leading-5 text-ink-muted"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-faso-gold" /><p>Chaque modification reste limitée à la boutique dont vous êtes propriétaire. Les statuts d’abonnement, de vérification et de publication restent protégés par FasoLink.</p></div>
  </div>;
}
