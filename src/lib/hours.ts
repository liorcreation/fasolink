import type { OpeningHours } from "@/lib/database.types";

const DAYS_FR = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

export interface OpenState {
  label: string;
  isOpen: boolean;
  /** Info secondaire : « ferme à 18h30 » / « ouvre lundi à 08h00 ». */
  detail: string | null;
}

/**
 * Détermine si une boutique est ouverte maintenant à partir de ses horaires.
 * `now` injectable pour les tests / le rendu serveur déterministe.
 */
export function getOpenState(
  hours: OpeningHours | null | undefined,
  now: Date = new Date(),
): OpenState {
  if (!hours) {
    return { label: "Horaires non renseignés", isOpen: false, detail: null };
  }

  const day = now.getDay();
  const key = String(day);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = hours[key];

  if (today) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (minutes >= open && minutes < close) {
      return {
        label: "Ouvert actuellement",
        isOpen: true,
        detail: `ferme à ${today.close}`,
      };
    }
    if (minutes < open) {
      return {
        label: "Fermé",
        isOpen: false,
        detail: `ouvre à ${today.open}`,
      };
    }
  }

  // Cherche le prochain jour ouvré (max 7 jours).
  for (let i = 1; i <= 7; i++) {
    const next = hours[String((day + i) % 7)];
    if (next) {
      const dayName = DAYS_FR[(day + i) % 7];
      return {
        label: "Fermé",
        isOpen: false,
        detail:
          i === 1
            ? `ouvre demain à ${next.open}`
            : `ouvre ${dayName} à ${next.open}`,
      };
    }
  }

  return { label: "Fermé", isOpen: false, detail: null };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** Horaires « commerce standard » : lun-sam 08h-19h, dim fermé. */
export const STANDARD_HOURS: OpeningHours = {
  "1": { open: "08:00", close: "19:00" },
  "2": { open: "08:00", close: "19:00" },
  "3": { open: "08:00", close: "19:00" },
  "4": { open: "08:00", close: "19:00" },
  "5": { open: "08:00", close: "19:00" },
  "6": { open: "09:00", close: "18:00" },
  "0": null,
};
