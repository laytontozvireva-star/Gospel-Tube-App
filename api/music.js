import { setCors } from './_shared/cors.js';
import { searchSpotifyTracks } from './_shared/spotify.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const q = req.query.q || "gospel worship";
    const limit = Math.min(Number(req.query.limit || "10"), 25);

    const spotify = await searchSpotifyTracks(q, limit);

    return res.status(200).json({
      results: spotify,
      total: spotify.length,
      sources: { spotify: spotify.length },
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
