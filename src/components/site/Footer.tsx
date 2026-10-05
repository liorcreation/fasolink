import Link from "next/link";
import { ArrowUpRight, Headphones, Laptop, Smartphone, Store } from "lucide-react";
import { Logo } from "@/components/site/Logo";

const TECH_LINK = "/boutiques?categorie=electronique#boutiques";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-clay-100 bg-white">
      <div className="container-faso py-14">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Logo />
            <p className="max-w-xs text-sm leading-6 text-ink-muted">
              La vitrine tech du Burkina Faso : téléphones, ordinateurs et accessoires
              auprès de vendeurs locaux de confiance.
            </p>
            <Link
              href="/vendeur/inscription"
              className="group inline-flex items-center gap-2 rounded-full border border-clay-200 bg-clay-50 px-4 py-2.5 text-xs font-bold text-ink transition hover:-translate-y-0.5 hover:border-faso-red/30 hover:text-faso-red"
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              Ouvrir une boutique tech
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink">Explorer la tech</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li>
                <Link href={TECH_LINK} className="group inline-flex items-center gap-2 transition-colors hover:text-faso-red">
                  <Smartphone className="h-4 w-4 text-faso-gold" aria-hidden="true" />
                  Téléphones & smartphones
                </Link>
              </li>
              <li>
                <Link href={TECH_LINK} className="group inline-flex items-center gap-2 transition-colors hover:text-faso-red">
                  <Laptop className="h-4 w-4 text-faso-gold" aria-hidden="true" />
                  Ordinateurs & bureautique
                </Link>
              </li>
              <li>
                <Link href={TECH_LINK} className="group inline-flex items-center gap-2 transition-colors hover:text-faso-red">
                  <Headphones className="h-4 w-4 text-faso-gold" aria-hidden="true" />
                  Audio & accessoires
                </Link>
              </li>
              <li>
                <Link href="/boutiques" className="font-semibold text-ink transition-colors hover:text-faso-red">
                  Toutes les boutiques →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink">FasoLink pour vous</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li>
                <Link href="/boutiques" className="transition-colors hover:text-faso-red">
                  Trouver un vendeur tech
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="transition-colors hover:text-faso-red">
                  Créer mon compte
                </Link>
              </li>
              <li>
                <Link href="/profil" className="transition-colors hover:text-faso-red">
                  Mon profil
                </Link>
              </li>
              <li>
                <Link href="/vendeur/dashboard" className="transition-colors hover:text-faso-red">
                  Espace vendeur
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink">Contact & confiance</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li>Ouagadougou, Burkina Faso</li>
              <li>
                <a href="mailto:contact@fasolink.bf" className="transition-colors hover:text-faso-red">
                  contact@fasolink.bf
                </a>
              </li>
              <li>
                <a href="tel:+22625000000" className="transition-colors hover:text-faso-red">
                  +226 25 00 00 00
                </a>
              </li>
            </ul>
            <div className="mt-5 space-y-2 text-xs text-ink-muted">
              <Link href="/confidentialite" className="block transition-colors hover:text-faso-red">Confidentialité</Link>
              <Link href="/conditions" className="block transition-colors hover:text-faso-red">Conditions d&apos;utilisation</Link>
              <Link href="/mentions-legales" className="block transition-colors hover:text-faso-red">Mentions légales</Link>
            </div>
          </div>
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
