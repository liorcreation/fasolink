"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "fasolink:pwa-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (isStandalone) return;

    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !/crios|fxios/i.test(navigator.userAgent);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    if (isIOS) {
      setIosHint(true);
      setTimeout(() => setVisible(true), 5000);
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
          className="fixed inset-x-4 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+0.5rem)] z-[45] mx-auto max-w-md rounded-3xl border border-clay-100 bg-white p-4 shadow-premium-lg sm:left-auto sm:right-4 md:bottom-4 md:z-[65]"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-faso-gradient text-white">
              <Download className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-ink">
                Installer FasoLink
              </p>
              {iosHint ? (
                <p className="mt-0.5 text-xs text-ink-muted">
                  Appuyez sur <Share className="inline h-3.5 w-3.5" /> puis
                  «&nbsp;Sur l&apos;écran d&apos;accueil&nbsp;».
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-ink-muted">
                  Accès instantané, sans store, même en connexion faible.
                </p>
              )}
              {!iosHint && (
                <button
                  onClick={install}
                  className="btn-base mt-2 h-9 bg-faso-red px-4 text-xs text-white"
                >
                  Installer l&apos;application
                </button>
              )}
            </div>
            <button
              onClick={dismiss}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-clay-100"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
