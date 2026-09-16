const BASE = "https://www.googleapis.com/youtube/v3";

function key() {
  return Deno.env.get("YOUTUBE_API_KEY") ?? "";
}

export interface YouTubeItem {
  id: string;
  source: "youtube";
  type: "video" | "live";
  title: string;
  thumbnail: string;
  url: string;
  author: string;
  duration?: string;
  publishedAt: string;
  viewCount?: string;
}

/** Search YouTube for gospel videos */
export async function searchYouTube(
  q: string,
  maxResults = 10,
  eventType?: "live" | "completed"
): Promise<YouTubeItem[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q,
    type: "video",
    maxResults: String(maxResults),
    key: key(),
    safeSearch: "strict",
    ...(eventType ? { eventType } : {}),
  });
  const res = await fetch(`${BASE}/search?${params}`);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.items ?? []).map((item: any) => ({
    id: item.id.videoId,
    source: "youtube",
    type: eventType === "live" ? "live" : "video",
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    author: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  }));
}

/** Get full details for a single YouTube video */
export async function getYouTubeVideo(videoId: string): Promise<YouTubeItem | null> {
  const params = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    id: videoId,
    key: key(),
  });
  const res = await fetch(`${BASE}/videos?${params}`);
  if (!res.ok) return null;
  const json = await res.json();
  const item = json.items?.[0];
  if (!item) return null;
  return {
    id: item.id,
    source: "youtube",
    type: "video",
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url ?? "",
    url: `https://www.youtube.com/watch?v=${item.id}`,
    author: item.snippet.channelTitle,
    duration: item.contentDetails?.duration,
    publishedAt: item.snippet.publishedAt,
    viewCount: item.statistics?.viewCount,
  };
}
