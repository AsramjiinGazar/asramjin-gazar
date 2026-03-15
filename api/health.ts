/**
 * Standalone health check – no backend import.
 * If this returns 200 + JSON, Vercel API routes are working.
 * If you get 404 or HTML, /api/* isn’t hitting serverless functions.
 */
export default function handler(_req: unknown, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (s: string) => void }) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify({ status: "ok", source: "vercel-api", timestamp: new Date().toISOString() }));
}
