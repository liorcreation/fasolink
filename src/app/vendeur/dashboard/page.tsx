import type { Metadata } from "next";
import { fetchShops } from "@/lib/shops";
import { Reveal } from "@/components/ui/Reveal";
import { VendorDashboard } from "@/components/vendeur/VendorDashboard";

export const metadata: Metadata = {
  title: "Tableau de bord vendeur",
  description:
    "Suivez vos contacts WhatsApp, votre période d'essai, votre vérification et votre QR Code boutique.",
};

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function VendorDashboardPage() {
  // Démo : on prend la première boutique comme « ma boutique ».
  // Connecté à Firebase : filtrer shops par owner_id == auth.currentUser.uid.
  const shops = await fetchShops();
  const myShop = shops[0];

  return (
    <div className="container-faso-wide py-12 md:py-16">
      <Reveal className="max-w-2xl">
        <span className="text-sm font-bold uppercase tracking-widest text-faso-red">
          Espace vendeur
        </span>
        <h1 className="mt-3 font-editorial text-display-2 font-semibold text-ink">
          Tableau de bord
        </h1>
        <p className="mt-3 text-ink-soft">
          La preuve chiffrée de la valeur de votre vitrine FasoLink.
        </p>
      </Reveal>

      <div className="mt-10">
        {myShop ? (
          <VendorDashboard shop={myShop} />
        ) : (
          <p className="text-ink-muted">Aucune boutique associée à ce compte.</p>
        )}
      </div>
    </div>
  );
}
