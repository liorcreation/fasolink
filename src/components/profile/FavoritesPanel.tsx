"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2, Store } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchFavoriteShops } from "@/lib/favorites";
import type { ShopWithProducts } from "@/lib/database.types";
import { ShopCard } from "@/components/shops/ShopCard";

export function FavoritesPanel() {
  const { user, isConfigured } = useAuth();
  const [shops, setShops] = useState<ShopWithProducts[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConfigured && !user) {
      setShops([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    void fetchFavoriteShops(user?.uid ?? "demo")
      .then((items) => {
        if (mounted) setShops(items);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isConfigured, user]);

  return (
    <section id="favoris" className="mt-10 scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold text-ink"><Heart className="h-5 w-5 text-faso-red" /> Mes favoris</p>
          <p className="mt-1 text-sm text-ink-muted">Vos boutiques préférées, accessibles partout.</p>
        </div>
        {shops.length > 0 && <span className="rounded-full bg-faso-red-soft/40 px-3 py-1 text-xs font-bold text-faso-red-dark">{shops.length}</span>}
      </div>

      {loading && <div className="card-premium flex items-center justify-center gap-2 p-8 text-sm text-ink-muted"><Loader2 className="h-4 w-4 animate-spin text-faso-red" /> Chargement de vos favoris…</div>}
      {!loading && isConfigured && !user && (
        <div className="card-premium p-6 text-center"><Heart className="mx-auto h-7 w-7 text-faso-gold" /><p className="mt-3 text-sm font-semibold text-ink">Connectez-vous pour retrouver vos favoris.</p><Link href="/connexion" className="mt-3 inline-flex text-sm font-bold text-faso-red hover:underline">Ouvrir une session</Link></div>
      )}
      {!loading && (!isConfigured || user) && shops.length === 0 && (
        <div className="card-premium p-6 text-center"><Store className="mx-auto h-7 w-7 text-ink-muted" /><p className="mt-3 text-sm font-semibold text-ink">Aucune boutique enregistrée pour le moment.</p><Link href="/#explorer" className="mt-3 inline-flex text-sm font-bold text-faso-red hover:underline">Explorer les boutiques</Link></div>
      )}
      {!loading && shops.length > 0 && <div className="grid gap-5 sm:grid-cols-2">{shops.map((shop, index) => <ShopCard key={shop.id} shop={shop} index={index} />)}</div>}
    </section>
  );
}
