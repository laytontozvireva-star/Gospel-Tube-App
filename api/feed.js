import { allowGet, queryLimit, queryText, setCache } from "./_shared/http.js";
import { searchYouTube } from "./_shared/youtube.js";
import { searchSpotifyTracks, searchSpotifyPodcasts } from "./_shared/spotify.js";
import { searchApplePodcasts } from "./_shared/podcast.js";
const TYPES = new Set(["all", "video", "music", "podcast"]);
export default async function handler(req, res) {
  if (!allowGet(req, res)) return;
  const type = TYPES.has(req.query.type) ? req.query.type : "all";
  const q = queryText(req.query.q, "gospel"); const limit = queryLimit(req.query.limit, 8, 15); setCache(res, 300, 3600);
  const tasks = [type === "all" || type === "video" ? searchYouTube(`${q} sermon`, limit) : [], type === "all" || type === "music" ? searchSpotifyTracks(`${q} worship`, limit) : [], type === "all" || type === "podcast" ? searchApplePodcasts(`${q} gospel`, limit) : [], type === "all" || type === "podcast" ? searchSpotifyPodcasts(`${q} gospel`, limit) : []];
  const settled = await Promise.allSettled(tasks); const groups = settled.map((item) => item.status === "fulfilled" ? item.value : []); const results = [];
  for (let i = 0; i < Math.max(...groups.map((group) => group.length)); i++) groups.forEach((group) => { if (group[i]) results.push(group[i]); });
  res.status(200).json({ results, total: results.length, sources: { youtube: groups[0].length, spotify: groups[1].length + groups[3].length, apple_podcasts: groups[2].length } });
}