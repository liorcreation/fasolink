import type { Metadata } from "next";
import { Suspense } from "react";
import { LayoutDashboard } from "lucide-react";
import { VendorDashboardLoader } from "@/components/vendeur/VendorDashboardLoader";
import { RevealText } from "@/components/fx/RevealText";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Tableau de bord vendeur",
  description:
    "Suivez vos contacts WhatsApp, votre période d'essai, votre vérification et votre QR Code boutique.",
};

export default function VendorDashboardPage() {
  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_60%_70%_at_20%_0%,rgb(var(--faso-gold)/.16),transparent_70%),radial-gradient(ellipse_50%_60%_at_90%_10%,rgb(var(--faso-green)/.1),transparent_70%)]" />
      <div className="container-faso py-8 md:py-12">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div>
            <Reveal>
              <span className="section-kicker">
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" /> Espace vendeur
              </span>
            </Reveal>
            <h1 className="fx-display mt-4 text-[clamp(2.4rem,5.5vw,4.2rem)] text-ink">
              <RevealText text="Tableau de bord" className="mr-[.25em]" />
              <span className="font-serif-accent fx-text-gradient inline-block pr-1 text-[1.08em]">en direct.</span>
            </h1>
          </div>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-6 text-ink-muted md:text-right">
              La preuve chiffrée de la valeur de votre vitrine FasoLink : contacts, catalogue et visibilité.
            </p>
          </Reveal>
        </header>

        <Suspense
          fallback={
            <div className="card-premium flex min-h-48 items-center justify-center text-sm text-ink-muted">
              Chargement de votre espace vendeur…
            </div>
          }
        >
          <VendorDashboardLoader />
        </Suspense>
      </div>
    </div>
  );
}
