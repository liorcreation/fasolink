"use client";

import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Révèle un texte mot par mot, chaque mot glissant hors d'un masque.
 * Le texte reste un vrai texte (lisible, sélectionnable, indexable).
 *
 * L'observation « dans l'écran » est portée par le conteneur : chaque mot est
 * entièrement masqué par son parent (overflow hidden) au départ, et un
 * IntersectionObserver posé sur le mot lui-même ne le verrait jamais.
 */
export function RevealText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  inView = false,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  /** true : se joue à l'entrée dans l'écran ; false : au montage. */
  inView?: boolean;
}) {
  const reduce = useSafeReducedMotion();
  const words = text.split(" ");

  // Même structure serveur/client dans tous les cas (sinon échec d'hydratation) :
  // en mouvement réduit, on démarre simplement à l'état final.
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={reduce ? "visible" : "hidden"}
      {...(inView ? { whileInView: "visible", viewport: { once: true, margin: "-40px" } } : { animate: "visible" })}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className={cn("inline-block will-change-transform", wordClassName)}
              variants={{
                hidden: { y: "105%", rotate: 4 },
                visible: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 && " "}
        </Fragment>
      ))}
    </motion.span>
  );
}
