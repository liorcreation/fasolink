"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { buildWhatsAppLink } from "@/lib/utils";
import { trackContact } from "@/lib/tracking";

/**
 * CTA WhatsApp collant en bas d'écran (mobile), sur les fiches boutique/produit.
 * Se place au-dessus de la BottomNav. Apparaît après un léger défilement.
 */
export function StickyContactBar({
  shopId,
  shopName,
  whatsapp,
  productId,
  aboutName,
  priceLabel,
  contactMessage,
  actionLabel,
}: {
  shopId: string;
  shopName: string;
  whatsapp: string;
  productId?: string;
  /** Nom du produit ou du service concerné. */
  aboutName?: string;
  priceLabel?: string;
  contactMessage?: string;
  actionLabel?: string;
}) {
  const [shown, setShown] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const message = contactMessage ?? (aboutName
    ? `Bonjour ${shopName}, je vous contacte depuis FasoLink à propos de ${aboutName}.`
    : `Bonjour ${shopName}, je vous contacte depuis FasoLink.`);

  return (
    <div
      className={cnBar(shown, Boolean(reduceMotion))}
      // masqué sur desktop (le header porte déjà le bouton)
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-clay-100 bg-white/95 p-2 shadow-premium-lg backdrop-blur">
        <div className="min-w-0 flex-1 pl-2">
          <p className="truncate text-xs font-semibold text-ink">{shopName}</p>
          <p className="truncate text-[11px] text-ink-muted">
            {aboutName ? aboutName : "Vitrine FasoLink"}
            {priceLabel ? ` · ${priceLabel}` : ""}
          </p>
        </div>
        <a
          href={buildWhatsAppLink(whatsapp, message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContact(shopId, productId)}
          className="btn-base min-h-11 shrink-0 bg-[#25D366] px-3 text-xs text-white transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-green focus-visible:ring-offset-2 sm:px-5 sm:text-sm"
          aria-label={actionLabel ?? `Contacter ${shopName} sur WhatsApp`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {actionLabel ?? "Contacter sur WhatsApp"}
        </a>
      </div>
    </div>
  );
}

function cnBar(shown: boolean, reduceMotion: boolean) {
  return [
    "pointer-events-none fixed inset-x-0 z-40 px-3 md:hidden",
    reduceMotion ? "transition-none" : "transition-all duration-300",
    // au-dessus de la BottomNav (h ~4rem) + safe area
    "bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)]",
    shown ? "translate-y-0 opacity-100" : "translate-y-[140%] opacity-0",
  ].join(" ");
}
