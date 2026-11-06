"use client";

import { useState } from "react";
import Link from "next/link";

type AppErrorStateProps = {
  error?: Error & { digest?: string };
  retry: () => void;
};

/** Petit écran de secours autonome, également utilisable hors du layout global. */
export function AppErrorState({ error, retry }: AppErrorStateProps) {
  const [retrying, setRetrying] = useState(false);

  return (
    <main
      role="alert"
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#FBF6EF",
        color: "#17120E",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <section style={{ width: "min(100%, 620px)", textAlign: "center" }}>
        <div aria-hidden="true" style={{ margin: "0 auto 24px", width: 76, height: 76, display: "grid", placeItems: "center", borderRadius: 26, background: "#FCE8E5", color: "#C82121", fontSize: 34, fontWeight: 900 }}>!</div>
        <p style={{ margin: 0, color: "#C82121", fontSize: 12, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase" }}>FasoLink · reprise</p>
        <h1 style={{ margin: "14px 0 0", fontSize: "clamp(30px, 6vw, 48px)", lineHeight: 1.08, letterSpacing: "-.045em" }}>Un petit souci est survenu.</h1>
        <p style={{ margin: "16px auto 0", maxWidth: 480, color: "#655A50", fontSize: 16, lineHeight: 1.7 }}>La page n’a pas pu s’afficher correctement. Réessayez; si le problème persiste, revenez à l’accueil.</p>
        {error?.digest && <p style={{ margin: "12px 0 0", color: "#81766B", fontSize: 12 }}>Référence : {error.digest}</p>}
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
          <button
            type="button"
            disabled={retrying}
            onClick={() => {
              setRetrying(true);
              retry();
              window.setTimeout(() => setRetrying(false), 1500);
            }}
            style={{ minHeight: 48, border: 0, borderRadius: 999, padding: "0 24px", background: "#D62828", color: "white", font: "inherit", fontSize: 14, fontWeight: 800, cursor: retrying ? "wait" : "pointer", opacity: retrying ? .72 : 1 }}
          >
            {retrying ? "Nouvel essai…" : "Réessayer"}
          </button>
          <Link href="/" style={{ minHeight: 48, display: "inline-flex", alignItems: "center", border: "1px solid #E5D9CA", borderRadius: 999, padding: "0 24px", background: "#fff", color: "#17120E", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
            Retour à l’accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
