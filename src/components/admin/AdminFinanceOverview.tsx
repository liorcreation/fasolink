"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, ArrowDownLeft, ArrowUpRight, CircleDollarSign, Clock3, RefreshCw, ShieldCheck, Store } from "lucide-react";
import type { Shop, Subscription } from "@/lib/database.types";
import { fetchAllSubscriptions } from "@/lib/admin-data";
import { formatCFA } from "@/lib/utils";

const money = (value: number) => formatCFA(value);
const dateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

export function AdminFinanceOverview({ shops, refreshKey }: { shops: Shop[]; refreshKey: number }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const rows = await fetchAllSubscriptions();
      setSubscriptions(rows.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")));
      setUpdatedAt(new Date());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Les données de paiement ne sont pas disponibles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, refreshKey]);

  const report = useMemo(() => {
    const now = Date.now();
    const cut30 = now - 30 * 864e5;
    const confirmed = subscriptions.filter((row) => row.gateway === "CinetPay" && row.status === "active" && row.amount > 0);
    const confirmed30 = confirmed.filter((row) => Date.parse(row.started_at ?? row.updated_at) >= cut30);
    const pending = subscriptions.filter((row) => row.gateway === "CinetPay" && row.status === "pending");
    const manual = subscriptions.filter((row) => row.gateway === "manual_superadmin" && row.amount > 0);
    const activeLicenses = subscriptions.filter((row) => ["active", "trialing"].includes(row.status) && (!row.expires_at || Date.parse(row.expires_at) > now));
    const bars = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now - (6 - index) * 864e5);
      const key = day.toISOString().slice(0, 10);
      const amount = confirmed.filter((row) => (row.started_at ?? row.updated_at ?? "").slice(0, 10) === key).reduce((sum, row) => sum + row.amount, 0);
      return { key, amount, label: day.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "") };
    });
    return {
      confirmed,
      confirmed30,
      pending,
      manual,
      activeLicenses,
      paidTotal: confirmed.reduce((sum, row) => sum + row.amount, 0),
      paid30: confirmed30.reduce((sum, row) => sum + row.amount, 0),
      pendingTotal: pending.reduce((sum, row) => sum + row.amount, 0),
      manualTotal: manual.reduce((sum, row) => sum + row.amount, 0),
      bars,
    };
  }, [subscriptions]);

  const shopById = useMemo(() => new Map(shops.map((shop) => [shop.id, shop.name])), [shops]);
  const maxBar = Math.max(...report.bars.map((bar) => bar.amount), 1);
  const latest = subscriptions.slice(0, 7);

  return (
    <section aria-labelledby="admin-finance-title" className="overflow-hidden rounded-[1.8rem] border border-clay-200/80 bg-white shadow-[0_12px_38px_rgba(51,37,23,.055)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-clay-100 px-5 py-5 md:px-7">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-faso-gold-soft/50 text-faso-gold-dark"><CircleDollarSign className="h-5 w-5" /></span>
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-faso-red">Pilotage financier · chiffres Firestore</p><h2 id="admin-finance-title" className="mt-1 text-xl font-black tracking-tight text-ink sm:text-2xl">Transactions & licences</h2><p className="mt-1 text-xs leading-5 text-ink-muted">Les montants encaissés ci-dessous correspondent aux abonnements CinetPay confirmés.</p></div>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-clay-200 bg-white px-4 text-xs font-bold text-ink transition hover:border-faso-gold/50 hover:bg-clay-50 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Actualiser</button>
      </div>

      {error && <p role="alert" className="mx-5 mt-4 rounded-xl border border-faso-red/15 bg-faso-red-soft/40 px-4 py-3 text-xs font-semibold text-faso-red-dark md:mx-7">{error}</p>}

      <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4 md:p-7">
        <FinanceMetric icon={<ArrowDownLeft className="h-4 w-4" />} label="Encaissé · tout temps" value={loading ? "…" : money(report.paidTotal)} note={`${report.confirmed.length} paiement${report.confirmed.length > 1 ? "s" : ""} confirmé${report.confirmed.length > 1 ? "s" : ""}`} tone="green" />
        <FinanceMetric icon={<Activity className="h-4 w-4" />} label="Encaissé · 30 jours" value={loading ? "…" : money(report.paid30)} note={`${report.confirmed30.length} confirmation${report.confirmed30.length > 1 ? "s" : ""}`} tone="gold" />
        <FinanceMetric icon={<Clock3 className="h-4 w-4" />} label="Paiements en attente" value={loading ? "…" : money(report.pendingTotal)} note={`${report.pending.length} transaction${report.pending.length > 1 ? "s" : ""} à confirmer`} tone="blue" />
        <FinanceMetric icon={<Store className="h-4 w-4" />} label="Licences en cours" value={loading ? "…" : String(report.activeLicenses.length)} note={`${report.manual.length} validation${report.manual.length > 1 ? "s" : ""} manuelle${report.manual.length > 1 ? "s" : ""}`} tone="dark" />
      </div>

      <div className="grid gap-4 px-5 pb-5 md:grid-cols-[1.1fr_.9fr] md:px-7 md:pb-7">
        <section className="rounded-2xl border border-clay-200/70 bg-[#FCFAF6] p-4 sm:p-5" aria-label="Encaissements CinetPay sur 7 jours">
          <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-extrabold text-ink">Encaissements confirmés</h3><p className="mt-1 text-xs text-ink-muted">7 derniers jours · CinetPay uniquement</p></div><span className="rounded-full bg-faso-green-soft/40 px-2.5 py-1 text-[10px] font-extrabold text-faso-green-dark"><ShieldCheck className="mr-1 inline h-3 w-3" /> Confirmé</span></div>
          <div className="mt-5 flex h-36 items-end gap-2 sm:gap-3">
            {report.bars.map((bar) => <div key={bar.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div title={`${bar.label}: ${money(bar.amount)}`} className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-[#D99C28] to-[#F0D58E] transition-[height] duration-500" style={{ height: `${Math.max(bar.amount ? 12 : 3, bar.amount / maxBar * 100)}%` }} /><span className="text-[9px] font-semibold capitalize text-ink-muted sm:text-[10px]">{bar.label}</span></div>)}
          </div>
          <p className="mt-4 border-t border-clay-200/70 pt-3 text-[10px] leading-4 text-ink-muted">Dernière lecture : {updatedAt ? dateTime(updatedAt.toISOString()) : "en attente"}. Une validation manuelle n’est pas comptée comme un encaissement CinetPay.</p>
        </section>

        <section className="rounded-2xl border border-faso-gold/20 bg-gradient-to-br from-[#241B12] to-[#17120E] p-4 text-white sm:p-5" aria-label="Licences enregistrées manuellement">
          <div className="flex items-center gap-2 text-[#F4D88D]"><ArrowUpRight className="h-4 w-4" /><h3 className="text-sm font-extrabold">Validations manuelles</h3></div>
          <p className="mt-4 text-3xl font-black tracking-tight">{loading ? "…" : money(report.manualTotal)}</p>
          <p className="mt-1 text-xs text-white/55">Montant saisi lors d’une attribution par le Super Admin · {report.manual.length} licence{report.manual.length > 1 ? "s" : ""}</p>
          <p className="mt-5 rounded-xl border border-white/10 bg-white/[.05] p-3 text-[10px] leading-5 text-white/65">À rapprocher d’une preuve de paiement externe : cette somme est une déclaration d’administration, pas une confirmation automatique de la banque ou de l’opérateur.</p>
        </section>
      </div>

      <section className="border-t border-clay-100">
        <div className="flex flex-wrap items-end justify-between gap-2 px-5 py-4 md:px-7"><div><h3 className="text-base font-extrabold text-ink">Derniers mouvements</h3><p className="mt-1 text-xs text-ink-muted">Historique d’abonnements et d’essais — les virements aux vendeurs ne sont pas gérés par FasoLink.</p></div><span className="text-[10px] font-semibold text-ink-muted">{latest.length} affiché{latest.length > 1 ? "s" : ""}</span></div>
        {latest.length === 0 ? <p className="mx-5 mb-5 rounded-xl bg-clay-50 px-4 py-5 text-center text-sm text-ink-muted md:mx-7">Aucune transaction ou licence enregistrée.</p> : <div className="divide-y divide-clay-100">
          {latest.map((item) => {
            const isGatewayPayment = item.gateway === "CinetPay" && item.amount > 0;
            const isConfirmed = isGatewayPayment && item.status === "active";
            const isPending = isGatewayPayment && item.status === "pending";
            const status = isConfirmed ? "Confirmé" : isPending ? "En attente" : item.status === "trialing" ? "Essai" : item.status === "cancelled" ? "Révoqué" : item.status === "expired" ? "Expiré" : "Manuel";
            return <div key={item.id} className="grid gap-2 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center md:px-7">
              <div className="min-w-0"><p className="truncate text-sm font-bold text-ink">{shopById.get(item.shop_id) ?? `Boutique ${item.shop_id}`}</p><p className="mt-0.5 truncate text-[10px] text-ink-muted">{item.reference || item.plan} · {item.gateway || "licence"} · {dateTime(item.created_at)}</p></div>
              <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-extrabold ${isConfirmed ? "bg-faso-green-soft/45 text-faso-green-dark" : isPending ? "bg-faso-gold-soft/50 text-faso-gold-dark" : "bg-clay-100 text-ink-muted"}`}>{status}</span>
              <strong className="text-sm font-black text-ink">{money(item.amount)}</strong>
            </div>;
          })}
        </div>}
      </section>
      <p className="border-t border-clay-100 px-5 py-3 text-[10px] leading-4 text-ink-muted md:px-7">Aucun dépôt/retrait de portefeuille ni transfert vendeur n’est inventé ou affiché : FasoLink ne possède pas encore de registre de versements marchands.</p>
    </section>
  );
}

function FinanceMetric({ icon, label, value, note, tone }: { icon: React.ReactNode; label: string; value: string; note: string; tone: "green" | "gold" | "blue" | "dark" }) {
  const styles = {
    green: "bg-faso-green-soft/35 text-faso-green-dark",
    gold: "bg-faso-gold-soft/45 text-faso-gold-dark",
    blue: "bg-blue-50 text-blue-700",
    dark: "bg-clay-100 text-ink",
  };
  return <article className="min-w-0 rounded-2xl border border-clay-200/70 bg-white p-4 shadow-[0_4px_14px_rgba(51,37,23,.025)] sm:p-5"><span className={`grid h-9 w-9 place-items-center rounded-xl ${styles[tone]}`}>{icon}</span><p className="mt-4 break-words text-xl font-black tracking-tight text-ink sm:text-2xl">{value}</p><p className="mt-1 text-xs font-extrabold text-ink">{label}</p><p className="mt-1 text-[10px] leading-4 text-ink-muted">{note}</p></article>;
}
