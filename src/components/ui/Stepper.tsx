import { cn } from "@/lib/utils";

export interface StepperStep {
  key: string;
  label: string;
}

/**
 * Indicateur de progression pour les parcours multi-étapes (inscription
 * vendeur → paiement → vérification). Le label reste visible (tronqué si
 * besoin) à toutes les largeurs — contrairement à un pattern "numéro seul
 * sur mobile" qui fait perdre le contexte du parcours en cours.
 */
export function Stepper({
  steps,
  currentKey,
  className,
}: {
  steps: StepperStep[];
  currentKey: string;
  className?: string;
}) {
  const currentIndex = Math.max(
    steps.findIndex((s) => s.key === currentKey),
    0,
  );

  return (
    <ol className={cn("flex items-center gap-1.5 sm:gap-2", className)}>
      {steps.map((s, i) => {
        const reached = currentIndex >= i;
        const active = currentIndex === i;
        return (
          <li key={s.key} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                reached
                  ? "bg-faso-gradient text-white shadow-premium-sm"
                  : "bg-clay-100 text-ink-muted",
              )}
              aria-current={active ? "step" : undefined}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "min-w-0 truncate text-[11px] font-semibold sm:text-xs",
                reached ? "text-ink" : "text-ink-muted",
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="h-px min-w-3 flex-1 bg-clay-200" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
