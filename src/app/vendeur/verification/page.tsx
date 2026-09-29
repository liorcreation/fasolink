import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { VerificationLoader } from "@/components/vendeur/VerificationLoader";

export const metadata: Metadata = {
  title: "Vérification vendeur",
  description:
    "Confirmez l’identité du responsable et l’emplacement de votre boutique pour demander le badge vendeur vérifié FasoLink.",
};

export default function VerificationPage() {
  return (
    <div className="container-faso py-14 md:py-20">
      <PageHeader
        eyebrow="Confiance & transparence"
        title="Faites vérifier votre boutique"
        description="Transmettez un justificatif d’identité et confirmez l’emplacement de votre boutique. Après examen de votre dossier, vous pourrez afficher le badge Vendeur vérifié sur FasoLink."
        icon="shield"
        align="left"
      />

      <div className="mt-8 md:mt-10">
        <VerificationLoader />
      </div>
    </div>
  );
}
