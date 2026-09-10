import Link from "next/link";
import { ArrowRight, MessageCircle, Search, Store } from "lucide-react";
import { estimateLocalImpact, fetchShops } from "@/lib/shops";
import { CATEGORIES } from "@/lib/constants";
import { Hero } from "@/components/home/Hero";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { SearchExplorer } from "@/components/home/SearchExplorer";
import { ImpactCounter } from "@/components/home/ImpactCounter";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

// Cloudflare Pages : rendu à la demande (données Firestore fraîches à chaque visite).
export const runtime = "edge";
export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: Search,
    title: "Cherchez",
    text: "Parcourez l'annuaire par catégorie, ville ou mot-clé. Résultats instantanés.",
  },
  {
    icon: Store,
    title: "Découvrez la vitrine",
    text: "Galerie de produits, prix, localisation et avis pour chaque boutique.",
  },
  {
    icon: MessageCircle,
    title: "Contactez sur WhatsApp",
    text: "Un bouton direct vers le WhatsApp Business du commerçant. Zéro intermédiaire.",
  },
];

export default async function HomePage() {
  const shops = await fetchShops();
  const impact = estimateLocalImpact(shops);

  return (
    <>
      <Hero shops={shops} />

      {/* Bandeau catégories — défilable au doigt sur mobile */}
      <section className="border-y border-clay-100 bg-white">
        <div className="snap-row no-scrollbar flex gap-3 overflow-x-auto px-5 py-6 sm:flex-wrap sm:justify-center sm:px-8 lg:px-10">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.id} y={12} delay={i * 0.05} className="snap-item shrink-0">
              <Link
                href="/#explorer"
                className="group inline-flex items-center gap-2 rounded-full border border-clay-100 bg-clay-50 px-4 py-2 text-sm font-semibold text-ink-soft transition-all hover:border-faso-gold hover:text-ink"
              >
                <c.icon className="h-4 w-4 text-faso-red" />
                {c.label}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <FeaturedCarousel shops={shops} />

      <SearchExplorer shops={shops} />

      <ImpactCounter amountCFA={impact} shopCount={520} />

      {/* Comment ça marche */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-faso">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-faso-green">
              Comment ça marche
            </span>
            <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">
              Du besoin au commerçant en 3 étapes
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <div className="card-premium h-full p-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-faso-gradient text-white shadow-premium">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-ink">
                    {i + 1}. {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-soft">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA vendeurs */}
      <section className="container-faso py-16 md:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-faso-gradient bg-[length:200%_200%] p-8 text-white shadow-premium-lg animate-gradient-pan md:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl font-bold md:text-4xl">
                Vous êtes commerçant, artisan ou producteur ?
              </h2>
              <p className="mt-4 text-white/90">
                Créez votre vitrine FasoLink en quelques minutes, publiez vos
                produits et recevez vos clients directement sur WhatsApp.
                14 jours d&apos;essai gratuit, sans carte.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href="/vendeur/inscription"
                  size="lg"
                  variant="gold"
                >
                  Ouvrir ma boutique
                  <ArrowRight className="h-5 w-5" />
                </ButtonLink>
                <ButtonLink
                  href="/inscription"
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-ink"
                >
                  Voir les formules
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
