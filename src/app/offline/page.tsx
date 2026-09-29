import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bookmark, Radio, ShieldCheck, WifiOff } from "lucide-react";
import { OfflineRetryButton } from "@/components/pwa/OfflineRetryButton";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Hors connexion",
  description: "FasoLink est momentanément hors connexion. Réessayez ou revenez aux pages déjà consultées.",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <div className="container-faso py-8 sm:py-12 md:py-16">
      <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-clay-200/80 bg-white/90 shadow-premium-lg sm:rounded-[2.5rem]">
        <div className="page-ambient" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-faso-gold/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-faso-green/10 blur-3xl" aria-hidden="true" />

        <div className="relative grid items-center gap-8 p-6 sm:p-9 md:grid-cols-[minmax(0,1fr)_300px] md:gap-12 md:p-12">
          <div>
            <span className="section-kicker"><WifiOff className="h-3.5 w-3.5" /> Mode hors connexion</span>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.06] tracking-[-0.05em] text-ink sm:text-5xl md:text-6xl">
              Le réseau a fait une pause.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
              FasoLink n’arrive pas à joindre Internet pour le moment. Vérifiez votre connexion puis réessayez : nous vous ramènerons à votre navigation dès que possible.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <OfflineRetryButton />
              <Link href="/" className="btn-base h-12 justify-center border border-clay-200 bg-white/90 px-5 text-sm font-bold text-ink hover:border-faso-gold hover:bg-white">
                Retour à l’accueil <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xs">
            <div className="absolute inset-4 rounded-full border border-dashed border-clay-300/80" aria-hidden="true" />
            <div className="relative grid aspect-square place-items-center rounded-[2rem] border border-white/80 bg-gradient-to-br from-clay-50 via-white to-faso-gold-soft/30 shadow-[0_30px_90px_-42px_rgba(26,17,9,.36)]">
              <div className="absolute left-[16%] top-[17%] h-3 w-3 rounded-full bg-faso-gold shadow-[0_0_0_7px_rgba(244,169,60,.12)]" aria-hidden="true" />
              <div className="absolute bottom-[19%] right-[16%] h-2.5 w-2.5 rounded-full bg-faso-green shadow-[0_0_0_7px_rgba(34,125,73,.1)]" aria-hidden="true" />
              <div className="grid h-32 w-32 place-items-center rounded-[2rem] bg-ink text-faso-gold shadow-premium-lg sm:h-36 sm:w-36">
                <WifiOff className="h-14 w-14" strokeWidth={1.5} />
              </div>
              <span className="absolute bottom-5 inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-ink-soft shadow-sm">
                <Radio className="h-3.5 w-3.5 text-faso-red" /> Connexion interrompue
              </span>
            </div>
          </div>
        </div>

        <div className="relative grid gap-3 border-t border-clay-200/80 bg-clay-50/65 p-5 sm:grid-cols-2 sm:p-7">
          <div className="flex items-start gap-3 rounded-2xl border border-clay-200/70 bg-white/80 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-faso-gold-soft/45 text-faso-gold-dark"><Bookmark className="h-5 w-5" /></span>
            <div><p className="text-sm font-bold text-ink">Reprenez où vous en étiez</p><p className="mt-1 text-xs leading-5 text-ink-muted">Certaines pages déjà consultées peuvent rester accessibles depuis le cache de cet appareil; leur contenu peut ne pas être à jour.</p></div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-clay-200/70 bg-white/80 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-faso-green-soft/35 text-faso-green"><ShieldCheck className="h-5 w-5" /></span>
            <div><p className="text-sm font-bold text-ink">Vos actions restent protégées</p><p className="mt-1 text-xs leading-5 text-ink-muted">Les opérations nécessitant Internet ne seront pas envoyées tant que la connexion n’est pas rétablie.</p></div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
