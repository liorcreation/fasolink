"use client";

import { ArrowRight, MessageCircle, Search, Sparkles, Store } from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { Hero } from "@/components/home/Hero";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { ElectronicsShowcase } from "@/components/home/ElectronicsShowcase";
import { SearchExplorer } from "@/components/home/SearchExplorer";
import { ImpactCounter } from "@/components/home/ImpactCounter";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { usePublicShopsRealtime } from "@/components/shops/PublicShopsRealtime";

const STEPS = [
  { icon: Search, title: "Explorez", text: "Téléphones, ordinateurs, audio et accessoires auprès de boutiques tech locales." },
  { icon: Store, title: "Comparez", text: "Consultez les prix, les photos, le stock annoncé et les détails de chaque produit." },
  { icon: MessageCircle, title: "Échangez en direct", text: "Posez vos questions au vendeur sur WhatsApp avant de vous déplacer ou commander." },
];

export function RealtimeHomeContent({ initialShops }: { initialShops: ShopWithProducts[] }) {
  const shops = usePublicShopsRealtime(initialShops);
  const productCount = shops.reduce((count, shop) => count + shop.products.length, 0);
  const cityCount = new Set(shops.map((shop) => shop.city).filter(Boolean)).size;
  const verifiedCount = shops.filter((shop) => shop.verification_status === "verified").length;

  return (
    <>
      <Hero shops={shops} />
      <ElectronicsShowcase shops={shops} />
      <FeaturedCarousel shops={shops} />
      <SearchExplorer shops={shops} initialCategory="electronique" electronicsOnly eyebrow="Le réseau tech burkinabè" heading="Les boutiques tech, près de vous" description="Repérez les vendeurs par ville, vérifiez leurs horaires et ouvrez leur vitrine pour poser vos questions." />
      <ImpactCounter shopCount={shops.length} productCount={productCount} cityCount={cityCount} verifiedCount={verifiedCount} />

      <section className="relative overflow-hidden bg-white py-16 md:py-24">
        <div aria-hidden className="pointer-events-none absolute -right-36 top-1/4 h-80 w-80 rounded-full bg-faso-gold/10 blur-[100px]" />
        <div className="container-faso relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="section-kicker"><Sparkles className="h-3.5 w-3.5" /> L’expérience FasoLink</span>
            <h2 className="mt-4 text-3xl font-bold text-ink md:text-5xl">La bonne technologie. Le bon vendeur. En direct.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-muted md:text-base">Repérez les appareils, vérifiez les informations publiées et échangez directement avec une boutique locale avant votre achat.</p>
          </Reveal>
          <div className="relative mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-5">
            <div aria-hidden className="absolute left-[17%] right-[17%] top-10 hidden h-px bg-gradient-to-r from-faso-red/20 via-faso-gold/50 to-faso-green/20 md:block" />
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.09} className="h-full">
                <article className="group relative h-full overflow-hidden rounded-[1.75rem] border border-clay-100 bg-[#fcfaf6] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-faso-gold/40 hover:bg-white hover:shadow-premium-lg sm:p-7">
                  <span aria-hidden className="absolute -right-1 -top-7 select-none text-[8rem] font-black leading-none tracking-[-.08em] text-ink/[.035] transition-colors duration-500 group-hover:text-faso-gold/[.11]">0{index + 1}</span>
                  <div className="relative flex items-center justify-between"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-faso-red shadow-[0_12px_30px_-18px_rgba(26,17,9,.38)] transition-transform duration-500 group-hover:rotate-[-5deg] group-hover:scale-105"><step.icon className="h-6 w-6" /></span><span className="text-xs font-extrabold uppercase tracking-[.16em] text-ink-muted">Étape 0{index + 1}</span></div>
                  <h3 className="relative mt-7 text-xl font-extrabold text-ink">{step.title}</h3>
                  <p className="relative mt-2 max-w-sm text-sm leading-6 text-ink-soft">{step.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-faso py-14 md:py-20"><Reveal><div className="relative isolate overflow-hidden rounded-[2rem] bg-[#1b2920] p-6 text-white shadow-[0_38px_90px_-48px_rgba(19,42,28,.75)] sm:p-9 md:rounded-[2.5rem] md:p-14"><div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_90%_10%,rgba(244,169,60,.24),transparent_30%),radial-gradient(ellipse_at_5%_100%,rgba(39,140,88,.25),transparent_42%)]" /><div aria-hidden className="pointer-events-none absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full border border-white/10" /><div className="relative grid items-end gap-9 lg:grid-cols-[1fr_auto] lg:gap-12"><div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-faso-gold"><Store className="h-3.5 w-3.5" /> Le Faso entreprend</span><h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">Votre boutique tech mérite une vitrine à sa hauteur.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/70 md:text-base">Présentez vos téléphones, ordinateurs et accessoires aux acheteurs du Burkina Faso. Publiez vos offres et échangez directement avec vos futurs clients.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:min-w-[230px] lg:flex-col"><ButtonLink href="/vendeur/inscription" size="lg" variant="gold" className="justify-between">Ouvrir ma boutique <ArrowRight className="h-4 w-4" /></ButtonLink><ButtonLink href="/boutiques" size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white hover:text-ink">Découvrir les boutiques</ButtonLink></div></div></div></Reveal></section>
    </>
  );
}
