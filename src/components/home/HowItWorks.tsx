"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import { MessageCircle, Search, Store } from "lucide-react";
import { RevealText } from "@/components/fx/RevealText";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  { icon: Search, title: "Explorez", text: "Téléphones, ordinateurs, audio et accessoires auprès de boutiques tech locales.", tone: "from-faso-red to-[#ef5b4d]" },
  { icon: Store, title: "Comparez", text: "Consultez les prix, les photos, le stock annoncé et les détails de chaque produit.", tone: "from-[#c97f16] to-faso-gold" },
  { icon: MessageCircle, title: "Échangez en direct", text: "Posez vos questions au vendeur sur WhatsApp avant de vous déplacer ou commander.", tone: "from-faso-green-dark to-[#36a269]" },
];

export function HowItWorks() {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section className="relative isolate overflow-hidden bg-white py-20 md:py-28">
      <div className="container-faso">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <span className="section-kicker">En trois gestes</span>
            </Reveal>
            <h2 className="fx-display mt-5 text-[clamp(2.3rem,4.6vw,3.8rem)] text-ink">
              <RevealText inView text="La bonne tech." className="block" />
              <RevealText inView text="Le bon vendeur." className="block" delay={0.1} />
              <span className="font-serif-accent fx-text-gradient block pb-1 text-[1.08em]">En direct.</span>
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-base leading-7 text-ink-muted">
                Repérez les appareils, vérifiez les informations publiées et échangez directement avec une boutique locale avant votre achat.
              </p>
            </Reveal>
          </div>

          <div ref={ref} className="relative">
            <div aria-hidden="true" className="absolute bottom-10 left-[3.1rem] top-10 w-px bg-clay-200 sm:left-[4.1rem]">
              <motion.div
                className="h-full w-full origin-top bg-gradient-to-b from-faso-red via-faso-gold to-faso-green"
                style={{ scaleY: reduce ? 1 : progress }}
              />
            </div>
            <ol className="space-y-5">
              {STEPS.map((step, index) => (
                <Reveal as="li" key={step.title} delay={index * 0.08}>
                  <article
                    data-spotlight
                    className="fx-spotlight group relative flex gap-5 overflow-hidden rounded-[1.75rem] border border-clay-100 bg-clay-50 p-5 transition-all duration-500 hover:bg-white sm:gap-7 sm:p-7"
                  >
                    <span className={`relative z-10 grid h-[3.7rem] w-[3.7rem] shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${step.tone} text-white shadow-[0_14px_30px_-14px_rgb(26_17_9/.55)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105 sm:h-[4.7rem] sm:w-[4.7rem]`}>
                      <step.icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                    </span>
                    <div className="relative z-10 min-w-0 pt-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-[.18em] text-ink-muted">Étape 0{index + 1}</span>
                      <h3 className="mt-1.5 text-2xl font-extrabold tracking-[-.03em] text-ink">{step.title}</h3>
                      <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">{step.text}</p>
                    </div>
                    <span aria-hidden="true" className="fx-display pointer-events-none absolute -bottom-6 right-3 select-none text-[7.5rem] text-ink/[.04] transition-colors duration-500 group-hover:text-faso-gold/[.14]">
                      0{index + 1}
                    </span>
                  </article>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
