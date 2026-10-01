import Link from "next/link";
import { ArrowRight, MessageCircle, Search, Sparkles, Store } from "lucide-react";
import { fetchShops } from "@/lib/shops";
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

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { categorie?: string };
}) {
  const shops = await fetchShops();
  const requestedCategory = CATEGORIES.some((category) => category.id === searchParams?.categorie)
    ? (searchParams?.categorie as (typeof CATEGORIES)[number]["id"])
    : "all";
  const productCount = shops.reduce((count, shop) => count + shop.products.length, 0);
  const cityCount = new Set(shops.map((shop) => shop.city).filter(Boolean)).size;
  const verifiedCount = shops.filter((shop) => shop.verification_status === "verified").length;

  return (
    <>
      <Hero shops={shops} />

      {/* Bandeau catégories — défilable au doigt sur mobile */}
      <section className="border-y border-clay-100/80 bg-white/70 py-7 backdrop-blur-sm sm:py-9">
        <div className="container-faso">
          <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-faso-red">À chacun son coup de cœur</p>
              <h2 className="mt-1 text-lg font-bold text-ink sm:text-xl">Parcourir par univers</h2>
            </div>
            <Link href="/boutiques" className="hidden items-center gap-1 text-xs font-bold text-ink-soft transition-colors hover:text-faso-red sm:inline-flex">Voir toutes les boutiques <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="snap-row no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
            {CATEGORIES.map((c, i) => {
              const count = shops.filter((shop) => shop.category === c.id).length;
              return (
                <Reveal key={c.id} y={12} delay={i * 0.035} className="snap-item shrink-0 sm:shrink">
                  <Link
                    href={`/boutiques?categorie=${c.id}#boutiques`}
                    className="group flex min-w-[154px] items-center gap-3 rounded-2xl border border-clay-100 bg-[#fbf8f3] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-faso-gold/50 hover:bg-white hover:shadow-premium sm:min-w-0"
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${c.accent} transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105`}><c.icon className="h-5 w-5" /></span>
                    <span className="min-w-0"><span className="block truncate text-xs font-extrabold text-ink">{c.label}</span><span className="mt-0.5 block text-[10px] text-ink-muted">{count} boutique{count === 1 ? "" : "s"}</span></span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <FeaturedCarousel shops={shops} />

      <SearchExplorer key={requestedCategory} shops={shops} initialCategory={requestedCategory} />

      <ImpactCounter
        shopCount={shops.length}
        productCount={productCount}
        cityCount={cityCount}
        verifiedCount={verifiedCount}
      />

      {/* Comment ça marche */}
      <section className="relative overflow-hidden bg-white py-16 md:py-24">
        <div aria-hidden className="pointer-events-none absolute -right-36 top-1/4 h-80 w-80 rounded-full bg-faso-gold/10 blur-[100px]" />
        <div className="container-faso relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="section-kicker"><Sparkles className="h-3.5 w-3.5" /> L’expérience FasoLink</span>
            <h2 className="mt-4 text-3xl font-bold text-ink md:text-5xl">
              Du coup de cœur au contact, sans détour.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-muted md:text-base">
              Tout est pensé pour vous faire gagner du temps et rapprocher les talents d’ici de ceux qui les recherchent.
            </p>
          </Reveal>

          <div className="relative mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-5">
            <div aria-hidden className="absolute left-[17%] right-[17%] top-10 hidden h-px bg-gradient-to-r from-faso-red/20 via-faso-gold/50 to-faso-green/20 md:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.09} className="h-full">
                <article className="group relative h-full overflow-hidden rounded-[1.75rem] border border-clay-100 bg-[#fcfaf6] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-faso-gold/40 hover:bg-white hover:shadow-premium-lg sm:p-7">
                  <span aria-hidden className="absolute -right-1 -top-7 select-none text-[8rem] font-black leading-none tracking-[-.08em] text-ink/[.035] transition-colors duration-500 group-hover:text-faso-gold/[.11]">0{i + 1}</span>
                  <div className="relative flex items-center justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-faso-red shadow-[0_12px_30px_-18px_rgba(26,17,9,.38)] transition-transform duration-500 group-hover:rotate-[-5deg] group-hover:scale-105"><s.icon className="h-6 w-6" /></span>
                    <span className="text-xs font-extrabold uppercase tracking-[.16em] text-ink-muted">Étape 0{i + 1}</span>
                  </div>
                  <h3 className="relative mt-7 text-xl font-extrabold text-ink">{s.title}</h3>
                  <p className="relative mt-2 max-w-sm text-sm leading-6 text-ink-soft">{s.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA vendeurs */}
      <section className="container-faso py-14 md:py-20">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#1b2920] p-6 text-white shadow-[0_38px_90px_-48px_rgba(19,42,28,.75)] sm:p-9 md:rounded-[2.5rem] md:p-14">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_90%_10%,rgba(244,169,60,.24),transparent_30%),radial-gradient(ellipse_at_5%_100%,rgba(39,140,88,.25),transparent_42%)]" />
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full border border-white/10" />
            <div className="relative grid items-end gap-9 lg:grid-cols-[1fr_auto] lg:gap-12">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-faso-gold"><Store className="h-3.5 w-3.5" /> Le Faso entreprend</span>
                <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
                  Votre savoir-faire mérite une vitrine à sa hauteur.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 md:text-base">
                  Rejoignez les vendeurs locaux, présentez vos produits avec élégance et échangez directement avec vos futurs clients.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:min-w-[230px] lg:flex-col">
                <ButtonLink
                  href="/vendeur/inscription"
                  size="lg"
                  variant="gold"
                  className="justify-between"
                >
                  Ouvrir ma boutique
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href="/boutiques"
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white hover:text-ink"
                >
                  Découvrir les boutiques
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
