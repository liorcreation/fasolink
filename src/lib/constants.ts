import {
  Shirt,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type {
  ProductAvailability,
  ShopCategory,
  SubscriptionPlan,
} from "@/lib/database.types";

export interface CategoryMeta {
  id: ShopCategory;
  label: string;
  icon: LucideIcon;
  /** Classe(s) d'accent pour puces & badges. */
  accent: string;
  gradient: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "alimentation",
    label: "Alimentation",
    icon: UtensilsCrossed,
    accent: "text-faso-green bg-faso-green-soft/50",
    gradient: "from-faso-green to-emerald-600",
  },
  {
    id: "habillement",
    label: "Habillement",
    icon: Shirt,
    accent: "text-faso-red bg-faso-red-soft/50",
    gradient: "from-faso-red to-rose-600",
  },
  {
    id: "electronique",
    label: "Électronique",
    icon: Smartphone,
    accent: "text-clay-700 bg-clay-100",
    gradient: "from-clay-600 to-clay-800",
  },
  {
    id: "artisanat",
    label: "Artisanat",
    icon: Sparkles,
    accent: "text-faso-gold-dark bg-faso-gold-soft/60",
    gradient: "from-faso-gold to-amber-500",
  },
  {
    id: "services",
    label: "Services",
    icon: Wrench,
    accent: "text-sky-700 bg-sky-100",
    gradient: "from-sky-500 to-blue-600",
  },
];

export const CATEGORY_MAP: Record<ShopCategory, CategoryMeta> =
  CATEGORIES.reduce(
    (acc, c) => ({ ...acc, [c.id]: c }),
    {} as Record<ShopCategory, CategoryMeta>,
  );

/** Principales villes du Burkina Faso pour les filtres & formulaires. */
export const BURKINA_CITIES = [
  "Ouagadougou",
  "Bobo-Dioulasso",
  "Koudougou",
  "Ouahigouya",
  "Banfora",
  "Kaya",
  "Tenkodogo",
  "Fada N'Gourma",
  "Dédougou",
  "Ziniaré",
  "Gaoua",
  "Dori",
];

export interface NeighborhoodMeta {
  name: string;
  city: string;
  lat: number;
  lng: number;
}

/**
 * Quartiers géolocalisés — utilisés pour le filtre « Proche de moi »
 * et le calcul de distance réelle (km).
 */
export const NEIGHBORHOODS: NeighborhoodMeta[] = [
  { name: "Ouaga 2000", city: "Ouagadougou", lat: 12.3183, lng: -1.5081 },
  { name: "Zogona", city: "Ouagadougou", lat: 12.3684, lng: -1.5015 },
  { name: "Kamboinsin", city: "Ouagadougou", lat: 12.4508, lng: -1.5347 },
  { name: "Tanghin", city: "Ouagadougou", lat: 12.3927, lng: -1.5006 },
  { name: "Gounghin", city: "Ouagadougou", lat: 12.3627, lng: -1.5478 },
  { name: "Dassasgho", city: "Ouagadougou", lat: 12.3846, lng: -1.4783 },
  { name: "Patte d'Oie", city: "Ouagadougou", lat: 12.3402, lng: -1.5261 },
  { name: "Zone du Bois", city: "Ouagadougou", lat: 12.3712, lng: -1.4966 },
  { name: "Cissin", city: "Ouagadougou", lat: 12.3406, lng: -1.5592 },
  { name: "Accart-Ville", city: "Bobo-Dioulasso", lat: 11.1839, lng: -4.2892 },
  { name: "Sikasso-Cira", city: "Bobo-Dioulasso", lat: 11.1706, lng: -4.2978 },
  { name: "Secteur 4", city: "Koudougou", lat: 12.2526, lng: -2.3628 },
  { name: "Centre", city: "Banfora", lat: 10.6376, lng: -4.7526 },
];

export const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  Ouagadougou: { lat: 12.3714, lng: -1.5197 },
  "Bobo-Dioulasso": { lat: 11.1771, lng: -4.2979 },
  Koudougou: { lat: 12.2526, lng: -2.3628 },
  Ouahigouya: { lat: 13.5828, lng: -2.4213 },
  Banfora: { lat: 10.6376, lng: -4.7526 },
  Kaya: { lat: 13.0918, lng: -1.0844 },
};

export const AVAILABILITY_META: Record<
  ProductAvailability,
  { label: string; dot: string; text: string }
> = {
  in_stock: {
    label: "En stock",
    dot: "bg-faso-green",
    text: "text-faso-green-dark bg-faso-green-soft/40",
  },
  on_order: {
    label: "Sur commande",
    dot: "bg-faso-gold",
    text: "text-faso-gold-dark bg-faso-gold-soft/50",
  },
  out_of_stock: {
    label: "Épuisé",
    dot: "bg-ink-muted",
    text: "text-ink-muted bg-clay-100",
  },
};

export interface PlanMeta {
  id: SubscriptionPlan;
  label: string;
  months: number;
  price: number;
  perMonth: number;
  highlight?: boolean;
  perks: string[];
}

/** Abonnement standard : 5 000 FCFA / mois (dégressif sur les durées longues). */
export const SUBSCRIPTION_PLANS: PlanMeta[] = [
  {
    id: "mensuel",
    label: "Mensuel",
    months: 1,
    price: 5000,
    perMonth: 5000,
    perks: [
      "Vitrine boutique publiée",
      "Jusqu'à 15 produits",
      "Bouton WhatsApp direct",
      "Statistiques de contacts",
    ],
  },
  {
    id: "trimestriel",
    label: "Trimestriel",
    months: 3,
    price: 13500,
    perMonth: 4500,
    highlight: true,
    perks: [
      "Tout du plan Mensuel",
      "Produits illimités",
      "Badge « Vendeur Vérifié »",
      "Mise en avant catégorie",
    ],
  },
  {
    id: "annuel",
    label: "Annuel",
    months: 12,
    price: 48000,
    perMonth: 4000,
    perks: [
      "Tout du plan Trimestriel",
      "Position prioritaire à l'accueil",
      "Tableau de bord analytics complet",
      "Support prioritaire WhatsApp",
    ],
  },
];

export const TRIAL_DAYS = 14;

export interface PaymentProviderMeta {
  id: "orange_money" | "moov_money" | "wave";
  label: string;
  color: string;
  hint: string;
  ussd: string;
}

export const PAYMENT_PROVIDERS: PaymentProviderMeta[] = [
  {
    id: "orange_money",
    label: "Orange Money",
    color: "#FF7900",
    hint: "Vous recevrez un push de confirmation",
    ussd: "#144#",
  },
  {
    id: "moov_money",
    label: "Moov Money",
    color: "#0072CE",
    hint: "Validez avec votre code secret Moov",
    ussd: "*555#",
  },
  {
    id: "wave",
    label: "Wave",
    color: "#1DC4FF",
    hint: "Confirmez le paiement dans l'app Wave",
    ussd: "app Wave",
  },
];

/** Passerelle d'agrégation Mobile Money (validation par webhook). */
export const PAYMENT_GATEWAY = {
  name: "CinetPay",
  alt: "PayDunya",
  webhookPath: "/api/webhooks/payment",
} as const;
