import type { Metadata } from "next";
import { RealtimeBoutiques } from "@/components/shops/RealtimeBoutiques";
import { fetchShops } from "@/lib/shops";

export const metadata: Metadata = {
  title: "Boutiques tech du Burkina Faso",
  description:
    "Découvrez les boutiques de téléphonie et d’informatique au Burkina Faso. Trouvez téléphones, ordinateurs et accessoires sur FasoLink.",
};

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function BoutiquesPage({
  searchParams,
}: {
  searchParams?: { categorie?: string; q?: string };
}) {
  const shops = (await fetchShops()).filter((shop) => shop.category === "electronique");

  return <RealtimeBoutiques initialShops={shops} initialQuery={searchParams?.q?.slice(0, 100) ?? ""} />;
}
