import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment FasoLink protège les données de ses utilisateurs et vendeurs.",
};

const sections = [
  { id: "donnees-collectees", label: "Données collectées" },
  { id: "utilisation", label: "Utilisation" },
  { id: "conservation-securite", label: "Conservation et sécurité" },
  { id: "droits", label: "Vos droits" },
  { id: "relecture", label: "Relecture avant exploitation" },
];

export default function ConfidentialitePage() {
  return (
    <LegalPageLayout
      eyebrow="Confiance & données"
      title="Politique de confidentialité"
      intro="FasoLink protège les informations nécessaires à la mise en relation entre acheteurs et vendeurs au Burkina Faso."
      icon={ShieldCheck}
      accent="green"
      activePage="/confidentialite"
      sections={sections}
    >
      <LegalSection id="donnees-collectees" title="Données collectées">
        <p>Nous collectons les informations saisies lors de la création d’un compte, d’une boutique ou d’une demande de vérification : identité, email, téléphone, localisation et contenus publiés.</p>
        <p>Les documents CNIB, passeport ou NIF sont utilisés uniquement pour l’examen de la vérification vendeur et ne sont pas rendus publics.</p>
      </LegalSection>
      <LegalSection id="utilisation" title="Utilisation">
        <p>Les données servent à créer votre compte, publier une vitrine, sécuriser les échanges, mesurer les contacts WhatsApp et prévenir les abus. Nous ne vendons pas les données personnelles.</p>
      </LegalSection>
      <LegalSection id="conservation-securite" title="Conservation et sécurité">
        <p>Les accès sont protégés par Firebase Authentication, les règles Firestore et des espaces Storage privés. Les pièces de vérification sont supprimées après validation selon la politique de la plateforme ; les données comptables ou nécessaires à la preuve d’une transaction peuvent être conservées pendant la durée légale applicable.</p>
      </LegalSection>
      <LegalSection id="droits" title="Vos droits">
        <p>Vous pouvez demander l’accès, la rectification ou la suppression de vos données en contactant l’équipe FasoLink. Pour toute demande, utilisez l’adresse officielle communiquée par le propriétaire de la plateforme.</p>
      </LegalSection>
      <LegalSection id="relecture" title="À valider avant l’exploitation commerciale">
        <div className="rounded-2xl border border-faso-gold/20 bg-faso-gold-soft/25 p-4 text-sm leading-6 text-ink-soft">
          Cette page constitue une base éditoriale à faire relire et compléter par le responsable légal de FasoLink avant mise en exploitation commerciale.
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
}
