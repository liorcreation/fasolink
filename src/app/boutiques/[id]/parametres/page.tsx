"use client";

export const runtime = "edge";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Info,
  Loader2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Save,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { BURKINA_CITIES } from "@/lib/constants";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchOwnedShop } from "@/lib/vendor-data";
import { updateShopSettings, VendorError } from "@/lib/vendor";
import type { ShopWithProducts } from "@/lib/database.types";

type FormState = {
  name: string;
  description: string;
  city: string;
  neighborhood: string;
  whatsapp: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  city: "",
  neighborhood: "",
  whatsapp: "",
};

export default function ShopSettingsPage() {
  const params = useParams<{ id: string }>();
  const shopId = params.id;
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [shop, setShop] = useState<ShopWithProducts | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      if (!isConfigured) {
        setLoading(false);
        setError("Les paramètres sont disponibles avec une session Firebase active.");
        return;
      }
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const owned = await fetchOwnedShop(user.uid, shopId);
        if (!mounted) return;
        if (!owned) {
          setError("Cette boutique n'est pas associée à votre compte.");
        } else {
          setShop(owned);
          setForm({
            name: owned.name,
            description: owned.description,
            city: owned.city,
            neighborhood: owned.neighborhood ?? "",
            whatsapp: owned.whatsapp,
          });
        }
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Impossible de charger la boutique.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [authLoading, isConfigured, shopId, user]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  }

  const valid =
    form.name.trim().length >= 2 &&
    form.description.trim().length >= 20 &&
    Boolean(form.city) &&
    /\d{6,}/.test(form.whatsapp);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shop || !valid || saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateShopSettings(shop.id, {
        name: form.name,
        description: form.description,
        city: form.city,
        neighborhood: form.neighborhood || null,
        whatsapp: form.whatsapp,
      });
      setShop((current) =>
        current
          ? {
              ...current,
              name: form.name.trim(),
              description: form.description.trim(),
              city: form.city.trim(),
              neighborhood: form.neighborhood.trim() || null,
              whatsapp: form.whatsapp.trim(),
            }
          : current,
      );
      setSaved(true);
    } catch (cause) {
      setError(
        cause instanceof VendorError
          ? cause.message
          : "La sauvegarde a échoué. Vérifiez votre connexion puis réessayez.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <AccessState
        icon={<LockKeyhole className="h-6 w-6" />}
        title="Connectez-vous pour gérer votre boutique"
        description="Cet espace est strictement réservé au compte qui a créé la boutique."
        action={{ href: "/connexion", label: "Ouvrir ma session" }}
      />
    );
  }

  if (!shop || !isFirebaseConfigured) {
    return (
      <AccessState
        icon={<ShieldCheck className="h-6 w-6" />}
        title="Espace propriétaire"
        description={error ?? "Cette boutique n'est pas associée à votre compte."}
        action={{ href: "/vendeur/dashboard", label: "Voir mon espace vendeur" }}
      />
    );
  }

  return (
    <div className="container-faso py-8 pb-24 sm:py-12 md:pb-16">
      <Link
        href={`/boutiques/${shop.id}`}
        className="inline-flex items-center gap-2 text-xs font-extrabold text-ink-muted transition hover:text-faso-red"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à ma vitrine
      </Link>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <main>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative isolate overflow-hidden rounded-[2rem] bg-[#17120E] p-6 text-white shadow-premium-lg sm:p-8"
          >
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_90%_0,rgba(220,166,55,.27),transparent_42%),radial-gradient(ellipse_at_0_100%,rgba(207,39,43,.2),transparent_45%)]" />
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-faso-gold">
                <Store className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#F3D88E]">Espace propriétaire</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Paramètres de la boutique</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Gardez votre vitrine claire, actuelle et rassurante pour les acheteurs tech du Burkina Faso.</p>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <section className="card-premium space-y-5 rounded-[1.75rem] p-5 sm:p-7">
              <SectionIntro icon={<Building2 className="h-4 w-4" />} eyebrow="Identité publique" title="Ce que vos clients voient" description="Ces informations apparaissent sur la vitrine de votre boutique." />
              <Field label="Nom de la boutique" required>
                <input value={form.name} onChange={(event) => update("name", event.target.value)} className={inputClass} maxLength={80} required />
              </Field>
              <Field label="Description" required hint={`${form.description.length}/600 caractères · minimum 20 caractères`}>
                <textarea value={form.description} onChange={(event) => update("description", event.target.value)} className={`${inputClass} min-h-32 resize-y py-3`} maxLength={600} required />
              </Field>
            </section>

            <section className="card-premium space-y-5 rounded-[1.75rem] p-5 sm:p-7">
              <SectionIntro icon={<MapPin className="h-4 w-4" />} eyebrow="Repères locaux" title="Où vous trouver" description="Aidez les clients à vous situer et à vous joindre rapidement." />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Ville" required>
                  <select value={form.city} onChange={(event) => update("city", event.target.value)} className={inputClass} required>
                    {BURKINA_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </Field>
                <Field label="Quartier / secteur" hint="Optionnel">
                  <input value={form.neighborhood} onChange={(event) => update("neighborhood", event.target.value)} className={inputClass} maxLength={80} placeholder="Ex. Ouaga 2000, Secteur 15" />
                </Field>
              </div>
              <Field label="WhatsApp Business" required hint="Format local ou international">
                <div className="flex items-center gap-2 rounded-2xl border border-clay-200 bg-white px-4 transition focus-within:border-faso-gold focus-within:shadow-[0_0_0_4px_rgba(244,169,60,.14)]">
                  <MessageCircle className="h-4 w-4 text-faso-green" />
                  <input type="tel" value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70" placeholder="70 12 34 56" required />
                </div>
              </Field>
            </section>

            {error && <p className="rounded-2xl border border-faso-red/15 bg-faso-red-soft/35 px-4 py-3 text-sm font-medium text-faso-red-dark">{error}</p>}
            {saved && <p className="flex items-center gap-2 rounded-2xl border border-faso-green/20 bg-faso-green-soft/30 px-4 py-3 text-sm font-bold text-faso-green-dark"><CheckCircle2 className="h-4 w-4" /> Modifications enregistrées.</p>}

            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-clay-200/75 bg-white/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <p className="text-xs leading-5 text-ink-muted">Les changements sont enregistrés immédiatement sur votre vitrine.</p>
              <Button type="submit" size="lg" disabled={!valid || saving} className="w-full sm:w-auto">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…</> : <><Save className="h-4 w-4" /> Enregistrer</>}
              </Button>
            </div>
          </form>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-[1.6rem] border border-clay-200/80 bg-white p-5 shadow-[0_7px_25px_rgba(51,37,23,.04)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-faso-red">Protection active</p>
            <div className="mt-4 space-y-3">
              <ProtectedRow label="Propriétaire" detail="Votre compte uniquement" />
              <ProtectedRow label="Vérification" detail="Gérée par FasoLink" />
              <ProtectedRow label="Abonnement" detail="Géré depuis l’espace vendeur" />
            </div>
          </section>
          <section className="rounded-[1.6rem] border border-faso-gold/20 bg-faso-gold-soft/25 p-5">
            <Info className="h-5 w-5 text-faso-gold-dark" />
            <p className="mt-3 text-sm font-extrabold text-ink">Besoin d’aller plus loin ?</p>
            <p className="mt-1 text-xs leading-5 text-ink-soft">Gérez vos produits, votre licence et votre vérification depuis le tableau de bord vendeur.</p>
            <Link href="/vendeur/dashboard" className="mt-4 inline-flex items-center text-xs font-extrabold text-faso-red hover:underline">Ouvrir l’espace vendeur <ArrowLeft className="ml-1 h-3.5 w-3.5 rotate-180" /></Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

const inputClass = "input-premium";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink">{label}{required && <span className="text-faso-red">*</span>}</span>{children}{hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}</label>;
}

function SectionIntro({ icon, eyebrow, title, description }: { icon: React.ReactNode; eyebrow: string; title: string; description: string }) {
  return <div className="flex items-start gap-3 border-b border-clay-100 pb-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-faso-red-soft/40 text-faso-red">{icon}</span><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-faso-red">{eyebrow}</p><h2 className="mt-1 text-lg font-black tracking-tight text-ink">{title}</h2><p className="mt-1 text-xs leading-5 text-ink-muted">{description}</p></div></div>;
}

function ProtectedRow({ label, detail }: { label: string; detail: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl bg-clay-50 px-3 py-2.5"><span className="text-xs font-bold text-ink">{label}</span><span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-muted"><LockKeyhole className="h-3 w-3" />{detail}</span></div>;
}

function LoadingState() {
  return <div className="container-faso flex min-h-[50vh] items-center justify-center"><div className="card-premium flex items-center gap-3 rounded-2xl px-5 py-4 text-sm text-ink-muted"><Loader2 className="h-5 w-5 animate-spin text-faso-red" /> Chargement de votre espace propriétaire…</div></div>;
}

function AccessState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action: { href: string; label: string } }) {
  return <div className="container-faso flex min-h-[55vh] items-center justify-center py-12"><div className="card-premium max-w-lg rounded-[2rem] p-8 text-center sm:p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-faso-gold-soft/40 text-faso-gold-dark">{icon}</span><h1 className="mt-5 text-2xl font-black tracking-tight text-ink">{title}</h1><p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p><ButtonLink href={action.href} className="mt-6">{action.label}</ButtonLink></div></div>;
}
