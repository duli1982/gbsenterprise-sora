# Backend

Express/TypeScript backend for the Sora demo. The API uses Firebase Firestore to store training modules.

## Environment Variables

Set these variables in your environment or a `.env` file:

- `PORT` – server port (default `3001`).
- `FIREBASE_SERVICE_ACCOUNT` – JSON-encoded service account used to initialize `firebase-admin`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` – Google OAuth credentials.
- `FIRESTORE_EMULATOR_HOST` – optional host for the Firestore emulator.

Example:

```bash
PORT=3001
FIREBASE_SERVICE_ACCOUNT='{"projectId":"demo","clientEmail":"foo@bar","privateKey":"-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n"}'
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback
```

## Authentication

All protected routes expect an `Authorization` header with a Google ID token.
For local development you can bypass the Google flow by sending the literal
string `dev-token` as the bearer token:

```
Authorization: Bearer dev-token
```

## Development

Install dependencies and seed sample data:

```bash
npm install
npm run seed:modules
npm run start
```

The `seed:modules` script inserts a few sample documents into the `modules`
collection so the `/content/modules` endpoint returns data immediately.

## Testing

```bash
npm test
```

Tests mock Firestore so no external services are needed.
