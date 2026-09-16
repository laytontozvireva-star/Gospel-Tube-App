import { setCors } from './_shared/cors.js';
import { searchYouTube } from './_shared/youtube.js';
import { searchSpotifyTracks, searchSpotifyPodcasts } from './_shared/spotify.js';
import { searchApplePodcasts } from './_shared/podcast.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const q = req.query.q || "gospel";
    const type = req.query.type || "all"; 
    const limit = Math.min(Number(req.query.limit || "8"), 15);

    const fetches = [];

    if (type === "all" || type === "video") fetches.push(searchYouTube(`${q} sermon`, limit));
    else fetches.push(Promise.resolve([]));

    if (type === "all" || type === "music") fetches.push(searchSpotifyTracks(`${q} worship`, limit));
    else fetches.push(Promise.resolve([]));

    if (type === "all" || type === "podcast") {
      fetches.push(searchApplePodcasts(`${q} gospel`, limit));
      fetches.push(searchSpotifyPodcasts(`${q} gospel`, limit));
    } else {
      fetches.push(Promise.resolve([]));
      fetches.push(Promise.resolve([]));
    }

    const settled = await Promise.allSettled(fetches);
    const [youtube, spotify_music, apple, spotify_podcast] = settled.map(
      (r) => (r.status === "fulfilled" ? r.value : [])
    );

    const all = interleave([youtube, spotify_music, apple, spotify_podcast]);

    return res.status(200).json({
      results: all,
      total: all.length,
      sources: {
        youtube: youtube.length,
        spotify: (spotify_music.length + spotify_podcast.length),
        apple_podcasts: apple.length,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}

function interleave(arrays) {
  const result = [];
  const max = Math.max(...arrays.map((a) => a.length));
  for (let i = 0; i < max; i++) {
    for (const arr of arrays) {
      if (arr[i] !== undefined) result.push(arr[i]);
    }
  }
  return result;
}
