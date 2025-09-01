import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db: FirebaseFirestore.Firestore;

try {
  const credentials = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!credentials) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined');
  }

  const serviceAccount = JSON.parse(credentials) as ServiceAccount;
  const app = initializeApp({ credential: cert(serviceAccount) });
  db = getFirestore(app);
} catch {
  // Allow tests to mock Firestore when credentials aren't provided
  db = {} as any;
}

export default db;
