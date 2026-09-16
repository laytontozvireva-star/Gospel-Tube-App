const BASE = "https://www.googleapis.com/youtube/v3";
const key = () => process.env.YOUTUBE_API_KEY || "";

export async function searchYouTube(q, maxResults = 10, eventType = null) {
  const params = new URLSearchParams({
    part: "snippet", q, type: "video", maxResults, key: key(), safeSearch: "strict"
  });
  if (eventType) params.append("eventType", eventType);
  
  const res = await fetch(`${BASE}/search?${params}`);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.items || []).map(item => ({
    id: item.id.videoId, source: "youtube", type: eventType === "live" ? "live" : "video",
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    author: item.snippet.channelTitle, publishedAt: item.snippet.publishedAt,
  }));
}

export async function getYouTubeVideo(videoId) {
  const params = new URLSearchParams({ part: "snippet,statistics,contentDetails", id: videoId, key: key() });
  const res = await fetch(`${BASE}/videos?${params}`);
  if (!res.ok) return null;
  const json = await res.json();
  const item = json.items?.[0];
  if (!item) return null;
  return {
    id: item.id, source: "youtube", type: "video", title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url || "",
    url: `https://www.youtube.com/watch?v=${item.id}`,
    author: item.snippet.channelTitle, duration: item.contentDetails?.duration,
    publishedAt: item.snippet.publishedAt, viewCount: item.statistics?.viewCount,
  };
}
