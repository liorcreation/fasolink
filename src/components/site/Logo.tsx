import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Monogramme FasoLink : un « F » géométrique dont la barre centrale est une
 * pastille or — la « connexion » (link) et un clin d'œil à l'étoile du drapeau.
 * `currentColor` pour le F (s'adapte au fond), or fixe (#F4A93C).
 */
export function LogoMark({
  className,
  mono = false,
}: {
  className?: string;
  /** Version 1 ton (la barre centrale reprend `currentColor` au lieu de l'or). */
  mono?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8 text-ink", className)}
      role="img"
      aria-label="FasoLink"
    >
      <rect
        x="6"
        y="14"
        width="13.5"
        height="6"
        rx="3"
        fill={mono ? "currentColor" : "#F4A93C"}
      />
      <rect x="6" y="4.5" width="6.6" height="23" rx="2" fill="currentColor" />
      <rect x="6" y="4.5" width="16" height="6.6" rx="2" fill="currentColor" />
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
      <LogoMark className="h-8 w-8 shrink-0 text-ink transition-transform duration-300 group-hover:-translate-y-0.5" />
      {!compact && (
        <span className="font-display text-lg leading-none tracking-tight text-ink">
          <span className="font-semibold">Faso</span>
          <span className="font-extrabold">Link</span>
        </span>
      )}
    </Link>
  );
}
