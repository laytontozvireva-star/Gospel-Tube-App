export function setCors(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean);
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
}