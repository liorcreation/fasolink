import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { SplashScreen } from "@/components/site/SplashScreen";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fasolink.bf"),
  applicationName: "FasoLink",
  title: {
    default: "FasoLink — Consommer Burkinabè",
    template: "%s · FasoLink",
  },
  description:
    "L'annuaire et la marketplace des commerçants, artisans et producteurs du Burkina Faso. Découvrez, contactez et soutenez le made in Burkina.",
  keywords: [
    "Burkina Faso",
    "consommer burkinabè",
    "marketplace",
    "annuaire commerçants",
    "artisanat",
    "Ouagadougou",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FasoLink",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  openGraph: {
    title: "FasoLink — Consommer Burkinabè",
    description:
      "La vitrine digitale des commerçants du Burkina Faso. Un clic vers WhatsApp.",
    locale: "fr_BF",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#D62828",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-dvh bg-clay-50 antialiased pb-bottom-nav md:pb-0">
        <SplashScreen />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <BottomNav />
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
