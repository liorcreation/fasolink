import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  MapPin,
  Search,
  Sparkles,
  Store,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export default function NotFound() {
  return (
    <div className="container-faso py-8 sm:py-12 md:py-16">
      <div className="relative mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-[.92fr_1.08fr] lg:gap-8">
        <Reveal className="relative isolate min-h-[300px] overflow-hidden rounded-[2rem] border border-clay-200/80 bg-[#1b2920] p-6 text-white shadow-premium-lg sm:min-h-[390px] sm:rounded-[2.5rem] sm:p-9 md:p-12">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_14%,rgba(244,169,60,.25),transparent_34%),radial-gradient(ellipse_at_5%_100%,rgba(39,140,88,.28),transparent_42%)]" aria-hidden="true" />
          <div className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-white/65 sm:right-8 sm:top-8">
            FasoLink <span className="text-faso-gold">·</span> 404
          </div>
          <div className="relative flex min-h-[250px] flex-col justify-center sm:min-h-[310px]">
            <div className="relative w-fit">
              <span className="select-none text-[clamp(7rem,24vw,14rem)] font-black leading-[.78] tracking-[-.1em] text-white/[.96]">404</span>
              <div className="absolute -right-2 top-[-1.2rem] grid h-14 w-14 rotate-6 place-items-center rounded-2xl bg-faso-gold text-ink shadow-[0_14px_32px_-12px_rgba(244,169,60,.8)] sm:-right-4 sm:top-[-1.6rem] sm:h-16 sm:w-16">
                <MapPin className="h-7 w-7" strokeWidth={2.4} />
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3 text-xs font-semibold text-white/65 sm:text-sm">
              <span className="h-px w-10 bg-faso-gold/70" /> Cette adresse n’apparaît pas sur la carte.
            </div>
          </div>
          <div className="absolute bottom-5 right-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/35 sm:bottom-8 sm:right-8">
            <Compass className="h-3.5 w-3.5 text-faso-gold/70" /> Cap sur FasoLink
          </div>
        </Reveal>

        <Reveal delay={0.08} y={16} className="rounded-[2rem] border border-clay-200/70 bg-white/85 p-6 shadow-premium backdrop-blur sm:rounded-[2.5rem] sm:p-9 md:p-11">
          <span className="section-kicker"><Sparkles className="h-3.5 w-3.5" /> On vous remet sur la bonne voie</span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-[-.04em] text-ink sm:text-4xl md:text-5xl">
            Cette page a pris un autre chemin.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-ink-soft sm:text-base sm:leading-8">
            Le lien est peut-être incomplet ou la page a été déplacée. Les boutiques et les savoir-faire du Burkina, eux, sont toujours à découvrir.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <ButtonLink href="/" size="lg" className="w-full justify-between">
              <span className="inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Accueil</span>
              <ArrowRight className="h-4 w-4 opacity-70" />
            </ButtonLink>
            <ButtonLink href="/boutiques" size="lg" variant="outline" className="w-full justify-between">
              <span className="inline-flex items-center gap-2"><Search className="h-4 w-4" /> Trouver une boutique</span>
              <ArrowRight className="h-4 w-4 opacity-50" />
            </ButtonLink>
          </div>

          <div className="mt-7 border-t border-clay-200/80 pt-5">
            <Link href="/vendeur/inscription" className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-clay-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-gold">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-faso-green-soft/35 text-faso-green"><Store className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink">Vous êtes commerçant ?</span><span className="mt-0.5 block text-xs text-ink-muted">Créez votre vitrine FasoLink.</span></span>
              <ArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-faso-green" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
