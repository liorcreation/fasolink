"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const MIN_REFRESH_GAP = 5_000;
const BACKGROUND_REFRESH_INTERVAL = 45_000;

/**
 * Synchronise l'arbre serveur sans rechargement complet de la page.
 * Les écrans client disposent de leur propre état local immédiat ; ce filet
 * garde les pages publiques et les données serveur fraîches après un retour
 * dans l'onglet, une reconnexion ou une attente prolongée.
 */
export function AutoRefresh() {
  const router = useRouter();
  const lastRefresh = useRef(0);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRefresh.current < MIN_REFRESH_GAP) return;
      lastRefresh.current = now;
      router.refresh();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", refresh);
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) refresh();
    };
    window.addEventListener("pageshow", onPageShow);
    const interval = window.setInterval(refresh, BACKGROUND_REFRESH_INTERVAL);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", refresh);
      window.removeEventListener("pageshow", onPageShow);
      window.clearInterval(interval);
    };
  }, [router]);

  return null;
}
