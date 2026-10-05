"use client";

import { useEffect, useState } from "react";
import { ChevronDown, LayoutGrid, Loader2, LogIn, Store } from "lucide-react";
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

  useEffect(() => {
    if (authLoading) return;
    let mounted = true;
    async function load() {
      if (!isConfigured) {
        const shops = await fetchShops();
        if (mounted) {
          setShops(shops);
          setSelectedShopId(shops[0]?.id ?? null);
          setLoading(false);
        }
        return;
      }
      if (!user) {
        setLoading(false);
        return;
      }
      if (user.isAnonymous) {
        setLoading(false);
        return;
      }
      const owned = await fetchOwnedShops(user.uid);
      if (mounted) {
        setShops(owned);
        setSelectedShopId((current) => current && owned.some((item) => item.id === current) ? current : owned[0]?.id ?? null);
        setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [authLoading, isConfigured, user]);

  if (authLoading || loading) {
    return <div className="card-premium flex justify-center gap-3 p-8 text-sm text-ink-muted"><Loader2 className="h-5 w-5 animate-spin text-faso-red" /> Chargement de votre boutique…</div>;
  }
  if (isConfigured && (!user || user.isAnonymous)) {
    return <div className="card-premium mx-auto max-w-lg p-8 text-center"><LogIn className="mx-auto h-8 w-8 text-faso-red" /><h2 className="mt-4 text-xl font-bold text-ink">Connectez-vous pour vérifier votre boutique</h2><ButtonLink href="/connexion" className="mt-5">Ouvrir ma session</ButtonLink></div>;
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
      <VerificationForm key={shop.id} shopId={shop.id} demo={!isConfigured} />
    </>
  );
}
