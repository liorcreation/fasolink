import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  Heart,
  MessageCircle,
  Store,
  TrendingUp,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Rejoignez FasoLink en tant qu'acheteur (gratuit) ou vendeur (abonnement) et participez au mouvement Consommer Burkinabè.",
};

const BUYER_PERKS = [
  { icon: Eye, text: "Consultation illimitée de l'annuaire" },
  { icon: Heart, text: "Enregistrez vos boutiques favorites" },
  { icon: MessageCircle, text: "Contact WhatsApp direct avec les vendeurs" },
];

const SELLER_PERKS = [
  { icon: Store, text: "Votre vitrine boutique personnalisée" },
  { icon: TrendingUp, text: "Mise en avant & badge « Vérifiée »" },
  { icon: MessageCircle, text: "Bouton WhatsApp Business sur chaque produit" },
];

export default function InscriptionPage() {
  return (
    <div className="container-faso py-16 md:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-faso-red">
          Inscription
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          Quel profil vous ressemble&nbsp;?
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Choisissez comment vous souhaitez rejoindre la communauté FasoLink.
        </p>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-2">
        {/* Acheteur */}
        <Reveal>
          <div className="card-premium flex h-full flex-col p-8">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-faso-green-soft/50 px-3 py-1 text-xs font-bold text-faso-green-dark">
                Acheteur
              </span>
              <span className="text-2xl font-extrabold text-faso-green">
                Gratuit
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-bold text-ink">
              Explorer & consommer local
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Parfait pour découvrir les commerçants près de chez vous et acheter
              en confiance.
            </p>

            <ul className="mt-6 space-y-3">
              {BUYER_PERKS.map((p) => (
                <li key={p.text} className="flex items-center gap-3 text-sm">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-faso-green-soft/40 text-faso-green-dark">
                    <p.icon className="h-4 w-4" />
                  </span>
                  <span className="text-ink-soft">{p.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <ButtonLink
                href="/#explorer"
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </ButtonLink>
            </div>
          </div>
        </Reveal>

        {/* Vendeur */}
        <Reveal delay={0.1}>
          <div className="card-premium relative flex h-full flex-col overflow-hidden border-faso-gold/40 p-8 shadow-glow">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-faso-gold/15 blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-faso-gold-soft/60 px-3 py-1 text-xs font-bold text-faso-gold-dark">
                Vendeur
              </span>
              <span className="text-right">
                <span className="block text-2xl font-extrabold text-ink">
                  5 000 F
                </span>
                <span className="text-xs text-ink-muted">/ mois</span>
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-bold text-ink">
              Exposer & vendre plus
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Une vitrine professionnelle pour votre boutique, visible par des
              milliers d&apos;acheteurs burkinabè.
            </p>

            <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-faso-green-soft/40 px-3 py-1 text-xs font-bold text-faso-green-dark">
              14 jours d&apos;essai gratuit · sans carte
            </span>

            <ul className="mt-6 space-y-3">
              {SELLER_PERKS.map((p) => (
                <li key={p.text} className="flex items-center gap-3 text-sm">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-faso-gold-soft/50 text-faso-gold-dark">
                    <p.icon className="h-4 w-4" />
                  </span>
                  <span className="text-ink-soft">{p.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <ButtonLink
                href="/vendeur/inscription"
                variant="primary"
                size="lg"
                className="w-full"
              >
                Créer ma boutique
                <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-ink-muted">
                Formulaire · essai 14 j · puis Orange Money / Moov Money / Wave
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mx-auto mt-12 max-w-2xl">
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-clay-100 bg-white p-6 text-center text-sm text-ink-muted">
          <Check className="h-5 w-5 text-faso-green" />
          <p>
            Vous hésitez&nbsp;? Créez un compte acheteur maintenant, vous pourrez
            passer vendeur à tout moment depuis votre profil.
          </p>
          <Link
            href="/vendeur/paiement"
            className="font-semibold text-faso-red hover:underline"
          >
            Voir le détail des formules vendeurs
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
