import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { VendorDashboardLoader } from "@/components/vendeur/VendorDashboardLoader";

export const metadata: Metadata = {
  title: "Tableau de bord vendeur",
  description:
    "Suivez vos contacts WhatsApp, votre période d'essai, votre vérification et votre QR Code boutique.",
};

export default function VendorDashboardPage() {
  return (
    <div className="container-faso py-12 md:py-16">
      <PageHeader
        align="left"
        eyebrow="Espace vendeur"
        title="Tableau de bord"
        description="La preuve chiffrée de la valeur de votre vitrine FasoLink."
        icon="dashboard"
      />

      <div className="mt-10">
        <VendorDashboardLoader />
      </div>
    </div>
  );
}
