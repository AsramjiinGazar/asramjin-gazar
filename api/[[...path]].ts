import type { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { pathToFileURL } from "url";

export const config = { runtime: "nodejs" };

let appPromise: Promise<any> | null = null;

function getApp() {
  if (!appPromise) {
    const appPath = path.join(process.cwd(), "backend", "dist", "app.js");
    appPromise = import(pathToFileURL(appPath).href).then((m) => m.default);
  }
  return appPromise;
}

export default async function handler(
  req: IncomingMessage & { url?: string },
  res: ServerResponse
) {
  const raw = req.url ?? "";
  const pathname = raw.split("?")[0] ?? "";

  // Standalone health check (no backend) so we can confirm API routes work.
  if (pathname === "/api/health" || pathname === "/api") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        status: "ok",
        source: "vercel-api",
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // Ensure Express sees full path with /api prefix.
  if (raw && !raw.startsWith("/api")) {
    (req as { url: string }).url = "/api" + (raw.startsWith("/") ? raw : "/" + raw);
  }

  try {
    const app = await getApp();
    return app(req as any, res as any);
  } catch (err) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Backend failed to load",
        message: err instanceof Error ? err.message : String(err),
      })
    );
  }
}
