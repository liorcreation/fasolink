"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowDown, ArrowRight, BadgeCheck, Check, Eye, KeyRound, Loader2, LockKeyhole, ShieldAlert, Sparkles, Store, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { Shop, ShopStatus, VerificationRequest } from "@/lib/database.types";
import {
  fetchAdminSnapshot,
  getAdminCapabilities,
  getVerificationMedia,
  reviewVerification,
  updateShopStatus,
} from "@/lib/admin-data";
import { SuperAdminLicenses } from "@/components/admin/SuperAdminLicenses";

export function AdminDashboard() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [media, setMedia] = useState<{ recto: string; verso: string | null } | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const load = useCallback(async () => {
    if (!user || !isConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const capabilities = await getAdminCapabilities();
      setIsSuperAdmin(capabilities.superAdmin);
      if (!capabilities.superAdmin) {
        setShops([]);
        setVerifications([]);
        setError("Accès réservé au Super Admin FasoLink.");
        return;
      }
      const snapshot = await fetchAdminSnapshot();
      setShops(snapshot.shops);
      setVerifications(snapshot.verifications);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de charger le back-office.");
    } finally {
      setLoading(false);
    }
  }, [isConfigured, user]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const pending = useMemo(
    () => verifications.filter((request) => request.status === "pending"),
    [verifications],
  );

  async function decide(request: VerificationRequest, status: "approved" | "rejected") {
    setBusyId(request.id);
    setError(null);
    try {
      const reason = status === "rejected" ? window.prompt("Motif du rejet (facultatif)") ?? undefined : undefined;
      await reviewVerification(request, status, reason);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Action impossible.");
    } finally {
      setBusyId(null);
    }
  }

  async function openDocuments(request: VerificationRequest) {
    setBusyId(request.id);
    setError(null);
    try {
      setMedia(await getVerificationMedia(request));
      setSelectedRequest(request);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d’ouvrir les documents.");
    } finally {
      setBusyId(null);
    }
  }

  async function changeStatus(shopId: string, status: ShopStatus) {
    setBusyId(shopId);
    setError(null);
    try {
      await updateShopStatus(shopId, status);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Action impossible.");
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading || loading) {
    return <div className="card-premium flex justify-center gap-3 p-8 text-sm text-ink-muted"><Loader2 className="h-5 w-5 animate-spin text-faso-red" /> Chargement du back-office…</div>;
  }
  if (!isConfigured) {
    return <div className="card-premium mx-auto max-w-lg p-8 text-center"><ShieldAlert className="mx-auto h-8 w-8 text-faso-gold" /><h2 className="mt-4 text-xl font-bold text-ink">Back-office indisponible en mode démo</h2><p className="mt-2 text-sm text-ink-soft">Configurez Firebase et un compte administrateur pour activer cette zone.</p></div>;
  }
  if (!user) {
    return <div className="card-premium mx-auto max-w-lg p-8 text-center"><LockKeyhole className="mx-auto h-8 w-8 text-faso-red" /><h2 className="mt-4 text-xl font-bold text-ink">Accès administrateur</h2><ButtonLink href="/connexion" className="mt-5">Se connecter</ButtonLink></div>;
  }
  if (!isSuperAdmin) {
    return <div className="card-premium mx-auto max-w-lg p-8 text-center"><LockKeyhole className="mx-auto h-8 w-8 text-faso-red" /><h2 className="mt-4 text-xl font-bold text-ink">Espace réservé au Super Admin</h2><p className="mt-2 text-sm text-ink-soft">Les outils d’administration et de gestion des licences sont réunis dans la plateforme Super Admin FasoLink.</p></div>;
  }

  return (
    <div className="space-y-7 pb-8">
      {error && <p role="alert" className="flex items-start gap-3 rounded-2xl border border-faso-red/15 bg-faso-red-soft/50 px-4 py-3.5 text-sm font-medium text-faso-red-dark"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className="relative isolate overflow-hidden rounded-[2rem] bg-[#17120E] px-6 py-8 text-white shadow-premium-lg sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_20%,rgba(220,166,55,0.22),transparent_38%),radial-gradient(ellipse_at_10%_110%,rgba(207,39,43,0.17),transparent_42%)]" />
        <div className="pointer-events-none absolute -right-16 -top-28 -z-10 h-72 w-72 rounded-full border border-white/[0.07] sm:h-96 sm:w-96" />
        <div className="pointer-events-none absolute -right-4 -top-16 -z-10 h-52 w-52 rounded-full border border-white/[0.07] sm:right-8 sm:top-[-5rem] sm:h-72 sm:w-72" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-faso-gold/30 bg-faso-gold/[0.09] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F5D98E]"><Sparkles className="h-3.5 w-3.5" /> Centre de commandement</div>
            <h2 className="mt-5 text-3xl font-black leading-[1.05] tracking-[-0.04em] sm:text-4xl lg:text-5xl">La marketplace,<br className="hidden sm:block" /> sous contrôle.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">Pilotez les accès, la confiance et la qualité de FasoLink depuis un espace unique, conçu pour décider vite et agir avec précision.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#admin-licenses" className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-faso-gold px-5 text-sm font-extrabold text-[#21170A] shadow-[0_8px_24px_rgba(220,166,55,.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#F1CA70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><KeyRound className="h-4 w-4" /> Gérer les licences <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></a>
              <a href="#admin-verifications" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><BadgeCheck className="h-4 w-4" /> Examiner les dossiers</a>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 backdrop-blur-sm lg:self-end">
            <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-faso-green/15 text-[#8FE1AE]"><Activity className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#70D695] shadow-[0_0_12px_#70D695]" /></span>
            <span><span className="block text-xs font-extrabold text-white">Console opérationnelle</span><span className="mt-0.5 block text-[11px] text-white/50">Données synchronisées</span></span>
          </div>
        </div>
        <a href="#admin-overview" aria-label="Voir les indicateurs" className="absolute bottom-7 right-8 hidden h-10 w-10 place-items-center rounded-full border border-white/15 text-white/60 transition hover:bg-white/10 hover:text-white lg:grid"><ArrowDown className="h-4 w-4" /></a>
      </motion.section>

      <section id="admin-overview" aria-label="Vue d’ensemble" className="scroll-mt-24">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.19em] text-faso-red">Vue d’ensemble</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">L’activité en un regard</h2></div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted"><Activity className="h-3.5 w-3.5 text-faso-green" /> Indicateurs en temps réel</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<Store className="h-5 w-5" />} label="Boutiques référencées" value={shops.length} detail="Ensemble de la marketplace" tone="gold" />
          <Metric icon={<BadgeCheck className="h-5 w-5" />} label="À vérifier" value={pending.length} detail={pending.length ? "Dossiers à examiner" : "Tout est à jour"} tone={pending.length ? "red" : "green"} href="#admin-verifications" />
          <Metric icon={<ShieldAlert className="h-5 w-5" />} label="Boutiques suspendues" value={shops.filter((shop) => shop.status === "suspended").length} detail="Accès actuellement limité" tone="red" href="#admin-shops" />
          <Metric icon={<Check className="h-5 w-5" />} label="Confiance vendeur" value={shops.filter((shop) => shop.verification_status === "verified").length} detail="Profils vérifiés" tone="green" />
        </div>
      </section>

      <nav aria-label="Sections d’administration" className="sticky top-2 z-20 -mx-1 flex gap-1 overflow-x-auto rounded-2xl border border-clay-200/80 bg-white/90 p-1.5 shadow-[0_8px_26px_rgba(51,37,23,.07)] backdrop-blur-xl sm:mx-0 sm:w-fit sm:gap-2 sm:p-2">
        <AdminNavItem href="#admin-licenses" icon={<KeyRound className="h-3.5 w-3.5" />} label="Licences" />
        <AdminNavItem href="#admin-verifications" icon={<BadgeCheck className="h-3.5 w-3.5" />} label="Vérifications" count={pending.length} />
        <AdminNavItem href="#admin-shops" icon={<Store className="h-3.5 w-3.5" />} label="Boutiques" />
      </nav>

      <div id="admin-licenses" className="scroll-mt-24">{isSuperAdmin && <SuperAdminLicenses shops={shops} onChanged={() => void load()} />}</div>

      <motion.section id="admin-verifications" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="card-premium scroll-mt-24 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-clay-100 px-5 py-5 md:px-7">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-faso-gold-soft/45 text-faso-gold-dark"><BadgeCheck className="h-5 w-5" /></span><div><h2 className="text-lg font-extrabold tracking-tight text-ink">Vérification des vendeurs</h2><p className="mt-0.5 text-xs text-ink-muted">Examinez les justificatifs et renforcez la confiance.</p></div></div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${pending.length ? "bg-faso-gold-soft/50 text-faso-gold-dark" : "bg-faso-green-soft/40 text-faso-green-dark"}`}>{pending.length ? `${pending.length} à traiter` : "Tout est à jour"}</span>
        </div>
        <div className="mt-4 space-y-3">
          {pending.length === 0 && <div className="mx-5 mb-5 grid justify-items-center rounded-2xl border border-dashed border-faso-green/20 bg-faso-green-soft/15 px-5 py-9 text-center md:mx-7"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-faso-green shadow-sm"><Check className="h-5 w-5" /></span><p className="mt-3 text-sm font-bold text-ink">Aucun dossier en attente</p><p className="mt-1 max-w-sm text-xs leading-5 text-ink-muted">Les nouvelles demandes de vérification apparaîtront ici dès leur envoi.</p></div>}
          {pending.map((request) => {
            const shop = shops.find((item) => item.id === request.shop_id);
            return (
              <motion.div key={request.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-clay-200/80 bg-white/70 p-4 transition-colors hover:border-faso-gold/50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{shop?.name ?? request.shop_id}</p>
                    <p className="mt-1 text-sm text-ink-soft">{request.full_name} · {request.document_type.toUpperCase()} · {request.document_number}</p>
                    <p className="mt-1 text-xs text-ink-muted">Reçu le {new Date(request.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" disabled={busyId === request.id} onClick={() => void openDocuments(request)}><Eye className="h-4 w-4" /> Documents</Button>
                    <Button size="sm" variant="secondary" disabled={busyId === request.id} onClick={() => void decide(request, "approved")}>Valider</Button>
                    <Button size="sm" variant="outline" disabled={busyId === request.id} onClick={() => void decide(request, "rejected")}>Rejeter</Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {selectedRequest && media && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Documents de vérification">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-5 shadow-premium-lg md:p-7">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-lg font-bold text-ink">Documents de {selectedRequest.full_name}</p><p className="text-xs text-ink-muted">{selectedRequest.document_type.toUpperCase()} · {selectedRequest.document_number}</p></div>
              <button type="button" onClick={() => { setSelectedRequest(null); setMedia(null); }} className="grid h-10 w-10 place-items-center rounded-full bg-clay-100 text-ink-muted hover:text-ink" aria-label="Fermer"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DocumentPreview label="Recto" src={media.recto} />
              {media.verso && <DocumentPreview label="Verso" src={media.verso} />}
            </div>
            <p className="mt-5 rounded-xl bg-faso-gold-soft/30 px-4 py-3 text-xs text-ink-soft">Ces documents privés sont accessibles uniquement au Super Admin autorisé et supprimés après validation.</p>
          </div>
        </div>
      )}

      <motion.section id="admin-shops" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium scroll-mt-24 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-clay-100 px-5 py-5 md:px-7">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-faso-red-soft/35 text-faso-red"><Store className="h-5 w-5" /></span><div><h2 className="text-lg font-extrabold tracking-tight text-ink">Modération des boutiques</h2><p className="mt-0.5 text-xs text-ink-muted">Gérez l’accès et le statut des boutiques FasoLink.</p></div></div>
          <span className="rounded-full bg-clay-50 px-3 py-1.5 text-xs font-bold text-ink-soft">{shops.length} boutique{shops.length > 1 ? "s" : ""}</span>
        </div>
        <div className="divide-y divide-clay-100 px-5 md:px-7">
          {shops.length === 0 && <p className="py-8 text-center text-sm text-ink-muted">Aucune boutique à modérer.</p>}
          {shops.map((shop) => <ShopRow key={shop.id} shop={shop} busy={busyId === shop.id} onChange={changeStatus} />)}
        </div>
      </motion.section>
    </div>
  );
}

function DocumentPreview({ label, src }: { label: string; src: string }) {
  return <figure className="overflow-hidden rounded-2xl border border-clay-200 bg-clay-50"><div className="flex h-64 items-center justify-center p-3">
    {/* eslint-disable-next-line @next/next/no-img-element -- URL Firebase Storage privée affichée seulement après autorisation admin. */}
    <img src={src} alt={`${label} de la pièce`} className="max-h-full max-w-full rounded-xl object-contain" />
  </div><figcaption className="border-t border-clay-200 bg-white px-3 py-2 text-xs font-bold text-ink">{label}</figcaption></figure>;
}

function Metric({ icon, label, value, detail, tone, href }: { icon: React.ReactNode; label: string; value: number; detail: string; tone: "gold" | "red" | "green"; href?: string }) {
  const tones = { gold: "bg-faso-gold-soft/45 text-faso-gold-dark", red: "bg-faso-red-soft/40 text-faso-red-dark", green: "bg-faso-green-soft/45 text-faso-green-dark" };
  const className = "group relative flex min-h-36 flex-col overflow-hidden rounded-[1.4rem] border border-clay-200/80 bg-white p-5 shadow-[0_5px_18px_rgba(51,37,23,.035)] transition duration-200 hover:-translate-y-0.5 hover:border-faso-gold/35 hover:shadow-premium";
  const content = <><div className="flex items-start justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>{href && <ArrowRight className="h-4 w-4 text-ink-muted/50 transition group-hover:translate-x-0.5 group-hover:text-faso-red" />}</div><p className="mt-4 text-3xl font-black tracking-tight text-ink">{value}</p><p className="mt-0.5 text-sm font-bold text-ink">{label}</p><p className="mt-1 text-[11px] text-ink-muted">{detail}</p></>;
  return href ? <a href={href} className={className}>{content}</a> : <div className={className}>{content}</div>;
}

function AdminNavItem({ href, icon, label, count }: { href: string; icon: React.ReactNode; label: string; count?: number }) {
  return <a href={href} className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold text-ink-soft transition-colors hover:bg-clay-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-gold sm:px-4">{icon}{label}{typeof count === "number" && count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-faso-red px-1 text-[10px] font-extrabold text-white">{count}</span>}</a>;
}

function ShopRow({ shop, busy, onChange }: { shop: Shop; busy: boolean; onChange: (shopId: string, status: ShopStatus) => Promise<void> }) {
  const next: ShopStatus = shop.status === "suspended" ? "active" : "suspended";
  return <div className="flex flex-wrap items-center justify-between gap-4 py-4"><div className="flex min-w-0 items-center gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${shop.status === "suspended" ? "bg-faso-red-soft/40 text-faso-red" : "bg-faso-green-soft/40 text-faso-green-dark"}`}><Store className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{shop.name}</p><p className="mt-0.5 text-xs text-ink-muted">{shop.city} <span className="mx-1">·</span> Vérification {shop.verification_status}</p></div></div><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${shop.status === "suspended" ? "bg-faso-red-soft/45 text-faso-red-dark" : "bg-faso-green-soft/40 text-faso-green-dark"}`}>{shop.status === "suspended" ? "Suspendue" : "Active"}</span><Button size="sm" variant={next === "active" ? "secondary" : "outline"} disabled={busy} onClick={() => void onChange(shop.id, next)}>{next === "active" ? "Réactiver" : "Suspendre"}</Button></div></div>;
}
