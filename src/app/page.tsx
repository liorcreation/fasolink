import { fetchShops } from "@/lib/shops";
import { RealtimeHomeContent } from "@/components/home/RealtimeHomeContent";

// Cloudflare Pages : rendu à la demande (données Firestore fraîches à chaque visite).
export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const shops = await fetchShops();
  const techShops = shops.filter((shop) => shop.category === "electronique");
  return <RealtimeHomeContent initialShops={techShops} />;
}
