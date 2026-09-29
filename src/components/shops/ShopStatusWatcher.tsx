"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribeToShopStatus } from "@/lib/shop-realtime";

/** Retire immédiatement une vitrine déjà ouverte dès qu’elle n’est plus active. */
export function ShopStatusWatcher({ shopId }: { shopId: string }) {
  const router = useRouter();

  useEffect(
    () =>
      subscribeToShopStatus(shopId, (status) => {
        if (status !== "active") router.replace("/");
      }),
    [router, shopId],
  );

  return null;
}
