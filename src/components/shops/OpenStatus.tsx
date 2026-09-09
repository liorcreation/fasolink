"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { OpeningHours } from "@/lib/database.types";
import { getOpenState, type OpenState } from "@/lib/hours";
import { cn } from "@/lib/utils";

/**
 * Affiche « Ouvert actuellement » / « Fermé · ouvre à 08h00 ».
 * Calculé après montage pour éviter tout écart d'hydratation (heure client).
 */
export function OpenStatus({
  hours,
  className,
  compact = false,
}: {
  hours: OpeningHours | null | undefined;
  className?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<OpenState | null>(null);

  useEffect(() => {
    const tick = () => setState(getOpenState(hours));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  if (!state) {
    return (
      <span
        className={cn(
          "inline-flex h-6 w-28 animate-pulse rounded-full bg-clay-100",
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
        state.isOpen
          ? "bg-faso-green-soft/50 text-faso-green-dark"
          : "bg-clay-100 text-ink-muted",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          state.isOpen ? "bg-faso-green" : "bg-ink-muted",
        )}
      />
      {compact ? state.label : (
        <>
          <Clock className="h-3 w-3" />
          {state.label}
          {state.detail && (
            <span className="font-medium text-ink-muted">· {state.detail}</span>
          )}
        </>
      )}
    </span>
  );
}
