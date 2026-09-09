import { CITY_CENTERS, NEIGHBORHOODS } from "@/lib/constants";
import type { Shop } from "@/lib/database.types";

export interface Coords {
  lat: number;
  lng: number;
}

const R = 6371; // rayon terrestre en km

/** Distance à vol d'oiseau entre deux points (formule de haversine), en km. */
export function haversineKm(a: Coords, b: Coords): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Coordonnées estimées d'une boutique (champ direct, sinon quartier, sinon ville). */
export function shopCoords(shop: Pick<
  Shop,
  "latitude" | "longitude" | "neighborhood" | "city"
>): Coords | null {
  if (shop.latitude != null && shop.longitude != null) {
    return { lat: shop.latitude, lng: shop.longitude };
  }
  if (shop.neighborhood) {
    const n = NEIGHBORHOODS.find(
      (q) => q.name === shop.neighborhood && q.city === shop.city,
    );
    if (n) return { lat: n.lat, lng: n.lng };
  }
  return CITY_CENTERS[shop.city] ?? null;
}

/** Formatte une distance : « 850 m » ou « 3,2 km ». */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

/** Récupère la position du navigateur (Promise). */
export function getBrowserPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Géolocalisation non disponible"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}
