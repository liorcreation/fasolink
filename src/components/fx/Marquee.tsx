import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Bande défilante infinie en CSS pur. La seconde copie est masquée aux
 * lecteurs d'écran ; en mouvement réduit, seule la première reste, en grille.
 */
export function Marquee({
  children,
  className,
  trackClassName,
  duration = 45,
  gap = "2.5rem",
  label,
}: {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  duration?: number;
  gap?: string;
  label?: string;
}) {
  const style = { "--fx-duration": `${duration}s`, "--fx-gap": gap } as CSSProperties;
  return (
    <div className={cn("fx-marquee", className)} style={style} role={label ? "region" : undefined} aria-label={label}>
      <div className={cn("fx-marquee-track", trackClassName)}>{children}</div>
      <div className={cn("fx-marquee-track", trackClassName)} aria-hidden="true">{children}</div>
    </div>
  );
}
