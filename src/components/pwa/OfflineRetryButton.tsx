"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCw, Wifi, WifiOff } from "lucide-react";

export function OfflineRetryButton() {
  const router = useRouter();
  const [online, setOnline] = useState<boolean | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const retryingRef = useRef(false);
  const retryTimeoutRef = useRef<number | null>(null);

  const retryHome = useCallback(() => {
    if (retryingRef.current) return;
    retryingRef.current = true;
    setRetrying(true);
    setRetryMessage(navigator.onLine ? "Connexion détectée. Réouverture de FasoLink…" : "Nouvel essai de connexion en cours…");
    router.replace("/");
    retryTimeoutRef.current = window.setTimeout(() => {
      retryingRef.current = false;
      setRetrying(false);
      setRetryMessage("La page n’a pas pu être réouverte. Vérifiez votre réseau puis réessayez.");
    }, 8000);
  }, [router]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const onOnline = () => {
      setOnline(true);
      retryHome();
    };
    update();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", update);
      if (retryTimeoutRef.current !== null) window.clearTimeout(retryTimeoutRef.current);
    };
  }, [retryHome]);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={retryHome}
        disabled={retrying}
        className="btn-base h-12 justify-center bg-faso-red px-5 text-sm font-bold text-white shadow-premium transition-all hover:-translate-y-0.5 hover:bg-faso-red-dark hover:shadow-premium-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-faso-red focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80"
      >
        {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
        Réessayer
      </button>
      <p aria-live="polite" className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-ink-muted">
        {online === true ? <Wifi className="h-3.5 w-3.5 text-faso-green" /> : <WifiOff className="h-3.5 w-3.5" />}
        {online === null ? "Vérification de la connexion…" : online ? "Réseau détecté — réessayez d’ouvrir FasoLink." : "Aucun réseau détecté pour le moment."}
      </p>
      {retryMessage && <p role="status" className="px-1 text-xs leading-5 text-ink-soft">{retryMessage}</p>}
    </div>
  );
}
