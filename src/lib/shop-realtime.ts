import { app, COLLECTIONS, isFirebaseConfigured } from "@/lib/firebase";
import type { ShopStatus } from "@/lib/database.types";

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
