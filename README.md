# GBS Learning Hub

This repository contains a TypeScript Express backend and a Next.js frontend.

## Backend

Located in `backend/` and built with TypeScript. It exposes authentication and content APIs backed by Firestore.

### Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Set environment variables:
   - `GOOGLE_CLIENT_ID` – OAuth client ID used to verify Google ID tokens.
   - `GOOGLE_CLIENT_SECRET` – OAuth client secret for login flows.
   - `GOOGLE_REDIRECT_URI` – Redirect URI configured in Google Cloud Console.
   - `FIREBASE_SERVICE_ACCOUNT` – JSON service account credentials for Firestore.
   Create a `.env` file using [`backend/.env.example`](backend/.env.example) as a template.
3. Run the development server:
   ```bash
   npm run build
   npm start
   ```

### Authentication

The backend expects a Google ID token in the `Authorization` header as `Bearer <token>`.

Useful endpoints:

- `POST /auth/login` – returns a Google OAuth URL that the frontend can redirect the user to.
- `GET /auth/profile` – returns the decoded user profile for a valid token.

For testing, the backend accepts a fake token `valid-token` that resolves to a mock user.

### Analytics & Progress Tracking

The backend exposes endpoints for recording user progress and arbitrary analytics events.

- `POST /progress/complete` – store a completed module in Firestore.
- `GET /progress/user/:userId` – retrieve a user's completed modules.
- `POST /analytics/events` – emit interaction events which are streamed into BigQuery.
- `GET /analytics/dashboard` – returns aggregated event counts from BigQuery for reporting.

Firestore is used to persist per-user progress while analytics events are inserted into the
BigQuery dataset `analytics.events`.

## Frontend

The Next.js app lives in `frontend/` and uses React Query to call the backend.

### Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create `.env.local` with the backend URL:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000/modules` to see module data.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Cloud Build and Cloud Run deployment instructions.
