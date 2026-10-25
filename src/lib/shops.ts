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
 * Couche d'accès aux données (Firestore) isomorphique (Serveur + Client).
 * IMPORTANT : Ce module est importé à la fois par des Server Components
 * et des Client Components ("use client" comme PublicShopsRealtime, OwnedShopsLoader).
 * Ne JAMAIS importer `cache` depuis "react" ici car React.cache est strictement
 * serveur et provoque une erreur fatale dans le navigateur ("t.cache is not a function")
 * causant une page blanche.
 *
 * Le cache en mémoire avec TTL de 60s protège contre la saturation CPU
 * Cloudflare Workers (Erreur 1102) tout en restant 100% compatible navigateur.
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

// ─── Cache Mémoire Isomorphique (Edge, Worker, Browser) ──────────────────────
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 60_000; // 60 secondes
let cachedShopsList: CacheEntry<ShopWithProducts[]> | null = null;
const cachedShopDetails = new Map<string, CacheEntry<ShopWithProducts | null>>();

export async function fetchShops(): Promise<ShopWithProducts[]> {
  const now = Date.now();
  if (cachedShopsList && now - cachedShopsList.timestamp < CACHE_TTL_MS) {
    return cachedShopsList.data;
  }

  if (!isFirebaseConfigured) {
    const mock = MOCK_SHOPS.filter((shop) => shop.category === "electronique");
    cachedShopsList = { data: mock, timestamp: now };
    return mock;
  }

  try {
    const [shopSnap, reviewSnap] = await Promise.all([
      getDocs(
        query(collection(db, COLLECTIONS.shops), where("status", "==", "active")),
      ),
      getDocs(collection(db, COLLECTIONS.reviews)),
    ]);

    if (shopSnap.empty) {
      cachedShopsList = { data: [], timestamp: now };
      return [];
    }

    const reviewsByShop = groupBy(reviewSnap.docs.map(fromDoc<Review>));

    const shops = shopSnap.docs
      .map(fromDoc<Shop>)
      .filter((shop) => shop.category === "electronique");
    const productsByShop = new Map<string, Product[]>();
    await Promise.all(
      shops.map(async (shop) => {
        try {
          const productSnap = await getDocs(
            query(
              collection(db, COLLECTIONS.products),
              where("shop_id", "==", shop.id),
            ),
          );
          productsByShop.set(shop.id, productSnap.docs.map(fromDoc<Product>));
        } catch {
          productsByShop.set(shop.id, []);
        }
      }),
    );

    const result = shops
      .map((shop) => {
        const fullShop: ShopWithProducts = {
          ...shop,
          products: productsByShop.get(shop.id) ?? [],
          reviews: reviewsByShop.get(shop.id) ?? [],
        };
        // Pré-remplit le cache individuel pour chaque boutique
        cachedShopDetails.set(shop.id, { data: fullShop, timestamp: now });
        if (shop.slug) {
          cachedShopDetails.set(shop.slug, { data: fullShop, timestamp: now });
        }
        return fullShop;
      })
      .sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) || b.rating - a.rating,
      );

    cachedShopsList = { data: result, timestamp: now };
    return result;
  } catch (error) {
    console.warn("[FasoLink] fetchShops:", error);
    return cachedShopsList?.data ?? [];
  }
}

export async function fetchShopById(
  id: string,
): Promise<ShopWithProducts | null> {
  const now = Date.now();
  const cached = cachedShopDetails.get(id);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (!isFirebaseConfigured) {
    const shop = getMockShop(id);
    const valid = shop?.category === "electronique" ? shop : null;
    cachedShopDetails.set(id, { data: valid, timestamp: now });
    return valid;
  }

  try {
    let shop: Shop | null = null;

    const byId = await getDoc(doc(db, COLLECTIONS.shops, id));
    if (byId.exists()) {
      shop = { id: byId.id, ...byId.data() } as unknown as Shop;
    } else {
      const bySlug = await getDocs(
        query(
          collection(db, COLLECTIONS.shops),
          where("slug", "==", id),
          where("status", "==", "active"),
        ),
      );
      if (!bySlug.empty) shop = fromDoc<Shop>(bySlug.docs[0]);
    }

    if (!shop || shop.status !== "active" || shop.category !== "electronique") {
      cachedShopDetails.set(id, { data: null, timestamp: now });
      return null;
    }

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

    const result: ShopWithProducts = {
      ...shop,
      products: productSnap.docs.map(fromDoc<Product>),
      reviews: reviewSnap.docs.map(fromDoc<Review>),
    };

    cachedShopDetails.set(id, { data: result, timestamp: now });
    if (shop.id !== id) cachedShopDetails.set(shop.id, { data: result, timestamp: now });
    if (shop.slug && shop.slug !== id) cachedShopDetails.set(shop.slug, { data: result, timestamp: now });

    return result;
  } catch (error) {
    console.warn("[FasoLink] fetchShopById:", error);
    return cached?.data ?? null;
  }
}

export async function fetchProduct(shopId: string, productId: string) {
  const shop = await fetchShopById(shopId);
  if (!shop) return null;
  const product = shop.products.find((p) => p.id === productId);
  if (!product) return null;
  return { shop, product };
}

/** Invalidation manuelle du cache (ex: après ajout de produit ou modification de boutique) */
export function invalidateShopsCache(shopId?: string) {
  cachedShopsList = null;
  if (shopId) {
    cachedShopDetails.delete(shopId);
  } else {
    cachedShopDetails.clear();
  }
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
