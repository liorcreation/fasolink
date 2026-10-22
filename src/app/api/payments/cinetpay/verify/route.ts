import { NextResponse } from "next/server";
import { POST as paymentWebhook } from "@/app/api/webhooks/payment/route";
import { isValidTransactionId } from "@/lib/payments/cinetpay";

export async function POST(request: Request) {
  try {
    const { reference } = (await request.json()) as { reference?: string };
    if (!reference || !isValidTransactionId(reference)) {
      return NextResponse.json({ error: "Référence de paiement non valide." }, { status: 400 });
    }

    const siteId = process.env.CINETPAY_SITE_ID ?? "";
    const result = await paymentWebhook(
      new Request(new URL("/api/webhooks/payment", request.url), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cpm_trans_id: reference, cpm_site_id: siteId }),
      }),
    );

    return new Response(result.body, { status: result.status, headers: result.headers });
  } catch (error) {
    console.error("[FasoLink Security] CinetPay return verification error:", error);
    return NextResponse.json({ error: "Vérification du paiement indisponible." }, { status: 500 });
  }
}
