import type { Metadata } from "next";
import { PaymentSimulator } from "@/components/vendeur/PaymentSimulator";
import { Reveal } from "@/components/ui/Reveal";

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
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-faso-red">
          Étape 2 / 2 · Abonnement
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          Activez votre vitrine
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Réglez votre abonnement par Mobile Money. Simulation interactive — aucun
          débit réel.
        </p>
      </Reveal>

      <div className="mt-12">
        <PaymentSimulator shopId={searchParams.shop} />
      </div>
    </div>
  );
}
