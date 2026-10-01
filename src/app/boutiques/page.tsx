import type { Metadata } from "next";
import { SearchExplorer } from "@/components/home/SearchExplorer";
import { CATEGORIES } from "@/lib/constants";
import type { ShopCategory } from "@/lib/database.types";
import { fetchShops } from "@/lib/shops";

export const metadata: Metadata = {
  title: "Boutiques locales",
  description:
    "Parcourez les boutiques, commerces et artisans du Burkina Faso. Filtrez par catégorie, ville et proximité sur FasoLink.",
};

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function BoutiquesPage({
  searchParams,
}: {
  searchParams?: { categorie?: string; q?: string };
}) {
  const shops = await fetchShops();
  const requestedCategory = CATEGORIES.some(
    (category) => category.id === searchParams?.categorie,
  )
    ? (searchParams?.categorie as ShopCategory)
    : "all";

  return (
    <SearchExplorer
      key={`${requestedCategory}:${searchParams?.q ?? ""}`}
      shops={shops}
      initialCategory={requestedCategory}
      initialQuery={searchParams?.q?.slice(0, 100) ?? ""}
      sectionId="boutiques"
      eyebrow="L’annuaire FasoLink"
      heading="Les boutiques du Faso, à portée de main"
      description="Trouvez une adresse, un talent ou un produit local. Filtrez par univers, ville ou proximité, puis ouvrez directement la vitrine qui vous plaît."
    />
  );
}
