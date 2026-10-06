import { app, COLLECTIONS, isFirebaseConfigured } from "@/lib/firebase";
import type { Product, Review, ShopStatus, ShopWithProducts } from "@/lib/database.types";
import type { DocumentData, QuerySnapshot } from "firebase/firestore";

const SHOP_STATUS_EVENT = "fasolink:shop-status";

export type ShopStatusEvent = {
  shopId: string;
  status: ShopStatus;
  at: number;
};

/** Diffuse immédiatement un changement aux autres onglets du même navigateur. */
export function publishShopStatus(shopId: string, status: ShopStatus) {
  if (typeof window === "undefined") return;
  const event: ShopStatusEvent = { shopId, status, at: Date.now() };
  window.dispatchEvent(new CustomEvent<ShopStatusEvent>(SHOP_STATUS_EVENT, { detail: event }));
  try {
    const channel = new BroadcastChannel(SHOP_STATUS_EVENT);
    channel.postMessage(event);
    channel.close();
  } catch {
    // BroadcastChannel peut être indisponible dans certains WebViews iOS.
  }
  try {
    window.localStorage.setItem(SHOP_STATUS_EVENT, JSON.stringify(event));
  } catch {
    // Le temps réel Firestore reste la source de vérité si le stockage local est bloqué.
  }
}

/** Écoute la propagation locale instantanée entre les onglets ouverts. */
export function subscribeToShopStatusEvents(
  onEvent: (event: ShopStatusEvent) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onCustomEvent = (event: Event) => {
    onEvent((event as CustomEvent<ShopStatusEvent>).detail);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SHOP_STATUS_EVENT || !event.newValue) return;
    try {
      onEvent(JSON.parse(event.newValue) as ShopStatusEvent);
    } catch {
      // Ignore une valeur locale corrompue.
    }
  };
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(SHOP_STATUS_EVENT) : null;
  window.addEventListener(SHOP_STATUS_EVENT, onCustomEvent);
  window.addEventListener("storage", onStorage);
  channel?.addEventListener("message", (event: MessageEvent<ShopStatusEvent>) => onEvent(event.data));
  return () => {
    window.removeEventListener(SHOP_STATUS_EVENT, onCustomEvent);
    window.removeEventListener("storage", onStorage);
    channel?.close();
  };
}

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
