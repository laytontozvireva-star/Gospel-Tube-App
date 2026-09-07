// Vercel serverless function that proxies YouTube search requests.
// The API key is stored as a private environment variable `YOUTUBE_API_KEY`
// and never exposed to the client bundle.

const gospelKeywords = [
  "gospel", "christian", "sermon", "pastor", "apostle", "prophet",
  "worship", "praise", "church", "jesus", "christ", "god", "bible",
  "ministry", "preaching", "faith", "holy", "bishop", "reverend"
];

export default async function handler(req, res) {
  const { q, max } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (typeof q !== "string" || !q.trim()) {
    return res.status(400).json({ error: "A search query is required" });
  }

  if (!apiKey) {
    console.error("YOUTUBE_API_KEY missing in Vercel environment");
    return res.status(500).json({ error: "Server configuration error: missing API key" });
  }

  const query = q.trim();
  const maxResults = Math.min(Math.max(Number(max) || 10, 1), 25);
  const includesGospelTerm = gospelKeywords.some((keyword) => query.toLowerCase().includes(keyword));
  const strictQuery = includesGospelTerm ? query : `${query} gospel christian sermon`;
  const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(strictQuery)}&type=video&safeSearch=strict&maxResults=${maxResults * 2}&key=${apiKey}`;

  try {
    const ytResp = await fetch(ytUrl);
    if (!ytResp.ok) {
      const txt = await ytResp.text();
      console.error("YouTube API error", ytResp.status, txt);
      return res.status(ytResp.status).json({ error: "YouTube API error" });
    }

    const data = await ytResp.json();
    const result = (data.items || [])
      .filter((item) => {
        const text = `${item.snippet.title} ${item.snippet.description} ${item.snippet.channelTitle}`.toLowerCase();
        return gospelKeywords.some((keyword) => text.includes(keyword));
      })
      .slice(0, maxResults)
      .map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        author: item.snippet.channelTitle,
        timeAgo: new Date(item.snippet.publishedAt).toLocaleDateString(),
        image: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        description: item.snippet.description,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("Unexpected error in /api/search", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}