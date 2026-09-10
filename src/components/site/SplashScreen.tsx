"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Écran de démarrage FasoLink.
 *
 * Le F et le L arrivent séparément — chacun sur sa propre tige, comme dans
 * le monogramme — et se rejoignent au moment où le rivet d'or apparaît :
 * c'est le geste de la marque (« Link »), rejoué en une seconde et demie
 * plutôt qu'illustré. Ne se rejoue pas à la navigation interne : ce
 * composant ne vit que le temps du montage racine (chargement complet).
 */
const EASE = [0.22, 1, 0.36, 1] as const;

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const holdMs = reduced ? 900 : 2000;
    const timer = window.setTimeout(() => setVisible(false), holdMs);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [reduced]);

  const timing = reduced
    ? { f: 0, l: 0, rivet: 0.1, word: 0.22, dur: 0.3 }
    : { f: 0.15, l: 0.4, rivet: 0.85, word: 1.05, dur: 0.55 };

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = "";
      }}
    >
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#15100A]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          transition={{ duration: 0.6, ease: EASE }}
          aria-hidden="true"
        >
          {/* Trame tissée, très discrète — Faso Dan Fani */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="splash-weave"
                width="26"
                height="26"
                patternUnits="userSpaceOnUse"
              >
                <path d="M0 13H26M13 0V26" stroke="#FFFFFF" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#splash-weave)" />
          </svg>

          {/* Halo ambiant, couleurs du drapeau adoucies */}
          <div
            className="pointer-events-none absolute left-1/2 top-[40%] h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(214,40,40,0.20) 0%, rgba(244,169,60,0.10) 45%, transparent 72%)",
            }}
          />

          {/* Éclat au moment précis où le rivet d'or se pose */}
          {!reduced && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-[44%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(251,198,106,0.9) 0%, rgba(251,198,106,0) 70%)",
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.3, 1.5] }}
              transition={{ delay: timing.rivet, duration: 0.7, ease: EASE }}
            />
          )}

          <svg
            viewBox="0 0 48 48"
            width="104"
            height="104"
            role="img"
            aria-label="FasoLink"
            className="relative"
          >
            <defs>
              <linearGradient
                id="splash-gold"
                x1="19"
                y1="27"
                x2="29"
                y2="17"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#FBC66A" />
                <stop offset="1" stopColor="#E0902A" />
              </linearGradient>
            </defs>

            {/* F — arrive par la gauche */}
            <motion.g
              fill="#F4EEE2"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: timing.f, duration: timing.dur, ease: EASE }}
            >
              <rect x="8" y="6" width="6" height="26" />
              <polygon points="14,6 24,6 28,10 28,12 14,12" />
              <rect x="14" y="16" width="10" height="6" />
            </motion.g>

            {/* L — arrive par le bas-droite, sous le F */}
            <motion.g
              fill="#F4EEE2"
              initial={{ opacity: 0, x: 14, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: timing.l, duration: timing.dur, ease: EASE }}
            >
              <rect x="24" y="22" width="6" height="20" />
              <polygon points="24,36 38,36 38,38 34,42 24,42" />
            </motion.g>

            {/* Le rivet d'or — le lien se fait */}
            <motion.polygon
              points="24,17 29,22 24,27 19,22"
              fill="url(#splash-gold)"
              style={{ transformOrigin: "24px 22px" }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: [0.3, 1.4, 1] }}
              transition={{ delay: timing.rivet, duration: 0.5, ease: EASE }}
            />
          </svg>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: timing.word, duration: 0.5, ease: EASE }}
            className="relative mt-4 font-display text-[1.4rem] leading-none tracking-[-0.03em] text-[#F4EEE2]"
          >
            <span className="font-medium">Faso</span>
            <span className="font-extrabold">Link</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
