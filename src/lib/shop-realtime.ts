import { app, COLLECTIONS, isFirebaseConfigured } from "@/lib/firebase";
import type { Product, Review, ShopStatus, ShopWithProducts } from "@/lib/database.types";
import type { DocumentData, QuerySnapshot } from "firebase/firestore";

/** Écoute uniquement côté navigateur pour garder Firestore Lite sur les routes Edge. */
export function subscribeToShopStatus(
  shopId: string,
  onStatus: (status: ShopStatus) => void,
): () => void {
  if (!isFirebaseConfigured) return () => undefined;

  let unsubscribe: (() => void) | undefined;
  let disposed = false;

  void import("firebase/firestore")
    .then(({ doc, getFirestore, onSnapshot }) => {
      if (disposed) return;
      const realtimeDb = getFirestore(app);
      unsubscribe = onSnapshot(
        doc(realtimeDb, COLLECTIONS.shops, shopId),
        (snapshot) => {
          const status = snapshot.data()?.status;
          onStatus(
            !snapshot.exists() || status === "suspended"
              ? "suspended"
              : status === "pending"
                ? "pending"
                : "active",
          );
        },
        (error) => console.warn("[FasoLink] écoute du statut boutique:", error),
      );
    })
    .catch((error: unknown) => {
      console.warn("[FasoLink] initialisation de l’écoute temps réel:", error);
    });

  return () => {
    disposed = true;
    unsubscribe?.();
  };
}

/**
 * Synchronise le catalogue public sans rechargement.
 * La requête des boutiques ne reçoit que les documents actifs : Firestore
 * émet donc immédiatement un changement retiré lorsqu'une boutique est
 * suspendue depuis le Super Admin.
 */
export function subscribeToPublicShops(
  initialShops: ShopWithProducts[],
  onShops: (shops: ShopWithProducts[]) => void,
): () => void {
  if (!isFirebaseConfigured) return () => undefined;

  const shops = new Map(initialShops.map((shop) => [shop.id, shop]));
  const products = new Map<string, Product>();
  const reviews = new Map<string, Review>();
  initialShops.forEach((shop) => {
    shop.products.forEach((product) => products.set(product.id, product));
    shop.reviews?.forEach((review) => reviews.set(review.id, review));
  });

  let disposed = false;
  let stopShops: (() => void) | undefined;
  let stopProducts: (() => void) | undefined;
  let stopReviews: (() => void) | undefined;

  function emit() {
    if (disposed) return;
    onShops(
      [...shops.values()]
        .filter((shop) => shop.status === "active" && shop.category === "electronique")
        .map((shop) => ({
          ...shop,
          products: [...products.values()].filter((product) => product.shop_id === shop.id),
          reviews: [...reviews.values()].filter((review) => review.shop_id === shop.id),
        }))
        .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || b.rating - a.rating),
    );
  }

  function replaceDocuments<T extends { id: string }>(
    target: Map<string, T>,
    snapshot: QuerySnapshot<DocumentData>,
  ) {
    target.clear();
    snapshot.docs.forEach((document) => {
      target.set(document.id, { id: document.id, ...document.data() } as T);
    });
  }

  void import("firebase/firestore")
    .then(({ collection, getFirestore, onSnapshot, query, where }) => {
      if (disposed) return;
      const realtimeDb = getFirestore(app);
      stopShops = onSnapshot(
        query(collection(realtimeDb, COLLECTIONS.shops), where("status", "==", "active")),
        (snapshot) => {
          shops.clear();
          snapshot.docs.forEach((document) => {
            shops.set(document.id, { id: document.id, ...document.data() } as ShopWithProducts);
          });
          emit();
        },
        (error) => console.warn("[FasoLink] écoute des boutiques publiques:", error),
      );
      stopProducts = onSnapshot(
        collection(realtimeDb, COLLECTIONS.products),
        (snapshot) => {
          replaceDocuments(products, snapshot);
          emit();
        },
        (error) => console.warn("[FasoLink] écoute des produits publics:", error),
      );
      stopReviews = onSnapshot(
        collection(realtimeDb, COLLECTIONS.reviews),
        (snapshot) => {
          replaceDocuments(reviews, snapshot);
          emit();
        },
        (error) => console.warn("[FasoLink] écoute des avis publics:", error),
      );
    })
    .catch((error: unknown) => {
      console.warn("[FasoLink] initialisation du catalogue temps réel:", error);
    });

  return () => {
    disposed = true;
    stopShops?.();
    stopProducts?.();
    stopReviews?.();
  };
}
