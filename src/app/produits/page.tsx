import type { Metadata } from "next";
import { ProductsCatalog } from "@/components/products/ProductsCatalog";
import { fetchShops } from "@/lib/shops";

export const metadata: Metadata = {
  title: "Produits tech au Burkina Faso",
  description: "Parcourez tous les téléphones, ordinateurs et accessoires proposés par les boutiques tech de FasoLink.",
};

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const shops = await fetchShops();
  return (
    <main className="container-faso py-6 sm:py-10 lg:py-14">
      <ProductsCatalog initialShops={shops} />
    </main>
  );
}
