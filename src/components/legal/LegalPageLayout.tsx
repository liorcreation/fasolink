import { AppLink as Link } from "@/components/site/AppLink";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  FileText,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Backdrop } from "@/components/fx/Backdrop";
import { RevealText } from "@/components/fx/RevealText";

const pages = [
  { href: "/conditions", label: "Conditions d’utilisation", icon: FileText },
  { href: "/confidentialite", label: "Confidentialité", icon: LockKeyhole },
  { href: "/mentions-legales", label: "Mentions légales", icon: Building2 },
];

const accents = {
  red: {
    pill: "border-faso-red/15 bg-faso-red-soft/30 text-faso-red-dark",
    icon: "bg-faso-red-soft/45 text-faso-red",
    orb: "bg-faso-red/10",
    toc: "text-faso-red",
  },
  green: {
    pill: "border-faso-green/15 bg-faso-green-soft/30 text-faso-green-dark",
    icon: "bg-faso-green-soft/45 text-faso-green",
    orb: "bg-faso-green/10",
    toc: "text-faso-green-dark",
  },
  gold: {
    pill: "border-faso-gold/20 bg-faso-gold-soft/35 text-faso-gold-dark",
    icon: "bg-faso-gold-soft/50 text-faso-gold-dark",
    orb: "bg-faso-gold/10",
    toc: "text-faso-gold-dark",
  },
} as const;

export function LegalPageLayout({
  eyebrow,
  title,
  intro,
  icon: Icon,
  accent,
  activePage,
  sections,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  icon: LucideIcon;
  accent: keyof typeof accents;
  activePage: string;
  sections: { id: string; label: string }[];
  children: ReactNode;
}) {
  const theme = accents[accent];

  return (
    <main className="container-faso py-8 sm:py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/80 bg-white/55 px-5 py-8 shadow-[inset_0_1px_0_rgb(255_255_255/.9),0_30px_70px_-45px_rgb(26_17_9/.45)] sm:rounded-[2.5rem] sm:px-8 sm:py-11 md:px-12 md:py-14">
          <Backdrop />
          <span aria-hidden="true" className="faso-brand-thread absolute inset-x-0 top-0 opacity-80" />
          <div className={`pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full blur-3xl ${theme.orb}`} aria-hidden="true" />
          <Reveal className="relative z-10 max-w-3xl" y={16}>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] ${theme.pill}`}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {eyebrow}
            </span>
            <h1 className="fx-display mt-5 max-w-3xl text-[clamp(2.4rem,5.6vw,4.4rem)] text-ink"><RevealText text={title} stagger={0.05} /></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">{intro}</p>
          </Reveal>

          <nav aria-label="Pages d’information" className="relative z-10 mt-8 grid gap-2 sm:grid-cols-3">
            {pages.map((page) => {
              const PageIcon = page.icon;
              const active = page.href === activePage;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-gold focus-visible:ring-offset-2 ${active ? "border-ink bg-ink text-white shadow-[0_14px_30px_-16px_rgb(26_17_9/.8)]" : "border-white/80 bg-white/70 text-ink-soft backdrop-blur hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white hover:text-ink"}`}
                >
                  <PageIcon className={`h-4 w-4 shrink-0 ${active ? "text-faso-gold" : "text-ink-muted group-hover:text-faso-red"}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">{page.label}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-faso-gold" aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>
        </section>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-7">
          <div className="space-y-4 sm:space-y-5">{children}</div>
          <aside className="order-first lg:sticky lg:top-24 lg:order-last">
            <nav aria-label="Sommaire de la page" className="fx-glass rounded-[1.6rem] p-4 sm:p-5">
              <div className="flex items-center gap-2 px-2">
                <span className={`grid h-8 w-8 place-items-center rounded-xl ${theme.icon}`}><FileText className="h-4 w-4" aria-hidden="true" /></span>
                <div>
                  <p className="text-sm font-extrabold text-ink">Sommaire</p>
                  <p className="text-[11px] text-ink-muted">Accès direct aux rubriques</p>
                </div>
              </div>
              <ol className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-xs leading-5 text-ink-soft transition-colors hover:bg-clay-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-gold">
                      <span className={`mt-0.5 font-extrabold tabular-nums ${theme.toc}`}>{String(index + 1).padStart(2, "0")}</span>
                      <span>{section.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="mt-3 hidden rounded-2xl border border-clay-200/80 bg-clay-50/80 p-4 text-xs leading-5 text-ink-muted lg:block">
              <div className="mb-2 flex items-center gap-2 font-bold text-ink"><ShieldCheck className="h-4 w-4 text-faso-green" /> FasoLink</div>
              Consultez aussi les autres pages d’information depuis les raccourcis ci-dessus.
            </div>
          </aside>
        </div>

        <Link href="/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-clay-200 bg-white/80 px-4 text-sm font-bold text-ink-soft transition-colors hover:border-faso-red/30 hover:text-faso-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour à l’accueil <ArrowRight className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <Reveal>
        <div data-spotlight className="fx-spotlight flex items-start gap-3 rounded-[1.6rem] border border-clay-100 bg-white/90 p-5 shadow-[inset_0_1px_0_#fff,0_20px_50px_-40px_rgb(26_17_9/.5)] sm:gap-4 sm:rounded-[1.9rem] sm:p-8">
          <span className="mt-0.5 hidden h-8 w-1 shrink-0 rounded-full bg-faso-gradient sm:block" aria-hidden="true" />
          <div className="relative z-10 min-w-0 flex-1">
            <h2 className="text-xl font-extrabold tracking-[-.03em] text-ink sm:text-2xl">{title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-ink-soft [&_strong]:font-bold [&_strong]:text-ink [&_p]:max-w-3xl">{children}</div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
