import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { searchApplePodcasts, fetchPodcastEpisodes } from "../_shared/podcast.ts";
import { searchSpotifyPodcasts } from "../_shared/spotify.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "gospel";
    const feedUrl = url.searchParams.get("feed");
    const limit = Math.min(Number(url.searchParams.get("limit") || "10"), 25);

    // GET /podcasts?feed=<rss_url> — episodes from a specific RSS feed
    if (feedUrl) {
      const episodes = await fetchPodcastEpisodes(feedUrl, limit);
      return jsonResponse({ results: episodes, total: episodes.length });
    }

    // GET /podcasts?q=gospel — search Apple Podcasts + Spotify
    const [apple, spotify] = await Promise.allSettled([
      searchApplePodcasts(q, limit),
      searchSpotifyPodcasts(q, limit),
    ]);

    const appleResults = apple.status === "fulfilled" ? apple.value : [];
    const spotifyResults = spotify.status === "fulfilled" ? spotify.value : [];

    const all = [...appleResults, ...spotifyResults];

    return jsonResponse({
      results: all,
      total: all.length,
      sources: { apple_podcasts: appleResults.length, spotify: spotifyResults.length },
    });
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
