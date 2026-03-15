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

So the backend **is** hosted on Vercel—same project, same domain. Requests to `https://your-app.vercel.app/api/*` run the Express app inside a serverless function. If login or API calls fail (e.g. 405, no data), common causes are: env vars (`CORS_ORIGIN`, Supabase, `JWT_SECRET`), or serverless/Express quirks (request format, cold starts).

### Option B: Host the backend separately

If the serverless setup is unreliable, you can run the backend as a **separate** Node server and keep only the frontend on Vercel:

1. **Deploy the backend** to a Node host (e.g. [Railway](https://railway.app), [Render](https://render.com), [Fly.io](https://fly.io), or a second Vercel project that only runs the backend).
2. **Backend** (e.g. `backend/` only):
   - Build: `npm run build` (in `backend/`)
   - Start: `npm run start`
   - Set env: `CORS_ORIGIN=https://asramjin-gazar.vercel.app`, plus Supabase and `JWT_SECRET`.
3. **Frontend** (Vercel):
   - Set **`VITE_API_URL`** to your backend URL (e.g. `https://your-backend.railway.app` or `https://your-api.vercel.app`).
   - Leave the repo’s `api/` folder unused (or remove it) so Vercel only serves the SPA.

Then the frontend will call the separate backend URL; CORS must allow your Vercel origin.

### Check that the backend is running on Vercel

After deploy, open **`https://your-app.vercel.app/api/health`** in the browser.

- If you see `{"status":"ok","source":"vercel-api",...}` → API routes work. If `/api/leaderboard` etc. still fail, the Express app may not be loading (check deploy logs for errors).
- If you see your SPA (HTML) or 404 → `/api/*` isn’t hitting serverless functions. **Fix:** In `vercel.json` we set `"framework": null` so Vercel uses “Other” and deploys both the static `dist/` and the `api/` serverless functions. If you override Framework in the Vercel dashboard, set it to **Other** (not Vite) so API routes are deployed.

### Vercel settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Note**: This project installs backend dependencies via `postinstall` automatically. `vercel.json` includes `backend/dist` in the API function so the Express app is available at runtime.

### Vercel Environment Variables (Backend)

Set these in Vercel Project Settings → Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `CORS_ORIGIN` (set to your Vercel frontend origin, e.g. `https://your-app.vercel.app`)

### Vercel Environment Variables (Frontend)

- `VITE_API_URL`:
  - **Same Vercel project (recommended):** Leave unset. The app will use the same origin as the site (e.g. `https://asramjin-gazar.vercel.app`), so it never calls localhost in production.
  - If backend is on a separate domain: set it to that backend URL.

## Public browsing

The app is **public by default** (no login required to browse). Login is required only for actions (upload, create, profile, etc.).
