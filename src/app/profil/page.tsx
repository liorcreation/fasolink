import type { Metadata } from "next";
import { ProfilePanel } from "@/components/profile/ProfilePanel";

export const metadata: Metadata = {
  title: "Mon Profil",
  description:
    "Votre espace FasoLink : favoris, contacts WhatsApp, compte vendeur et paramètres.",
};

export default function ProfilPage() {
  return <ProfilePanel />;
}
