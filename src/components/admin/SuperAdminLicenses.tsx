"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  CircleDollarSign,
  Clock3,
  Gift,
  History,
  KeyRound,
  Loader2,
  PauseCircle,
  Plus,
  Search,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import {
  fetchAdminAuditLogs,
  fetchAllSubscriptions,
  grantShopLicense,
  revokeShopLicense,
} from "@/lib/admin-data";
import type { AdminAuditLog, Shop, Subscription, SubscriptionPlan } from "@/lib/database.types";
import { formatCFA } from "@/lib/utils";

const PLAN_MONTHS: Record<SubscriptionPlan, number> = {
  mensuel: 1,
  trimestriel: 3,
  annuel: 12,
};

function dateLabel(value: string | null | undefined) {
  if (!value) return "Sans échéance";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date inconnue" : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function statusMeta(status: Subscription["status"]) {
  if (status === "active") return { label: "Active", classes: "bg-faso-green-soft/40 text-faso-green-dark" };
  if (status === "trialing") return { label: "Essai", classes: "bg-faso-gold-soft/50 text-faso-gold-dark" };
  if (status === "pending") return { label: "En attente", classes: "bg-blue-50 text-blue-700" };
  if (status === "expired") return { label: "Expirée", classes: "bg-clay-100 text-ink-muted" };
  return { label: "Révoquée", classes: "bg-faso-red-soft/50 text-faso-red-dark" };
}

export function SuperAdminLicenses({ shops, onChanged }: { shops: Shop[]; onChanged?: () => void }) {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shopId, setShopId] = useState("");
  const [plan, setPlan] = useState<SubscriptionPlan>("mensuel");
  const [months, setMonths] = useState(1);
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [revokeTarget, setRevokeTarget] = useState<Subscription | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextSubscriptions, nextLogs] = await Promise.all([
        fetchAllSubscriptions(),
        fetchAdminAuditLogs(),
      ]);
      setSubscriptions(nextSubscriptions.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")));
      setAuditLogs(nextLogs);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de charger les licences.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const activeCount = useMemo(
    () => subscriptions.filter((item) => item.status === "active" || item.status === "trialing").length,
    [subscriptions],
  );
  const shopById = useMemo(() => new Map(shops.map((shop) => [shop.id, shop])), [shops]);
  const selectedPlan = SUBSCRIPTION_PLANS.find((item) => item.id === plan);
  const visibleSubscriptions = useMemo(() => subscriptions.filter((item) => {
    const shopName = shopById.get(item.shop_id)?.name ?? item.shop_id;
    const query = search.trim().toLocaleLowerCase("fr");
    const matchesText = !query || `${shopName} ${item.reference ?? ""} ${item.plan}`.toLocaleLowerCase("fr").includes(query);
    return matchesText && (statusFilter === "all" || item.status === statusFilter);
  }), [search, shopById, statusFilter, subscriptions]);

  function choosePlan(value: SubscriptionPlan) {
    setPlan(value);
    setMonths(PLAN_MONTHS[value]);
    setAmount(SUBSCRIPTION_PLANS.find((item) => item.id === value)?.price ?? 0);
  }

  async function submitGrant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shopId) {
      setError("Sélectionnez une boutique à licencier.");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await grantShopLicense({ shopId, plan, months, amount, reason, currentSubscriptions: subscriptions });
      setReason("");
      setSuccess(`Licence accordée à ${shopById.get(shopId)?.name ?? "la boutique"}.`);
      await load();
      onChanged?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L'octroi de la licence a échoué.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmRevoke() {
    if (!revokeTarget) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await revokeShopLicense({ subscription: revokeTarget, reason: revokeReason, currentSubscriptions: subscriptions });
      setSuccess(`Licence de ${shopById.get(revokeTarget.shop_id)?.name ?? "la boutique"} révoquée.`);
      setRevokeTarget(null);
      setRevokeReason("");
      await load();
      onChanged?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La révocation de la licence a échoué.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="card-premium flex items-center justify-center gap-3 p-8 text-sm text-ink-muted"><Loader2 className="h-5 w-5 animate-spin text-faso-red" /> Chargement de la console des licences…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-[#17120E] p-6 text-white shadow-premium-lg md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full bg-faso-gold/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-faso-gold"><ShieldCheck className="h-3.5 w-3.5" /> Super Admin Control</span>
            <h2 className="mt-4 text-2xl font-extrabold md:text-3xl">Licences & accès boutiques</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">Accordez une période d’accès, offrez une licence, prolongez une échéance ou révoquez un accès. Chaque décision est historisée.</p>
          </div>
          <div className="grid min-w-[220px] grid-cols-2 gap-3">
            <Summary icon={<Store className="h-4 w-4" />} value={String(shops.length)} label="Boutiques" />
            <Summary icon={<KeyRound className="h-4 w-4" />} value={String(activeCount)} label="Licences actives" />
          </div>
        </div>
      </section>

      {error && <p role="alert" className="rounded-2xl border border-faso-red/15 bg-faso-red-soft/40 px-4 py-3 text-sm text-faso-red-dark">{error}</p>}
      {success && <p role="status" className="flex items-center gap-2 rounded-2xl border border-faso-green/15 bg-faso-green-soft/30 px-4 py-3 text-sm font-semibold text-faso-green-dark"><Check className="h-4 w-4" />{success}</p>}

      <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={submitGrant} className="card-premium space-y-5 p-5 md:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-faso-gold-soft/50 text-faso-gold-dark"><Plus className="h-5 w-5" /></span>
            <div><h3 className="text-lg font-bold text-ink">Accorder une licence</h3><p className="mt-1 text-xs leading-5 text-ink-muted">La durée s’ajoute à l’échéance actuelle si elle est encore valide.</p></div>
          </div>

          <label className="block text-sm font-semibold text-ink">Boutique
            <select required value={shopId} onChange={(event) => setShopId(event.target.value)} className="input-premium mt-2">
              <option value="">Choisir une boutique…</option>
              {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name} · {shop.city}</option>)}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">Formule
              <select value={plan} onChange={(event) => choosePlan(event.target.value as SubscriptionPlan)} className="input-premium mt-2">
                {SUBSCRIPTION_PLANS.map((item) => <option key={item.id} value={item.id}>{item.label} · {formatCFA(item.price)}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink">Durée (mois)
              <input type="number" min={1} max={24} step={1} value={months} onChange={(event) => setMonths(Number(event.target.value))} className="input-premium mt-2" required />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setAmount(0)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${amount === 0 ? "border-faso-gold bg-faso-gold-soft/25" : "border-clay-200 bg-white"}`}>
              <Gift className="h-5 w-5 text-faso-gold-dark" /><span><span className="block text-sm font-bold text-ink">Offerte</span><span className="text-xs text-ink-muted">Gratuité contrôlée</span></span>
            </button>
            <button type="button" onClick={() => setAmount(selectedPlan?.price ?? 0)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${amount > 0 ? "border-faso-gold bg-faso-gold-soft/25" : "border-clay-200 bg-white"}`}>
              <CircleDollarSign className="h-5 w-5 text-faso-green" /><span><span className="block text-sm font-bold text-ink">Payée / validée</span><span className="text-xs text-ink-muted">Saisie manuelle</span></span>
            </button>
          </div>
          {amount > 0 && <label className="block text-sm font-semibold text-ink">Montant validé (FCFA)
            <input type="number" min={1} step={1} value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="input-premium mt-2" required />
          </label>}

          <label className="block text-sm font-semibold text-ink">Motif et référence de validation
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={8} maxLength={500} rows={3} placeholder="Ex. Paiement vérifié par Orange Money, référence…" className="input-premium mt-2 h-auto py-3" required />
          </label>
          <p className="rounded-xl bg-clay-50 px-3 py-2.5 text-xs leading-5 text-ink-muted"><CalendarClock className="mr-1 inline h-3.5 w-3.5 text-faso-red" /> L’échéance sera calculée automatiquement. Le motif et l’identité de l’administrateur seront conservés dans l’historique.</p>
          <Button type="submit" size="lg" disabled={busy || shops.length === 0} className="w-full">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Accorder l’accès</Button>
        </form>

        <section className="card-premium overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-clay-100 px-5 py-4 md:px-6">
            <div><h3 className="text-lg font-bold text-ink">Toutes les licences</h3><p className="mt-0.5 text-xs text-ink-muted">Paiements opérateur et décisions manuelles</p></div>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void load()}><History className="h-4 w-4" /> Actualiser</Button>
          </div>
          <div className="grid gap-3 border-b border-clay-100 bg-clay-50/60 p-4 sm:grid-cols-[1fr_170px] md:px-6">
            <label className="relative block"><span className="sr-only">Rechercher une licence</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Boutique, référence, formule…" className="input-premium h-10 pl-9" /></label>
            <label><span className="sr-only">Filtrer par statut</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-premium h-10"><option value="all">Tous les statuts</option><option value="active">Actives</option><option value="trialing">Essais</option><option value="pending">En attente</option><option value="expired">Expirées</option><option value="cancelled">Révoquées</option></select></label>
          </div>
          <div className="divide-y divide-clay-100">
            {subscriptions.length === 0 && <p className="p-6 text-sm text-ink-muted">Aucune licence enregistrée.</p>}
            {subscriptions.length > 0 && visibleSubscriptions.length === 0 && <p className="p-6 text-sm text-ink-muted">Aucune licence ne correspond à ces critères.</p>}
            {visibleSubscriptions.map((item) => {
              const shop = shopById.get(item.shop_id);
              const status = statusMeta(item.status);
              const canRevoke = item.status === "active" || item.status === "trialing";
              return <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4 md:px-6">
                <div className="min-w-[180px] flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-bold text-ink">{shop?.name ?? item.shop_id}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${status.classes}`}>{status.label}</span></div>
                  <p className="mt-1 text-xs text-ink-muted">{item.plan} · {item.license_type === "complimentary" ? "Offerte" : item.license_type === "manual_paid" ? "Validation manuelle" : item.gateway ?? "Abonnement"}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft"><Clock3 className="h-3.5 w-3.5" /> Jusqu’au {dateLabel(item.expires_at)} <span className="mx-1">·</span> {formatCFA(item.amount)}</p>
                </div>
                {canRevoke && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => { setRevokeTarget(item); setRevokeReason(""); }}><PauseCircle className="h-4 w-4" /> Révoquer</Button>}
              </div>;
            })}
          </div>
        </section>
      </div>

      <section className="card-premium overflow-hidden">
        <div className="flex items-center gap-3 border-b border-clay-100 px-5 py-4 md:px-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-clay-100 text-ink"><History className="h-4 w-4" /></span><div><h3 className="font-bold text-ink">Journal de contrôle</h3><p className="text-xs text-ink-muted">Les événements sont consultables et non modifiables depuis l’application.</p></div></div>
        {auditLogs.length === 0 ? <p className="p-5 text-sm text-ink-muted">Aucune action de licence enregistrée pour le moment.</p> : <div className="divide-y divide-clay-100">{auditLogs.map((entry) => <div key={entry.id} className="grid gap-1 px-5 py-3 text-sm md:grid-cols-[180px_1fr_180px] md:items-center md:px-6"><span className="text-xs text-ink-muted">{new Date(entry.created_at).toLocaleString("fr-FR")}</span><span className="font-semibold text-ink">{entry.action === "license_granted" ? "Licence accordée" : "Licence révoquée"} · {shopById.get(entry.shop_id)?.name ?? entry.shop_id}</span><span className="text-xs text-ink-soft">{entry.reason}</span></div>)}</div>}
      </section>

      {revokeTarget && <div className="fixed inset-0 z-[90] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="revoke-title">
        <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white p-6 shadow-premium-lg">
          <div className="flex items-start justify-between gap-4"><div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-faso-red-soft/40 text-faso-red"><PauseCircle className="h-5 w-5" /></span><h3 id="revoke-title" className="mt-4 text-xl font-bold text-ink">Révoquer cette licence ?</h3><p className="mt-2 text-sm leading-6 text-ink-soft">La boutique pourra être suspendue immédiatement s’il ne reste aucun autre accès valide.</p></div><button type="button" onClick={() => setRevokeTarget(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-clay-50 text-ink-muted hover:text-ink" aria-label="Fermer"><X className="h-4 w-4" /></button></div>
          <label className="mt-5 block text-sm font-semibold text-ink">Motif de révocation<textarea value={revokeReason} onChange={(event) => setRevokeReason(event.target.value)} minLength={8} maxLength={500} rows={3} className="input-premium mt-2 h-auto py-3" placeholder="Décrivez la raison de cette décision…" /></label>
          <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setRevokeTarget(null)}>Annuler</Button><Button type="button" disabled={busy || revokeReason.trim().length < 8} onClick={() => void confirmRevoke()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PauseCircle className="h-4 w-4" />} Confirmer</Button></div>
        </div>
      </div>}
    </div>
  );
}

function Summary({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3"><div className="flex items-center gap-2 text-faso-gold">{icon}<span className="text-xl font-extrabold text-white">{value}</span></div><p className="mt-1 text-[11px] text-white/65">{label}</p></div>;
}
