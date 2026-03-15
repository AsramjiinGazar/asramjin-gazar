import type { IncomingMessage, ServerResponse } from "http";

// Vercel will run `npm run build` which also builds `backend/` (see package.json).
// Import the compiled backend express app so NodeNext/ESM pathing works reliably.
import app from "../backend/dist/app.js";

// Ensure Node runtime and all HTTP methods are accepted (avoids 405 for POST/PUT/DELETE).
export const config = { runtime: "nodejs" as const };

export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  // Vercel may pass path without /api prefix for catch-all; Express expects full path.
  const raw = req.url ?? "";
  if (raw && !raw.startsWith("/api")) {
    (req as { url: string }).url = "/api" + (raw.startsWith("/") ? raw : "/" + raw);
  }
  return app(req as any, res as any);
}

