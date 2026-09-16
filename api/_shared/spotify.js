let _token = null;
let _tokenExpiry = 0;

async function getAccessToken() {
  if (_token && Date.now() < _tokenExpiry) return _token;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const json = await res.json();
  _token = json.access_token;
  _tokenExpiry = Date.now() + (json.expires_in - 60) * 1000;
  return _token;
}

export async function searchSpotifyTracks(q, limit = 10) {
  try {
    const token = await getAccessToken();
    const params = new URLSearchParams({ q, type: "track", limit, market: "US" });
    const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.tracks?.items || []).map(item => ({
      id: item.id, source: "spotify", type: "music", title: item.name,
      thumbnail: item.album?.images?.[0]?.url || "",
      url: item.external_urls?.spotify || "",
      author: item.artists?.map(a => a.name).join(", "),
      duration: msToTime(item.duration_ms), previewUrl: item.preview_url,
    }));
  } catch (err) {
    return [];
  }
}

export async function searchSpotifyPodcasts(q, limit = 10) {
  try {
    const token = await getAccessToken();
    const params = new URLSearchParams({ q, type: "show", limit, market: "US" });
    const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.shows?.items || []).map(item => ({
      id: item.id, source: "spotify", type: "podcast", title: item.name,
      thumbnail: item.images?.[0]?.url || "",
      url: item.external_urls?.spotify || "", author: item.publisher,
    }));
  } catch (err) {
    return [];
  }
}

function msToTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
