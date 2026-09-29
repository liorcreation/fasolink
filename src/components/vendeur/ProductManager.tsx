"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, CircleDollarSign, Edit3, Loader2, Package, PackagePlus, Trash2, X } from "lucide-react";
import type { Product, ProductAvailability } from "@/lib/database.types";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type ProductDraft,
} from "@/lib/vendor";
import { formatCFA } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const AVAILABILITY: { id: ProductAvailability; label: string }[] = [
  { id: "in_stock", label: "En stock" },
  { id: "on_order", label: "Sur commande" },
  { id: "out_of_stock", label: "Rupture" },
];

const EMPTY_DRAFT: ProductDraft = {
  name: "",
  description: "",
  price: 0,
  availability: "in_stock",
  image_url: null,
};

export function ProductManager({
  shopId,
  initialProducts,
  demo = false,
}: {
  shopId: string;
  initialProducts: Product[];
  demo?: boolean;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setError(null);
  }

  function edit(product: Product) {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      availability: product.availability,
      image_url: product.image_url,
    });
    setError(null);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim() || draft.price < 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (editingId) {
        if (!demo) await updateProduct(editingId, draft);
        setProducts((current) =>
          current.map((product) =>
            product.id === editingId
              ? { ...product, ...draft, name: draft.name.trim(), description: draft.description.trim() || null, updated_at: new Date().toISOString() }
              : product,
          ),
        );
      } else if (demo) {
        const now = new Date().toISOString();
        setProducts((current) => [
          ...current,
          {
            id: `demo-${Date.now()}`,
            shop_id: shopId,
            name: draft.name.trim(),
            description: draft.description.trim() || null,
            price: Number(draft.price),
            currency: "FCFA",
            image_url: draft.image_url ?? null,
            availability: draft.availability,
            created_at: now,
            updated_at: now,
          },
        ]);
      } else {
        const created = await createProduct(shopId, draft);
        setProducts((current) => [...current, created]);
      }
      reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d’enregistrer le produit.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(product: Product) {
    if (busy || !window.confirm(`Supprimer « ${product.name} » ?`)) return;
    setBusy(true);
    setError(null);
    try {
      if (!demo) await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingId === product.id) reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de supprimer le produit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-clay-200/80 bg-white shadow-[0_12px_38px_rgba(51,37,23,.055)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-clay-100 px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-faso-red-soft/35 text-faso-red"><Package className="h-5 w-5" /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-faso-red">Votre vitrine</p><h3 className="mt-0.5 text-lg font-black tracking-tight text-ink">Catalogue produits</h3><p className="mt-0.5 text-xs text-ink-muted">Présentez clairement vos produits et leurs disponibilités.</p></div></div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-faso-green/10 bg-faso-green-soft/35 px-3 py-1.5 text-[11px] font-extrabold text-faso-green-dark"><Package className="h-3.5 w-3.5" />{products.length} produit{products.length === 1 ? "" : "s"}</span>
      </div>

      <div className="p-5 sm:p-7">
        {products.length === 0 && (
          <div className="mb-5 grid justify-items-center rounded-2xl border border-dashed border-clay-200 bg-clay-50/70 px-5 py-8 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-faso-gold-dark shadow-sm"><PackagePlus className="h-5 w-5" /></span><p className="mt-3 text-sm font-bold text-ink">Votre vitrine commence ici</p><p className="mt-1 max-w-sm text-xs leading-5 text-ink-muted">Ajoutez votre premier produit ou service pour aider les clients à découvrir votre offre.</p></div>
        )}
        {products.length > 0 && <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => {
          const availability = AVAILABILITY.find((item) => item.id === product.availability);
          const tone = product.availability === "in_stock" ? "bg-faso-green-soft/40 text-faso-green-dark" : product.availability === "on_order" ? "bg-faso-gold-soft/45 text-faso-gold-dark" : "bg-clay-100 text-ink-muted";
          return <article key={product.id} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-clay-200/75 bg-white p-3 transition duration-200 hover:-translate-y-0.5 hover:border-faso-gold/40 hover:shadow-[0_10px_24px_rgba(51,37,23,.06)] sm:p-3.5">
            <span className="relative grid h-[4.25rem] w-[4.25rem] shrink-0 place-items-center overflow-hidden rounded-xl bg-clay-50 text-clay-300">{product.image_url ? <Image src={product.image_url} alt={product.name} fill sizes="68px" className="object-cover" /> : <Package className="h-6 w-6" />}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold text-ink">{product.name}</p><p className="mt-1 inline-flex items-center gap-1 text-xs font-extrabold text-faso-green-dark"><CircleDollarSign className="h-3.5 w-3.5" />{formatCFA(product.price)}</p><span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold ${tone}`}>{availability?.label}</span></div>
            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" disabled={busy} onClick={() => edit(product)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition hover:bg-clay-100 hover:text-ink disabled:opacity-40" aria-label={`Modifier ${product.name}`} title="Modifier">
                <Edit3 className="h-4 w-4" />
              </button>
              <button type="button" disabled={busy} onClick={() => void remove(product)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition hover:bg-faso-red-soft/40 hover:text-faso-red-dark disabled:opacity-40" aria-label={`Supprimer ${product.name}`} title="Supprimer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>;
        })}
        </div>}
      </div>

      <form onSubmit={save} className="mx-5 mb-5 rounded-[1.5rem] border border-clay-200/80 bg-[#FCFAF6] p-4 sm:mx-7 sm:mb-7 sm:p-5">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-faso-gold-soft/45 text-faso-gold-dark"><PackagePlus className="h-4 w-4" /></span>
          <p className="text-sm font-extrabold text-ink">{editingId ? "Modifier le produit" : "Ajouter à ma vitrine"}</p></div>
          {editingId && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-ink-muted transition hover:bg-clay-100 hover:text-ink">
              <X className="h-3.5 w-3.5" /> Annuler
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-[11px] font-bold text-ink-soft">Nom<input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Ex. Sac Faso Dan Fani" className="input-premium mt-1.5" required /></label>
          <label className="text-[11px] font-bold text-ink-soft">Prix (FCFA)<input type="number" min="0" step="1" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))} placeholder="Ex. 12 500" className="input-premium mt-1.5" required /></label>
          <label className="text-[11px] font-bold text-ink-soft sm:col-span-2">Disponibilité<select value={draft.availability} onChange={(event) => setDraft((current) => ({ ...current, availability: event.target.value as ProductAvailability }))} className="input-premium mt-1.5">
            {AVAILABILITY.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select></label>
          <label className="text-[11px] font-bold text-ink-soft sm:col-span-2">Description <span className="font-medium text-ink-muted">(facultatif)</span><textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Matière, dimensions, origine, points forts…" rows={3} className="input-premium mt-1.5 h-auto py-3 sm:col-span-2" /></label>
        </div>
        {error && <p className="mt-3 rounded-xl bg-faso-red-soft/40 px-3 py-2 text-xs text-faso-red-dark">{error}</p>}
        <Button type="submit" className="mt-4" disabled={busy || !draft.name.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {editingId ? "Enregistrer les modifications" : "Ajouter au catalogue"}
        </Button>
      </form>
    </section>
  );
}
