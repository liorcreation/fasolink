"use client";

import { useEffect, useRef, useState } from "react";
import type { ShopWithProducts } from "@/lib/database.types";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchShopById } from "@/lib/shops";
import { subscribeToPublicShops, subscribeToShopStatusEvents } from "@/lib/shop-realtime";

export function usePublicShopsRealtime(initialShops: ShopWithProducts[]) {
  const [shops, setShops] = useState(initialShops);
  const hiddenShopIds = useRef(new Set<string>());

  useEffect(() => {
    let mounted = true;
    hiddenShopIds.current.clear();
    setShops(initialShops);
    if (!isFirebaseConfigured) return;

    const stopLocalEvents = subscribeToShopStatusEvents((event) => {
      if (event.status !== "active") {
        hiddenShopIds.current.add(event.shopId);
        setShops((current) => current.filter((shop) => shop.id !== event.shopId));
        return;
      }

      hiddenShopIds.current.delete(event.shopId);
      void fetchShopById(event.shopId).then((shop) => {
        if (!mounted || !shop) return;
        setShops((current) => {
          const next = current.some((item) => item.id === shop.id)
            ? current.map((item) => item.id === shop.id ? shop : item)
            : [...current, shop];
          return next.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || b.rating - a.rating);
        });
      });
    });
    const stopRealtime = subscribeToPublicShops(
      initialShops,
      (next) => setShops(next.filter((shop) => !hiddenShopIds.current.has(shop.id))),
    );
    return () => {
      mounted = false;
      stopLocalEvents();
      stopRealtime();
    };
  }, [initialShops]);

  return shops;
}
