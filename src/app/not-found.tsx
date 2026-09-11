import Link from "next/link";
import { Home, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-faso flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-7xl font-extrabold text-gradient-faso">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">Page introuvable</h1>
      <p className="mt-2 max-w-md text-ink-soft">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Revenez à
        l&apos;accueil pour explorer les boutiques du Faso.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" size="lg">
          <Home className="h-5 w-5" />
          Accueil
        </ButtonLink>
        <ButtonLink href="/boutiques" variant="outline" size="lg">
          <Search className="h-5 w-5" />
          Explorer les boutiques
        </ButtonLink>
      </div>
      <Link
        href="/inscription"
        className="mt-6 text-sm font-semibold text-faso-red hover:underline"
      >
        Créer un compte
      </Link>
    </div>
  );
}
