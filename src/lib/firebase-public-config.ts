/**
 * Paramètres Firebase Web publics de FasoLink.
 * Firebase précise que ce config identifie l'application; l'accès aux données
 * est contrôlé par Authentication, Firestore Rules et App Check.
 * Ces valeurs sont nécessaires aux builds Pages déclenchés depuis Git,
 * qui ne peuvent pas lire le fichier local .env.local.
 */
export const firebasePublicConfig = {
  "apiKey": "AIzaSyA_b6eWVOTE2OsU0vq9V0ky6wJaBsI_q6w",
  "authDomain": "fasolink-d6e77.firebaseapp.com",
  "projectId": "fasolink-d6e77",
  "storageBucket": "fasolink-d6e77.firebasestorage.app",
  "messagingSenderId": "979555094870",
  "appId": "1:979555094870:web:93a4046918f870e741c6f7"
} as const;
