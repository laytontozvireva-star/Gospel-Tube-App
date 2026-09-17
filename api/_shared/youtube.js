import { fetchWithTimeout } from "./http.js";
const BASE = "https://www.googleapis.com/youtube/v3";
const key = () => process.env.YOUTUBE_API_KEY || "";

function canUseYouTube() { return Boolean(key()); }
function mapVideo(item, eventType) {
  return { id: item.id.videoId, source: "youtube", type: eventType === "live" ? "live" : "video", title: item.snippet.title, thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "", url: `https://www.youtube.com/watch?v=${item.id.videoId}`, author: item.snippet.channelTitle, publishedAt: item.snippet.publishedAt };
}
export async function searchYouTube(q, maxResults = 10, eventType = null) {
  if (!canUseYouTube()) return [];
  const params = new URLSearchParams({ part: "snippet", q, type: "video", maxResults: String(maxResults), key: key(), safeSearch: "strict" });
  if (eventType) params.append("eventType", eventType);
  const res = await fetchWithTimeout(`${BASE}/search?${params}`);
  if (!res.ok) throw new Error(`YouTube search failed (${res.status})`);
  return (await res.json()).items?.map((item) => mapVideo(item, eventType)) || [];
}
export async function getYouTubeVideo(videoId) {
  if (!canUseYouTube() || !/^[\w-]{11}$/.test(videoId)) return null;
  const params = new URLSearchParams({ part: "snippet,statistics,contentDetails", id: videoId, key: key() });
  const res = await fetchWithTimeout(`${BASE}/videos?${params}`);
  if (!res.ok) throw new Error(`YouTube video lookup failed (${res.status})`);
  const item = (await res.json()).items?.[0];
  return item ? { ...mapVideo({ ...item, id: { videoId: item.id } }), duration: item.contentDetails?.duration, viewCount: item.statistics?.viewCount } : null;
}