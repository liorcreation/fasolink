"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Eye, Loader2, LockKeyhole, ShieldAlert, Store, X } from "lucide-react";
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
    <div className="space-y-6">
      {error && <p className="rounded-xl bg-faso-red-soft/40 px-4 py-3 text-sm text-faso-red-dark">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Store className="h-5 w-5" />} label="Boutiques" value={shops.length} />
        <Metric icon={<BadgeCheck className="h-5 w-5" />} label="Vérifications en attente" value={pending.length} />
        <Metric icon={<ShieldAlert className="h-5 w-5" />} label="Boutiques suspendues" value={shops.filter((shop) => shop.status === "suspended").length} />
      </div>

      {isSuperAdmin && <SuperAdminLicenses shops={shops} onChanged={() => void load()} />}

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5 md:p-6">
        <h2 className="text-lg font-bold text-ink">Demandes de vérification</h2>
        <div className="mt-4 space-y-3">
          {pending.length === 0 && <p className="rounded-xl bg-clay-50 p-4 text-sm text-ink-muted">Aucun dossier en attente.</p>}
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

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-5 md:p-6">
        <h2 className="text-lg font-bold text-ink">Modération des boutiques</h2>
        <div className="mt-4 divide-y divide-clay-100">
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

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="card-premium relative overflow-hidden p-5"><div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-faso-gold/10 blur-2xl" /><span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-faso-red-soft/35 text-faso-red">{icon}</span><p className="mt-4 text-3xl font-extrabold tracking-tight text-ink">{value}</p><p className="mt-1 text-sm font-semibold text-ink">{label}</p></div>;
}

function ShopRow({ shop, busy, onChange }: { shop: Shop; busy: boolean; onChange: (shopId: string, status: ShopStatus) => Promise<void> }) {
  const next: ShopStatus = shop.status === "suspended" ? "active" : "suspended";
  return <div className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold text-ink">{shop.name}</p><p className="text-xs text-ink-muted">{shop.city} · {shop.status} · vérification {shop.verification_status}</p></div><Button size="sm" variant={next === "active" ? "secondary" : "outline"} disabled={busy} onClick={() => void onChange(shop.id, next)}>{next === "active" ? "Réactiver" : "Suspendre"}</Button></div>;
}
