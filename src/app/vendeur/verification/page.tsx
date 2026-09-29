import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { VerificationLoader } from "@/components/vendeur/VerificationLoader";

export const metadata: Metadata = {
  title: "Vérification vendeur",
  description:
    "Obtenez le badge doré « Vendeur Vérifié FasoLink » en confirmant votre identité (CNIB / NIF) et votre localisation.",
};

export default function VerificationPage() {
  return (
    <div className="container-faso py-14 md:py-20">
      <PageHeader
        eyebrow="Trust Engine FasoLink"
        title="Devenez Vendeur Vérifié"
        description="Le badge doré multiplie la confiance des acheteurs et votre taux de contact. Vérification CNIB / NIF + localisation physique."
        icon="shield"
      />

      <div className="mt-12">
        <VerificationLoader />
      </div>
    </div>
  );
}
