"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper, X } from "lucide-react";

/**
 * Toast de confirmation affiché après publication de la boutique
 * (redirection depuis /vendeur/paiement avec ?published=1).
 * Nettoie le paramètre d'URL puis se referme automatiquement.
 */
export function PublishedToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.get("published") === "1") {
      setOpen(true);
      // retire le paramètre sans recharger
      router.replace(pathname, { scroll: false });
      const t = setTimeout(() => setOpen(false), 6000);
      return () => clearTimeout(t);
    }
  }, [params, pathname, router]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="fixed inset-x-4 top-20 z-[80] mx-auto max-w-md md:left-auto md:right-6 md:top-24"
          role="status"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-faso-green/30 bg-white p-4 shadow-premium-lg">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-faso-green text-white">
              <PartyPopper className="h-5 w-5" />
            </span>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-bold text-ink">
                Félicitations, votre boutique est en ligne !
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Partagez le lien de votre vitrine et votre QR Code à vos clients.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-clay-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
