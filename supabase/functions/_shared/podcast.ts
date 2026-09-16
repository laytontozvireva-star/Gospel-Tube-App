export interface PodcastItem {
  id: string;
  source: "apple_podcasts";
  type: "podcast";
  title: string;
  thumbnail: string;
  url: string;
  author: string;
  publishedAt?: string;
  description?: string;
}

export interface PodcastEpisode {
  id: string;
  source: "apple_podcasts";
  type: "podcast";
  title: string;
  thumbnail: string;
  url: string;
  author: string;
  duration?: string;
  publishedAt?: string;
  description?: string;
  audioUrl?: string;
}

/** Search Apple Podcasts for gospel shows via iTunes Search API (no key required) */
export async function searchApplePodcasts(q: string, limit = 10): Promise<PodcastItem[]> {
  const params = new URLSearchParams({
    term: q,
    media: "podcast",
    limit: String(limit),
    entity: "podcast",
    explicit: "No",
  });
  const res = await fetch(`https://itunes.apple.com/search?${params}`);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.results ?? []).map((item: any) => ({
    id: String(item.collectionId),
    source: "apple_podcasts",
    type: "podcast",
    title: item.collectionName,
    thumbnail: item.artworkUrl600 ?? item.artworkUrl100 ?? "",
    url: item.collectionViewUrl ?? "",
    author: item.artistName ?? "",
    description: item.primaryGenreName,
  }));
}

/** Fetch episodes from any gospel podcast RSS feed */
export async function fetchPodcastEpisodes(feedUrl: string, limit = 20): Promise<PodcastEpisode[]> {
  const res = await fetch(feedUrl);
  if (!res.ok) return [];
  const xml = await res.text();

  const items: PodcastEpisode[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const [, itemXml] of itemMatches) {
    if (items.length >= limit) break;
    const title = extractTag(itemXml, "title");
    const url = extractAttr(itemXml, "enclosure", "url") ?? extractTag(itemXml, "link");
    const audioUrl = extractAttr(itemXml, "enclosure", "url");
    const pubDate = extractTag(itemXml, "pubDate");
    const duration = extractTag(itemXml, "itunes:duration");
    const description = extractTag(itemXml, "description")?.replace(/<[^>]+>/g, "").trim();
    const thumbnail =
      extractAttr(itemXml, "itunes:image", "href") ??
      extractAttr(itemXml, "media:thumbnail", "url") ?? "";
    const author = extractTag(itemXml, "itunes:author") ?? extractTag(itemXml, "author") ?? "";

    if (title) {
      items.push({
        id: url ?? title,
        source: "apple_podcasts",
        type: "podcast",
        title,
        thumbnail,
        url: url ?? "",
        author,
        duration,
        publishedAt: pubDate,
        description,
        audioUrl,
      });
    }
  }
  return items;
}

function extractTag(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, "s"));
  return match?.[1]?.trim();
}

function extractAttr(xml: string, tag: string, attr: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, "i"));
  return match?.[1];
}
