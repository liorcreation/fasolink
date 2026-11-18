"use client";

import type { ShopWithProducts } from "@/lib/database.types";
import { Hero } from "@/components/home/Hero";
import { UniverseMarquee } from "@/components/home/UniverseMarquee";
import { ElectronicsShowcase } from "@/components/home/ElectronicsShowcase";
import { FeatureBento } from "@/components/home/FeatureBento";
import { VideoShowcase } from "@/components/home/VideoShowcase";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { SearchExplorer } from "@/components/home/SearchExplorer";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ImpactCounter } from "@/components/home/ImpactCounter";
import { SellerCta } from "@/components/home/SellerCta";
import { usePublicShopsRealtime } from "@/components/shops/PublicShopsRealtime";

export function RealtimeHomeContent({ initialShops }: { initialShops: ShopWithProducts[] }) {
  const shops = usePublicShopsRealtime(initialShops);
  const productCount = shops.reduce((count, shop) => count + shop.products.length, 0);
  const cities = Array.from(new Set(shops.map((shop) => shop.city).filter(Boolean)));
  const verifiedCount = shops.filter((shop) => shop.verification_status === "verified").length;

  return (
    <>
      <Hero shops={shops} />
      <UniverseMarquee cities={cities} />
      <ElectronicsShowcase shops={shops} />
      <FeatureBento shops={shops} />
      <VideoShowcase />
      <FeaturedCarousel shops={shops} />
      <SearchExplorer shops={shops} initialCategory="electronique" electronicsOnly eyebrow="Le réseau tech burkinabè" heading="Les boutiques tech," accent="près de vous." description="Repérez les vendeurs par ville, vérifiez leurs horaires et ouvrez leur vitrine pour poser vos questions." />
      <HowItWorks />
      <ImpactCounter shopCount={shops.length} productCount={productCount} cityCount={cities.length} verifiedCount={verifiedCount} />
      <SellerCta />
    </>
  );
}
