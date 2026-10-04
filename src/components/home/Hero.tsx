"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Store } from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { ButtonLink } from "@/components/ui/Button";
import { PredictiveSearch } from "@/components/home/PredictiveSearch";

const HERO_VIDEO_SOURCES = Array.from({ length: 8 }, (_, index) =>
  `/videos/hero/clip-${String(index + 1).padStart(2, "0")}.mp4`,
);
const HERO_VIDEO_POSTER = "/videos/hero/poster.jpg";

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

function HeroVideoBackdrop({ reducedMotion }: { reducedMotion: boolean }) {
  const [enabled, setEnabled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const failedClips = useRef(new Set<number>());

  useEffect(() => {
    if (reducedMotion) {
      setEnabled(false);
      return;
    }
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (connection?.saveData || connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g") {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  }, [reducedMotion]);

  const attemptPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!enabled || !video || document.hidden) return;
    // iOS Safari requires these to be set on the element before play().
    video.muted = true;
    video.playsInline = true;
    void video.play().catch(() => {
      // Autoplay can be temporarily refused (for example Low Power Mode).
      // Keep the poster visible and retry on canplay/visibility changes.
      setPlaying(false);
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onVisibilityChange = () => {
      if (document.hidden) {
        videoRef.current?.pause();
        setPlaying(false);
      } else {
        attemptPlayback();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", attemptPlayback);
    attemptPlayback();
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", attemptPlayback);
    };
  }, [attemptPlayback, currentIndex, enabled]);

  const handleError = () => {
    setPlaying(false);
    failedClips.current.add(currentIndex);
    const nextIndex = HERO_VIDEO_SOURCES.findIndex((_, index) => !failedClips.current.has(index));
    if (nextIndex === -1) setEnabled(false);
    else setCurrentIndex(nextIndex);
  };

  return (
    <>
      <div aria-hidden="true" className="hero-video-fallback" />
      {enabled && (
        <video
          ref={videoRef}
          aria-hidden="true"
          className={`hero-video-layer${playing ? " is-playing" : ""}`}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={HERO_VIDEO_POSTER}
          src={HERO_VIDEO_SOURCES[currentIndex]}
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
          onWaiting={() => setPlaying(false)}
          onCanPlay={attemptPlayback}
          onEnded={() => {
            setPlaying(false);
            setCurrentIndex((index) => {
              for (let offset = 1; offset <= HERO_VIDEO_SOURCES.length; offset += 1) {
                const next = (index + offset) % HERO_VIDEO_SOURCES.length;
                if (!failedClips.current.has(next)) return next;
              }
              return index;
            });
          }}
          onError={handleError}
        />
      )}
    </>
  );
}

export function Hero({ shops }: { shops: ShopWithProducts[] }) {
  const reduce = useReducedMotion();
  const verifiedCount = shops.filter((shop) => shop.verification_status === "verified").length;
  const cityCount = new Set(shops.map((shop) => shop.city).filter(Boolean)).size;

  return (
    <section className="hero-cinematic relative isolate overflow-hidden bg-[#05070b] text-white">
      <HeroVideoBackdrop reducedMotion={Boolean(reduce)} />
      <div aria-hidden="true" className="hero-cinematic-shade pointer-events-none absolute inset-0 z-[1]" />
      <div aria-hidden="true" className="hero-cinematic-glow pointer-events-none absolute inset-0 z-[2]" />

      <div className="container-faso relative z-10 flex min-h-[min(760px,calc(100svh-5rem))] flex-col justify-center py-12 sm:py-16 lg:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.08 } },
          }}
          className="max-w-[760px]"
        >
          <motion.div variants={reveal} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
            <span className="hero-cinematic-pill inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold tracking-wide shadow-lg backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#77dda2] opacity-45 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#77dda2]" />
              </span>
              La tech locale, choisie au Burkina Faso
            </span>
          </motion.div>

          <motion.h1
            variants={reveal}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-4xl text-[clamp(2.85rem,7vw,5.5rem)] font-extrabold leading-[0.96] tracking-[-0.065em] text-white"
          >
            La tech
            <br />
            du Faso,
            <br />
            <span className="hero-cinematic-accent relative inline-block pl-[0.08em]">
              à portée de main.
              <svg className="absolute -bottom-2 left-1 h-3 w-[94%] text-[#f0ad47]" viewBox="0 0 300 16" fill="none" aria-hidden="true">
                <path d="M4 11C66 3 178 1 295 8" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8"
          >
            Téléphones, ordinateurs et accessoires : découvrez les vendeurs
            tech près de vous, comparez leurs offres et échangez directement
            avec eux sur WhatsApp.
          </motion.p>

          <motion.div
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-xl"
          >
            <PredictiveSearch shops={shops} />
          </motion.div>

          <motion.div
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 flex flex-col gap-3 min-[420px]:flex-row"
          >
            <ButtonLink href="#produits" size="lg" variant="primary" className="group shadow-[0_14px_35px_-16px_rgba(215,38,42,.8)]">
              Explorer les produits <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink
              href="/vendeur/inscription"
              size="lg"
              variant="outline"
              className="hero-cinematic-secondary border-white/20 bg-white/[.08] text-white shadow-none backdrop-blur-xl hover:border-white/45 hover:bg-white/15 hover:text-white"
            >
              <Store className="h-4 w-4" /> Vendre sur FasoLink
            </ButtonLink>
          </motion.div>

          <motion.dl
            variants={reveal}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="hero-cinematic-stats mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-5"
          >
            <Stat value={shops.length.toLocaleString("fr-FR")} label="boutiques tech" />
            <span aria-hidden="true" className="hidden h-8 w-px bg-white/15 min-[420px]:block" />
            <Stat value={cityCount.toLocaleString("fr-FR")} label="villes représentées" />
            <span aria-hidden="true" className="hidden h-8 w-px bg-white/15 min-[650px]:block" />
            <Stat value={verifiedCount.toLocaleString("fr-FR")} label="vendeurs vérifiés" />
          </motion.dl>
        </motion.div>

        <Link
          href="#produits"
          className="hero-cinematic-scroll absolute bottom-6 right-10 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/55 transition-colors hover:text-white lg:flex"
        >
          Défilez pour découvrir <ArrowDown className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">{value}</dt>
      <dd className="mt-0.5 text-[11px] font-medium text-white/60 sm:text-xs">{label}</dd>
    </div>
  );
}
