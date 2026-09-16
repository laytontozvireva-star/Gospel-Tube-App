import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { searchYouTube } from "../_shared/youtube.ts";
import { searchVimeo } from "../_shared/vimeo.ts";
import { searchSpotifyTracks, searchSpotifyPodcasts } from "../_shared/spotify.ts";
import { searchSoundCloud } from "../_shared/soundcloud.ts";
import { searchApplePodcasts } from "../_shared/podcast.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "gospel";
    const type = url.searchParams.get("type") || "all"; // all | video | music | podcast
    const limit = Math.min(Number(url.searchParams.get("limit") || "8"), 15);

    // Fetch from all platforms in parallel based on type filter
    const fetches: Promise<any[]>[] = [];

    if (type === "all" || type === "video") {
      fetches.push(searchYouTube(`${q} sermon`, limit));
      fetches.push(searchVimeo(`${q} church`, limit));
    } else {
      fetches.push(Promise.resolve([]));
      fetches.push(Promise.resolve([]));
    }

    if (type === "all" || type === "music") {
      fetches.push(searchSpotifyTracks(`${q} worship`, limit));
      fetches.push(searchSoundCloud(`${q} gospel music`, limit));
    } else {
      fetches.push(Promise.resolve([]));
      fetches.push(Promise.resolve([]));
    }

    if (type === "all" || type === "podcast") {
      fetches.push(searchApplePodcasts(`${q} gospel`, limit));
      fetches.push(searchSpotifyPodcasts(`${q} gospel`, limit));
    } else {
      fetches.push(Promise.resolve([]));
      fetches.push(Promise.resolve([]));
    }

    const settled = await Promise.allSettled(fetches);
    const [youtube, vimeo, spotify_music, soundcloud, apple, spotify_podcast] = settled.map(
      (r) => (r.status === "fulfilled" ? r.value : [])
    );

    // Merge and interleave results so feed is diverse
    const all = interleave([youtube, vimeo, spotify_music, soundcloud, apple, spotify_podcast]);

    return jsonResponse({
      results: all,
      total: all.length,
      sources: {
        youtube: youtube.length,
        vimeo: vimeo.length,
        spotify: (spotify_music.length + spotify_podcast.length),
        soundcloud: soundcloud.length,
        apple_podcasts: apple.length,
      },
    });
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});

/** Round-robin interleave arrays so the feed shows diverse sources */
function interleave(arrays: any[][]): any[] {
  const result: any[] = [];
  const max = Math.max(...arrays.map((a) => a.length));
  for (let i = 0; i < max; i++) {
    for (const arr of arrays) {
      if (arr[i] !== undefined) result.push(arr[i]);
    }
  }
  return result;
}
