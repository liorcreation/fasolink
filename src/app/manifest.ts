import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FasoLink — La tech du Faso",
    short_name: "FasoLink",
    description:
      "Téléphones, ordinateurs et accessoires auprès des vendeurs tech du Burkina Faso.",
    start_url: "/?utm_source=pwa",
    display: "standalone",
    orientation: "any",
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
        name: "Boutiques tech",
        url: "/boutiques",
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
