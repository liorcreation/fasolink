/**
 * Typage de la base de données Supabase (PostgreSQL).
 * Reflète `schema.sql` à la racine du projet.
 *
 * En production, régénérez ce fichier avec :
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
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

/** Horaires d'ouverture : 0 = dimanche … 6 = samedi. `null` = fermé ce jour. */
export type OpeningHours = Record<
  string,
  { open: string; close: string } | null
>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: ProfileRole;
          full_name: string;
          phone: string | null;
          city: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: ProfileRole;
          full_name: string;
          phone?: string | null;
          city?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      shops: {
        Row: {
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
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          category: ShopCategory;
          description: string;
          city: string;
          neighborhood?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          opening_hours?: OpeningHours | null;
          whatsapp: string;
          logo_url?: string | null;
          cover_url?: string | null;
          gallery?: string[];
          status?: ShopStatus;
          verification_status?: VerificationStatus;
          is_featured?: boolean;
          rating?: number;
          rating_count?: number;
          whatsapp_clicks?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shops"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "shops_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
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
        };
        Insert: {
          id?: string;
          shop_id: string;
          name: string;
          description?: string | null;
          price: number;
          currency?: string;
          image_url?: string | null;
          availability?: ProductAvailability;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey";
            columns: ["shop_id"];
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
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
        };
        Insert: {
          id?: string;
          shop_id: string;
          plan: SubscriptionPlan;
          status?: SubscriptionStatus;
          provider?: PaymentProvider | null;
          gateway?: string | null;
          amount: number;
          phone?: string | null;
          reference?: string | null;
          trial_ends_at?: string | null;
          started_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "subscriptions_shop_id_fkey";
            columns: ["shop_id"];
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          shop_id: string;
          author_id: string | null;
          author_name: string;
          rating: number;
          comment: string;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          author_id?: string | null;
          author_name: string;
          rating: number;
          comment: string;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reviews_shop_id_fkey";
            columns: ["shop_id"];
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_events: {
        Row: {
          id: string;
          shop_id: string;
          product_id: string | null;
          channel: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          product_id?: string | null;
          channel?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_events"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "contact_events_shop_id_fkey";
            columns: ["shop_id"];
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      track_contact: {
        Args: { p_shop_id: string; p_product_id?: string | null };
        Returns: undefined;
      };
    };
    Enums: {
      profile_role: ProfileRole;
      shop_category: ShopCategory;
      shop_status: ShopStatus;
      verification_status: VerificationStatus;
      product_availability: ProductAvailability;
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
      payment_provider: PaymentProvider;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Raccourcis pratiques
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Shop = Database["public"]["Tables"]["shops"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

export type ShopWithProducts = Shop & {
  products: Product[];
  reviews?: Review[];
};
