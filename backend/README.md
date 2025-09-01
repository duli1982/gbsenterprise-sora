# Backend

Express/TypeScript backend for the Sora demo. The API uses Firebase Firestore to store training modules.

## Environment Variables

Set these variables in your environment or a `.env` file:

- `PORT` – server port (default `3001`).
- `FIREBASE_SERVICE_ACCOUNT` – JSON-encoded service account used to initialize `firebase-admin`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` – Google OAuth credentials.
- `JWT_SECRET` – secret used to sign JWT access and refresh tokens.
- `FIRESTORE_EMULATOR_HOST` – optional host for the Firestore emulator.
- BigQuery uses application default credentials. Set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON key if needed.

Example:

```bash
PORT=3001
FIREBASE_SERVICE_ACCOUNT='{"projectId":"demo","clientEmail":"foo@bar","privateKey":"-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n"}'
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback
```

## Authentication

The backend uses Google OAuth for sign-in and issues its own JWT access and
refresh tokens.

1. `POST /auth/login` returns a Google OAuth URL for the client to redirect to.
2. After Google redirects back to your app, send the authorization `code` to
   `POST /auth/callback` to exchange it for signed `accessToken` and
   `refreshToken` values.
3. Include the access token in the `Authorization` header to access protected
   routes:

```
Authorization: Bearer <accessToken>
```

4. When the access token expires, call `POST /auth/refresh` with the refresh
   token to obtain a new access token.
5. Call `POST /auth/logout` with the refresh token to invalidate it.

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

## Analytics

Training progress is persisted to Firestore and richer analytics events are
streamed to BigQuery.

Routes:

- `POST /progress/complete` – mark a module completed for the authenticated user.
- `GET /progress/user/:userId` – return progress for a given user.
- `POST /analytics/events` – ingest a custom event which is inserted into the
  BigQuery dataset `analytics` table `events`.
- `GET /analytics/dashboard` – aggregate events by type and module from
  BigQuery.

Create the dataset and table in BigQuery ahead of time with a schema matching
the fields above. For local development provide credentials via the
`GOOGLE_APPLICATION_CREDENTIALS` environment variable or another method supported
by the Google Cloud SDK.
