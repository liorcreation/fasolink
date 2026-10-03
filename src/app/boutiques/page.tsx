import type { Metadata } from "next";
import { SearchExplorer } from "@/components/home/SearchExplorer";
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

  return (
    <SearchExplorer
      key={`electronique:${searchParams?.q ?? ""}`}
      shops={shops}
      initialCategory="electronique"
      initialQuery={searchParams?.q?.slice(0, 100) ?? ""}
      sectionId="boutiques"
      electronicsOnly
      eyebrow="L’annuaire tech FasoLink"
      heading="La tech du Faso, tout près de vous"
      description="Trouvez téléphones, ordinateurs, audio et accessoires auprès des vendeurs tech. Filtrez par ville ou proximité, puis découvrez leur vitrine."
    />
  );
}
