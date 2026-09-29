import {
  collection,
  getDocs,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore/lite";
import { COLLECTIONS, db, isFirebaseConfigured } from "@/lib/firebase";
import type {
  Product,
  Shop,
  ShopWithProducts,
  Subscription,
} from "@/lib/database.types";

function fromDoc<T>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
  return { id: snapshot.id, ...snapshot.data() } as unknown as T;
}

export async function fetchOwnedShops(ownerId: string): Promise<ShopWithProducts[]> {
  if (!isFirebaseConfigured) return [];

  const shops = (
    await getDocs(
      query(collection(db, COLLECTIONS.shops), where("owner_id", "==", ownerId)),
    )
  ).docs.map(fromDoc<Shop>);

  if (!shops.length) return [];

  const products = (
    await getDocs(collection(db, COLLECTIONS.products))
  ).docs.map(fromDoc<Product>);

  return shops
    .map((shop) => ({
      ...shop,
      products: products.filter((product) => product.shop_id === shop.id),
    }))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function fetchOwnedShop(
  ownerId: string,
  shopId?: string,
): Promise<ShopWithProducts | null> {
  const shops = await fetchOwnedShops(ownerId);
  return shops.find((shop) => !shopId || shop.id === shopId) ?? null;
}

export async function fetchLatestSubscription(
  shopId: string,
): Promise<Subscription | null> {
  if (!isFirebaseConfigured) return null;

  const snapshots = await getDocs(
    query(
      collection(db, COLLECTIONS.subscriptions),
      where("shop_id", "==", shopId),
    ),
  );
  return (
    snapshots.docs
      .map(fromDoc<Subscription>)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
  );
}
