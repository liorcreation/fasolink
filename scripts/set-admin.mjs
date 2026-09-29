import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2];
const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!email || !raw) {
  console.error("Usage: npm run admin:set -- admin@client.bf");
  console.error("FIREBASE_SERVICE_ACCOUNT doit contenir la clé JSON Firebase Admin.");
  process.exit(1);
}

if (!getApps().length) {
  const account = JSON.parse(raw);
  initializeApp({
    credential: cert({
      projectId: account.project_id,
      clientEmail: account.client_email,
      privateKey: account.private_key,
    }),
  });
}

const adminAuth = getAuth();
const user = await adminAuth.getUserByEmail(email);
await adminAuth.setCustomUserClaims(user.uid, { admin: true });
console.log(`Custom claim admin activé pour ${email}. Reconnectez-vous dans FasoLink.`);
