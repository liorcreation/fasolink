import { AppLink as Link } from "@/components/site/AppLink";
import { ArrowUpRight, Headphones, Laptop, Mail, MapPin, Phone, Smartphone, Store } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";

const TECH_LINK = "/boutiques?categorie=electronique#boutiques";

const COLUMNS = [
  {
    title: "Explorer la tech",
    links: [
      { href: TECH_LINK, label: "Téléphones & smartphones", icon: Smartphone },
      { href: TECH_LINK, label: "Ordinateurs & bureautique", icon: Laptop },
      { href: TECH_LINK, label: "Audio & accessoires", icon: Headphones },
      { href: "/produits", label: "Tout le catalogue" },
      { href: "/boutiques", label: "Toutes les boutiques" },
    ],
  },
  {
    title: "FasoLink pour vous",
    links: [
      { href: "/boutiques", label: "Trouver un vendeur tech" },
      { href: "/inscription", label: "Créer mon compte" },
      { href: "/profil", label: "Mon profil" },
      { href: "/vendeur/dashboard", label: "Espace vendeur" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="fx-night relative isolate mt-24 overflow-hidden text-white">
      <div aria-hidden="true" className="fx-grid fx-grid-dark" />
      <div aria-hidden="true" className="fx-grain fx-grain-dark" />
      <span aria-hidden="true" className="faso-brand-thread absolute inset-x-0 top-0" />

      <div className="container-faso relative pt-16 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div className="space-y-6">
            <Link href="/" aria-label="FasoLink — accueil" className="group inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_10px_30px_-12px_rgb(244_169_60/.6)] transition-transform duration-500 group-hover:-rotate-6">
                <LogoMark className="h-8 w-8 text-ink" />
              </span>
              <span className="font-display text-2xl leading-none tracking-[-0.03em]">
                <span className="font-medium">Faso</span>
                <span className="font-extrabold">Link</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-white/60">
              La vitrine tech du Burkina Faso : téléphones, ordinateurs et accessoires
              auprès de vendeurs locaux de confiance.
            </p>
            <Link
              href="/vendeur/inscription"
              className="btn-shine group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#f8c46e,rgb(var(--faso-gold))_55%,#e59a31)] px-5 py-3 text-sm font-extrabold text-ink shadow-[0_14px_34px_-16px_rgb(var(--faso-gold)/.9)] transition-transform hover:-translate-y-0.5"
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              Ouvrir une boutique tech
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-extrabold uppercase tracking-[.18em] text-white/45">{column.title}</h3>
              <ul className="mt-5 space-y-3.5 text-sm">
                {column.links.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    <Link href={href} className="group inline-flex items-center gap-2.5 text-white/75 transition-colors hover:text-white">
                      {Icon && <Icon className="h-4 w-4 text-faso-gold" aria-hidden="true" />}
                      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[11px] font-extrabold uppercase tracking-[.18em] text-white/45">Contact & confiance</h3>
            <ul className="mt-5 space-y-3.5 text-sm text-white/75">
              <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-faso-gold" aria-hidden="true" /> Ouagadougou, Burkina Faso</li>
              <li>
                <a href="mailto:contact@fasolink.bf" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                  <Mail className="h-4 w-4 text-faso-gold" aria-hidden="true" /> contact@fasolink.bf
                </a>
              </li>
              <li>
                <a href="tel:+22625000000" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                  <Phone className="h-4 w-4 text-faso-gold" aria-hidden="true" /> +226 25 00 00 00
                </a>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <Link href="/confidentialite" className="rounded-full border border-white/12 px-3 py-1.5 text-white/60 transition-colors hover:border-white/30 hover:text-white">Confidentialité</Link>
              <Link href="/conditions" className="rounded-full border border-white/12 px-3 py-1.5 text-white/60 transition-colors hover:border-white/30 hover:text-white">Conditions</Link>
              <Link href="/mentions-legales" className="rounded-full border border-white/12 px-3 py-1.5 text-white/60 transition-colors hover:border-white/30 hover:text-white">Mentions légales</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Signature géante, découpée par le bas de page. */}
      <div aria-hidden="true" className="pointer-events-none relative mt-14 select-none overflow-hidden md:mt-20">
        <p className="fx-display translate-y-[18%] whitespace-nowrap bg-[linear-gradient(180deg,rgb(255_255_255/.16)_0%,rgb(244_169_60/.08)_45%,transparent_80%)] bg-clip-text text-center text-[clamp(5rem,21vw,20rem)] leading-[.8] text-transparent">
          FasoLink
        </p>
      </div>

      <div className="relative border-t border-white/10 bg-black/20 backdrop-blur">
        <div className="container-faso flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} FasoLink. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Fièrement conçu au
            <span className="font-semibold text-white/85">Faso</span>
            <span aria-hidden className="text-faso-red">●</span>
            <span aria-hidden className="text-faso-green">●</span>
            <span aria-hidden className="text-faso-gold">★</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
