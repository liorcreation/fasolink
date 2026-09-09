"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Lock, ShieldCheck, Star } from "lucide-react";
import type { Review } from "@/lib/database.types";
import { cn, initials } from "@/lib/utils";
import { getLocalContactStats } from "@/lib/tracking";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const LS_KEY = (id: string) => `fasolink:reviews:${id}`;

export function ReviewsSection({
  shopId,
  shopName,
  initialReviews = [],
}: {
  shopId: string;
  shopName: string;
  initialReviews?: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setCanReview(getLocalContactStats(shopId).total > 0);
    try {
      const local = JSON.parse(
        localStorage.getItem(LS_KEY(shopId)) ?? "[]",
      ) as Review[];
      if (local.length) setReviews((r) => [...local, ...r]);
    } catch {
      /* ignore */
    }
  }, [shopId]);

  const summary = useMemo(() => {
    if (!reviews.length) return { avg: 0, count: 0, dist: [0, 0, 0, 0, 0] };
    const dist = [0, 0, 0, 0, 0];
    let total = 0;
    for (const r of reviews) {
      dist[5 - r.rating] += 1;
      total += r.rating;
    }
    return { avg: total / reviews.length, count: reviews.length, dist };
  }, [reviews]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || comment.trim().length < 10) return;

    const review: Review = {
      id: `local-${Date.now()}`,
      shop_id: shopId,
      author_id: null,
      author_name: name.trim(),
      rating,
      comment: comment.trim(),
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data: auth } = await supabase.auth.getUser();
      await supabase.from("reviews").insert({
        shop_id: shopId,
        author_id: auth.user?.id ?? null,
        author_name: review.author_name,
        rating,
        comment: review.comment,
        is_verified: true,
      });
    } else {
      try {
        const local = JSON.parse(
          localStorage.getItem(LS_KEY(shopId)) ?? "[]",
        ) as Review[];
        localStorage.setItem(
          LS_KEY(shopId),
          JSON.stringify([review, ...local].slice(0, 20)),
        );
      } catch {
        /* ignore */
      }
    }

    setReviews((r) => [review, ...r]);
    setComment("");
    setName("");
    setRating(5);
    setSent(true);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      {/* Résumé */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="card-premium p-5 text-center">
          <p className="text-4xl font-extrabold text-ink">
            {summary.avg.toFixed(1)}
          </p>
          <div className="mt-1 flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={cn(
                  "h-4 w-4",
                  n <= Math.round(summary.avg)
                    ? "fill-faso-gold text-faso-gold"
                    : "text-clay-200",
                )}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            {summary.count} avis vérifié{summary.count > 1 ? "s" : ""}
          </p>

          <div className="mt-4 space-y-1.5">
            {summary.dist.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-ink-muted">{5 - i}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-clay-100">
                  <span
                    className="block h-full rounded-full bg-faso-gold"
                    style={{
                      width: `${summary.count ? (c / summary.count) * 100 : 0}%`,
                    }}
                  />
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-faso-green-soft/30 px-3 py-2 text-[11px] font-medium text-faso-green-dark">
            <ShieldCheck className="h-3.5 w-3.5" />
            Avis déposés après contact vérifié
          </p>
        </div>
      </div>

      {/* Liste + formulaire */}
      <div>
        <AnimatePresence>
          {sent && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-center gap-2 rounded-xl bg-faso-green-soft/40 px-4 py-3 text-sm font-medium text-faso-green-dark"
            >
              <CheckCircle2 className="h-4 w-4" />
              Merci ! Votre avis a été publié.
            </motion.p>
          )}
        </AnimatePresence>

        {canReview ? (
          <form
            onSubmit={submit}
            className="card-premium mb-6 space-y-3 p-5"
          >
            <p className="text-sm font-bold text-ink">
              Partagez votre expérience avec {shopName}
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      n <= (hover || rating)
                        ? "fill-faso-gold text-faso-gold"
                        : "text-clay-200",
                    )}
                  />
                </button>
              ))}
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="h-10 w-full rounded-xl border border-clay-200 bg-white px-3 text-sm outline-none focus:border-faso-gold"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Qualité, délai, accueil… (min. 10 caractères)"
              className="w-full resize-none rounded-xl border border-clay-200 bg-white px-3 py-2 text-sm outline-none focus:border-faso-gold"
            />
            <button
              type="submit"
              disabled={!name.trim() || comment.trim().length < 10}
              className="btn-base h-10 bg-faso-red px-5 text-sm text-white disabled:opacity-50"
            >
              Publier mon avis
            </button>
          </form>
        ) : (
          <div className="card-premium mb-6 flex items-center gap-3 p-5 text-sm text-ink-soft">
            <Lock className="h-5 w-5 shrink-0 text-ink-muted" />
            <p>
              Pour garantir des notes fiables, seuls les acheteurs ayant
              <strong> contacté cette boutique </strong> via FasoLink peuvent
              laisser un avis.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {reviews.length === 0 && (
            <li className="rounded-2xl border border-dashed border-clay-200 p-6 text-center text-sm text-ink-muted">
              Aucun avis pour le moment. Soyez le premier après votre achat !
            </li>
          )}
          {reviews.map((r) => (
            <li key={r.id} className="card-premium p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-faso-gradient text-xs font-bold text-white">
                  {initials(r.author_name)}
                </span>
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                    {r.author_name}
                    {r.is_verified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-faso-green-soft/40 px-1.5 py-0.5 text-[10px] font-bold text-faso-green-dark">
                        <ShieldCheck className="h-3 w-3" />
                        Vérifié
                      </span>
                    )}
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={cn(
                          "h-3.5 w-3.5",
                          n <= r.rating
                            ? "fill-faso-gold text-faso-gold"
                            : "text-clay-200",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-soft">{r.comment}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
