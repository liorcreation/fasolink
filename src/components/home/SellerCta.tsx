"use client";

import { ArrowRight, BadgeCheck, QrCode, Store, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Backdrop } from "@/components/fx/Backdrop";
import { Magnetic } from "@/components/fx/Magnetic";
import { RevealText } from "@/components/fx/RevealText";
import { Reveal } from "@/components/ui/Reveal";

const PERKS = [
  { icon: Store, label: "Vitrine en ligne" },
  { icon: BadgeCheck, label: "Badge Vendeur Vérifié" },
  { icon: QrCode, label: "QR code de boutique" },
  { icon: TrendingUp, label: "Statistiques de contacts" },
];

export function SellerCta() {
  return (
    <section className="container-faso py-16 md:py-24">
      <Reveal>
        <div className="fx-beam fx-night relative isolate overflow-hidden rounded-[2rem] px-6 py-14 text-white shadow-[0_60px_120px_-60px_rgb(19_42_28/.9)] sm:px-10 md:rounded-[2.75rem] md:px-16 md:py-20">
          <Backdrop dark />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 h-[26rem] w-[26rem] rounded-full border border-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 -z-10 h-[18rem] w-[18rem] rounded-full border border-white/[.07]" />

          <div className="relative grid items-end gap-10 lg:grid-cols-[1.3fr_.7fr] lg:gap-14">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-faso-gold">
                <Store className="h-3.5 w-3.5" aria-hidden="true" /> Le Faso entreprend
              </span>
              <h2 className="fx-display mt-6 text-[clamp(2.4rem,5.4vw,4.6rem)]">
                <RevealText inView text="Votre boutique tech mérite" className="block" />
                <span className="font-serif-accent fx-text-gradient-light block pb-1 text-[1.08em]">une vitrine à sa hauteur.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/65">
                Présentez vos téléphones, ordinateurs et accessoires aux acheteurs du Burkina Faso. Publiez vos offres et échangez directement avec vos futurs clients.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {PERKS.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.06] px-3.5 py-2 text-xs font-semibold text-white/80 backdrop-blur">
                    <Icon className="h-3.5 w-3.5 text-faso-gold" aria-hidden="true" /> {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Magnetic className="w-full">
                <ButtonLink href="/vendeur/inscription" size="lg" variant="gold" className="group w-full justify-between">
                  Ouvrir ma boutique <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </ButtonLink>
              </Magnetic>
              <ButtonLink href="/boutiques" size="lg" variant="outline" className="w-full border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10">
                Découvrir les boutiques
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
