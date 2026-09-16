let _token: string | null = null;
let _tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token!;
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID")!;
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET")!;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });
  const json = await res.json();
  _token = json.access_token;
  _tokenExpiry = Date.now() + (json.expires_in - 60) * 1000;
  return _token!;
}

export interface SpotifyItem {
  id: string;
  source: "spotify";
  type: "music" | "podcast";
  title: string;
  thumbnail: string;
  url: string;
  author: string;
  duration?: string;
  publishedAt?: string;
  previewUrl?: string;
}

/** Search Spotify tracks (gospel music) */
export async function searchSpotifyTracks(q: string, limit = 10): Promise<SpotifyItem[]> {
  const token = await getAccessToken();
  const params = new URLSearchParams({ q, type: "track", limit: String(limit), market: "US" });
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.tracks?.items ?? []).map((item: any) => ({
    id: item.id,
    source: "spotify",
    type: "music",
    title: item.name,
    thumbnail: item.album?.images?.[0]?.url ?? "",
    url: item.external_urls?.spotify ?? "",
    author: item.artists?.map((a: any) => a.name).join(", "),
    duration: msToTime(item.duration_ms),
    previewUrl: item.preview_url,
  }));
}

/** Search Spotify podcasts */
export async function searchSpotifyPodcasts(q: string, limit = 10): Promise<SpotifyItem[]> {
  const token = await getAccessToken();
  const params = new URLSearchParams({ q, type: "show", limit: String(limit), market: "US" });
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.shows?.items ?? []).map((item: any) => ({
    id: item.id,
    source: "spotify",
    type: "podcast",
    title: item.name,
    thumbnail: item.images?.[0]?.url ?? "",
    url: item.external_urls?.spotify ?? "",
    author: item.publisher,
  }));
}

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
