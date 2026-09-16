import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { searchYouTube } from "../_shared/youtube.ts";

// Default gospel search terms for live streams
const LIVE_QUERIES = ["gospel live stream", "church live service", "worship live"];

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || LIVE_QUERIES[0];

    // Fetch live streams from multiple queries in parallel
    const queries = q === LIVE_QUERIES[0] ? LIVE_QUERIES : [q];
    const results = await Promise.allSettled(
      queries.map((query) => searchYouTube(query, 5, "live"))
    );

    const seen = new Set<string>();
    const live = results
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

    return jsonResponse({ results: live, total: live.length, isLive: true });
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
