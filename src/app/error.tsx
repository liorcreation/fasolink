"use client";

import { useEffect } from "react";
import { AppErrorState } from "@/components/site/AppErrorState";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error("[FasoLink] erreur de rendu de page", error.digest ?? "sans référence");
  }, [error]);

  return <AppErrorState error={error} retry={retry} />;
}
