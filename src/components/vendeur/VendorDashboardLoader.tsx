"use client";

import { useEffect, useState } from "react";
import { ChevronDown, LayoutGrid, Loader2, LogIn, Store } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchShops } from "@/lib/shops";
import { fetchLatestSubscription, fetchOwnedShops } from "@/lib/vendor-data";
import { VendorDashboard } from "@/components/vendeur/VendorDashboard";
import type { ShopWithProducts, Subscription } from "@/lib/database.types";
import { subscribeToShopStatus } from "@/lib/shop-realtime";

export function VendorDashboardLoader() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const searchParams = useSearchParams();
  const [selectedShopId, setSelectedShopId] = useState<string | null>(() => searchParams.get("shop"));
  const [shops, setShops] = useState<ShopWithProducts[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
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
          if (mounted) setShops(demoShops);
          return;
        }
        if (!user || user.isAnonymous) return;
        const owned = await fetchOwnedShops(user.uid);
        if (!mounted) return;
        setShops(owned);
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Impossible de charger votre espace vendeur.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [authLoading, isConfigured, user]);

  const shop = shops.find((item) => item.id === selectedShopId) ?? shops[0] ?? null;

  const shopId = shop?.id;

  useEffect(() => {
    let mounted = true;
    if (!shopId) {
      setSubscription(null);
      return () => {
        mounted = false;
      };
    }
    setSubscription(null);
    void fetchLatestSubscription(shopId).then((next) => {
      if (mounted) setSubscription(next);
    }).catch(() => {
      if (mounted) setSubscription(null);
    });
    if (!isConfigured) return () => {
      mounted = false;
    };
    const unsubscribe = subscribeToShopStatus(shopId, (status) => {
      setShops((current) => current.map((item) => item.id === shopId ? { ...item, status } : item));
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [isConfigured, shopId]);

  if (authLoading || loading) {
    return (
      <div className="card-premium flex min-h-48 items-center justify-center gap-3 p-8 text-sm text-ink-muted">
        <Loader2 className="h-5 w-5 animate-spin text-faso-red" />
        Chargement de votre espace vendeur…
      </div>
    );
  }

  if (isConfigured && (!user || user.isAnonymous)) {
    return (
      <div className="card-premium mx-auto max-w-lg p-8 text-center">
        <LogIn className="mx-auto h-8 w-8 text-faso-red" />
        <h2 className="mt-4 text-xl font-bold text-ink">Connectez-vous pour continuer</h2>
        <p className="mt-2 text-sm text-ink-soft">Votre tableau de bord affiche uniquement les boutiques rattachées à votre compte.</p>
        <ButtonLink href="/connexion" className="mt-5">Ouvrir ma session</ButtonLink>
      </div>
    );
  }

  if (error) {
    return <p className="rounded-xl bg-faso-red-soft/40 px-4 py-3 text-sm text-faso-red-dark">{error}</p>;
  }

  if (!shop) {
    return (
      <div className="card-premium mx-auto max-w-lg p-8 text-center">
        <Store className="mx-auto h-8 w-8 text-faso-gold" />
        <h2 className="mt-4 text-xl font-bold text-ink">Aucune boutique associée</h2>
        <p className="mt-2 text-sm text-ink-soft">Créez votre vitrine pour commencer à recevoir des contacts.</p>
        <ButtonLink href="/vendeur/inscription" className="mt-5">Créer ma boutique</ButtonLink>
      </div>
    );
  }

  return (
    <>
      {shops.length > 1 && (
        <div className="mb-6 flex flex-col gap-4 rounded-[1.5rem] border border-clay-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(51,37,23,.05)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-faso-gold/15 text-faso-gold-dark"><LayoutGrid className="h-5 w-5" /></span>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-faso-red">Boutique active</p>
              <p className="mt-1 text-sm font-bold text-ink">Choisissez l’espace à piloter</p>
            </div>
          </div>
          <label className="relative min-w-0 sm:w-80">
            <span className="sr-only">Choisir une boutique</span>
            <select
              value={shop.id}
              onChange={(event) => setSelectedShopId(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-clay-200 bg-clay-50 px-4 pr-10 text-sm font-bold text-ink outline-none transition focus:border-faso-gold focus:ring-2 focus:ring-faso-gold/15"
            >
              {shops.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.city}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </label>
        </div>
      )}
      <VendorDashboard key={shop.id} shop={shop} subscription={subscription} demo={!isConfigured} />
    </>
  );
}
