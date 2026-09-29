import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace FasoLink.",
};

export default function ConnexionPage() {
  return (
    <div className="container-faso py-16 md:py-24">
      <PageHeader
        eyebrow="Espace sécurisé"
        title="Votre compte FasoLink"
        description="Retrouvez vos boutiques, vos produits et votre espace vendeur depuis n’importe quel appareil."
        icon="lock"
      />
      <div className="mt-10">
        <AuthForm />
      </div>
    </div>
  );
}
