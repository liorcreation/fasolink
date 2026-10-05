import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { SplashScreen } from "@/components/site/SplashScreen";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AutoRefresh } from "@/components/site/AutoRefresh";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fasolink.pages.dev"),
  applicationName: "FasoLink",
  title: {
    default: "FasoLink — La tech du Faso, à portée de main",
    template: "%s · FasoLink",
  },
  description:
    "Téléphones, ordinateurs et accessoires proposés par des boutiques tech au Burkina Faso. Comparez les offres et contactez les vendeurs directement sur FasoLink.",
  keywords: [
    "Burkina Faso",
    "électronique Burkina Faso",
    "téléphones Ouagadougou",
    "ordinateurs Burkina Faso",
    "boutique informatique Bobo-Dioulasso",
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
    title: "FasoLink — La tech du Faso, à portée de main",
    description:
      "Téléphones, ordinateurs et accessoires auprès des vendeurs tech du Burkina Faso.",
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
      <body className="min-h-dvh bg-clay-50 antialiased pb-bottom-nav lg:pb-0">
        <AuthProvider>
          <SplashScreen />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <BottomNav />
          <ServiceWorkerRegister />
          <InstallPrompt />
          <AutoRefresh />
        </AuthProvider>
      </body>
    </html>
  );
}
