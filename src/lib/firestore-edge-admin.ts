export interface EdgeServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

type FirestoreFields = Record<string, Record<string, unknown>>;

let cachedToken: { value: string; expiresAt: number } | null = null;

export function getEdgeServiceAccount(): EdgeServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is missing");
  return JSON.parse(raw) as EdgeServiceAccount;
}

function base64Url(input: string | ArrayBuffer) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemBytes(pem: string) {
  const binary = atob(pem.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\s/g, ""));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export async function getFirestoreAccessToken(account: EdgeServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 60) return cachedToken.value;
  const unsigned = `${base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64Url(JSON.stringify({ iss: account.client_email, scope: "https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }))}`;
  const key = await crypto.subtle.importKey("pkcs8", pemBytes(account.private_key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${base64Url(signature)}` }),
  });
  if (!response.ok) throw new Error("Google OAuth token request failed");
  const body = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: body.access_token, expiresAt: now + body.expires_in };
  return body.access_token;
}

export function firestoreBase(projectId: string) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;
}

export function firestoreString(value: string) {
  return { stringValue: value };
}

export function firestoreData(fields: FirestoreFields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => {
    if ("stringValue" in value) return [key, value.stringValue];
    if ("integerValue" in value) return [key, Number(value.integerValue)];
    if ("doubleValue" in value) return [key, Number(value.doubleValue)];
    if ("booleanValue" in value) return [key, value.booleanValue];
    if ("nullValue" in value) return [key, null];
    return [key, null];
  }));
}

export async function runFirestoreQuery(account: EdgeServiceAccount, accessToken: string, structuredQuery: Record<string, unknown>) {
  const response = await fetch(`${firestoreBase(account.project_id)}:runQuery`, {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({ structuredQuery }),
  });
  if (!response.ok) throw new Error("Firestore query failed");
  return (await response.json()) as Array<{ document?: { name: string; fields: FirestoreFields } }>;
}

export async function patchFirestoreDocument(documentName: string, fields: FirestoreFields, accessToken: string) {
  const url = new URL(`https://firestore.googleapis.com/v1/${documentName}`);
  for (const fieldPath of Object.keys(fields)) url.searchParams.append("updateMask.fieldPaths", fieldPath);
  const response = await fetch(url, {
    method: "PATCH",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!response.ok) throw new Error("Firestore document update failed");
}
