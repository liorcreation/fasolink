"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useSafeReducedMotion } from "@/components/fx/motion";
import {
  ArrowLeftRight,
  BadgeCheck,
  Clock3,
  MessageCircle,
  Navigation,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import type { ShopWithProducts } from "@/lib/database.types";
import { RevealText } from "@/components/fx/RevealText";
import { Reveal } from "@/components/ui/Reveal";
import { cn, formatCFA } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type Hit = { id: string; name: string; shop: string; price: number; image: string | null };

export function FeatureBento({ shops }: { shops: ShopWithProducts[] }) {
  const hits = useMemo<Hit[]>(
    () =>
      shops
        .flatMap((shop) => shop.products.map((product) => ({
          id: `${shop.id}-${product.id}`,
          name: product.name,
          shop: shop.name,
          price: product.price,
          image: product.image_url,
        })))
        .slice(0, 6),
    [shops],
  );

  return (
    <section aria-labelledby="bento-title" className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(var(--faso-gold)/.14),transparent_65%)]" />
      <div className="container-faso">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="section-kicker"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Pensé pour acheter sereinement</span>
          </Reveal>
          <h2 id="bento-title" className="fx-display mt-5 text-[clamp(2.3rem,5vw,4rem)] text-ink">
            <RevealText inView text="Tout ce qu’il faut pour" className="block" />
            <span className="font-serif-accent fx-text-gradient block pb-1 text-[1.08em]">bien choisir sa tech.</span>
          </h2>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-ink-muted">
              Recherche instantanée, comparaison, horaires, proximité et contact direct : FasoLink réunit l’essentiel avant de vous déplacer.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid auto-rows-[minmax(17rem,auto)] gap-4 md:grid-cols-6 md:gap-5">
          <Tile className="md:col-span-4" delay={0} icon={Search} kicker="Recherche prédictive" title="Trouvez en quelques lettres." text="Produits et boutiques s’affichent pendant la saisie, avec photo et prix.">
            <SearchDemo hits={hits} />
          </Tile>
          <Tile className="md:col-span-2 md:row-span-2" delay={0.08} icon={MessageCircle} kicker="Contact direct" title="Une question ? Écrivez au vendeur." text="Un message prêt à envoyer sur WhatsApp, sans intermédiaire.">
            <ChatDemo productName={hits[0]?.name} />
          </Tile>
          <Tile className="md:col-span-2" delay={0.12} icon={ArrowLeftRight} kicker="Comparateur" title="Jusqu’à 3 appareils côte à côte.">
            <CompareDemo />
          </Tile>
          <Tile className="md:col-span-2" delay={0.16} icon={Clock3} kicker="Horaires" title="Ouvert maintenant ? Vous le savez.">
            <HoursDemo />
          </Tile>
          <Tile className="md:col-span-3" delay={0.1} icon={Navigation} kicker="Proximité" title="Les boutiques triées par distance." text="Autorisez la localisation et voyez d’abord les vendeurs les plus proches.">
            <RadarDemo count={Math.min(shops.length, 6)} />
          </Tile>
          <Tile className="md:col-span-3" delay={0.16} icon={ShieldCheck} kicker="Confiance" title="Le badge Vendeur Vérifié." text="Identité ou localisation contrôlée par l’équipe FasoLink avant attribution du badge.">
            <VerifiedDemo />
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({
  className,
  delay,
  icon: Icon,
  kicker,
  title,
  text,
  children,
}: {
  className?: string;
  delay: number;
  icon: typeof Search;
  kicker: string;
  title: string;
  text?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal delay={delay} className={cn("min-w-0", className)}>
      <article
        data-spotlight
        className="fx-spotlight group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-clay-100 bg-white/85 p-6 shadow-[inset_0_1px_0_#fff,0_20px_50px_-36px_rgb(26_17_9/.45)] backdrop-blur transition-transform duration-500 hover:-translate-y-1 sm:p-7"
      >
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.16em] text-faso-red">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {kicker}
          </span>
          <h3 className="mt-3 text-xl font-extrabold tracking-[-.03em] text-ink sm:text-2xl">{title}</h3>
          {text && <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">{text}</p>}
        </div>
        <div className="relative z-10 mt-6 flex flex-1 items-end">{children}</div>
      </article>
    </Reveal>
  );
}

/* ---------- Démos animées (décoratives, masquées aux lecteurs d'écran) ---------- */

function useLoop(length: number, interval: number, active: boolean) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active || length <= 1) return;
    const id = window.setInterval(() => setStep((value) => (value + 1) % length), interval);
    return () => window.clearInterval(id);
  }, [active, length, interval]);
  return step;
}

function SearchDemo({ hits }: { hits: Hit[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduce = useSafeReducedMotion();
  const queries = useMemo(() => {
    const words = hits.map((hit) => hit.name.split(" ").slice(0, 2).join(" "));
    return words.length ? Array.from(new Set(words)).slice(0, 3) : ["smartphone", "ordinateur", "écouteurs"];
  }, [hits]);
  const queryIndex = useLoop(queries.length, 4200, inView && !reduce);
  const query = queries[queryIndex] ?? "";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (reduce || !inView) {
      setTyped(query);
      return;
    }
    setTyped("");
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setTyped(query.slice(0, index));
      if (index >= query.length) window.clearInterval(id);
    }, 75);
    return () => window.clearInterval(id);
  }, [query, inView, reduce]);

  const done = typed.length === query.length;
  const needle = query.toLocaleLowerCase("fr");
  const matches = hits.filter((hit) => hit.name.toLocaleLowerCase("fr").includes(needle)).slice(0, 2);
  const results = [...matches, ...hits.filter((hit) => !matches.includes(hit))].slice(0, 2);

  return (
    <div ref={ref} aria-hidden="true" className="w-full">
      <div className="flex items-center gap-3 rounded-2xl border border-clay-200 bg-white px-4 py-3 shadow-[0_10px_30px_-20px_rgb(26_17_9/.4)]">
        <Search className="h-4 w-4 text-faso-red" />
        <span className="flex-1 text-sm font-semibold text-ink">
          {typed}
          <span className="fx-caret" />
        </span>
        <kbd className="rounded-md border border-clay-200 bg-clay-50 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">Ctrl K</kbd>
      </div>
      <div className="mt-2 grid min-h-[8.5rem] gap-2 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {done &&
            results.map((hit, index) => (
              <motion.div
                key={`${query}-${hit.id}`}
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: EASE, delay: index * 0.08 }}
                className="flex items-center gap-3 rounded-2xl border border-clay-100 bg-clay-50/80 p-2.5"
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                  {hit.image ? <Image src={hit.image} alt="" fill sizes="48px" className="object-contain p-1" /> : <Store className="m-3.5 h-5 w-5 text-clay-400" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-ink">{hit.name}</span>
                  <span className="block truncate text-[11px] text-ink-muted">{hit.shop}</span>
                  <span className="block text-xs font-extrabold text-faso-green-dark">{formatCFA(hit.price)}</span>
                </span>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChatDemo({ productName }: { productName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduce = useSafeReducedMotion();
  const step = useLoop(5, 1600, inView && !reduce);
  // 1 → 2 → 3 messages, puis une pause avant de recommencer.
  const shown = reduce ? 3 : Math.min(step + 1, 3);

  const messages = [
    { me: true, text: `Bonjour, ${productName ? `le ${productName}` : "ce produit"} est-il disponible ?` },
    { me: false, text: "Bonjour ! Oui, il est en boutique." },
    { me: true, text: "Super, je passe aujourd’hui 🙏🏾" },
  ];

  return (
    <div ref={ref} aria-hidden="true" className="w-full">
      <div className="overflow-hidden rounded-[1.4rem] border border-clay-100 bg-[#efe7db] shadow-[0_16px_40px_-26px_rgb(26_17_9/.5)]">
        <div className="flex items-center gap-2.5 bg-[#075e54] px-3.5 py-2.5 text-white">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15"><Store className="h-4 w-4" /></span>
          <span className="min-w-0">
            <span className="block text-xs font-bold">Boutique tech</span>
            <span className="block text-[10px] text-white/70">{shown === 1 ? "en train d’écrire…" : "en ligne"}</span>
          </span>
        </div>
        <div className="flex min-h-[12.5rem] flex-col justify-end gap-2 p-3">
          <AnimatePresence initial={false}>
            {messages.map((message, index) =>
              shown > index ? (
                <motion.p
                  key={index}
                  initial={reduce ? false : { opacity: 0, y: 14, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-5 shadow-sm",
                    message.me ? "self-end rounded-br-md bg-[#dcf8c6] text-[#173a22]" : "self-start rounded-bl-md bg-white text-ink",
                  )}
                >
                  {message.text}
                </motion.p>
              ) : null,
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2 border-t border-black/5 bg-white/70 px-3 py-2">
          <span className="h-8 flex-1 rounded-full bg-white" />
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#25D366] text-white"><MessageCircle className="h-4 w-4" /></span>
        </div>
      </div>
    </div>
  );
}

function CompareDemo() {
  const reduce = useSafeReducedMotion();
  const columns = [
    { label: "A", values: [0.55, 0.7, 0.45], tone: "bg-faso-red" },
    { label: "B", values: [0.8, 0.5, 0.75], tone: "bg-faso-gold" },
    { label: "C", values: [0.65, 0.9, 0.6], tone: "bg-faso-green" },
  ];
  return (
    <div aria-hidden="true" className="grid w-full grid-cols-3 gap-2.5">
      {columns.map((column, columnIndex) => (
        <div key={column.label} className="rounded-2xl border border-clay-100 bg-clay-50/80 p-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-[11px] font-extrabold text-ink shadow-sm">{column.label}</span>
          <div className="mt-3 space-y-2">
            {column.values.map((value, rowIndex) => (
              <div key={rowIndex} className="h-1.5 overflow-hidden rounded-full bg-clay-200/70">
                <motion.div
                  className={cn("h-full origin-left rounded-full", column.tone)}
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: value }}
                  style={reduce ? { transform: `scaleX(${value})` } : undefined}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.2 + columnIndex * 0.12 + rowIndex * 0.08 }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function HoursDemo() {
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  // Calculé après montage pour éviter tout écart d'hydratation serveur/client.
  const [today, setToday] = useState(-1);
  useEffect(() => setToday((new Date().getDay() + 6) % 7), []);
  return (
    <div aria-hidden="true" className="w-full">
      <span className="inline-flex items-center gap-2 rounded-full bg-faso-green/10 px-3 py-1.5 text-xs font-extrabold text-faso-green-dark">
        <span className="fx-live-dot" /> Ouvert · ferme à 19h00
      </span>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5">
            <div className="relative h-14 w-full overflow-hidden rounded-lg bg-clay-100">
              <div
                className={cn("absolute inset-x-0 rounded-md", index === today ? "bg-faso-green" : "bg-clay-300/70", index === 6 && "opacity-30")}
                style={{ top: `${18 + (index % 3) * 4}%`, bottom: `${16 + (index % 2) * 6}%` }}
              />
            </div>
            <span className={cn("text-[10px] font-bold", index === today ? "text-faso-green-dark" : "text-ink-muted")}>{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarDemo({ count }: { count: number }) {
  const dots = [
    { x: 30, y: 34 },
    { x: 66, y: 28 },
    { x: 72, y: 64 },
    { x: 40, y: 70 },
    { x: 56, y: 46 },
    { x: 22, y: 56 },
  ].slice(0, Math.max(count, 3));
  return (
    <div aria-hidden="true" className="flex w-full items-center gap-6">
      <div className="relative aspect-square w-40 shrink-0 rounded-full border border-faso-green/20 bg-[radial-gradient(circle,rgb(var(--faso-green)/.1),transparent_70%)] sm:w-44">
        <div className="absolute inset-0">
          <span className="fx-radar-ring" />
          <span className="fx-radar-ring" />
          <span className="fx-radar-ring" />
        </div>
        <div className="absolute inset-[22%] rounded-full border border-dashed border-faso-green/25" />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-faso-red ring-4 ring-faso-red/20" />
        {dots.map((dot, index) => (
          <span key={index} className="absolute h-2.5 w-2.5 rounded-full bg-faso-green shadow-[0_0_0_4px_rgb(var(--faso-green)/.18)]" style={{ left: `${dot.x}%`, top: `${dot.y}%` }} />
        ))}
      </div>
      <ul className="hidden min-w-0 flex-1 space-y-2 sm:block">
        {["0,8 km", "1,9 km", "3,4 km"].map((distance, index) => (
          <li key={distance} className="flex items-center gap-2.5 rounded-xl border border-clay-100 bg-clay-50/80 px-3 py-2 text-xs">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-faso-green-dark shadow-sm"><Store className="h-3.5 w-3.5" /></span>
            <span className="h-2 flex-1 rounded-full bg-clay-200/80" style={{ maxWidth: `${80 - index * 14}%` }} />
            <span className="font-extrabold text-ink">{distance}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VerifiedDemo() {
  return (
    <div aria-hidden="true" className="flex w-full items-center gap-5">
      <div className="fx-beam relative grid h-28 w-28 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fff6e4,#f6dfb4_55%,#e7bd73)] shadow-[0_20px_40px_-20px_rgb(201_127_22/.8)]">
        <BadgeCheck className="h-12 w-12 text-faso-gold-dark" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-faso-gold-soft/60 px-2.5 py-1 text-[11px] font-bold text-faso-gold-dark">
          <BadgeCheck className="h-3.5 w-3.5" /> Vendeur Vérifié
        </span>
        <div className="space-y-1.5">
          <span className="block h-2 w-[85%] rounded-full bg-clay-200/80" />
          <span className="block h-2 w-[62%] rounded-full bg-clay-200/60" />
          <span className="block h-2 w-[74%] rounded-full bg-clay-200/40" />
        </div>
      </div>
    </div>
  );
}
