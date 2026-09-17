import { setCors } from './_shared/cors.js';
import { searchApplePodcasts } from './_shared/podcast.js';
import { searchSpotifyPodcasts } from './_shared/spotify.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const q = req.query.q || "gospel";
    const limit = Math.min(Number(req.query.limit || "10"), 25);

    const [apple, spotify] = await Promise.allSettled([
      searchApplePodcasts(q, limit),
      searchSpotifyPodcasts(q, limit),
    ]);

    const appleResults = apple.status === "fulfilled" ? apple.value : [];
    const spotifyResults = spotify.status === "fulfilled" ? spotify.value : [];

    const all = [...appleResults, ...spotifyResults];

    return res.status(200).json({
      results: all,
      total: all.length,
      sources: { apple_podcasts: appleResults.length, spotify: spotifyResults.length },
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
