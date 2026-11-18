"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type Day = { date: string; count: number };

const EASE = [0.16, 1, 0.3, 1] as const;

function formatDay(date: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", { ...options, timeZone: "UTC" });
}

/** Graduations « propres » : 0, la moitié et le maximum arrondi. */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const unit = value <= 10 ? 2 : value <= 100 ? 10 : Math.pow(10, Math.floor(Math.log10(value)) - 1) * 2;
  return Math.ceil(value / unit) * unit;
}

/**
 * Contacts WhatsApp par jour (une seule série, donc pas de légende : le titre
 * la nomme). Colonnes ≤ 24 px à bout arrondi, grille en filet, info-bulle par
 * colonne au survol ; le tableau masqué en est l'équivalent pour le clavier et
 * les lecteurs d'écran.
 */
export function ContactsChart({ days, loading }: { days: Day[]; loading: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState<number | null>(null);

  const peak = Math.max(0, ...days.map((day) => day.count));
  const top = niceMax(peak);
  const ticks = [top, top / 2, 0];
  const peakIndex = peak > 0 ? days.findIndex((day) => day.count === peak) : -1;

  // Le conteneur observé reste monté pendant le chargement : sinon
  // l'observateur de `useInView` ne se rebranche jamais et les barres
  // resteraient à hauteur nulle.
  if (loading) {
    return (
      <div ref={ref} className="mt-6">
        <div aria-hidden="true" className="h-48 animate-pulse rounded-2xl bg-clay-100/70" />
      </div>
    );
  }

  return (
    <div ref={ref} className="mt-6">
      <div className="flex gap-3">
        {/* Axe Y : graduations arrondies, en encre discrète. */}
        <div aria-hidden="true" className="flex h-48 flex-col justify-between pb-px text-right text-[10px] font-semibold text-ink-muted [font-variant-numeric:tabular-nums]">
          {ticks.map((tick) => <span key={tick} className="-translate-y-1/2 leading-none last:translate-y-0">{tick}</span>)}
        </div>

        <div className="relative h-48 flex-1">
          {/* Grille en filet, pleine, récessive. */}
          <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between">
            {ticks.map((tick) => <span key={tick} className="h-px w-full bg-clay-200/70" />)}
          </div>

          <div aria-hidden="true" className="relative flex h-full items-end gap-0.5" onPointerLeave={() => setHovered(null)}>
            {days.map((day, index) => {
              const height = day.count === 0 ? 0 : Math.max((day.count / top) * 100, 3);
              const active = hovered === index;
              return (
                <div
                  key={day.date}
                  onPointerEnter={() => setHovered(index)}
                  className="relative flex h-full flex-1 cursor-default items-end justify-center"
                >
                  {day.count === 0 ? (
                    <span className="h-[3px] w-full max-w-6 rounded-full bg-clay-200" />
                  ) : (
                    <motion.span
                      className={cn(
                        "w-full max-w-6 origin-bottom rounded-t-[4px] bg-faso-green transition-[filter] duration-200",
                        hovered !== null && !active && "brightness-110 saturate-50",
                      )}
                      style={{ height: `${height}%` }}
                      initial={{ scaleY: 0 }}
                      animate={inView ? { scaleY: 1 } : undefined}
                      transition={{ duration: 0.9, ease: EASE, delay: index * 0.035 }}
                    />
                  )}

                  {/* Étiquette directe, uniquement sur le pic. */}
                  {index === peakIndex && hovered === null && (
                    <span className="absolute text-[11px] font-extrabold text-ink" style={{ bottom: `calc(${height}% + 6px)` }}>
                      {day.count}
                    </span>
                  )}

                  {active && (
                    <span
                      className="pointer-events-none absolute z-10 whitespace-nowrap rounded-xl bg-ink px-2.5 py-1.5 text-center text-[11px] text-white shadow-lg"
                      style={{ bottom: `calc(${Math.max(height, 4)}% + 10px)` }}
                    >
                      <span className="block font-extrabold">{day.count} contact{day.count > 1 ? "s" : ""}</span>
                      <span className="block text-white/65">{formatDay(day.date, { weekday: "short", day: "numeric", month: "short" })}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="ml-7 mt-2 flex justify-between text-[10px] font-semibold text-ink-muted">
        <span>{days[0] ? formatDay(days[0].date) : ""}</span>
        <span>{days[6] ? formatDay(days[6].date) : ""}</span>
        <span>Aujourd’hui</span>
      </div>

      {/* Vue tableau équivalente pour les technologies d'assistance. */}
      <table className="sr-only">
        <caption>Contacts WhatsApp par jour sur les 14 derniers jours</caption>
        <thead>
          <tr><th scope="col">Jour</th><th scope="col">Contacts</th></tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}><td>{formatDay(day.date, { weekday: "long", day: "numeric", month: "long" })}</td><td>{day.count}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
