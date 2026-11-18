import type { Metadata } from "next";
import { RealtimeBoutiques } from "@/components/shops/RealtimeBoutiques";
import { fetchShops } from "@/lib/shops";

export const metadata: Metadata = {
  title: "Boutiques tech du Burkina Faso",
  description:
    "Découvrez les boutiques de téléphonie et d’informatique au Burkina Faso. Trouvez téléphones, ordinateurs et accessoires sur FasoLink.",
};

export default async function BoutiquesPage({
  searchParams,
}: {
  // Next 16 : searchParams est une Promise et doit être attendue.
  searchParams: Promise<{ categorie?: string; q?: string }>;
}) {
  const [{ q }, allShops] = await Promise.all([searchParams, fetchShops()]);
  const shops = allShops.filter((shop) => shop.category === "electronique");

  return <RealtimeBoutiques initialShops={shops} initialQuery={typeof q === "string" ? q.slice(0, 100) : ""} />;
}
