import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const STORE_KEY = "fasolink:contact-events";

interface LocalEvent {
  shopId: string;
  productId: string | null;
  at: number;
}

function readLocal(): LocalEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as LocalEvent[];
  } catch {
    return [];
  }
}

function writeLocal(events: LocalEvent[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(events.slice(-500)));
  } catch {
    /* quota / mode privé — on ignore */
  }
}

/**
 * Enregistre un clic « Contacter sur WhatsApp ».
 * - Supabase configuré  → RPC `track_contact` (incrémente shops.whatsapp_clicks).
 * - Mode démo           → compteur local (localStorage) pour alimenter le dashboard.
 * Ne bloque jamais la navigation (fire-and-forget).
 */
export function trackContact(shopId: string, productId?: string | null) {
  const events = readLocal();
  events.push({ shopId, productId: productId ?? null, at: Date.now() });
  writeLocal(events);

  if (isSupabaseConfigured) {
    void supabase
      .rpc("track_contact", { p_shop_id: shopId, p_product_id: productId ?? null })
      .then(({ error }) => {
        if (error) console.warn("[FasoLink] track_contact:", error.message);
      });
  }
}

export interface ContactStats {
  total: number;
  last30d: number;
  last7d: number;
  byDay: { date: string; count: number }[];
  byShop: Record<string, number>;
}

/** Agrège les événements locaux pour le tableau de bord vendeur (mode démo). */
export function getLocalContactStats(shopId?: string): ContactStats {
  const now = Date.now();
  const d7 = now - 7 * 864e5;
  const d30 = now - 30 * 864e5;
  const events = readLocal().filter((e) => !shopId || e.shopId === shopId);

  const byDayMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const key = new Date(now - i * 864e5).toISOString().slice(0, 10);
    byDayMap.set(key, 0);
  }
  const byShop: Record<string, number> = {};

  for (const e of events) {
    byShop[e.shopId] = (byShop[e.shopId] ?? 0) + 1;
    const key = new Date(e.at).toISOString().slice(0, 10);
    if (byDayMap.has(key)) byDayMap.set(key, (byDayMap.get(key) ?? 0) + 1);
  }

  return {
    total: events.length,
    last30d: events.filter((e) => e.at >= d30).length,
    last7d: events.filter((e) => e.at >= d7).length,
    byDay: [...byDayMap].map(([date, count]) => ({ date, count })),
    byShop,
  };
}

/** Pré-remplit quelques événements de démo au premier chargement du dashboard. */
export function seedDemoContactEvents(shopId: string) {
  const events = readLocal();
  if (events.some((e) => e.shopId === shopId)) return;
  const now = Date.now();
  const seeded: LocalEvent[] = [];
  for (let i = 0; i < 45; i++) {
    seeded.push({
      shopId,
      productId: null,
      at: now - Math.floor(Math.random() * 30) * 864e5 - Math.random() * 864e5,
    });
  }
  writeLocal([...events, ...seeded]);
}
