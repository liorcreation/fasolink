"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import { Play } from "lucide-react";
import { RevealText } from "@/components/fx/RevealText";
import { Reveal } from "@/components/ui/Reveal";

/** Le film de marque : le cadre s'ouvre et se redresse au fil du défilement. */
export function VideoShowcase() {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], [48, 28]);

  return (
    <section aria-labelledby="fasolink-video-title" className="relative isolate overflow-hidden bg-clay-50 py-20 sm:py-24 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[40rem] w-[80rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(var(--faso-green)/.12),transparent_60%)]" />
      <div className="container-faso relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="section-kicker"><Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> Le film FasoLink</span>
          </Reveal>
          <h2 id="fasolink-video-title" className="fx-display mt-5 text-[clamp(2.3rem,5vw,4rem)] text-ink">
            <RevealText inView text="45 secondes pour" className="block" />
            <span className="font-serif-accent fx-text-gradient block pb-1 text-[1.08em]">tout comprendre.</span>
          </h2>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-muted md:text-lg">
              Explorez les boutiques, comparez les produits et échangez directement avec les vendeurs tech du Burkina Faso.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="mx-auto mt-12 max-w-6xl sm:mt-16" style={{ perspective: 1600 }}>
          <motion.div
            style={reduce ? { borderRadius: 28 } : { scale, rotateX, borderRadius: radius }}
            className="relative overflow-hidden bg-gradient-to-br from-faso-green/80 via-faso-gold/60 to-faso-red/70 p-[1.5px] shadow-[0_60px_120px_-60px_rgb(26_17_9/.65),0_30px_60px_-40px_rgb(var(--faso-green)/.35)]"
          >
            <motion.div style={reduce ? { borderRadius: 26 } : { borderRadius: radius }} className="overflow-hidden bg-[#171412]">
              <video
                className="block aspect-video h-auto w-full bg-[#171412] object-contain"
                controls
                preload="none"
                playsInline
                poster="/fasolink-film-poster.webp"
                aria-label="Film de présentation de FasoLink, le catalogue tech du Burkina Faso"
              >
                <source src="/FasoLink_Film_45s_1920x1080.mp4" type="video/mp4" />
                Votre navigateur ne prend pas en charge la lecture vidéo.
              </video>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
