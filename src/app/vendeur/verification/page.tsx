import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { VerificationForm } from "@/components/vendeur/VerificationForm";

export const metadata: Metadata = {
  title: "Vérification vendeur",
  description:
    "Obtenez le badge doré « Vendeur Vérifié FasoLink » en confirmant votre identité (CNIB / NIF) et votre localisation.",
};

export default function VerificationPage() {
  return (
    <div className="container-faso py-14 md:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-faso-gold-soft/50 px-3 py-1 text-xs font-bold text-faso-gold-dark">
          <ShieldCheck className="h-3.5 w-3.5" />
          Trust Engine FasoLink
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          Devenez Vendeur Vérifié
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Le badge doré multiplie la confiance des acheteurs et votre taux de
          contact. Vérification CNIB / NIF + localisation physique.
        </p>
      </Reveal>

      <div className="mt-12">
        <VerificationForm />
      </div>
    </div>
  );
}
