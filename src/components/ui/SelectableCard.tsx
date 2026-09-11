import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectableCardProps {
  selected: boolean;
  onSelect: () => void;
  icon?: LucideIcon;
  label: string;
  description?: string;
  variant?: "pill" | "card";
  className?: string;
}

/**
 * Généralise les chips catégorie/type-de-document et les cartes de méthode
 * de paiement — un seul composant au lieu de trois implémentations
 * dupliquées. Sélection = anneau doré + fond teinté, jamais un aplat plein.
 */
export function SelectableCard({
  selected,
  onSelect,
  icon: Icon,
  label,
  description,
  variant = "pill",
  className,
}: SelectableCardProps) {
  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "flex min-h-[44px] items-start gap-3 rounded-2xl border p-4 text-left transition-all",
          selected
            ? "border-faso-gold bg-faso-gold-soft/25 shadow-premium-sm ring-1 ring-faso-gold"
            : "border-clay-200 bg-white hover:border-faso-gold/60",
          className,
        )}
      >
        {Icon && (
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
              selected ? "bg-faso-gradient text-white" : "bg-clay-100 text-ink-soft",
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-sm font-bold text-ink">{label}</span>
          {description && (
            <span className="mt-0.5 block text-xs text-ink-muted">
              {description}
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
        selected
          ? "border-faso-gold bg-faso-gold-soft/30 text-ink ring-1 ring-faso-gold"
          : "border-clay-200 bg-white text-ink-soft hover:border-faso-gold/60 hover:text-ink",
        className,
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}
