import { NextResponse } from "next/server";
import { POST as paymentWebhook } from "@/app/api/webhooks/payment/route";


export async function POST(request: Request) {
  try {
    const { reference } = await request.json() as { reference?: string };
    if (!reference || !/^FL[0-9]{13,}[A-Fa-f0-9]{8,16}$/.test(reference)) {
      return NextResponse.json({ error: "Référence de paiement invalide." }, { status: 400 });
    }
    const result = await paymentWebhook(new Request(new URL("/api/webhooks/payment", request.url), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cpm_trans_id: reference, cpm_site_id: process.env.CINETPAY_SITE_ID ?? "" }),
    }));
    return new Response(result.body, { status: result.status, headers: result.headers });
  } catch (error) {
    console.error("[FasoLink] CinetPay return verification:", error);
    return NextResponse.json({ error: "Vérification du paiement indisponible." }, { status: 500 });
  }
}
