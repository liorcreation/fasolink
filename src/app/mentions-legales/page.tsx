import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";

export const metadata: Metadata = { title: "Mentions légales", description: "Informations légales de FasoLink." };

export default function MentionsLegalesPage() {
  return <div className="container-faso py-14 md:py-20"><div className="mx-auto max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full bg-faso-gold-soft/50 px-3 py-1 text-xs font-bold text-faso-gold-dark"><Building2 className="h-3.5 w-3.5" /> Informations officielles</span><h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">Mentions légales</h1><p className="mt-4 text-lg text-ink-soft">Les informations ci-dessous doivent être complétées avec les données juridiques définitives du propriétaire de la plateforme.</p><div className="mt-10 grid gap-4 sm:grid-cols-2"><Info label="Éditeur" value="FasoLink — à compléter" /><Info label="Siège / adresse" value="Ouagadougou, Burkina Faso — à compléter" /><Info label="Contact" value="contact@fasolink.bf — à confirmer" /><Info label="Hébergement" value="Cloudflare Pages / Firebase" /></div><div className="mt-8 rounded-2xl border border-clay-200 bg-white p-5 text-sm leading-7 text-ink-soft"><p><strong className="text-ink">Propriété intellectuelle.</strong> La marque, l’interface et les contenus originaux de FasoLink sont protégés selon les droits applicables. Les contenus déposés par les vendeurs restent sous leur responsabilité.</p><p className="mt-3"><strong className="text-ink">Responsable de publication.</strong> À renseigner avant livraison définitive.</p></div><Link href="/" className="mt-10 inline-flex text-sm font-bold text-faso-red hover:underline">← Retour à l’accueil</Link></div></div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-clay-100 bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-ink-muted">{label}</p><p className="mt-2 text-sm font-semibold text-ink">{value}</p></div>; }
