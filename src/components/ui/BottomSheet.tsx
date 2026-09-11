"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
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
          className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag={reduce ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className="relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-4xl bg-clay-50 shadow-premium-lg outline-none sm:max-w-lg sm:rounded-4xl"
          >
            <div className="shrink-0 px-5 pb-2 pt-3">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-clay-300 sm:hidden" />
              <div className="mt-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink-muted hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
              {children}
            </div>

            {footer && (
              <div className="shrink-0 border-t border-clay-100 bg-white/80 px-5 py-3 pb-safe backdrop-blur">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
