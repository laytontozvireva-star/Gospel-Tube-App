import { builtInVideos } from "../data/builtInVideos";

export async function searchYouTubeVideos(query, maxResults = 10) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

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
    return Array.isArray(videos) ? videos : [];
  } catch (err) {
    console.warn('YouTube API fallback triggered:', err.message);
    return builtInVideos.slice(0, maxResults);
  }
}