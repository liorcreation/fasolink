import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { ShopWithProducts } from "@/lib/database.types";
import { MOCK_SHOPS, getMockShop } from "@/lib/mock-data";

/**
 * Couche d'accès aux données. Utilise Supabase si configuré, sinon retombe
 * proprement sur les données de démonstration afin que l'UI reste fonctionnelle.
 */

const SELECT = "*, products(*), reviews(*)";

export async function fetchShops(): Promise<ShopWithProducts[]> {
  if (!isSupabaseConfigured) return MOCK_SHOPS;

  const { data, error } = await supabase
    .from("shops")
    .select(SELECT)
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false });

  if (error || !data || data.length === 0) return MOCK_SHOPS;
  return data as unknown as ShopWithProducts[];
}

export async function fetchShopById(
  id: string,
): Promise<ShopWithProducts | null> {
  if (!isSupabaseConfigured) return getMockShop(id) ?? null;

  const { data, error } = await supabase
    .from("shops")
    .select(SELECT)
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  if (error || !data) return getMockShop(id) ?? null;
  return data as unknown as ShopWithProducts;
}

export async function fetchProduct(shopId: string, productId: string) {
  const shop = await fetchShopById(shopId);
  if (!shop) return null;
  const product = shop.products.find((p) => p.id === productId);
  if (!product) return null;
  return { shop, product };
}

/**
 * Estimation de l'impact économique local :
 * panier moyen par boutique x volume de contacts mensuels estimé.
 * Extrapolé à l'échelle de la plateforme (facteur `scale`).
 */
export function estimateLocalImpact(
  shops: ShopWithProducts[],
  platformShops = 520,
): number {
  if (!shops.length) return 0;
  const avgPerShop =
    shops.reduce((sum, shop) => {
      const prices = shop.products.map((p) => p.price).filter(Boolean);
      const basket = prices.length
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 0;
      const monthlyContacts = Math.max(
        shop.whatsapp_clicks,
        40 + Math.round(shop.rating * 12),
      );
      // ~35 % des contacts se concluent par un achat.
      return sum + basket * monthlyContacts * 0.35;
    }, 0) / shops.length;

  return Math.round(avgPerShop * platformShops);
}
