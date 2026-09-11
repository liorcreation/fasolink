import type { Metadata } from "next";
import { fetchShops } from "@/lib/shops";
import { SearchExplorer } from "@/components/home/SearchExplorer";

// Cloudflare Pages : rendu à la demande (données Firestore fraîches à chaque visite).
export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Toutes les boutiques",
  description:
    "Parcourez l'annuaire complet des commerçants, artisans et producteurs du Burkina Faso — recherche, catégories, ville, quartier et distance.",
};

// Route canonique et partageable de l'annuaire — SearchExplorer fournit déjà
// son propre en-tête (utilisé aussi tel quel dans la section #explorer de
// l'accueil), donc pas de titre dupliqué ici.
export default async function BoutiquesPage() {
  const shops = await fetchShops();
  return <SearchExplorer shops={shops} />;
}
