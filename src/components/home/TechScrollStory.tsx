"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowRight, AudioLines, BadgeCheck, Laptop, MapPin, Smartphone, Sparkles } from "lucide-react";
import type { Product, ShopWithProducts } from "@/lib/database.types";

type Photo = {
  id: string;
  image_url: string;
  alt: string;
  image_credit: string;
  image_source_url: string;
};

type Scene = {
  eyebrow: string;
  title: string;
  body: string;
  action: string;
  href: string;
  fallback: Product | null;
  shop: ShopWithProducts | null;
  Icon: typeof Smartphone;
  accent: string;
};

function SceneFrame({ scene, photo, progress, index, reduce, active }: {
  scene: Scene;
  photo: Photo | null;
  progress: MotionValue<number>;
  index: number;
  reduce: boolean | null;
  active: boolean;
}) {
  const start = index / 3;
  const opacity = useTransform(progress, [start - 0.06, start + 0.04, start + 0.27, start + 0.36], [0, 1, 1, 0], { clamp: true });
  const y = useTransform(progress, [start - 0.06, start + 0.08], [32, 0], { clamp: true });
  const scale = useTransform(progress, [start - 0.06, start + 0.12, start + 0.36], [0.9, 1, 1.06], { clamp: true });
  const rotateY = useTransform(progress, [start - 0.06, start + 0.12], [index % 2 === 0 ? 7 : -7, 0], { clamp: true });
  const Icon = scene.Icon;

  return (
    <motion.article
      aria-label={scene.title.replace("\n", " ")}
      aria-hidden={!reduce && !active}
      inert={!reduce && !active}
      className={`tech-story-scene ${reduce ? "tech-story-scene-static" : ""}`}
      style={reduce ? undefined : { opacity, y, scale, rotateY, transformPerspective: 1200 }}
    >
      <div className="tech-story-copy">
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.22em] text-[#f4bd69] sm:text-xs">
          <Icon className="h-4 w-4" /> {scene.eyebrow}
        </div>
        <h3 className="mt-5 max-w-xl text-[clamp(2.35rem,5.5vw,5rem)] font-black leading-[.98] tracking-[-.065em] text-white">{scene.title}</h3>
        <p className="mt-5 max-w-lg text-sm leading-7 text-white/70 sm:text-base sm:leading-8">{scene.body}</p>
        <Link href={scene.href} className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#17120e] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4bd69] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          {scene.action}<ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="tech-story-art" style={{ "--scene-accent": scene.accent } as React.CSSProperties}>
        <div aria-hidden className="tech-story-orbit tech-story-orbit-one" />
        <div aria-hidden className="tech-story-orbit tech-story-orbit-two" />
        <div className="tech-story-image-shell">
          {photo ? (
            <Image
              src={photo.image_url}
              alt={photo.alt || scene.eyebrow}
              fill
              sizes="(max-width: 900px) 90vw, 48vw"
              quality={95}
              priority={index === 0}
              className="tech-story-image"
            />
          ) : scene.fallback?.image_url ? (
            <Image src={scene.fallback.image_url} alt={scene.fallback.name} fill sizes="(max-width: 900px) 90vw, 48vw" quality={95} className="tech-story-image tech-story-image-product" />
          ) : (
            <div className="tech-story-placeholder" aria-label="Visuel électronique" role="img">
              <div className="tech-story-device"><span /><i /><b /></div>
              <Sparkles aria-hidden="true" className="absolute right-[16%] top-[19%] h-7 w-7 text-[#ffd68f]" />
            </div>
          )}
          <div aria-hidden className="tech-story-image-shade" />
          <div className="tech-story-photo-caption">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {scene.shop?.city || "Burkina Faso"}</span>
            {photo ? <a href={photo.image_source_url} target="_blank" rel="noreferrer" className="mt-1 block w-fit text-[11px] font-semibold text-white/75 underline decoration-white/30 underline-offset-2">{photo.image_credit}</a> : <span className="mt-1 block text-[11px] font-semibold text-white/75">{scene.fallback ? "Photo publiée par le vendeur" : "Découvrir les boutiques tech locales"}</span>}
          </div>
        </div>
        <div className="tech-story-float-card tech-story-float-card-top">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f4bd69]/15 text-[#f4bd69]"><Icon className="h-4 w-4" /></span>
          <span><strong>{scene.fallback?.name ?? scene.eyebrow}</strong><small>{scene.shop?.name ?? "Sélection FasoLink"}</small></span>
        </div>
        <div className="tech-story-float-card tech-story-float-card-bottom">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#36a269]/15 text-[#70dfa3]"><BadgeCheck className="h-4 w-4" /></span>
          <span><strong>Le vendeur, en direct</strong><small>Échangez avant de décider</small></span>
          <ArrowRight className="ml-auto h-4 w-4 text-white/55" />
        </div>
      </div>
    </motion.article>
  );
}
export function TechScrollStory({ shops }: { shops: ShopWithProducts[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [activeScene, setActiveScene] = useState(0);
  const [photos, setPhotos] = useState<Array<Photo | null>>([null, null, null]);
  const firstImages = useMemo(() => shops.flatMap((shop) => shop.products
    .filter((product) => product.image_url)
    .map((product) => ({ product, shop }))), [shops]);

  const scenes = useMemo<Scene[]>(() => {
    const byFamily = (pattern: RegExp) => firstImages.find(({ product }) => pattern.test(`${product.name} ${product.description ?? ""}`.toLocaleLowerCase("fr")));
    const phone = byFamily(/téléphone|telephone|smartphone|iphone|galaxy|redmi|pixel/);
    const laptop = byFamily(/ordinateur|portable|laptop|macbook|pc |tablette/);
    const audio = byFamily(/écouteur|ecouteur|casque|enceinte|bluetooth|audio|micro/);
    return [
      { eyebrow: "Téléphones", title: "Le bon appareil.\nPour votre quotidien.", body: "Parcourez les smartphones proposés par les boutiques locales, comparez les informations publiées et posez vos questions directement au vendeur.", action: "Voir les téléphones", href: "/boutiques", fallback: phone?.product ?? firstImages[0]?.product ?? null, shop: phone?.shop ?? firstImages[0]?.shop ?? null, Icon: Smartphone, accent: "#b66c3e" },
      { eyebrow: "Ordinateurs", title: "De nouvelles idées\nprennent forme.", body: "Ordinateurs portables et outils de travail : découvrez l’offre disponible près de vous et vérifiez les caractéristiques avec la boutique.", action: "Explorer les boutiques", href: "/boutiques", fallback: laptop?.product ?? firstImages[1]?.product ?? null, shop: laptop?.shop ?? firstImages[1]?.shop ?? null, Icon: Laptop, accent: "#496d7b" },
      { eyebrow: "Audio & accessoires", title: "Les détails qui\nfont la différence.", body: "Écouteurs, casques et accessoires du quotidien, présentés par les vendeurs tech burkinabè. Un message suffit pour en savoir plus.", action: "Découvrir FasoLink", href: "/boutiques", fallback: audio?.product ?? firstImages[2]?.product ?? null, shop: audio?.shop ?? firstImages[2]?.shop ?? null, Icon: AudioLines, accent: "#687348" },
    ];
  }, [firstImages]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/images/search?query=${encodeURIComponent("premium smartphone laptop headphones electronics product photography")}`);
        if (!response.ok) return;
        const data = await response.json() as { photos?: Photo[] };
        const found = data.photos?.filter((photo) => photo.image_url).slice(0, 3) ?? [];
        if (active) setPhotos([found[0] ?? null, found[1] ?? null, found[2] ?? null]);
      } catch {
        // Seller product imagery and the locally-rendered 3D fallback remain available offline.
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => progress.on("change", (value) => {
    const nextScene = Math.min(2, Math.floor(value * 3));
    setActiveScene((current) => current === nextScene ? current : nextScene);
  }), [progress]);

  return (
    <section ref={sectionRef} className={`tech-story-section ${reduce ? "tech-story-section-reduced" : ""}`} aria-label="Découvrir les univers électroniques FasoLink">
      <div className="tech-story-sticky">
        <div aria-hidden className="tech-story-background" />
        <div className="tech-story-topline">
          <span className="inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-[#f4bd69]" /> La technologie, près de vous</span>
          <span className="hidden items-center gap-2 sm:inline-flex"><BadgeCheck className="h-3.5 w-3.5 text-[#70dfa3]" /> Les vendeurs du Burkina Faso</span>
        </div>

        {reduce ? (
          <div className="tech-story-static-list">
            {scenes.map((scene, index) => <SceneFrame key={scene.eyebrow} scene={scene} photo={photos[index]} progress={progress} index={index} reduce active />)}
          </div>
        ) : (
          <div className="tech-story-stage">
            {scenes.map((scene, index) => <SceneFrame key={scene.eyebrow} scene={scene} photo={photos[index]} progress={progress} index={index} reduce={false} active={activeScene === index} />)}
          </div>
        )}

        {!reduce && <div className="tech-story-scroll-cue" aria-hidden="true"><span>Faites défiler pour explorer</span><ArrowDown className="h-4 w-4 animate-bounce motion-reduce:animate-none" /></div>}
      </div>
      <div className="tech-story-progress" aria-hidden="true"><motion.span style={{ scaleY: progress, transformOrigin: "top" }} /></div>
    </section>
  );
}
