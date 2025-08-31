import admin, { ServiceAccount } from 'firebase-admin';

let db: FirebaseFirestore.Firestore;

try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? (JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount)
    : undefined;

  if (!admin.apps.length) {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      admin.initializeApp();
    }
  }

  db = admin.firestore();
} catch {
  // Allow tests to mock Firestore when credentials aren't provided
  db = {} as any;
}

export default db;
