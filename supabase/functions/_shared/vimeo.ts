const BASE = "https://api.vimeo.com";

function token() {
  return Deno.env.get("VIMEO_ACCESS_TOKEN") ?? "";
}

export interface VimeoItem {
  id: string;
  source: "vimeo";
  type: "video";
  title: string;
  thumbnail: string;
  url: string;
  author: string;
  duration?: string;
  publishedAt?: string;
}

/** Search Vimeo for gospel videos */
export async function searchVimeo(q: string, perPage = 10): Promise<VimeoItem[]> {
  const params = new URLSearchParams({
    query: q,
    per_page: String(perPage),
    filter: "CC",
    sort: "relevant",
    fields: "uri,name,description,link,duration,created_time,user,pictures",
  });
  const res = await fetch(`${BASE}/videos?${params}`, {
    headers: { Authorization: `bearer ${token()}` },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data ?? []).map((item: any) => {
    const thumb = item.pictures?.sizes?.find((s: any) => s.width >= 640)?.link
      ?? item.pictures?.sizes?.[0]?.link ?? "";
    return {
      id: item.uri?.replace("/videos/", "") ?? "",
      source: "vimeo",
      type: "video",
      title: item.name,
      thumbnail: thumb,
      url: item.link,
      author: item.user?.name ?? "",
      duration: secToTime(item.duration),
      publishedAt: item.created_time,
    };
  });
}

function secToTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
