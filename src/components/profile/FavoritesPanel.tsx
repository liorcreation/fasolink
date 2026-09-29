"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Heart, LoaderCircle, RefreshCw, Store } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchFavoriteShops } from "@/lib/favorites";
import type { ShopWithProducts } from "@/lib/database.types";
import { ShopCard } from "@/components/shops/ShopCard";

export function FavoritesPanel() {
  const { user, isConfigured } = useAuth();
  const reduceMotion = useReducedMotion();
  const [shops, setShops] = useState<ShopWithProducts[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (isConfigured && !user) {
      setShops([]);
      setLoading(false);
      setLoadError(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    setLoadError(false);
    void fetchFavoriteShops(user?.uid ?? "demo")
      .then((items) => {
        if (mounted) setShops(items);
      })
      .catch(() => {
        if (mounted) setLoadError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [isConfigured, retry, user]);

  return (
    <motion.section
      id="favoris"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .08 }}
      transition={{ duration: .48 }}
      className="profile-section-card profile-favorites-section scroll-mt-28"
    >
      <div className="profile-section-heading profile-favorites-heading">
        <div><span className="profile-section-icon profile-section-icon-red"><Heart aria-hidden="true" /></span><div><p className="profile-section-kicker">VOTRE SÉLECTION</p><h2>Mes favoris</h2><p className="profile-section-subtitle">Les boutiques que vous souhaitez garder près de vous.</p></div></div>
        {shops.length > 0 && <span className="profile-favorite-count">{shops.length}<small>{shops.length === 1 ? "boutique" : "boutiques"}</small></span>}
      </div>

      {loading && <div className="profile-favorites-loading" role="status"><LoaderCircle className="h-5 w-5 animate-spin" /><span>Nous préparons votre sélection…</span></div>}
      {!loading && isConfigured && !user && (
        <div className="profile-empty-state">
          <span className="profile-empty-icon"><Heart aria-hidden="true" /></span><div><h3>Vos coups de cœur, toujours avec vous</h3><p>Connectez-vous pour retrouver les boutiques que vous avez enregistrées sur tous vos appareils.</p><Link href="/connexion">Me connecter <ArrowRight aria-hidden="true" /></Link></div>
        </div>
      )}
      {!loading && (!isConfigured || user) && loadError && (
        <div className="profile-favorites-error" role="alert"><span>Vos favoris n’ont pas pu être chargés. Vérifiez votre connexion puis réessayez.</span><button type="button" onClick={() => setRetry((value) => value + 1)}><RefreshCw aria-hidden="true" /> Réessayer</button></div>
      )}
      {!loading && !loadError && (!isConfigured || user) && shops.length === 0 && (
        <div className="profile-empty-state">
          <span className="profile-empty-icon profile-empty-icon-neutral"><Store aria-hidden="true" /></span><div><h3>Votre sélection commence ici</h3><p>Explorez les commerces du Burkina et touchez le cœur pour retrouver une boutique ici.</p><Link href="/#explorer">Découvrir les boutiques <ArrowRight aria-hidden="true" /></Link></div>
        </div>
      )}
      {!loading && !loadError && shops.length > 0 && <div className="profile-favorite-grid">{shops.map((shop, index) => <ShopCard key={shop.id} shop={shop} index={index} />)}</div>}
    </motion.section>
  );
}
