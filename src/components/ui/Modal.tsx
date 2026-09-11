"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/useFocusTrap";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  full: "max-w-none h-full sm:h-auto sm:max-w-4xl",
} as const;

/**
 * Dialogue centré générique — remplace les implémentations indépendantes de
 * ShopGallery (lightbox) et PredictiveSearch (palette). Piège le focus,
 * ferme sur Échap/clic extérieur, restitue le focus au déclencheur.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: keyof typeof SIZES;
  showClose?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(panelRef, open);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-4xl bg-white shadow-premium-lg outline-none",
              SIZES[size],
              className,
            )}
          >
            {(title || showClose) && (
              <div className="flex shrink-0 items-center justify-between border-b border-clay-100 px-5 py-4">
                {title && (
                  <h2 id={titleId} className="font-display text-lg font-bold text-ink">
                    {title}
                  </h2>
                )}
                {showClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="ml-auto grid h-9 w-9 place-items-center rounded-xl bg-clay-100 text-ink-muted transition-colors hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
