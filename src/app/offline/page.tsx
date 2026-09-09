import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "Hors ligne",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <div className="container-faso flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-clay-100 text-ink-muted">
        <WifiOff className="h-8 w-8" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-ink">Vous êtes hors ligne</h1>
      <p className="mt-2 max-w-md text-ink-soft">
        Cette page n&apos;est pas encore disponible sans connexion. Les boutiques
        déjà consultées restent accessibles.
      </p>
      <Link
        href="/"
        className="btn-base mt-8 h-12 bg-faso-red px-6 text-white"
      >
        Réessayer l&apos;accueil
      </Link>
    </div>
  );
}
