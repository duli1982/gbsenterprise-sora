# Frontend

This is a Next.js app using TypeScript, Tailwind CSS, and React Query.

## Local development

1. Ensure [Node.js](https://nodejs.org/) 18+ is installed.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in this directory:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_DEV_TOKEN=dev-token # optional helper token for local development
```

4. Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000/modules](http://localhost:3000/modules) to see the modules page powered by `/content/modules`.

5. To ensure the app builds correctly:

```bash
npm run build
```
