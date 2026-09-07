export async function searchYouTubeVideos(query, maxResults = 10) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  // Keep the YouTube key on the server. Calling YouTube from the browser makes
  // the key public and breaks when its HTTP-referrer restriction is changed.
  const searchUrl = `/api/search?q=${encodeURIComponent(trimmedQuery)}&max=${encodeURIComponent(maxResults)}`;

  try {
    const resp = await fetch(searchUrl);
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(body.error || `Search request failed (${resp.status})`);
    }

    const videos = await resp.json();
    return Array.isArray(videos) ? videos : [];
  } catch (err) {
    console.error('Failed to fetch YouTube videos:', err);
    throw err;
  }
}