"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCw, Wifi, WifiOff } from "lucide-react";

export function OfflineRetryButton() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => {
          setRetrying(true);
          window.location.reload();
        }}
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
    </div>
  );
}
