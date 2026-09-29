"use client";

import { useEffect, useState } from "react";
import { Loader2, LogIn, Store } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchShops } from "@/lib/shops";
import { fetchLatestSubscription, fetchOwnedShop } from "@/lib/vendor-data";
import { VendorDashboard } from "@/components/vendeur/VendorDashboard";
import type { ShopWithProducts, Subscription } from "@/lib/database.types";
import { subscribeToShopStatus } from "@/lib/shop-realtime";

export function VendorDashboardLoader() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [shop, setShop] = useState<ShopWithProducts | null>(null);
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
          const shops = await fetchShops();
          if (mounted) setShop(shops[0] ?? null);
          return;
        }
        if (!user) return;
        const owned = await fetchOwnedShop(user.uid);
        if (!mounted) return;
        setShop(owned);
        setSubscription(owned ? await fetchLatestSubscription(owned.id) : null);
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

  const shopId = shop?.id;

  useEffect(() => {
    if (!shopId || !isConfigured) return;
    return subscribeToShopStatus(shopId, (status) => {
      setShop((current) => (current ? { ...current, status } : current));
    });
  }, [isConfigured, shopId]);

  if (authLoading || loading) {
    return (
      <div className="card-premium flex min-h-48 items-center justify-center gap-3 p-8 text-sm text-ink-muted">
        <Loader2 className="h-5 w-5 animate-spin text-faso-red" />
        Chargement de votre espace vendeur…
      </div>
    );
  }

  if (isConfigured && !user) {
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

  return <VendorDashboard shop={shop} subscription={subscription} demo={!isConfigured} />;
}
