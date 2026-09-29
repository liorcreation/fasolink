import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales de FasoLink.",
};

const sections = [
  { id: "identification", label: "Identification de l’éditeur" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "publication", label: "Responsable de publication" },
];

const information = [
  { label: "Éditeur", value: "FasoLink — à compléter" },
  { label: "Siège / adresse", value: "Ouagadougou, Burkina Faso — à compléter" },
  { label: "Contact", value: "contact@fasolink.bf — à confirmer" },
  { label: "Hébergement", value: "Cloudflare Pages / Firebase" },
];

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout
      eyebrow="Informations officielles"
      title="Mentions légales"
      intro="Les informations ci-dessous doivent être complétées avec les données juridiques définitives du propriétaire de la plateforme."
      icon={Building2}
      accent="gold"
      activePage="/mentions-legales"
      sections={sections}
    >
      <LegalSection id="identification" title="Identification de l’éditeur">
        <div className="grid gap-3 sm:grid-cols-2">
          {information.map((item) => (
            <div key={item.label} className="rounded-2xl border border-clay-200/80 bg-clay-50/60 p-4 transition-colors hover:border-faso-gold/35 hover:bg-white">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-muted">{item.label}</p>
              <p className="mt-2 break-words text-sm font-semibold leading-6 text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      </LegalSection>
      <LegalSection id="propriete" title="Propriété intellectuelle">
        <p>La marque, l’interface et les contenus originaux de FasoLink sont protégés selon les droits applicables. Les contenus déposés par les vendeurs restent sous leur responsabilité.</p>
      </LegalSection>
      <LegalSection id="publication" title="Responsable de publication">
        <p>À renseigner avant livraison définitive.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
