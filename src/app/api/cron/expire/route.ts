import { NextResponse } from "next/server";
import { firestoreBase, firestoreString, getEdgeServiceAccount, getFirestoreAccessToken, patchFirestoreDocument, runFirestoreQuery } from "@/lib/firestore-edge-admin";

export const runtime = "edge";

function valueOf(value: Record<string, unknown>) {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  return null;
}

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("x-cron-secret") === secret || request.headers.get("authorization") === `Bearer ${secret}`;
}

async function querySubscriptions(token: string, account: ReturnType<typeof getEdgeServiceAccount>, status: "trialing" | "active", now: string) {
  return runFirestoreQuery(account, token, {
    from: [{ collectionId: "subscriptions" }],
    where: { compositeFilter: { op: "AND", filters: [
      { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: firestoreString(status) } },
      { fieldFilter: { field: { fieldPath: "expires_at" }, op: "LESS_THAN_OR_EQUAL", value: firestoreString(now) } },
    ] } },
  });
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const account = getEdgeServiceAccount();
    const token = await getFirestoreAccessToken(account);
    const now = new Date().toISOString();
    const expiredRows = [
      ...(await querySubscriptions(token, account, "trialing", now)),
      ...(await querySubscriptions(token, account, "active", now)),
    ];
    let expired = 0;
    let suspended = 0;
    for (const row of expiredRows) {
      const document = row.document;
      if (!document) continue;
      const data = Object.fromEntries(Object.entries(document.fields).map(([key, value]) => [key, valueOf(value)])) as { shop_id?: string };
      await patchFirestoreDocument(document.name, { status: firestoreString("expired"), updated_at: firestoreString(now) }, token);
      expired++;
      if (!data.shop_id) continue;
      const activeRows = [
        ...(await runFirestoreQuery(account, token, { from: [{ collectionId: "subscriptions" }], where: { compositeFilter: { op: "AND", filters: [
          { fieldFilter: { field: { fieldPath: "shop_id" }, op: "EQUAL", value: firestoreString(data.shop_id) } },
          { fieldFilter: { field: { fieldPath: "status" }, op: "IN", value: { arrayValue: { values: [firestoreString("active"), firestoreString("trialing")] } } } },
          { fieldFilter: { field: { fieldPath: "expires_at" }, op: "GREATER_THAN", value: firestoreString(now) } },
        ] } } })),
      ];
      if (activeRows.length === 0) {
        await patchFirestoreDocument(`${firestoreBase(account.project_id)}/shops/${encodeURIComponent(data.shop_id)}`, { status: firestoreString("suspended"), updated_at: firestoreString(now) }, token);
        suspended++;
      }
    }
    return NextResponse.json({ ok: true, expired, suspended, checkedAt: now });
  } catch (error) {
    console.error("[FasoLink] expiry cron:", error);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
