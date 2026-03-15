import type { IncomingMessage, ServerResponse } from "http";

// Vercel will run `npm run build` which also builds `backend/` (see package.json).
// Import the compiled backend express app so NodeNext/ESM pathing works reliably.
import app from "../backend/dist/app.js";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Express apps are (req, res) handlers.
  return app(req as any, res as any);
}

