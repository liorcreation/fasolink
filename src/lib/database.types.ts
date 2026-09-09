/**
 * Types de données FasoLink (collections Firestore : `shops`, `products`,
 * `subscriptions`, `reviews`, `contact_events`, `profiles`).
 *
 * Les timestamps sont stockés en chaînes ISO 8601 (`new Date().toISOString()`).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRole = "buyer" | "seller";
export type ShopCategory =
  | "alimentation"
  | "habillement"
  | "electronique"
  | "artisanat"
  | "services";
export type ShopStatus = "pending" | "active" | "suspended";
export type VerificationStatus = "unverified" | "pending" | "verified";
export type ProductAvailability = "in_stock" | "on_order" | "out_of_stock";
export type SubscriptionPlan = "mensuel" | "trimestriel" | "annuel";
export type SubscriptionStatus =
  | "trialing"
  | "pending"
  | "active"
  | "expired"
  | "cancelled";
export type PaymentProvider = "orange_money" | "moov_money" | "wave";

/** Horaires d'ouverture : "0" = dimanche … "6" = samedi. `null` = fermé ce jour. */
export type OpeningHours = Record<
  string,
  { open: string; close: string } | null
>;

export interface Profile {
  id: string;
  role: ProfileRole;
  full_name: string;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: ShopCategory;
  description: string;
  city: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: OpeningHours | null;
  whatsapp: string;
  logo_url: string | null;
  cover_url: string | null;
  gallery: string[];
  status: ShopStatus;
  verification_status: VerificationStatus;
  is_featured: boolean;
  rating: number;
  rating_count: number;
  whatsapp_clicks: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  availability: ProductAvailability;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  shop_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: PaymentProvider | null;
  gateway: string | null;
  amount: number;
  phone: string | null;
  reference: string | null;
  trial_ends_at: string | null;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  shop_id: string;
  author_id: string | null;
  author_name: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  created_at: string;
}

export interface ContactEvent {
  id: string;
  shop_id: string;
  product_id: string | null;
  channel: string;
  created_at: string;
}

export type ShopWithProducts = Shop & {
  products: Product[];
  reviews?: Review[];
};

/** Données du formulaire boutique avant écriture Firestore. */
export type ShopInput = Omit<
  Shop,
  "id" | "created_at" | "updated_at" | "rating" | "rating_count" | "whatsapp_clicks"
> &
  Partial<Pick<Shop, "logo_url" | "cover_url" | "gallery" | "latitude" | "longitude">>;
