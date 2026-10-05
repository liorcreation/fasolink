import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { OwnedShopsLoader } from "@/components/vendeur/OwnedShopsLoader";

export const metadata: Metadata = {
  title: "Mes boutiques",
  description:
    "Retrouvez, consultez et gérez toutes vos boutiques FasoLink depuis un espace vendeur unique.",
};

export default function OwnedShopsPage() {
  return (
    <div className="container-faso py-12 md:py-16">
      <PageHeader
        align="left"
        eyebrow="FasoLink Pro · Portefeuille vendeur"
        title="Mes boutiques"
        description="Un seul espace pour retrouver vos vitrines, suivre leur statut et modifier chacune de vos boutiques en quelques secondes."
        icon="store"
      />

      <div className="mt-10">
        <OwnedShopsLoader />
      </div>
    </div>
  );
}
