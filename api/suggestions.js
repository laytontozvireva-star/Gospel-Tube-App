// Proxies YouTube search suggestions so the browser has one same-origin API surface.
export default async function handler(req, res) {
  // Cache suggestions at the edge for 24 hours
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');

  const { q } = req.query;
  if (typeof q !== "string" || q.trim().length < 2) {
    return res.status(200).json([]);
  }

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q.trim())}`;
    const response = await fetch(url);
    if (!response.ok) return res.status(200).json([]);

    const [, suggestions] = await response.json();
    const uniqueSuggestions = [...new Set((suggestions || []).filter((item) => typeof item === "string"))].slice(0, 6);
    return res.status(200).json(uniqueSuggestions);
  } catch (error) {
    console.error("Unexpected error in /api/suggestions", error);
    return res.status(200).json([]);
  }
}