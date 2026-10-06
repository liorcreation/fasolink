"use client";

import { useEffect, useState } from "react";
import type { ShopWithProducts } from "@/lib/database.types";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToPublicShops } from "@/lib/shop-realtime";

export function usePublicShopsRealtime(initialShops: ShopWithProducts[]) {
  const [shops, setShops] = useState(initialShops);

  useEffect(() => {
    setShops(initialShops);
    if (!isFirebaseConfigured) return;
    return subscribeToPublicShops(initialShops, setShops);
  }, [initialShops]);

  return shops;
}
