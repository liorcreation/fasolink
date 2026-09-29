import type { Metadata } from "next";
import { ShopRegistrationForm } from "@/components/vendeur/ShopRegistrationForm";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Créer ma boutique",
  description:
    "Renseignez les informations de votre boutique : nom, localisation, WhatsApp Business, description et photos.",
};

export default function VendeurInscriptionPage() {
  return (
    <div className="container-faso py-14 md:py-20">
      <PageHeader
        eyebrow="Étape 1 / 2 · Boutique"
        title="Présentez votre boutique"
        description="Ces informations composeront votre vitrine publique sur FasoLink."
        icon="store"
      />

      <div className="mt-12">
        <ShopRegistrationForm />
      </div>
    </div>
  );
}
