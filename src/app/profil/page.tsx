import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  LogIn,
  MessageCircle,
  Settings,
  Store,
  UserRound,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Mon Profil",
  description:
    "Votre espace FasoLink : favoris, contacts WhatsApp, compte vendeur et paramètres.",
};

const LINKS = [
  {
    href: "/#explorer",
    icon: Heart,
    title: "Mes favoris",
    desc: "Boutiques enregistrées pour plus tard",
  },
  {
    href: "/vendeur/dashboard",
    icon: Store,
    title: "Mon espace vendeur",
    desc: "Tableau de bord, contacts, QR Code",
  },
  {
    href: "/vendeur/verification",
    icon: MessageCircle,
    title: "Vérification",
    desc: "Obtenir le badge « Vendeur Vérifié »",
  },
  {
    href: "/inscription",
    icon: Settings,
    title: "Type de compte",
    desc: "Acheteur ou vendeur",
  },
];

export default function ProfilPage() {
  return (
    <div className="container-faso py-10 md:py-16">
      <Reveal className="flex items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-faso-gradient text-white shadow-premium">
          <UserRound className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            Mon Profil
          </h1>
          <p className="text-sm text-ink-muted">
            Invité · connectez-vous pour synchroniser vos favoris
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <div className="card-premium flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-soft">
            Créez un compte gratuit pour retrouver vos boutiques favorites sur
            tous vos appareils.
          </p>
          <ButtonLink href="/inscription" size="sm" className="shrink-0">
            <LogIn className="h-4 w-4" />
            Créer un compte
          </ButtonLink>
        </div>
      </Reveal>

      <div className="mt-6 space-y-3">
        {LINKS.map((l, i) => (
          <Reveal key={l.href} delay={0.08 + i * 0.04}>
            <Link
              href={l.href}
              className="flex items-center gap-4 rounded-2xl border border-clay-100 bg-white p-4 transition-colors hover:border-faso-gold"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-clay-50 text-faso-red">
                <l.icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-ink">
                  {l.title}
                </span>
                <span className="block text-xs text-ink-muted">{l.desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-ink-muted" />
            </Link>
          </Reveal>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        FasoLink — Consommer Burkinabè 🇧🇫
      </p>
    </div>
  );
}
