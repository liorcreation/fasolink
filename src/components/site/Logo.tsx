import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Monogramme FasoLink — un « F » tissé.
 *
 * Ruban ink : le Γ (fût + bras haut).
 * Ruban or  : se noue à travers le F — passe DERRIÈRE le fût, PAR-DESSUS le
 *             bras haut. Un vrai croisement de tissage (Faso Dan Fani) = le
 *             « link », la mise en relation.
 *
 * `currentColor` porte le ruban ink (s'adapte au fond) ; l'or est fixe.
 * `mono` : version 1 ton, sans les ombres de profondeur (fonds colorés / petit).
 */
export function LogoMark({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  const uid = mono ? "flm-m" : "flm";
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-8 w-8 text-ink", className)}
      role="img"
      aria-label="FasoLink"
    >
      <defs>
        <linearGradient id={`${uid}-ink`} x1="0" y1="6" x2="0" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity={mono ? 1 : 0.86} />
          <stop offset="1" stopColor="currentColor" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="6" y1="21" x2="34" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={mono ? "currentColor" : "#FBC66A"} />
          <stop offset="1" stopColor={mono ? "currentColor" : "#E0902A"} />
        </linearGradient>
      </defs>

      {/* Ruban ink : Γ (fût + bras haut) */}
      <path
        d="M15 41 L15 9 L36 6.5"
        fill="none"
        stroke={`url(#${uid}-ink)`}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Ombre portée de l'or sur le bras haut (croisement « par-dessus ») */}
      {!mono && (
        <path
          d="M27.5 8 L32 7.3"
          fill="none"
          stroke="#0B0704"
          strokeOpacity="0.17"
          strokeWidth="8"
          strokeLinecap="butt"
        />
      )}

      {/* Ruban or : se noue à travers le F */}
      <path
        d="M6 20 L26 18 C31 17 34 15 34 11 C34 7 30.5 6 27.5 8"
        fill="none"
        stroke={`url(#${uid}-gold)`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Ombres du fût sur l'or (croisement « par-derrière ») */}
      {!mono && (
        <g stroke="#0B0704" strokeOpacity="0.16" strokeWidth="7" strokeLinecap="butt">
          <path d="M19 18.6 L23 18" fill="none" />
          <path d="M8 19.9 L12 19.4" fill="none" />
        </g>
      )}

      {/* Segment du fût redessiné : l'or passe derrière */}
      <path
        d="M15 12.5 L15 25.5"
        fill="none"
        stroke={`url(#${uid}-ink)`}
        strokeWidth="8"
        strokeLinecap="butt"
      />
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="FasoLink — accueil"
    >
      <LogoMark className="h-9 w-9 shrink-0 text-ink transition-transform duration-300 group-hover:-translate-y-0.5" />
      {!compact && (
        <span className="font-display text-[1.15rem] leading-none tracking-[-0.03em] text-ink">
          <span className="font-medium">Faso</span>
          <span className="font-extrabold">Link</span>
        </span>
      )}
    </Link>
  );
}
