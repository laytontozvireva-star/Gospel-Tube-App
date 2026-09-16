/**
 * GospelTube API Client
 * ─────────────────────
 * Your own API that aggregates gospel content from:
 *   YouTube · Spotify · Apple Podcasts
 */

// Use relative URL so it works locally and on Vercel
const BASE_URL = "/api";

/** Get the current session auth header from localStorage */
function authHeader() {
  try {
    const raw = localStorage.getItem(
      `sb-${process.env.REACT_APP_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`
    );
    if (!raw) return {};
    const session = JSON.parse(raw);
    const token = session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.REACT_APP_SUPABASE_ANON_KEY,
      ...authHeader(),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ─── Unified Feed ──────────────────────────────────────────────────────────
/**
 * Get a mixed gospel content feed from all platforms.
 * @param {Object} opts
 * @param {string} [opts.q="gospel"] - search query
 * @param {"all"|"video"|"music"|"podcast"} [opts.type="all"]
 * @param {number} [opts.limit=8]
 */
export async function getFeed({ q = "gospel", type = "all", limit = 8 } = {}) {
  return apiFetch(`/feed?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`);
}

// ─── Videos (YouTube + Vimeo) ──────────────────────────────────────────────
/**
 * Search for gospel videos.
 * @param {Object} opts
 * @param {string} [opts.q="gospel sermon"]
 * @param {"all"|"youtube"|"vimeo"} [opts.source="all"]
 * @param {number} [opts.limit=10]
 */
export async function getVideos({ q = "gospel sermon", source = "all", limit = 10 } = {}) {
  return apiFetch(`/videos?q=${encodeURIComponent(q)}&source=${source}&limit=${limit}`);
}

/** Get full details for a single YouTube video by ID */
export async function getVideo(videoId) {
  return apiFetch(`/videos/${videoId}`);
}

// ─── Music (Spotify + SoundCloud) ──────────────────────────────────────────
/**
 * Search for gospel music.
 * @param {Object} opts
 * @param {string} [opts.q="gospel worship"]
 * @param {"all"|"spotify"|"soundcloud"} [opts.source="all"]
 * @param {number} [opts.limit=10]
 */
export async function getMusic({ q = "gospel worship", source = "all", limit = 10 } = {}) {
  return apiFetch(`/music?q=${encodeURIComponent(q)}&source=${source}&limit=${limit}`);
}

// ─── Podcasts (Apple Podcasts + Spotify) ───────────────────────────────────
/**
 * Search for gospel podcasts.
 * @param {Object} opts
 * @param {string} [opts.q="gospel"]
 * @param {number} [opts.limit=10]
 */
export async function getPodcasts({ q = "gospel", limit = 10 } = {}) {
  return apiFetch(`/podcasts?q=${encodeURIComponent(q)}&limit=${limit}`);
}

/**
 * Get episodes from a specific gospel podcast RSS feed.
 * @param {string} feedUrl - The RSS feed URL
 * @param {number} [limit=20]
 */
export async function getPodcastEpisodes(feedUrl, limit = 20) {
  return apiFetch(`/podcasts?feed=${encodeURIComponent(feedUrl)}&limit=${limit}`);
}

// ─── Live Streams (YouTube Live) ───────────────────────────────────────────
/**
 * Get currently live gospel streams.
 * @param {string} [q="gospel live stream"]
 */
export async function getLiveStreams(q = "gospel live stream") {
  return apiFetch(`/live?q=${encodeURIComponent(q)}`);
}

// ─── Apostles (your Supabase DB) ───────────────────────────────────────────
export async function getApostles() {
  return apiFetch("/apostles");
}

export async function getApostle(id) {
  return apiFetch(`/apostles/${id}`);
}

// ─── Comments (auth required for POST/DELETE) ──────────────────────────────
export async function getComments(videoId) {
  return apiFetch(`/comments?videoId=${videoId}`);
}

export async function addComment(videoId, content) {
  return apiFetch("/comments", {
    method: "POST",
    body: JSON.stringify({ videoId, content }),
  });
}

export async function deleteComment(commentId) {
  return apiFetch(`/comments/${commentId}`, { method: "DELETE" });
}

// ─── Likes (auth required) ─────────────────────────────────────────────────
export async function getLikedVideos() {
  return apiFetch("/likes");
}

export async function toggleLike(videoId) {
  return apiFetch(`/likes/${videoId}`, { method: "POST" });
}

// ─── Watch History (auth required) ─────────────────────────────────────────
export async function getWatchHistory() {
  return apiFetch("/history");
}

export async function saveWatchProgress(videoId, progressSeconds) {
  return apiFetch("/history", {
    method: "POST",
    body: JSON.stringify({ videoId, progressSeconds }),
  });
}

export async function clearWatchHistory() {
  return apiFetch("/history", { method: "DELETE" });
}

// ─── Playlists (auth required for write operations) ────────────────────────
export async function getPlaylists() {
  return apiFetch("/playlists");
}

export async function createPlaylist(name, description, isPublic = true) {
  return apiFetch("/playlists", {
    method: "POST",
    body: JSON.stringify({ name, description, isPublic }),
  });
}

export async function getPlaylistVideos(playlistId) {
  return apiFetch(`/playlists/${playlistId}/videos`);
}

export async function addVideoToPlaylist(playlistId, videoId) {
  return apiFetch(`/playlists/${playlistId}/videos`, {
    method: "POST",
    body: JSON.stringify({ videoId }),
  });
}

export async function deletePlaylist(playlistId) {
  return apiFetch(`/playlists/${playlistId}`, { method: "DELETE" });
}

// ─── Named export for convenience ──────────────────────────────────────────
export const gospelApi = {
  getFeed,
  getVideos,
  getVideo,
  getMusic,
  getPodcasts,
  getPodcastEpisodes,
  getLiveStreams,
  getApostles,
  getApostle,
  getComments,
  addComment,
  deleteComment,
  getLikedVideos,
  toggleLike,
  getWatchHistory,
  saveWatchProgress,
  clearWatchHistory,
  getPlaylists,
  createPlaylist,
  getPlaylistVideos,
  addVideoToPlaylist,
  deletePlaylist,
};
