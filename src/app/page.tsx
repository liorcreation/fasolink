import { fetchShops } from "@/lib/shops";
import { RealtimeHomeContent } from "@/components/home/RealtimeHomeContent";

// ISR (Incremental Static Regeneration) : revalidation en arrière-plan toutes les 60 secondes.
// Permet un affichage instantané (<100ms) sans surcoût CPU sur Cloudflare Workers (protection Erreur 1102).
// Les mises à jour en direct côté navigateur restent gérées en temps réel par RealtimeHomeContent.
export const revalidate = 60;

export default async function HomePage() {
  const shops = await fetchShops();
  const techShops = shops.filter((shop) => shop.category === "electronique");
  return <RealtimeHomeContent initialShops={techShops} />;
}
