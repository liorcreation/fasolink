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
    <div className="container-faso py-8 md:py-12">
      <PageHeader
        align="left"
        eyebrow="Étape 1 / 2 · Boutique"
        title="Votre vitrine commence ici."
        description="Racontez votre activité, indiquez où vous trouver et comment vous contacter. Vous pourrez vérifier votre aperçu avant de passer à l’abonnement."
        icon="store"
      />

      <div className="mt-7 md:mt-9">
        <ShopRegistrationForm />
      </div>
    </div>
  );
}
