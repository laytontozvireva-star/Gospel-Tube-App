const BASE = "https://api.soundcloud.com";

function clientId() {
  return Deno.env.get("SOUNDCLOUD_CLIENT_ID") ?? "";
}

export interface SoundCloudItem {
  id: string;
  source: "soundcloud";
  type: "music";
  title: string;
  thumbnail: string;
  url: string;
  author: string;
  duration?: string;
  publishedAt?: string;
}

/** Search SoundCloud for gospel tracks */
export async function searchSoundCloud(q: string, limit = 10): Promise<SoundCloudItem[]> {
  const params = new URLSearchParams({
    q,
    limit: String(limit),
    client_id: clientId(),
  });
  const res = await fetch(`${BASE}/tracks?${params}`);
  if (!res.ok) return [];
  const json = await res.json();
  return (Array.isArray(json) ? json : []).map((item: any) => ({
    id: String(item.id),
    source: "soundcloud",
    type: "music",
    title: item.title,
    thumbnail: item.artwork_url?.replace("-large", "-t300x300") ?? "",
    url: item.permalink_url,
    author: item.user?.username ?? "",
    duration: msToTime(item.duration),
    publishedAt: item.created_at,
  }));
}

function msToTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
