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

## Deploying (frontend on Vercel, backend separate)

The **frontend** deploys to Vercel as a static SPA. The **backend** runs as a normal Node server on Railway, Render, Fly.io, or another host. There is no `/api/*` on Vercel.

### 1. Deploy the backend

Deploy the `backend/` folder to a Node host:

- **Railway**: New project → Deploy from GitHub → set **Root Directory** to `backend`. Build: `npm install && npm run build`. Start: `npm run start`.
- **Render**: New Web Service → connect repo, **Root Directory** `backend`, Build Command `npm install && npm run build`, Start Command `npm run start`. (Build must run `npm run build` so `dist/` exists; start runs from `backend/` so use `npm run start` or `node dist/index.js`.)
- **Fly.io** / others: same idea — root `backend`, then `npm run build` and `npm run start` (i.e. `node dist/index.js`).

**Backend env vars** (on the backend host):

- `CORS_ORIGIN=https://asramjin-gazar.vercel.app` (your Vercel frontend URL)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` (and any others from `backend/.env.example`)

Note the backend’s public URL (e.g. `https://your-app.railway.app`).

### 2. Deploy the frontend (Vercel)

- Connect the repo to Vercel. **Build Command**: `npm run build`. **Output Directory**: `dist`.
- **Required env var**: `VITE_API_URL` = your backend URL (e.g. `https://your-app.railway.app`). No trailing slash. The app uses this in production to call the backend.
- No backend env vars are needed on Vercel; only the frontend runs there.

## Public browsing

The app is **public by default** (no login required to browse). Login is required only for actions (upload, create, profile, etc.).
