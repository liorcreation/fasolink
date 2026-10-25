import { fetchShops } from "@/lib/shops";
import { RealtimeHomeContent } from "@/components/home/RealtimeHomeContent";

export default async function HomePage() {
  const shops = await fetchShops();
  const techShops = shops.filter((shop) => shop.category === "electronique");
  return <RealtimeHomeContent initialShops={techShops} />;
}
