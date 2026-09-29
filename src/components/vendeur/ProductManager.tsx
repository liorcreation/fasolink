"use client";

import { useState } from "react";
import { Check, Edit3, Loader2, PackagePlus, Trash2, X } from "lucide-react";
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
    <section className="card-premium p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink">Catalogue produits</p>
          <p className="mt-1 text-xs text-ink-muted">
            Gérez ce que vos clients voient sur votre vitrine.
          </p>
        </div>
        {!editingId && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-faso-green-soft/40 px-3 py-1 text-xs font-bold text-faso-green-dark">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="mt-5 divide-y divide-clay-100">
        {products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-clay-200 bg-clay-50 p-6 text-center text-sm text-ink-muted">
            Votre catalogue est vide. Ajoutez votre premier produit ci-dessous.
          </div>
        )}
        {products.map((product) => (
          <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{product.name}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {formatCFA(product.price)} · {AVAILABILITY.find((item) => item.id === product.availability)?.label}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => edit(product)} className="rounded-xl p-2 text-ink-muted hover:bg-clay-100 hover:text-ink" aria-label={`Modifier ${product.name}`}>
                <Edit3 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => void remove(product)} className="rounded-xl p-2 text-ink-muted hover:bg-faso-red-soft/40 hover:text-faso-red-dark" aria-label={`Supprimer ${product.name}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={save} className="mt-5 rounded-2xl bg-clay-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <PackagePlus className="h-4 w-4 text-faso-red" />
            {editingId ? "Modifier le produit" : "Ajouter un produit"}
          </p>
          {editingId && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink">
              <X className="h-3.5 w-3.5" /> Annuler
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nom du produit" className="input-premium" required />
          <input type="number" min="0" step="1" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))} placeholder="Prix en FCFA" className="input-premium" required />
          <select value={draft.availability} onChange={(event) => setDraft((current) => ({ ...current, availability: event.target.value as ProductAvailability }))} className="input-premium sm:col-span-2">
            {AVAILABILITY.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Description courte (facultatif)" rows={3} className="input-premium h-auto py-3 sm:col-span-2" />
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
