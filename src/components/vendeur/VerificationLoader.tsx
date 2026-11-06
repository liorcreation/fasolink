"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, ChevronDown, LayoutGrid, Loader2, LogIn, RefreshCw, ShieldCheck, Store } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ButtonLink } from "@/components/ui/Button";
import { VerificationForm } from "@/components/vendeur/VerificationForm";
import { fetchShops } from "@/lib/shops";
import { fetchOwnedShops } from "@/lib/vendor-data";
import type { ShopWithProducts } from "@/lib/database.types";

export function VerificationLoader() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [shops, setShops] = useState<ShopWithProducts[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!isConfigured) {
          const demoShops = await fetchShops();
          if (mounted) {
            setShops(demoShops);
            setSelectedShopId((current) => current && demoShops.some((item) => item.id === current) ? current : demoShops[0]?.id ?? null);
          }
          return;
        }
        if (!user || user.isAnonymous) return;
        const owned = await fetchOwnedShops(user.uid);
        if (mounted) {
          setShops(owned);
          setSelectedShopId((current) => current && owned.some((item) => item.id === current) ? current : owned[0]?.id ?? null);
        }
      } catch (cause) {
        if (mounted) setError(cause instanceof Error ? cause.message : "Impossible de charger vos boutiques.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [authLoading, isConfigured, reloadKey, user]);

  if (authLoading || loading) {
    return <div className="card-premium flex justify-center gap-3 p-8 text-sm text-ink-muted"><Loader2 className="h-5 w-5 animate-spin text-faso-red" /> Chargement de votre boutique…</div>;
  }
  if (isConfigured && (!user || user.isAnonymous)) {
    return <div className="card-premium mx-auto max-w-lg p-8 text-center"><LogIn className="mx-auto h-8 w-8 text-faso-red" /><h2 className="mt-4 text-xl font-bold text-ink">Connectez-vous pour vérifier votre boutique</h2><ButtonLink href="/connexion" className="mt-5">Ouvrir ma session</ButtonLink></div>;
  }
  if (error) {
    return <div role="alert" className="card-premium mx-auto max-w-xl rounded-[1.75rem] border-faso-red/20 bg-faso-red/5 p-6 text-faso-red-dark sm:p-8"><h2 className="text-lg font-extrabold">Impossible de charger vos boutiques</h2><p className="mt-2 text-sm leading-6">{error}</p><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-faso-red px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red focus-visible:ring-offset-2"><RefreshCw className="h-4 w-4" />Réessayer</button></div>;
  }
  const shop = shops.find((item) => item.id === selectedShopId) ?? shops[0] ?? null;

  if (!shop) {
    return <div className="card-premium mx-auto max-w-lg p-8 text-center"><Store className="mx-auto h-8 w-8 text-faso-gold" /><h2 className="mt-4 text-xl font-bold text-ink">Créez d’abord votre boutique</h2><ButtonLink href="/vendeur/inscription" className="mt-5">Créer ma boutique</ButtonLink></div>;
  }
  return (
    <>
      {shops.length > 1 && (
        <div className="mb-6 flex flex-col gap-4 rounded-[1.5rem] border border-clay-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(51,37,23,.05)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-faso-gold/15 text-faso-gold-dark"><LayoutGrid className="h-5 w-5" /></span>
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-faso-red">Boutique à vérifier</p><p className="mt-1 text-sm font-bold text-ink">Choisissez la boutique concernée</p></div>
          </div>
          <label className="relative min-w-0 sm:w-80">
            <span className="sr-only">Choisir une boutique</span>
            <select value={shop.id} onChange={(event) => setSelectedShopId(event.target.value)} className="h-11 w-full appearance-none rounded-xl border border-clay-200 bg-clay-50 px-4 pr-10 text-sm font-bold text-ink outline-none transition focus:border-faso-gold focus:ring-2 focus:ring-faso-gold/15">
              {shops.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.city}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </label>
        </div>
      )}
      {shop.verification_status === "pending" ? (
        <section className="relative isolate mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-faso-gold/25 bg-white p-6 shadow-premium sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-faso-gold/10 blur-3xl" />
          <span className="inline-flex items-center gap-2 rounded-full bg-faso-gold-soft/40 px-3 py-1.5 text-xs font-extrabold text-[#805500]"><ShieldCheck className="h-4 w-4" />En cours d’examen</span>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-ink sm:text-3xl">Votre dossier est entre les mains de FasoLink.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">La demande pour <strong>{shop.name}</strong> a été transmise. Vous pouvez continuer à gérer votre boutique pendant l’examen. Le formulaire restera indisponible pour éviter l’envoi d’un doublon.</p>
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-clay-200 bg-clay-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs leading-5 text-ink-muted">Le statut se met à jour après la décision de l’équipe de vérification.</span><ButtonLink href="/vendeur/dashboard" variant="outline" className="shrink-0">Retour à mon espace vendeur</ButtonLink></div>
        </section>
      ) : shop.verification_status === "verified" ? (
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-faso-green/20 bg-white p-6 text-center shadow-premium sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-[1.5rem] bg-faso-green-soft/40 text-faso-green-dark"><BadgeCheck className="h-9 w-9" /></span>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[.18em] text-faso-green-dark">Boutique vérifiée</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">Votre badge de confiance est activé.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-soft">La boutique <strong>{shop.name}</strong> a déjà été vérifiée par FasoLink. Aucune nouvelle demande n’est nécessaire.</p>
          <ButtonLink href="/vendeur/dashboard" className="mt-6">Voir mon espace vendeur</ButtonLink>
        </section>
      ) : <VerificationForm key={shop.id} shopId={shop.id} demo={!isConfigured} />}
    </>
  );
}
