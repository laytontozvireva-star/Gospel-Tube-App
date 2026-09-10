import { builtInVideos } from "../data/builtInVideos";

// In-memory cache for the client side
const cache = new Map();

export async function searchYouTubeVideos(query, maxResults = 10) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const cacheKey = `${trimmedQuery}_${maxResults}`;
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    // Cache on the client side for 1 hour
    if (Date.now() - timestamp < 3600000) {
      return data;
    }
  }

  const searchUrl = `/api/search?q=${encodeURIComponent(trimmedQuery)}&max=${encodeURIComponent(maxResults)}`;

  try {
    const resp = await fetch(searchUrl);
    if (!resp.ok) {
      if (resp.status === 429) {
        console.warn("YouTube API quota exceeded (429). Falling back to built-in videos.");
        return builtInVideos.slice(0, maxResults);
      }
      const body = await resp.json().catch(() => ({}));
      throw new Error(body.error || `Search request failed (${resp.status})`);
    }

    const videos = await resp.json();
    const result = Array.isArray(videos) ? videos : [];
    
    // Save to cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (err) {
    console.warn('YouTube API fallback triggered:', err.message);
    return builtInVideos.slice(0, maxResults);
  }
}