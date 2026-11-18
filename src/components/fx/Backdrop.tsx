import { cn } from "@/lib/utils";

/**
 * Fond d'ambiance réutilisable : aurora + grille + grain.
 * À placer en premier enfant d'une section `relative isolate overflow-hidden`.
 */
export function Backdrop({
  dark = false,
  grid = true,
  aurora = true,
  grain = true,
  className,
}: {
  dark?: boolean;
  grid?: boolean;
  aurora?: boolean;
  grain?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      {aurora && (
        <div className={cn("fx-aurora", dark && "fx-aurora-dark")}>
          <i />
          <i />
          <i />
        </div>
      )}
      {grid && <div className={cn("fx-grid", dark && "fx-grid-dark")} />}
      {grain && <div className={cn("fx-grain", dark && "fx-grain-dark")} />}
    </div>
  );
}
