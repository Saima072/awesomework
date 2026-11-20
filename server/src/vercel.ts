import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "./app.js";

// One Fastify instance per warm serverless instance.
const app = buildApp({ logger: true });
const ready = app.ready();

/**
 * vercel.json rewrites /api/<path> to this function as /api?__path=<path>.
 * Put the original path back so Fastify's routes match.
 */
export function restoreUrl(url: string): string {
  const u = new URL(url, "http://local");
  const path = u.searchParams.get("__path");
  if (path === null) return url;
  u.searchParams.delete("__path");
  const qs = u.searchParams.toString();
  return `/api/${path.replace(/^\/+/, "")}${qs ? `?${qs}` : ""}`;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ready;
  req.url = restoreUrl(req.url ?? "/");
  app.server.emit("request", req, res);
}
