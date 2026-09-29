import type { Metadata } from "next";
import { PaymentSimulator } from "@/components/vendeur/PaymentSimulator";
import { PageHeader } from "@/components/ui/PageHeader";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Abonnement vendeur",
  description:
    "Activez votre vitrine FasoLink via une simulation de paiement Orange Money, Moov Money ou Wave.",
};

export default function VendeurPaiementPage({
  searchParams,
}: {
  searchParams: { shop?: string; demo?: string };
}) {
  return (
    <div className="container-faso py-14 md:py-20">
      <PageHeader
        eyebrow="Étape 2 / 2 · Abonnement"
        title="Activez votre vitrine"
        description="Réglez votre abonnement par Mobile Money. La vitrine est activée uniquement après confirmation sécurisée de l’opérateur."
        icon="card"
      />

      <div className="mt-12">
        <PaymentSimulator shopId={searchParams.shop} />
      </div>
    </div>
  );
}
