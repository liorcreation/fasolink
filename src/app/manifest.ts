import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FasoLink — Consommer Burkinabè",
    short_name: "FasoLink",
    description:
      "L'annuaire et la marketplace des commerçants du Burkina Faso. Contact WhatsApp direct.",
    start_url: "/?utm_source=pwa",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FBF6EF",
    theme_color: "#D62828",
    lang: "fr",
    categories: ["shopping", "business", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Explorer les boutiques",
        url: "/#explorer",
      },
      {
        name: "Ouvrir ma boutique",
        url: "/vendeur/inscription",
      },
      {
        name: "Tableau de bord vendeur",
        url: "/vendeur/dashboard",
      },
    ],
  };
}
