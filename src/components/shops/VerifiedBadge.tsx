import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Badge doré « Vendeur Vérifié FasoLink » (CNIB/NIF ou localisation contrôlée). */
export function VerifiedBadge({
  className,
  label = "Vendeur Vérifié",
  size = "sm",
}: {
  className?: string;
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold text-faso-gold-dark",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        !className?.includes("bg-") && "bg-faso-gold-soft/60",
        className,
      )}
    >
      <BadgeCheck
        className={cn(
          "text-faso-gold-dark",
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
        )}
      />
      {label}
    </span>
  );
}
