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
 * Construit un lien wa.me à partir d'un numéro WhatsApp Business.
 * Accepte les formats locaux burkinabè (8 chiffres) ou internationaux.
 */
export function buildWhatsAppLink(rawPhone: string, message?: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  const normalized = digits.startsWith("226")
    ? digits
    : `226${digits.replace(/^0+/, "")}`;
  const base = `https://wa.me/${normalized}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Formate un numéro burkinabè pour l'affichage : « +226 70 11 22 33 ».
 */
export function formatPhoneBF(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  const local = digits.startsWith("226") ? digits.slice(3) : digits.replace(/^0+/, "");
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
