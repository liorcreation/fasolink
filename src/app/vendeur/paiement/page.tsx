import type { Metadata } from "next";
import { PaymentSimulator } from "@/components/vendeur/PaymentSimulator";
import { PageHeader } from "@/components/ui/PageHeader";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Abonnement vendeur",
  description:
    "Choisissez une formule FasoLink et consultez les étapes de demande de paiement Mobile Money.",
};

export default function VendeurPaiementPage({
  searchParams,
}: {
  searchParams: { shop?: string; demo?: string };
}) {
  return (
    <div className="container-faso py-8 md:py-12">
      <PageHeader
        align="left"
        eyebrow="Étape 2 / 2 · Abonnement"
        title="Choisissez votre formule."
        description="Comparez les durées, sélectionnez votre moyen de paiement et consultez le récapitulatif avant de confirmer votre demande."
        icon="card"
      />

      <div className="mt-7 md:mt-9">
        <PaymentSimulator shopId={searchParams.shop} />
      </div>
    </div>
  );
}
