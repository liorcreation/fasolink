"use client";

import type { ShopWithProducts } from "@/lib/database.types";
import { SearchExplorer } from "@/components/home/SearchExplorer";
import { usePublicShopsRealtime } from "@/components/shops/PublicShopsRealtime";

export function RealtimeBoutiques({ initialShops, initialQuery = "" }: { initialShops: ShopWithProducts[]; initialQuery?: string }) {
  const shops = usePublicShopsRealtime(initialShops);
  return <SearchExplorer key={`electronique:${initialQuery}`} shops={shops} initialCategory="electronique" initialQuery={initialQuery} sectionId="boutiques" electronicsOnly eyebrow="L’annuaire tech FasoLink" heading="La tech du Faso, tout près de vous" description="Trouvez téléphones, ordinateurs, audio et accessoires auprès des vendeurs tech. Filtrez par ville ou proximité, puis découvrez leur vitrine." />;
}
