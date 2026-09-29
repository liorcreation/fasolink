"use client";

import { useEffect, useState } from "react";
import { Loader2, LogIn, Store } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ButtonLink } from "@/components/ui/Button";
import { VerificationForm } from "@/components/vendeur/VerificationForm";
import { fetchShops } from "@/lib/shops";
import { fetchOwnedShop } from "@/lib/vendor-data";
import type { ShopWithProducts } from "@/lib/database.types";

export function VerificationLoader() {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [shop, setShop] = useState<ShopWithProducts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    let mounted = true;
    async function load() {
      if (!isConfigured) {
        const shops = await fetchShops();
        if (mounted) {
          setShop(shops[0] ?? null);
          setLoading(false);
        }
        return;
      }
      if (!user) {
        setLoading(false);
        return;
      }
      const owned = await fetchOwnedShop(user.uid);
      if (mounted) {
        setShop(owned);
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
  if (isConfigured && !user) {
    return <div className="card-premium mx-auto max-w-lg p-8 text-center"><LogIn className="mx-auto h-8 w-8 text-faso-red" /><h2 className="mt-4 text-xl font-bold text-ink">Connectez-vous pour vérifier votre boutique</h2><ButtonLink href="/connexion" className="mt-5">Ouvrir ma session</ButtonLink></div>;
  }
  if (!shop) {
    return <div className="card-premium mx-auto max-w-lg p-8 text-center"><Store className="mx-auto h-8 w-8 text-faso-gold" /><h2 className="mt-4 text-xl font-bold text-ink">Créez d’abord votre boutique</h2><ButtonLink href="/vendeur/inscription" className="mt-5">Créer ma boutique</ButtonLink></div>;
  }
  return <VerificationForm shopId={shop.id} demo={!isConfigured} />;
}
