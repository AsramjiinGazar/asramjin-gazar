import type { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { pathToFileURL } from "url";
import { fileURLToPath } from "url";

export const config = { runtime: "nodejs" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let appPromise: Promise<any> | null = null;

function getApp() {
  if (!appPromise) {
    const appPath = path.resolve(__dirname, "..", "backend", "dist", "app.js");
    appPromise = import(pathToFileURL(appPath).href).then((m) => m.default);
  }
  return appPromise;
}

export default async function handler(
  req: IncomingMessage & { url?: string },
  res: ServerResponse
) {
  const raw = req.url ?? "";
  const pathname = (raw.split("?")[0] ?? "").replace(/\/$/, "") || "/api";

  // Quick responses without loading Express
  if (pathname === "/api" || pathname === "/api/health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ status: "ok", source: "vercel-api", timestamp: new Date().toISOString() })
    );
    return;
  }

  // Ensure Express sees full path with /api prefix
  if (raw && !raw.startsWith("/api")) {
    (req as { url: string }).url = "/api" + (raw.startsWith("/") ? raw : "/" + raw);
  }

  try {
    const app = await getApp();
    await new Promise<void>((resolve, reject) => {
      res.once("finish", () => resolve());
      res.once("error", reject);
      app(req as any, res as any);
    });
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
