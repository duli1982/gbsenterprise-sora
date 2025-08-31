let admin: any;
try {
  admin = require('firebase-admin');
} catch {
  admin = {
    apps: [],
    initializeApp: () => {},
    credential: { cert: () => ({}) },
    firestore: () => ({})
  };
}

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
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

const db = admin.firestore();
export default db;
