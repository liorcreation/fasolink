"use client";

import { useEffect } from "react";

/**
 * Un seul écouteur global alimente --mx / --my sur l'élément [data-spotlight]
 * survolé. Les cartes restent des composants simples (même serveur) : il
 * suffit d'ajouter `data-spotlight` + la classe `fx-spotlight`.
 */
export function SpotlightTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let last: PointerEvent | null = null;

    const update = () => {
      frame = 0;
      const event = last;
      if (!event) return;
      const target = event.target instanceof Element ? event.target : null;
      const host = target?.closest<HTMLElement>("[data-spotlight]");
      if (!host) return;
      const rect = host.getBoundingClientRect();
      host.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      host.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      last = event;
      if (!frame) frame = requestAnimationFrame(update);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
