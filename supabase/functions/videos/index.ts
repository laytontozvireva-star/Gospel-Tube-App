import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { searchYouTube, getYouTubeVideo } from "../_shared/youtube.ts";
import { searchVimeo } from "../_shared/vimeo.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "gospel sermon";
    const source = url.searchParams.get("source") || "all";
    const limit = Math.min(Number(url.searchParams.get("limit") || "10"), 25);

    // GET /videos/:id — single YouTube video
    const pathParts = url.pathname.split("/").filter(Boolean);
    const videoId = pathParts[pathParts.length - 1];
    if (videoId && videoId !== "videos") {
      const video = await getYouTubeVideo(videoId);
      if (!video) return errorResponse("Video not found", 404);
      return jsonResponse(video);
    }

    // GET /videos?q=...&source=youtube|vimeo|all
    const results = await Promise.allSettled([
      source === "vimeo" ? Promise.resolve([]) : searchYouTube(q, limit),
      source === "youtube" ? Promise.resolve([]) : searchVimeo(q, limit),
    ]);

    const youtube = results[0].status === "fulfilled" ? results[0].value : [];
    const vimeo = results[1].status === "fulfilled" ? results[1].value : [];

    const all = [...youtube, ...vimeo].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return jsonResponse({ results: all, total: all.length, sources: { youtube: youtube.length, vimeo: vimeo.length } });
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
