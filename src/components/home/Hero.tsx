"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import { ArrowRight, BadgeCheck, MapPin, MessageCircle, Smartphone, Store } from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { AppLink as Link } from "@/components/site/AppLink";
import { ButtonLink } from "@/components/ui/Button";
import { PredictiveSearch } from "@/components/home/PredictiveSearch";
import { Backdrop } from "@/components/fx/Backdrop";
import { Magnetic } from "@/components/fx/Magnetic";
import { RevealText } from "@/components/fx/RevealText";
import { formatCFA, initials } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const rise = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
};

export function Hero({ shops }: { shops: ShopWithProducts[] }) {
  const reduce = useSafeReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const verifiedCount = shops.filter((shop) => shop.verification_status === "verified").length;
  const cityCount = new Set(shops.map((shop) => shop.city).filter(Boolean)).size;
  const productCount = shops.reduce((total, shop) => total + shop.products.length, 0);

  // Une vraie offre publiée sert de carte flottante : jamais de contenu inventé.
  const spotlight = findSpotlight(shops);

  // Parallaxe pilotée par la souris (désactivée en mouvement réduit / tactile).
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 70, damping: 18, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 70, damping: 18, mass: 0.6 });
  const rotateY = useTransform(smoothX, (value) => value * 14);
  const rotateX = useTransform(smoothY, (value) => value * -10);

  // Parallaxe de défilement : la colonne texte s'éloigne doucement.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={sectionRef}
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      className="relative isolate overflow-hidden bg-clay-50 text-ink"
    >
      <Backdrop />

      <div className="container-faso relative grid min-h-[min(880px,calc(100svh-4.5rem))] grid-cols-[minmax(0,1fr)] items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,.94fr)] lg:gap-8 lg:pb-24 lg:pt-12 xl:gap-14">
        <motion.div
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: 0.05 } } }}
          className="relative z-10 min-w-0 max-w-[720px]"
        >
          <motion.div variants={rise} transition={{ duration: 0.8, ease: EASE }}>
            <Link
              href="/boutiques"
              className="fx-glass group inline-flex max-w-full items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-ink-soft transition-transform hover:-translate-y-0.5"
            >
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.14em] text-white">
                <span className="fx-live-dot" aria-hidden="true" /> En direct
              </span>
              <span className="truncate">
                {shops.length > 0
                  ? `${shops.length.toLocaleString("fr-FR")} boutique${shops.length > 1 ? "s" : ""} tech en vitrine`
                  : "La tech locale, choisie au Burkina Faso"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </motion.div>

          <h1 className="fx-display mt-7 text-[clamp(3rem,6.3vw,5.9rem)] text-ink">
            <RevealText text="La tech" className="block" delay={0.15} />
            <RevealText text="du Faso," className="block" delay={0.27} />
            <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
              <motion.span
                className="font-serif-accent fx-text-gradient inline-block pr-[0.1em] text-[1.06em] leading-[1.02]"
                initial={reduce ? false : { y: "105%", rotate: 3 }}
                animate={{ y: "0%", rotate: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 1.05, ease: EASE, delay: 0.42 }}
              >
                à portée de main.
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={rise}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-7 max-w-xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8"
          >
            Téléphones, ordinateurs et accessoires : découvrez les vendeurs tech près de vous,
            comparez leurs offres et échangez directement avec eux sur WhatsApp.
          </motion.p>

          <motion.div variants={rise} transition={{ duration: 0.8, ease: EASE }} className="mt-8 max-w-xl">
            <div className="rounded-[calc(1.15rem+1.5px)] bg-gradient-to-r from-faso-red/40 via-faso-gold/60 to-faso-green/40 p-[1.5px] shadow-[0_24px_60px_-30px_rgb(26_17_9/.45)] transition-shadow hover:shadow-[0_28px_70px_-28px_rgb(201_127_22/.55)]">
              <PredictiveSearch shops={shops} />
            </div>
          </motion.div>

          <motion.div
            variants={rise}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-5 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center"
          >
            <Magnetic>
              <ButtonLink href="#produits" size="lg" variant="primary" className="group w-full min-[420px]:w-auto">
                Explorer les produits
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href="/vendeur/inscription" size="lg" variant="outline" className="w-full min-[420px]:w-auto">
                <Store className="h-4 w-4" /> Vendre sur FasoLink
              </ButtonLink>
            </Magnetic>
          </motion.div>

          <motion.div
            variants={rise}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-4 border-t border-clay-200/80 pt-6"
          >
            {shops.length > 0 && (
              <div className="flex -space-x-2.5" aria-hidden="true">
                {shops.slice(0, 4).map((shop, index) => (
                  <span
                    key={shop.id}
                    className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border-[2.5px] border-clay-50 bg-faso-gradient text-[11px] font-extrabold text-white shadow-md"
                    style={{ zIndex: 10 - index }}
                  >
                    {shop.logo_url ? (
                      <Image src={shop.logo_url} alt="" fill sizes="40px" className="object-cover" />
                    ) : (
                      initials(shop.name)
                    )}
                  </span>
                ))}
              </div>
            )}
            <dl className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Stat value={shops.length} label={shops.length > 1 ? "boutiques tech" : "boutique tech"} />
              {productCount > 0 && <Stat value={productCount} label={productCount > 1 ? "offres publiées" : "offre publiée"} />}
              {cityCount > 0 && <Stat value={cityCount} label={cityCount > 1 ? "villes" : "ville"} />}
              {verifiedCount > 0 && <Stat value={verifiedCount} label={verifiedCount > 1 ? "vendeurs vérifiés" : "vendeur vérifié"} />}
            </dl>
          </motion.div>
        </motion.div>

        {/* Scène produit : téléphone en relief, orbites et cartes de verre. */}
        <motion.div
          style={reduce ? undefined : { y: stageY }}
          className="relative mx-auto hidden w-full max-w-[400px] sm:block lg:max-w-[520px] lg:justify-self-end"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 1.3, ease: EASE, delay: 0.2 }}
            className="relative"
            style={{ perspective: 1400 }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="absolute aspect-square w-[118%] rounded-full bg-[radial-gradient(circle,rgb(var(--faso-gold)/.38),transparent_62%)] blur-2xl" />
              <div className="fx-orbit aspect-square w-[112%] text-faso-gold"><b /></div>
              <div className="fx-orbit fx-orbit-reverse aspect-square w-[84%] text-faso-green"><b /></div>
              <div className="fx-orbit aspect-square w-[58%] border-solid text-faso-red [animation-duration:36s]"><b /></div>
            </div>

            <motion.div
              style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative mx-auto w-[74%]"
            >
              <div className="fx-float">
                <Image
                  src="/hero-mockup-cutout.webp"
                  alt="Un smartphone affichant une boutique FasoLink, tenu dans une main"
                  width={950}
                  height={1655}
                  priority
                  sizes="(max-width: 1023px) 300px, 390px"
                  className="h-auto w-full drop-shadow-[0_40px_50px_rgba(26,17,9,.28)]"
                  unoptimized
                />
              </div>
            </motion.div>

            <ParallaxLayer x={smoothX} y={smoothY} depth={-34} className="absolute left-[-6%] top-[12%] lg:left-[-12%]">
              <FloatIn delay={0.9} className="fx-float-slow">
                {spotlight ? (
                  <Link
                    href={`/boutiques/${spotlight.shop.id}/produits/${spotlight.product.id}`}
                    className="fx-glass flex w-[15.5rem] items-center gap-3 rounded-2xl p-2.5 pr-3.5 transition-transform hover:scale-[1.03]"
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[linear-gradient(145deg,#fff,#efe6d8)]">
                      <Image src={spotlight.product.image_url!} alt="" fill sizes="56px" className="object-contain p-1.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-faso-green-dark">
                        <span className="fx-live-dot" aria-hidden="true" /> {spotlight.product.availability === "on_order" ? "Sur commande" : "Disponible"}
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-bold text-ink">{spotlight.product.name}</span>
                      <span className="block text-sm font-extrabold text-faso-green-dark">{formatCFA(spotlight.product.price)}</span>
                    </span>
                  </Link>
                ) : (
                  <div className="fx-glass flex items-center gap-3 rounded-2xl p-3 pr-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-faso-red/10 text-faso-red"><Smartphone className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="text-sm font-bold text-ink">Téléphones, PC, audio</span>
                  </div>
                )}
              </FloatIn>
            </ParallaxLayer>

            <ParallaxLayer x={smoothX} y={smoothY} depth={42} className="absolute right-[-4%] top-[44%] lg:right-[-10%]">
              <FloatIn delay={1.15} className="fx-float">
                <div className="fx-glass w-[14.5rem] rounded-2xl p-3">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-ink-muted">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#25D366] text-white"><MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /></span>
                    Contact direct
                  </div>
                  <p className="mt-2.5 rounded-2xl rounded-tl-md bg-[#dcf8c6] px-3 py-2 text-xs leading-5 text-[#173a22]">
                    Bonjour, {spotlight ? <>le <b className="font-bold">{spotlight.product.name}</b></> : "ce produit"} est-il disponible&nbsp;?
                  </p>
                  <div className="mt-2 flex w-fit items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm" aria-hidden="true">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="h-1.5 w-1.5 rounded-full bg-ink-muted"
                        animate={reduce ? undefined : { opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.16 }}
                      />
                    ))}
                  </div>
                </div>
              </FloatIn>
            </ParallaxLayer>

            <ParallaxLayer x={smoothX} y={smoothY} depth={-22} className="absolute bottom-[10%] left-[-2%] lg:left-[-6%]">
              <FloatIn delay={1.4} className="fx-float">
                <div className="fx-glass flex items-center gap-3 rounded-2xl p-2.5 pr-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(140deg,#f8c46e,#c97f16)] text-white shadow-[0_8px_18px_-8px_rgb(201_127_22/.8)]">
                    {verifiedCount > 0 ? <BadgeCheck className="h-5 w-5" aria-hidden="true" /> : <MapPin className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-ink">
                      {verifiedCount > 0
                        ? `${verifiedCount} vendeur${verifiedCount > 1 ? "s" : ""} vérifié${verifiedCount > 1 ? "s" : ""}`
                        : "Vendeurs locaux"}
                    </span>
                    <span className="block text-[11px] font-medium text-ink-muted">
                      {cityCount > 0 ? `${cityCount} ville${cityCount > 1 ? "s" : ""} au Burkina Faso` : "Partout au Burkina Faso"}
                    </span>
                  </span>
                </div>
              </FloatIn>
            </ParallaxLayer>
          </motion.div>
        </motion.div>
      </div>

      <Link
        href="#produits"
        className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-ink-muted transition-colors hover:text-ink lg:flex"
      >
        <span className="relative h-9 w-[22px] rounded-full border-[1.5px] border-current" aria-hidden="true">
          <motion.span
            className="absolute left-1/2 top-1.5 h-2 w-[3px] -translate-x-1/2 rounded-full bg-current"
            animate={reduce ? undefined : { y: [0, 10, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        Découvrir
      </Link>
    </section>
  );
}

function findSpotlight(shops: ShopWithProducts[]) {
  for (const shop of shops) {
    const product = shop.products.find((item) => item.image_url && item.availability !== "out_of_stock");
    if (product) return { shop, product };
  }
  return null;
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="flex items-baseline gap-1.5">
        <span className="faso-tabular text-2xl font-extrabold tracking-tight text-ink">{value.toLocaleString("fr-FR")}</span>
        <span className="text-xs font-semibold text-ink-muted">{label}</span>
      </dd>
    </div>
  );
}

function ParallaxLayer({
  x,
  y,
  depth,
  className,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  depth: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useSafeReducedMotion();
  const tx = useTransform(x, (value) => value * depth);
  const ty = useTransform(y, (value) => value * depth);
  return (
    <motion.div style={reduce ? undefined : { x: tx, y: ty }} className={className}>
      {children}
    </motion.div>
  );
}

function FloatIn({ delay, className, children }: { delay: number; className?: string; children: React.ReactNode }) {
  const reduce = useSafeReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.85, y: 18, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE, delay }}
    >
      <div className={className}>{children}</div>
    </motion.div>
  );
}
