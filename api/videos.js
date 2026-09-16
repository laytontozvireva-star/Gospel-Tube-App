import { setCors } from './_shared/cors.js';
import { searchYouTube, getYouTubeVideo } from './_shared/youtube.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const q = req.query.q || "gospel sermon";
    const limit = Math.min(Number(req.query.limit || "10"), 25);
    const videoId = req.query.id;

    if (videoId) {
      const video = await getYouTubeVideo(videoId);
      if (!video) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(video);
    }

    const youtube = await searchYouTube(q, limit);
    return res.status(200).json({ results: youtube, total: youtube.length, sources: { youtube: youtube.length } });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
