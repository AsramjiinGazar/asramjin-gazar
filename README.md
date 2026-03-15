# Asramjiin Gazar (Vite + Express)

This repo contains:

- **Frontend**: Vite + React (SPA) in the repo root
- **Backend**: Express + TypeScript in `backend/`

## Local development

### Backend

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` from `backend/.env.example`.

### Frontend

```bash
npm install
npm run dev
```

Create `.env` from `.env.example`.

## Production build

### Backend

```bash
cd backend
npm install
npm run build
npm run start
```

### Frontend

```bash
npm install
npm run build
```

Deploy the `dist/` folder to your static host.

## Hosting notes (important)

- **SPA routing**: this is a React Router SPA. Your host must rewrite unknown routes to `index.html`.
  - Netlify: `public/_redirects` is included in this repo.
- Vercel: `vercel.json` is included in this repo.
- **API URL**: set `VITE_API_URL` (frontend) to your deployed backend URL.
- **CORS**: set `CORS_ORIGIN` (backend) to your frontend origin(s), comma-separated.
  - Example: `CORS_ORIGIN=https://your-frontend.com,http://localhost:8080`

## Deploying on Vercel

This repo is configured to deploy on **Vercel** as:

- **Frontend**: Vite SPA (build output: `dist/`)
- **Backend**: Serverless function under `/api/*` (wraps the Express app)

### Vercel settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Vercel Environment Variables (Backend)

Set these in Vercel Project Settings → Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `CORS_ORIGIN` (set to your Vercel frontend origin, e.g. `https://your-app.vercel.app`)

### Vercel Environment Variables (Frontend)

- `VITE_API_URL`:
  - If you deploy backend in the same Vercel project (recommended here): set it to empty, or set it to your site origin.
  - If backend is on a separate domain: set it to that backend URL.

## Public browsing

The app is **public by default** (no login required to browse). Login is required only for actions (upload, create, profile, etc.).
