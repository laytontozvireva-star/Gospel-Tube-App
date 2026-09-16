import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { searchSpotifyTracks } from "../_shared/spotify.ts";
import { searchSoundCloud } from "../_shared/soundcloud.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "gospel worship";
    const source = url.searchParams.get("source") || "all";
    const limit = Math.min(Number(url.searchParams.get("limit") || "10"), 25);

    const results = await Promise.allSettled([
      source === "soundcloud" ? Promise.resolve([]) : searchSpotifyTracks(q, limit),
      source === "spotify" ? Promise.resolve([]) : searchSoundCloud(q, limit),
    ]);

    const spotify = results[0].status === "fulfilled" ? results[0].value : [];
    const soundcloud = results[1].status === "fulfilled" ? results[1].value : [];

    const all = [...spotify, ...soundcloud];

    return jsonResponse({
      results: all,
      total: all.length,
      sources: { spotify: spotify.length, soundcloud: soundcloud.length },
    });
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
