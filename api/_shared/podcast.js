export async function searchApplePodcasts(q, limit = 10) {
  try {
    const params = new URLSearchParams({
      term: q, media: "podcast", limit, entity: "podcast", explicit: "No",
    });
    const res = await fetch(`https://itunes.apple.com/search?${params}`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results || []).map(item => ({
      id: String(item.collectionId), source: "apple_podcasts", type: "podcast",
      title: item.collectionName,
      thumbnail: item.artworkUrl600 || item.artworkUrl100 || "",
      url: item.collectionViewUrl || "",
      author: item.artistName || "",
      description: item.primaryGenreName,
    }));
  } catch(e) {
    return [];
  }
}
