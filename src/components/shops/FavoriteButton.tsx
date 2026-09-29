"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasFavorite, isLocalFavorite, setFavorite } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  shopId,
  className,
}: {
  shopId: string;
  className?: string;
}) {
  const { user, isConfigured } = useAuth();
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!isConfigured) {
      setActive(isLocalFavorite(shopId));
      return () => {
        mounted = false;
      };
    }
    if (!user) {
      setActive(false);
      return () => {
        mounted = false;
      };
    }
    void hasFavorite(user.uid, shopId).then((value) => {
      if (mounted) setActive(value);
    });
    return () => {
      mounted = false;
    };
  }, [isConfigured, shopId, user]);

  async function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    if (isConfigured && !user) {
      setNotice(true);
      window.setTimeout(() => setNotice(false), 2600);
      return;
    }
    setBusy(true);
    try {
      const next = await setFavorite(user?.uid ?? "demo", shopId, !active);
      setActive(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={active}
        title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/90 text-ink-muted shadow-premium backdrop-blur transition-all hover:scale-105 hover:text-faso-red active:scale-95",
          active && "text-faso-red",
        )}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn("h-4 w-4", active && "fill-current")} />}
      </button>
      {notice && (
        <span className="absolute right-0 top-12 z-20 w-44 rounded-xl bg-ink px-3 py-2 text-center text-[11px] font-semibold text-white shadow-premium">
          Connectez-vous pour synchroniser vos favoris.
        </span>
      )}
    </span>
  );
}
