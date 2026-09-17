const DEFAULT_QUERY_LIMIT = 80;

export function setCors(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",").map((value) => value.trim()).filter(Boolean);
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
}

export function allowGet(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") { res.status(204).end(); return false; }
  if (req.method !== "GET") { res.setHeader("Allow", "GET, OPTIONS"); res.status(405).json({ error: "Method not allowed" }); return false; }
  return true;
}

export function queryText(value, fallback, maxLength = DEFAULT_QUERY_LIMIT) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, maxLength) : fallback;
}

export function queryLimit(value, fallback, maximum) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), maximum) : fallback;
}

export function setCache(res, seconds, staleSeconds = seconds) {
  res.setHeader("Cache-Control", `public, s-maxage=${seconds}, stale-while-revalidate=${staleSeconds}`);
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}