import type { Metadata } from "next";
import { PaymentSimulator } from "@/components/vendeur/PaymentSimulator";
import { Reveal } from "@/components/ui/Reveal";
import { Stepper } from "@/components/ui/Stepper";
import { VENDOR_ONBOARDING_STEPS } from "@/lib/constants";

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
      <Stepper
        steps={VENDOR_ONBOARDING_STEPS}
        currentKey="payment"
        className="mx-auto mb-10 max-w-md"
      />
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-faso-red">
          Étape 2 / 3 · Abonnement
        </span>
        <h1 className="mt-3 font-editorial text-display-2 font-semibold text-ink">
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
