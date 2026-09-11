import type { Metadata } from "next";
import { ShopRegistrationForm } from "@/components/vendeur/ShopRegistrationForm";
import { Reveal } from "@/components/ui/Reveal";
import { Stepper } from "@/components/ui/Stepper";
import { VENDOR_ONBOARDING_STEPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Créer ma boutique",
  description:
    "Renseignez les informations de votre boutique : nom, localisation, WhatsApp Business, description et photos.",
};

export default function VendeurInscriptionPage() {
  return (
    <div className="container-faso py-14 md:py-20">
      <Stepper
        steps={VENDOR_ONBOARDING_STEPS}
        currentKey="shop"
        className="mx-auto mb-10 max-w-md"
      />
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-faso-red">
          Étape 1 / 3 · Boutique
        </span>
        <h1 className="mt-3 font-editorial text-display-2 font-semibold text-ink">
          Présentez votre boutique
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Ces informations composeront votre vitrine publique sur FasoLink.
        </p>
      </Reveal>

      <div className="mt-12">
        <ShopRegistrationForm />
      </div>
    </div>
  );
}
