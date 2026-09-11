import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GrainTexture } from "@/components/ui/GrainTexture";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Traitement unique pour les états vides — remplace le pattern « bordure en
 * pointillés + texte centré » dupliqué (fiche boutique, recherche, hors-ligne).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  texture = false,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  size?: "sm" | "md";
  texture?: boolean;
  className?: string;
}) {
  const compact = size === "sm";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-clay-100 bg-clay-50/60 text-center",
        compact ? "px-6 py-10" : "px-6 py-16",
        className,
      )}
    >
      {texture && <GrainTexture className="text-ink" opacity={0.04} />}
      <div className="relative flex flex-col items-center gap-3">
        <span className="glow-dot h-14 w-14 text-white">
          <Icon className={compact ? "h-6 w-6" : "h-7 w-7"} />
        </span>
        <p className={cn("font-display font-bold text-ink", compact ? "text-base" : "text-lg")}>
          {title}
        </p>
        {description && (
          <p className="max-w-sm text-sm text-ink-muted">{description}</p>
        )}
        {action &&
          (action.href ? (
            <Link
              href={action.href}
              className="btn-base mt-1 h-11 bg-faso-red px-6 text-sm text-white"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="btn-base mt-1 h-11 bg-faso-red px-6 text-sm text-white"
            >
              {action.label}
            </button>
          ))}
      </div>
    </div>
  );
}
