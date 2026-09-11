import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { CATEGORIES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-clay-100 bg-white">
      <div className="container-faso grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-ink-muted">
            L&apos;annuaire et la marketplace des commerçants du Burkina Faso.
            Ensemble, consommons burkinabè.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink">Catégories</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/#explorer`}
                  className="transition-colors hover:text-faso-red"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink">Plateforme</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>
              <Link href="/inscription" className="hover:text-faso-red">
                Créer un compte
              </Link>
            </li>
            <li>
              <Link href="/vendeur/inscription" className="hover:text-faso-red">
                Ouvrir une boutique
              </Link>
            </li>
            <li>
              <Link href="/vendeur/paiement" className="hover:text-faso-red">
                Abonnements vendeurs
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>Ouagadougou, Burkina Faso</li>
            <li>contact@fasolink.bf</li>
            <li>+226 25 00 00 00</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-clay-100">
        <div className="container-faso flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} FasoLink. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Fièrement conçu au
            <span className="font-semibold text-ink">Faso</span>
            <span aria-hidden className="text-faso-red">
              ●
            </span>
            <span aria-hidden className="text-faso-green">
              ●
            </span>
            <span aria-hidden className="text-faso-gold">
              ★
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
