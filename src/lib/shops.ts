import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore/lite";
import { COLLECTIONS, db, isFirebaseConfigured } from "@/lib/firebase";
import type {
  Product,
  Review,
  Shop,
  ShopWithProducts,
} from "@/lib/database.types";
import { MOCK_SHOPS, getMockShop } from "@/lib/mock-data";

/**
 * Couche d'accès aux données (Firestore). Utilise Firebase si configuré, sinon
 * retombe proprement sur `mock-data.ts` pour que l'UI reste fonctionnelle.
 */

function fromDoc<T>(d: QueryDocumentSnapshot<DocumentData>): T {
  return { id: d.id, ...d.data() } as unknown as T;
}

function groupBy<T extends { shop_id: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const arr = map.get(item.shop_id) ?? [];
    arr.push(item);
    map.set(item.shop_id, arr);
  }
  return map;
}

export async function fetchShops(): Promise<ShopWithProducts[]> {
  if (!isFirebaseConfigured) return MOCK_SHOPS;

  try {
    const [shopSnap, productSnap, reviewSnap] = await Promise.all([
      getDocs(
        query(collection(db, COLLECTIONS.shops), where("status", "==", "active")),
      ),
      getDocs(collection(db, COLLECTIONS.products)),
      getDocs(collection(db, COLLECTIONS.reviews)),
    ]);

    if (shopSnap.empty) return MOCK_SHOPS;

    const productsByShop = groupBy(productSnap.docs.map(fromDoc<Product>));
    const reviewsByShop = groupBy(reviewSnap.docs.map(fromDoc<Review>));

    return shopSnap.docs
      .map(fromDoc<Shop>)
      .map((shop) => ({
        ...shop,
        products: productsByShop.get(shop.id) ?? [],
        reviews: reviewsByShop.get(shop.id) ?? [],
      }))
      .sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) || b.rating - a.rating,
      );
  } catch (error) {
    console.warn("[FasoLink] fetchShops:", error);
    return MOCK_SHOPS;
  }
}

export async function fetchShopById(
  id: string,
): Promise<ShopWithProducts | null> {
  if (!isFirebaseConfigured) return getMockShop(id) ?? null;

  try {
    let shop: Shop | null = null;

    const byId = await getDoc(doc(db, COLLECTIONS.shops, id));
    if (byId.exists()) {
      shop = { id: byId.id, ...byId.data() } as unknown as Shop;
    } else {
      const bySlug = await getDocs(
        query(collection(db, COLLECTIONS.shops), where("slug", "==", id)),
      );
      if (!bySlug.empty) shop = fromDoc<Shop>(bySlug.docs[0]);
    }

    if (!shop) return getMockShop(id) ?? null;

    const [productSnap, reviewSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, COLLECTIONS.products),
          where("shop_id", "==", shop.id),
        ),
      ),
      getDocs(
        query(
          collection(db, COLLECTIONS.reviews),
          where("shop_id", "==", shop.id),
        ),
      ),
    ]);

    return {
      ...shop,
      products: productSnap.docs.map(fromDoc<Product>),
      reviews: reviewSnap.docs.map(fromDoc<Review>),
    };
  } catch (error) {
    console.warn("[FasoLink] fetchShopById:", error);
    return getMockShop(id) ?? null;
  }
}

export async function fetchProduct(shopId: string, productId: string) {
  const shop = await fetchShopById(shopId);
  if (!shop) return null;
  const product = shop.products.find((p) => p.id === productId);
  if (!product) return null;
  return { shop, product };
}

/** Estimation de l'impact économique local (panier moyen × contacts estimés). */
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
      return sum + basket * monthlyContacts * 0.35;
    }, 0) / shops.length;

  return Math.round(avgPerShop * platformShops);
}
