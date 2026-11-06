"use client";

import { useEffect } from "react";
import { AppErrorState } from "@/components/site/AppErrorState";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("[FasoLink] erreur du layout racine", error.digest ?? "sans référence");
  }, [error]);

  return (
    <html lang="fr">
      <head><title>Une erreur est survenue · FasoLink</title><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
      <body style={{ margin: 0 }}>
        <main>
          <AppErrorState error={error} retry={retry} />
        </main>
      </body>
    </html>
  );
}
