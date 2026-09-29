import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment FasoLink protège les données de ses utilisateurs et vendeurs.",
};

export default function ConfidentialitePage() {
  return <LegalShell eyebrow="Confiance & données" title="Politique de confidentialité" intro="FasoLink protège les informations nécessaires à la mise en relation entre acheteurs et vendeurs au Burkina Faso.">
    <LegalSection title="Données collectées"><p>Nous collectons les informations saisies lors de la création d’un compte, d’une boutique ou d’une demande de vérification : identité, email, téléphone, localisation et contenus publiés.</p><p>Les documents CNIB, passeport ou NIF sont utilisés uniquement pour l’examen de la vérification vendeur et ne sont pas rendus publics.</p></LegalSection>
    <LegalSection title="Utilisation"><p>Les données servent à créer votre compte, publier une vitrine, sécuriser les échanges, mesurer les contacts WhatsApp et prévenir les abus. Nous ne vendons pas les données personnelles.</p></LegalSection>
    <LegalSection title="Conservation et sécurité"><p>Les accès sont protégés par Firebase Authentication, les règles Firestore et des espaces Storage privés. Les pièces de vérification sont supprimées après validation selon la politique de la plateforme ; les données comptables ou nécessaires à la preuve d’une transaction peuvent être conservées pendant la durée légale applicable.</p></LegalSection>
    <LegalSection title="Vos droits"><p>Vous pouvez demander l’accès, la rectification ou la suppression de vos données en contactant l’équipe FasoLink. Pour toute demande, utilisez l’adresse officielle communiquée par le propriétaire de la plateforme.</p></LegalSection>
    <p className="mt-8 rounded-2xl bg-faso-gold-soft/30 p-4 text-sm text-ink-soft">Cette page constitue une base éditoriale à faire relire et compléter par le responsable légal de FasoLink avant mise en exploitation commerciale.</p>
  </LegalShell>;
}

function LegalShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <div className="container-faso py-14 md:py-20"><div className="mx-auto max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full bg-faso-green-soft/40 px-3 py-1 text-xs font-bold text-faso-green-dark"><ShieldCheck className="h-3.5 w-3.5" /> {eyebrow}</span><h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">{title}</h1><p className="mt-4 text-lg text-ink-soft">{intro}</p><div className="mt-10 space-y-8 text-sm leading-7 text-ink-soft">{children}</div><Link href="/" className="mt-10 inline-flex text-sm font-bold text-faso-red hover:underline">← Retour à l’accueil</Link></div></div>;
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="text-xl font-bold text-ink">{title}</h2><div className="mt-3 space-y-3">{children}</div></section>;
}
