import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Conditions d’utilisation",
  description: "Règles d’utilisation de la plateforme FasoLink.",
};

const sections = [
  { id: "role-fasolink", label: "Rôle de FasoLink" },
  { id: "comptes-boutiques", label: "Comptes et boutiques" },
  { id: "paiements", label: "Paiements" },
  { id: "contact-litiges", label: "Contact et litiges" },
  { id: "complement", label: "À compléter avant exploitation" },
];

export default function ConditionsPage() {
  return (
    <LegalPageLayout
      eyebrow="Cadre d’utilisation"
      title="Conditions d’utilisation"
      intro="FasoLink met en relation les acteurs locaux ; chaque utilisateur s’engage à fournir des informations exactes et respectueuses."
      icon={FileText}
      accent="red"
      activePage="/conditions"
      sections={sections}
    >
      <LegalSection id="role-fasolink" title="Rôle de FasoLink">
        <p>FasoLink fournit une vitrine numérique, un annuaire et des outils de contact. Les vendeurs restent responsables de leurs produits, prix, disponibilités, délais, garanties et obligations fiscales.</p>
      </LegalSection>
      <LegalSection id="comptes-boutiques" title="Comptes et boutiques">
        <p>Un compte ne doit pas être partagé. Les contenus frauduleux, trompeurs, illicites ou portant atteinte aux droits d’autrui peuvent être retirés. Une boutique peut être suspendue par l’administration en cas d’abus ou de non-conformité.</p>
      </LegalSection>
      <LegalSection id="paiements" title="Paiements">
        <p>Les abonnements vendeurs sont activés uniquement après confirmation de la passerelle de paiement configurée. Les frais, renouvellements et conditions commerciales doivent être validés dans l’offre remise au client.</p>
      </LegalSection>
      <LegalSection id="contact-litiges" title="Contact et litiges">
        <p>Les échanges commerciaux se font directement entre acheteur et vendeur. FasoLink peut aider à signaler un abus, sans se substituer aux parties ni aux autorités compétentes.</p>
      </LegalSection>
      <LegalSection id="complement" title="Informations à compléter">
        <div className="rounded-2xl border border-faso-gold/20 bg-faso-gold-soft/25 p-4 text-sm leading-6 text-ink-soft">
          Document de base à compléter avec l’identité juridique, l’adresse et les coordonnées officielles du propriétaire de FasoLink.
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
}
