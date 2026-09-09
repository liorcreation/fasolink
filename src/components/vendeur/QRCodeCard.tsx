"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";

/**
 * Génère un QR Code FasoLink personnalisé pour la vitrine physique du vendeur.
 * Le QR pointe vers la fiche boutique ; le PNG téléchargeable est composé
 * avec l'identité FasoLink (couleurs drapeau + nom de la boutique).
 */
export function QRCodeCard({
  shopId,
  shopName,
}: {
  shopId: string;
  shopName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/boutiques/${shopId}`
      : `https://fasolink.bf/boutiques/${shopId}`;

  const compose = useCallback(async () => {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 640,
      margin: 1,
      color: { dark: "#1A1109", light: "#FFFFFF" },
      errorCorrectionLevel: "H",
    });
    setQrUrl(dataUrl);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 720;
    const H = 960;
    canvas.width = W;
    canvas.height = H;

    // Fond
    ctx.fillStyle = "#FBF6EF";
    ctx.fillRect(0, 0, W, H);

    // Bandeau dégradé drapeau
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "#D62828");
    grad.addColorStop(0.5, "#C97F16");
    grad.addColorStop(1, "#1F9254");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 120);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 44px Sora, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FasoLink", W / 2, 76);

    // Carte QR
    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, 80, 190, W - 160, W - 160, 32);
    ctx.fill();

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((res) => {
      img.onload = () => res();
      img.src = dataUrl;
    });
    ctx.drawImage(img, 120, 230, W - 240, W - 240);

    // Textes
    ctx.fillStyle = "#1A1109";
    ctx.font = "800 46px Sora, Arial, sans-serif";
    wrapText(ctx, shopName, W / 2, 720, W - 140, 52);

    ctx.fillStyle = "#7A6E5F";
    ctx.font = "500 26px Inter, Arial, sans-serif";
    ctx.fillText("Scannez pour découvrir ma boutique", W / 2, 830);
    ctx.fillText("et commander sur WhatsApp", W / 2, 866);

    ctx.fillStyle = "#D62828";
    ctx.font = "700 24px Inter, Arial, sans-serif";
    ctx.fillText("Consommer Burkinabè", W / 2, 918);

    setReady(true);
  }, [url, shopName]);

  useEffect(() => {
    compose();
  }, [compose]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-fasolink-${shopId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="card-premium p-6">
      <div className="flex items-center gap-2">
        <QrCode className="h-5 w-5 text-faso-red" />
        <h3 className="font-bold text-ink">QR Code boutique</h3>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        À imprimer pour votre devanture, vos emballages ou vos cartes de visite.
      </p>

      <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row">
        <div className="grid h-40 w-40 shrink-0 place-items-center rounded-2xl border border-clay-100 bg-white p-3">
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="QR Code de la boutique" className="h-full w-full" />
          ) : (
            <div className="h-full w-full animate-pulse rounded-lg bg-clay-100" />
          )}
        </div>
        <div className="flex-1">
          <p className="break-all text-xs text-ink-muted">{url}</p>
          <Button
            type="button"
            size="sm"
            variant="gold"
            className="mt-3"
            onClick={download}
            disabled={!ready}
          >
            <Download className="h-4 w-4" />
            Télécharger l&apos;affiche (PNG)
          </Button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let offsetY = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, offsetY);
      line = word + " ";
      offsetY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, offsetY);
}
