import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Monogramme FasoLink — ligature F + L.
 *
 * Deux lettres séparées, chacune sur sa propre tige (le F en haut à gauche,
 * le L en bas à droite, décalé en diagonale) — jamais trois barres sur une
 * même tige, pour ne pas se lire comme un « E ». Elles se touchent à un
 * seul point : là où la grande barre du F rejoint la tige du L. C'est à cet
 * endroit précis qu'est posé le seul accent d'or, en losange — le rivet qui
 * relie « Faso » et « Link ».
 *
 * `currentColor` porte le F et le L (s'adapte au fond) ; l'or est fixe.
 * `mono` : version 1 ton (fonds colorés, tampon, gravure, très petite taille).
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
          <stop offset="0" stopColor="currentColor" stopOpacity={mono ? 1 : 0.88} />
          <stop offset="1" stopColor="currentColor" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="19" y1="27" x2="29" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={mono ? "currentColor" : "#FBC66A"} />
          <stop offset="1" stopColor={mono ? "currentColor" : "#C97F16"} />
        </linearGradient>
      </defs>

      {/* F — tige, grande barre (coupe 45°), petite barre */}
      <rect x="8" y="6" width="6" height="26" fill={`url(#${uid}-ink)`} />
      <polygon points="14,6 24,6 28,10 28,12 14,12" fill={`url(#${uid}-ink)`} />
      <rect x="14" y="16" width="10" height="6" fill={`url(#${uid}-ink)`} />

      {/* L — tige, pied (coupe 45°), décalé en diagonale sous le F */}
      <rect x="24" y="22" width="6" height="20" fill={`url(#${uid}-ink)`} />
      <polygon points="24,36 38,36 38,38 34,42 24,42" fill={`url(#${uid}-ink)`} />

      {/* Rivet d'or — point de contact unique entre le F et le L */}
      <polygon points="24,17 29,22 24,27 19,22" fill={`url(#${uid}-gold)`} />
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
