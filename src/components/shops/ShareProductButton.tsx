"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export function ShareProductButton({ title, shopName }: { title: string; shopName: string }) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const copyLink = async (url: string) => {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return;
    }

    const field = document.createElement("textarea");
    field.value = url;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copiedSuccessfully = document.execCommand("copy");
    field.remove();
    if (!copiedSuccessfully) throw new Error("La copie du lien a échoué.");
  };

  const share = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${title} | FasoLink`,
      text: `${title} chez ${shopName}, sur FasoLink.`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await copyLink(url);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2400);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await copyLink(url);
        setCopied(true);
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopied(false), 2400);
      } catch {
        setCopied(false);
      }
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-clay-200 bg-white px-4 text-xs font-extrabold text-ink-soft shadow-sm transition hover:-translate-y-0.5 hover:border-faso-gold hover:text-ink hover:shadow-premium"
      >
        {copied ? <Check className="h-4 w-4 text-faso-green" aria-hidden="true" /> : navigatorShareIcon()}
        {copied ? "Lien copié" : "Partager"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">{copied ? "Lien de la fiche produit copié." : ""}</span>
    </div>
  );
}

function navigatorShareIcon() {
  return typeof navigator !== "undefined" && "share" in navigator
    ? <Share2 className="h-4 w-4" aria-hidden="true" />
    : <Copy className="h-4 w-4" aria-hidden="true" />;
}
