import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Hors ligne",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <div className="container-faso flex min-h-[60vh] items-center justify-center py-20">
      <Reveal className="mx-auto w-full max-w-md">
        <EmptyState
          icon={WifiOff}
          title="Vous êtes hors ligne"
          description="Cette page n'est pas encore disponible sans connexion. Les boutiques déjà consultées restent accessibles."
          action={{ label: "Réessayer l'accueil", href: "/" }}
          texture
        />
      </Reveal>
    </div>
  );
}
