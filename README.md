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
   - `GOOGLE_CLIENT_ID` – OAuth client used to verify Google ID tokens.
   - `FIREBASE_SERVICE_ACCOUNT` – JSON service account credentials for Firestore.
3. Run the development server:
   ```bash
   npm run build
   npm start
   ```

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
