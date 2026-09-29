import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore/lite";
import { COLLECTIONS, db, isFirebaseConfigured } from "@/lib/firebase";
import { getMockShop } from "@/lib/mock-data";
import { fetchShopById } from "@/lib/shops";
import type { ShopWithProducts } from "@/lib/database.types";

const LOCAL_KEY = "fasolink:favorites";

function readLocalIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeLocalIds(ids: string[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    /* mode privé / quota : l'interface reste utilisable */
  }
}

export function localFavoriteIds() {
  return readLocalIds();
}

export function isLocalFavorite(shopId: string) {
  return readLocalIds().includes(shopId);
}

export function toggleLocalFavorite(shopId: string) {
  const ids = readLocalIds();
  const next = ids.includes(shopId)
    ? ids.filter((id) => id !== shopId)
    : [...ids, shopId];
  writeLocalIds(next);
  return next.includes(shopId);
}

export async function setFavorite(
  ownerId: string,
  shopId: string,
  active: boolean,
) {
  if (!isFirebaseConfigured) return toggleLocalFavorite(shopId);
  const favoriteRef = doc(db, COLLECTIONS.favorites, `${ownerId}_${shopId}`);
  if (active) {
    await setDoc(favoriteRef, {
      owner_id: ownerId,
      shop_id: shopId,
      created_at: new Date().toISOString(),
    });
  } else {
    await deleteDoc(favoriteRef);
  }
  return active;
}

export async function hasFavorite(ownerId: string, shopId: string) {
  if (!isFirebaseConfigured) return isLocalFavorite(shopId);
  return (await getDoc(doc(db, COLLECTIONS.favorites, `${ownerId}_${shopId}`))).exists();
}

export async function fetchFavoriteShops(ownerId: string): Promise<ShopWithProducts[]> {
  const ids = !isFirebaseConfigured
    ? localFavoriteIds()
    : (
        await getDocs(
          query(collection(db, COLLECTIONS.favorites), where("owner_id", "==", ownerId)),
        )
      ).docs.map((snapshot) => String(snapshot.data().shop_id));

  const shops = await Promise.all(
    ids.map((shopId) => (isFirebaseConfigured ? fetchShopById(shopId) : Promise.resolve(getMockShop(shopId) ?? null))),
  );
  return shops.filter((shop): shop is ShopWithProducts => Boolean(shop));
}
