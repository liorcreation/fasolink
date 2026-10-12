import type { Metadata } from "next";
import { PaymentSimulator } from "@/components/vendeur/PaymentSimulator";
import { PageHeader } from "@/components/ui/PageHeader";


export const metadata: Metadata = {
  title: "Abonnement vendeur",
  description:
    "Choisissez votre formule FasoLink et réglez votre abonnement en toute sécurité avec CinetPay.",
};

export default async function VendeurPaiementPage({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string; demo?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="container-faso py-8 md:py-12">
      <PageHeader
        align="left"
        eyebrow="Étape 2 / 2 · Abonnement"
        title="Choisissez votre formule."
        description="Comparez les durées, confirmez votre formule puis réglez votre abonnement via la page sécurisée CinetPay."
        icon="card"
      />

      <div className="mt-7 md:mt-9">
        <PaymentSimulator shopId={resolvedSearchParams.shop} />
      </div>
    </div>
  );
}
