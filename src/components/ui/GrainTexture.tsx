"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Trame tissée très discrète (Faso Dan Fani), extraite du SplashScreen.
 * À poser en fond de grands blocs (header de fiche boutique, empty states,
 * bandeau dashboard) — jamais sous du texte de lecture ou des champs de
 * formulaire, la texture doit rester subliminale.
 */
export function GrainTexture({
  opacity = 0.05,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 13H26M13 0V26" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
