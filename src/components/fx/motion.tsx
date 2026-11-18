"use client";

import { MotionConfig } from "framer-motion";
import { useSyncExternalStore, type ReactNode } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * Préférence « réduire les animations », sûre pour l'hydratation : le serveur
 * et le premier rendu client voient `false` (même HTML), puis la vraie valeur
 * est appliquée. Le `MotionConfig` global garantit qu'aucun mouvement n'est
 * joué entre-temps pour les personnes concernées.
 */
export function useSafeReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}

/** Respecte prefers-reduced-motion pour toutes les animations framer-motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
