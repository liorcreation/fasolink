import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne des classes Tailwind sans conflit. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formate un montant en Francs CFA (XOF). */
export function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Normalise un numéro du plan burkinabè vers le format international E.164.
 * L'entrée reste toujours une chaîne : un zéro saisi par l'utilisateur ne
 * peut donc jamais disparaître comme avec un champ numérique.
 */
export function normalizeBurkinaPhone(rawPhone: string): string | null {
  const digits = rawPhone.replace(/\D/g, "");
  let national = digits;

  if (digits.startsWith("226")) {
    national = digits.slice(3);
  } else if (digits.length === 9 && digits.startsWith("0")) {
    // Tolère une saisie longue avec préfixe de sortie 0.
    national = digits.slice(1);
  }

  // Le PNN burkinabè est fermé à 8 chiffres. Le premier chiffre peut faire
  // partie d'un préfixe AB attribué par l'ARCEP : on ne le supprime jamais.
  if (!/^\d{8}$/.test(national)) return null;
  return `+226${national}`;
}

export function isValidBurkinaPhone(rawPhone: string): boolean {
  return normalizeBurkinaPhone(rawPhone) !== null;
}

/** Construit un lien wa.me à partir d'un numéro WhatsApp Business. */
export function buildWhatsAppLink(rawPhone: string, message?: string): string {
  const normalized = normalizeBurkinaPhone(rawPhone);
  const digits = rawPhone.replace(/\D/g, "");
  const fallback = digits.startsWith("226") ? digits : `226${digits.replace(/^0+/, "")}`;
  const base = `https://wa.me/${(normalized ?? `+${fallback}`).replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Formate un numéro burkinabè pour l'affichage : « +226 70 11 22 33 ».
 */
export function formatPhoneBF(rawPhone: string): string {
  const normalized = normalizeBurkinaPhone(rawPhone);
  if (!normalized) return rawPhone.trim();
  const local = normalized.slice(4);
  const grouped = local.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  return `+226 ${grouped}`;
}

/** Slugifie une chaîne (accents inclus) pour des URLs propres. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Retourne les initiales d'un nom (max 2 lettres). */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
