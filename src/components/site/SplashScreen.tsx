"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { gsap as GsapInstance } from "gsap";

/**
 * Animation d'ouverture FasoLink — « Le Lien ».
 *
 * Les cinq pièces du monogramme (le F et le L, chacun sur sa propre tige)
 * arrivent de la profondeur avec une vraie épaisseur, s'emboîtent, puis le
 * rivet d'or se verrouille au point de contact : c'est le geste de la marque.
 *
 * Contraintes conservées :
 * - lecture unique par session (décision prise par le script du layout avant
 *   le premier affichage, `window.__fasolinkSplashShouldPlay`) ;
 * - logo statique dans le HTML serveur, visible avant le JavaScript ;
 * - sécurité CSS `.fasolink-splash` (masquage après 12 s quoi qu'il arrive) ;
 * - GSAP n'est téléchargé que si l'intro joue réellement ;
 * - clic ou Échap pour passer ; aucune intro si les animations sont réduites.
 *
 * Note 3D : un filtre ou une opacité < 1 sur un élément `preserve-3d`
 * l'aplatit. On n'anime donc ni flou ni opacité sur les conteneurs 3D.
 */

type Gsap = typeof GsapInstance;

type Piece = {
  id: string;
  d: string;
  /** Centre de la pièce dans le repère 48×48, en pourcentage. */
  origin: string;
  /** Position de départ dans l'espace (pourcentages de la taille du logo, px en z). */
  from: { xPercent: number; yPercent: number; z: number; rotationX: number; rotationY: number; rotationZ: number };
};

const PIECES: Piece[] = [
  { id: "f-stem", d: "M8 6h6v26H8z", origin: "22.9% 39.6%", from: { xPercent: -190, yPercent: -30, z: -520, rotationX: -40, rotationY: 120, rotationZ: 0 } },
  { id: "f-top", d: "M14 6h10l4 4v2H14z", origin: "43.75% 18.75%", from: { xPercent: -90, yPercent: -210, z: 320, rotationX: 160, rotationY: 0, rotationZ: -30 } },
  { id: "f-mid", d: "M14 16h10v6H14z", origin: "39.6% 39.6%", from: { xPercent: -240, yPercent: 90, z: -220, rotationX: 0, rotationY: -140, rotationZ: 0 } },
  { id: "l-stem", d: "M24 22h6v20h-6z", origin: "56.25% 66.7%", from: { xPercent: 200, yPercent: 180, z: -420, rotationX: -120, rotationY: 0, rotationZ: 20 } },
  { id: "l-foot", d: "M24 36h14v2l-4 4H24z", origin: "64.6% 81.25%", from: { xPercent: 240, yPercent: 40, z: 360, rotationX: 0, rotationY: 150, rotationZ: 40 } },
];

const RIVET_D = "M24 17l5 5-5 5-5-5z";
const RIVET_ORIGIN = "50% 45.83%";

/** Couches d'extrusion : la face avant, puis des tranches de plus en plus sombres. */
const DEPTH = 7;
const IVORY_SIDES = ["#c9b391", "#ad9573", "#917a5b", "#766148", "#5d4a37", "#463729", "#33281e"];
const GOLD_SIDES = ["#d99a35", "#c4852a", "#ab7022", "#915c1b", "#774a16", "#5f3a11", "#4a2d0d"];

const PARTICLES = 28;
const PARTICLE_COLORS = ["#d62828", "#f4a93c", "#1f9254", "#f4eee2"];
const SPARKS = 10;

const MARK_STYLE = {
  width: "var(--fl-mark)",
  height: "var(--fl-mark)",
  transformStyle: "preserve-3d",
} as CSSProperties;

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const boot = window as Window & { __fasolinkSplashShouldPlay?: boolean };
    // Le script synchrone du layout a déjà lu le stockage avant le premier
    // affichage : on partage sa décision, sans flash d'hydratation.
    if (boot.__fasolinkSplashShouldPlay === false) {
      document.documentElement.dataset.fasolinkSplashSeen = "true";
      setVisible(false);
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let context: ReturnType<Gsap["context"]> | undefined;
    const timers: number[] = [];
    document.body.style.overflow = "hidden";

    const finish = () => {
      if (cancelled) return;
      document.body.style.overflow = "";
      setVisible(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") skipRef.current?.();
    };
    window.addEventListener("keydown", onKey);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Pas d'intro pour qui demande moins d'animations. (La règle CSS globale
      // ramène de toute façon la sécurité `.fasolink-splash` à 0,01 ms, ce qui
      // masque l'écran dès le premier affichage : inutile de bloquer le
      // défilement derrière un écran invisible.)
      finish();
    } else {
      // Filet de sécurité si GSAP ne se charge pas (réseau très lent).
      timers.push(window.setTimeout(finish, 9000));
      import("gsap")
        .then(({ gsap }) => {
          if (cancelled) return;
          context = gsap.context(() => {
            const timeline = buildIntro(gsap, root, finish);
            skipRef.current = () => {
              if (timeline.time() < timeline.labels.outro) timeline.seek("outro");
            };
          }, root);
        })
        .catch(finish);
    }

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("keydown", onKey);
      skipRef.current = null;
      context?.revert();
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      onClick={() => skipRef.current?.()}
      className="fasolink-splash fixed inset-0 z-[100] isolate overflow-hidden bg-[#0b0806] [--fl-mark:clamp(132px,36vmin,230px)]"
      style={{ backgroundColor: "#0b0806" }}
      aria-hidden="true"
    >
      {/* Matières partagées par toutes les couches SVG. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="fl-ivory" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".55" stopColor="#f4eee2" />
            <stop offset="1" stopColor="#dccdb4" />
          </linearGradient>
          <linearGradient id="fl-gold" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#c97f16" />
            <stop offset=".5" stopColor="#f4a93c" />
            <stop offset="1" stopColor="#ffd88a" />
          </linearGradient>
          <linearGradient id="fl-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".5" stopColor="#fff" stopOpacity=".95" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="fl-clip">
            {PIECES.map((piece) => <path key={piece.id} d={piece.d} />)}
            <path d={RIVET_D} />
          </clipPath>
        </defs>
      </svg>

      {/* Décor : nuit chaude, fuites de lumière, sol en perspective, grain. */}
      <div data-bg className="pointer-events-none absolute inset-0 opacity-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,#2a1d12_0%,#0b0806_70%)]" />
        <i data-leak className="absolute left-[18%] top-[22%] h-[42vmax] w-[42vmax] rounded-full bg-[radial-gradient(circle,rgba(244,169,60,.22),transparent_62%)] blur-3xl" />
        <i data-leak className="absolute right-[10%] top-[40%] h-[38vmax] w-[38vmax] rounded-full bg-[radial-gradient(circle,rgba(31,146,84,.2),transparent_62%)] blur-3xl" />
        <i data-leak className="absolute bottom-[-10%] left-[35%] h-[36vmax] w-[36vmax] rounded-full bg-[radial-gradient(circle,rgba(214,40,40,.18),transparent_62%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-[46%] [perspective:520px]">
          <div
            data-floor
            className="absolute inset-x-[-60%] bottom-[-30%] h-[180%] origin-bottom opacity-0 [transform:rotateX(74deg)]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(244,169,60,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(244,169,60,.14) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              WebkitMaskImage: "linear-gradient(to top, #000 10%, transparent 75%)",
              maskImage: "linear-gradient(to top, #000 10%, transparent 75%)",
            }}
          />
        </div>
        <div className="fx-grain fx-grain-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,.65)_100%)]" />
      </div>

      {/* Logo statique : présent dans le HTML serveur, avant tout JavaScript. */}
      <div data-static className="absolute inset-0 flex flex-col items-center justify-center">
        <svg viewBox="0 0 48 48" width="104" height="104">
          <path d="M8 6h16l4 4v2H14v4h10v6H14v10H8z" fill="#F4EEE2" />
          <path d="M24 22h6v14h8v2l-4 4h-10z" fill="#F4EEE2" />
          <path d="m24 17 5 5-5 5-5-5z" fill="#FBC66A" />
        </svg>
        <div className="mt-4 font-display text-[1.4rem] leading-none tracking-[-0.03em] text-[#F4EEE2]">
          <span className="font-medium">Faso</span>
          <span className="font-extrabold">Link</span>
        </div>
      </div>

      {/* Scène animée (révélée par GSAP). */}
      <div data-stage className="invisible absolute inset-0 grid place-items-center" style={{ perspective: 1100 }}>
        <div data-content className="flex flex-col items-center">
          <div data-shake>
            <div data-mark className="relative" style={MARK_STYLE}>
              {/* Rubans tricolores en orbite, derrière le logo. */}
              <svg
                data-orbits
                viewBox="0 0 100 100"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[230%] w-[230%] overflow-visible"
                style={{ transform: "translate(-50%,-50%) translateZ(-40px)" }}
              >
                {[
                  { r: 46, color: "#d62828" },
                  { r: 41.5, color: "#f4a93c" },
                  { r: 37, color: "#1f9254" },
                ].map((ring) => (
                  <circle
                    key={ring.r}
                    data-ribbon
                    cx="50"
                    cy="50"
                    r={ring.r}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth=".7"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * ring.r}
                    strokeDashoffset={2 * Math.PI * ring.r}
                  />
                ))}
              </svg>

              {/* Particules qui convergent vers le point de contact. */}
              <div className="pointer-events-none absolute left-1/2 top-[45.83%]">
                {Array.from({ length: PARTICLES }, (_, index) => (
                  <i
                    key={index}
                    data-particle
                    className="absolute -left-1 -top-1 block h-2 w-2 rounded-full opacity-0"
                    style={{
                      background: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
                      boxShadow: `0 0 12px ${PARTICLE_COLORS[index % PARTICLE_COLORS.length]}`,
                    }}
                  />
                ))}
              </div>

              {PIECES.map((piece) => (
                <Extruded key={piece.id} id={piece.id} d={piece.d} origin={piece.origin} front="url(#fl-ivory)" sides={IVORY_SIDES} />
              ))}
              <Extruded id="rivet" d={RIVET_D} origin={RIVET_ORIGIN} front="url(#fl-gold)" sides={GOLD_SIDES} />

              {/* Reflet qui balaie la face avant une fois le logo assemblé. */}
              <svg
                viewBox="0 0 48 48"
                className="pointer-events-none absolute inset-0 h-full w-full"
                style={{ transform: "translateZ(1px)" }}
              >
                <g clipPath="url(#fl-clip)">
                  <rect data-sheen x="-30" y="-12" width="14" height="72" fill="url(#fl-sheen)" opacity=".85" transform="rotate(22 24 24)" />
                </g>
              </svg>

              {/* Impact du rivet : éclair, flare anamorphique, ondes de choc, étincelles. */}
              <div className="pointer-events-none absolute left-1/2 top-[45.83%]" style={{ transform: "translateZ(3px)" }}>
                <i data-flash className="absolute -left-16 -top-16 block h-32 w-32 rounded-full opacity-0 bg-[radial-gradient(circle,rgba(255,236,190,1)_0%,rgba(251,198,106,.55)_30%,transparent_70%)]" />
                <i data-flare className="absolute -top-px left-[-45vw] block h-[2px] w-[90vw] opacity-0 bg-[linear-gradient(90deg,transparent,rgba(251,198,106,.9)_40%,#fff_50%,rgba(251,198,106,.9)_60%,transparent)]" />
                <i data-shock className="absolute -left-10 -top-10 block h-20 w-20 rounded-full border border-[#fbc66a] opacity-0" />
                <i data-shock className="absolute -left-10 -top-10 block h-20 w-20 rounded-full border border-[#f4eee2]/70 opacity-0" />
                {Array.from({ length: SPARKS }, (_, index) => (
                  <i key={index} data-spark className="absolute -left-px -top-[7px] block h-[14px] w-[2px] rounded-full bg-gradient-to-b from-white to-[#f4a93c] opacity-0" />
                ))}
              </div>
            </div>
          </div>

          {/* Nom de marque, lettre par lettre, puis signature. */}
          <div className="mt-[clamp(1.4rem,4vmin,2.2rem)] font-display text-[clamp(2.1rem,7.5vmin,3.6rem)] leading-none tracking-[-0.045em] text-[#F4EEE2] [perspective:700px]">
            {"Faso".split("").map((char, index) => (
              <span key={`f${index}`} data-char className="inline-block font-medium opacity-0">{char}</span>
            ))}
            {"Link".split("").map((char, index) => (
              <span key={`l${index}`} data-char className="inline-block font-extrabold opacity-0">{char}</span>
            ))}
          </div>
          <span data-thread className="mt-4 block h-[2px] w-[clamp(7rem,22vmin,11rem)] origin-center scale-x-0 rounded-full bg-[linear-gradient(90deg,#d62828,#f4a93c_52%,#1f9254)]" />
          <span className="mt-4 block overflow-hidden pb-1">
            <span data-tagline className="block translate-y-[110%] font-serif-accent text-[clamp(1rem,3.2vmin,1.35rem)] text-[#f8d08a]">
              La tech du Faso, à portée de main.
            </span>
          </span>
        </div>
      </div>

      {/* Rayon lumineux d'ouverture, à la hauteur du logo. */}
      <i data-streak className="pointer-events-none absolute left-[5%] top-1/2 block h-[2px] w-[90%] origin-center scale-x-0 opacity-0 bg-[linear-gradient(90deg,transparent,rgba(251,198,106,.85)_35%,#fff_50%,rgba(251,198,106,.85)_65%,transparent)] shadow-[0_0_24px_4px_rgba(244,169,60,.45)]" />
    </div>
  );
}

/** Une pièce du monogramme, extrudée en couches empilées le long de l'axe Z. */
function Extruded({ id, d, origin, front, sides }: { id: string; d: string; origin: string; front: string; sides: string[] }) {
  return (
    <div
      data-piece={id}
      className="absolute inset-0 opacity-0"
      style={{ transformStyle: "preserve-3d", transformOrigin: origin }}
    >
      {Array.from({ length: DEPTH }, (_, index) => DEPTH - index).map((layer) => (
        <svg
          key={layer}
          viewBox="0 0 48 48"
          className="absolute inset-0 h-full w-full overflow-visible"
          style={{ transform: `translateZ(${-layer * 2.8}px)` }}
        >
          <path d={d} fill={sides[layer - 1]} />
        </svg>
      ))}
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full overflow-visible">
        <path d={d} fill={front} />
      </svg>
    </div>
  );
}

/** Construit et lance la chorégraphie ; renvoie la timeline principale. */
function buildIntro(gsap: Gsap, root: HTMLElement, done: () => void) {
  const q = gsap.utils.selector(root);
  const mark = q("[data-mark]")[0] as HTMLElement;
  const rivet = q('[data-piece="rivet"]')[0] as HTMLElement;
  const random = gsap.utils.random;

  // Le rayon d'ouverture passe exactement à la hauteur du point de contact.
  const markBox = mark.getBoundingClientRect();
  gsap.set(q("[data-streak]"), { top: markBox.top + markBox.height * 0.4583 });

  // États de départ.
  gsap.set(q("[data-stage]"), { autoAlpha: 1 });
  gsap.set(mark, { rotationY: -48, rotationX: 26, z: -160 });
  PIECES.forEach((piece) => gsap.set(q(`[data-piece="${piece.id}"]`), { ...piece.from }));
  gsap.set(rivet, { z: 360, scale: 1.9, rotationZ: -225, rotationX: 70 });
  gsap.set(q("[data-char]"), { yPercent: 110, rotationX: -90, transformOrigin: "50% 100%" });

  // Vie ambiante, indépendante de la timeline principale.
  gsap.to(q("[data-floor]"), { backgroundPosition: "0px 64px", duration: 1.1, repeat: -1, ease: "none" });
  q("[data-leak]").forEach((leak, index) => {
    gsap.to(leak, { x: random(-60, 60), y: random(-40, 40), scale: random(0.85, 1.2), duration: random(3, 5), repeat: -1, yoyo: true, ease: "sine.inOut", delay: index * 0.2 });
  });

  const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: done });

  // 1. La nuit s'installe, le rayon d'or s'ouvre puis se referme.
  tl.to(q("[data-static]"), { autoAlpha: 0, duration: 0.25, ease: "power1.out" }, 0)
    .to(q("[data-bg]"), { opacity: 1, duration: 0.9, ease: "power2.out" }, 0)
    .fromTo(q("[data-floor]"), { opacity: 0 }, { opacity: 0.6, duration: 1.6, ease: "power3.out" }, 0.1)
    .to(q("[data-streak]"), { scaleX: 1, opacity: 1, duration: 0.55 }, 0.1)
    .to(q("[data-streak]"), { scaleX: 0, opacity: 0, duration: 0.4, ease: "expo.in" }, 0.6);

  // 2. Les particules convergent vers le futur point de contact.
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.6;
  q("[data-particle]").forEach((particle, index) => {
    const angle = (index / PARTICLES) * Math.PI * 2 + random(-0.2, 0.2);
    const distance = radius * random(0.55, 1);
    const start = random(0.08, 0.4);
    const duration = random(0.75, 1.05);
    tl.fromTo(
      particle,
      { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, opacity: 0, scale: random(0.6, 1.7) },
      { x: 0, y: 0, opacity: 1, scale: 0.3, duration, ease: "power3.in" },
      start,
    ).to(particle, { opacity: 0, duration: 0.12, ease: "none" }, start + duration - 0.06);
  });

  // 3. Assemblage 3D : les pièces arrivent de la profondeur, la caméra pivote.
  // La caméra se redresse lentement : l'épaisseur des pièces reste lisible.
  tl.to(mark, { rotationY: -14, rotationX: 8, z: 0, duration: 1.2, ease: "power3.out" }, 0.5);
  PIECES.forEach((piece, index) => {
    const at = 0.5 + index * 0.07;
    const target = q(`[data-piece="${piece.id}"]`);
    tl.to(target, { opacity: 1, duration: 0.18, ease: "none" }, at).to(
      target,
      { xPercent: 0, yPercent: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, duration: 1.05 },
      at,
    );
  });

  // 4. Le rivet d'or tombe et verrouille le lien.
  tl.to(rivet, { opacity: 1, duration: 0.12, ease: "none" }, 1.2).to(
    rivet,
    { z: 0, scale: 1, rotationZ: 0, rotationX: 0, duration: 0.5, ease: "power4.in" },
    1.2,
  );
  tl.addLabel("impact", 1.7);

  tl.fromTo(q("[data-flash]"), { scale: 0.3, opacity: 0 }, { scale: 2.4, opacity: 1, duration: 0.12, ease: "power2.out" }, "impact")
    .to(q("[data-flash]"), { opacity: 0, duration: 0.55, ease: "power2.out" }, "impact+=0.12")
    .fromTo(q("[data-flare]"), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.18 }, "impact")
    .to(q("[data-flare]"), { scaleX: 1.35, opacity: 0, duration: 0.65, ease: "power2.out" }, "impact+=0.18")
    .fromTo(q("[data-shock]"), { scale: 0.2, opacity: 0.95 }, { scale: 5, opacity: 0, duration: 1, stagger: 0.1, immediateRender: false }, "impact")
    .fromTo(
      q("[data-shake]"),
      { x: 0, y: 0 },
      { keyframes: [{ x: -5, y: 3 }, { x: 4, y: -3 }, { x: -3, y: 2 }, { x: 2, y: -1 }, { x: 0, y: 0 }], duration: 0.3, ease: "none" },
      "impact",
    );

  q("[data-spark]").forEach((spark, index) => {
    const angle = (index / SPARKS) * Math.PI * 2 + random(-0.15, 0.15);
    const distance = random(60, 120);
    tl.fromTo(
      spark,
      { x: 0, y: 0, rotation: (angle * 180) / Math.PI + 90, opacity: 1, scaleY: 1.4 },
      { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, opacity: 0, scaleY: 0.4, duration: random(0.55, 0.85), immediateRender: false },
      "impact",
    );
  });

  // 5. Reflet métallique et rubans tricolores en orbite.
  tl.fromTo(q("[data-sheen]"), { attr: { x: -30 } }, { attr: { x: 62 }, duration: 0.95, ease: "power2.inOut" }, "impact+=0.2");
  q("[data-ribbon]").forEach((ribbon, index) => {
    const length = Number(ribbon.getAttribute("stroke-dasharray")) || 0;
    tl.fromTo(
      ribbon,
      { strokeDashoffset: length, rotation: -90 + index * 40, svgOrigin: "50 50", opacity: 1 },
      { strokeDashoffset: length * 0.38, rotation: 200 + index * 40, svgOrigin: "50 50", duration: 1.35, ease: "expo.inOut", immediateRender: false },
      `impact-=${0.15 - index * 0.07}`,
    ).to(ribbon, { opacity: 0, duration: 0.4, ease: "power1.out" }, `impact+=${1 + index * 0.05}`);
  });

  // Respiration 3D : le logo pivote doucement pour révéler son volume.
  tl.to(mark, { rotationY: 16, rotationX: -7, duration: 1.1, ease: "sine.inOut" }, "impact")
    .to(mark, { rotationY: 0, rotationX: 0, duration: 0.6, ease: "power2.inOut" }, "impact+=1.1");

  // 6. Le nom se déplie lettre par lettre, puis la signature.
  tl.to(q("[data-char]"), { yPercent: 0, rotationX: 0, opacity: 1, duration: 0.9, stagger: 0.035 }, "impact+=0.08")
    .to(q("[data-thread]"), { scaleX: 1, duration: 0.8, ease: "expo.inOut" }, "impact+=0.32")
    .to(q("[data-tagline]"), { y: 0, yPercent: 0, duration: 0.8 }, "impact+=0.42");

  // 7. Sortie : l'iris se referme sur le rivet d'or et révèle le site.
  tl.addLabel("outro", "impact+=1.3");
  tl.to(q("[data-content]"), { scale: 0.94, duration: 0.5, ease: "power2.in" }, "outro").fromTo(
    root,
    { clipPath: () => iris(rivet, 150) },
    { clipPath: () => iris(rivet, 0), duration: 0.75, ease: "expo.inOut", immediateRender: false },
    "outro+=0.05",
  );

  return tl;
}

/** Cercle de découpe centré sur le rivet (rayon en % de la diagonale). */
function iris(rivet: HTMLElement, radius: number) {
  const box = rivet.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height * 0.4583;
  return `circle(${radius}% at ${x}px ${y}px)`;
}
