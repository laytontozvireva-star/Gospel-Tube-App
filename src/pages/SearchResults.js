import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Filter, Search, Play, Loader2, ShieldCheck } from "lucide-react";
import PageShell from "../components/PageShell";
import { searchYouTubeVideos } from "../lib/youtube";
import VideoModal from "../components/VideoModal";

const contentFilters = [
  { label: "All", matches: () => true },
  { label: "Sermons", matches: (text) => /sermon|preach|message|pastor|apostle|prophet/.test(text) },
  { label: "Worship", matches: (text) => /worship|praise|music|song|choir/.test(text) },
  { label: "Bible Teaching", matches: (text) => /bible|teaching|devotion|scripture|word of god/.test(text) },
  { label: "Testimonies", matches: (text) => /testimony|testimonies|miracle|deliverance/.test(text) },
];

function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [contentFilter, setContentFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Most Relevant");

  useEffect(() => {
    let active = true;
    setSearchInput(query);
    setContentFilter("All");
    setSortBy("Most Relevant");

    if (!query) {
      setResults([]);
      return undefined;
    }

    setLoading(true);
    setError(null);
    searchYouTubeVideos(query, 25)
      .then((data) => {
        if (active) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("We could not load search results. Please try again.");
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, [query]);

  const visibleResults = useMemo(() => {
    const filter = contentFilters.find((item) => item.label === contentFilter) || contentFilters[0];
    const filtered = results.filter((video) =>
      filter.matches(`${video.title} ${video.author} ${video.description}`.toLowerCase())
    );

    if (sortBy === "Latest") {
      return [...filtered].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
    }
    return filtered;
  }, [results, contentFilter, sortBy]);

  const handleSearch = (event) => {
    event.preventDefault();
    const nextQuery = searchInput.trim();
    if (!nextQuery) return;

    try {
      const currentHistory = JSON.parse(localStorage.getItem("gt_search_history") || "[]");
      const newHistory = [nextQuery, ...currentHistory.filter((item) => item !== nextQuery)].slice(0, 5);
      localStorage.setItem("gt_search_history", JSON.stringify(newHistory));
    } catch {}
    navigate(`/search?q=${encodeURIComponent(nextQuery)}`, { replace: true });
  };

  return (
    <PageShell title={`Results for “${query}”`} description="Find gospel sermons, worship, Bible teaching, and Christian testimonies.">
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto py-6">
        <aside className="w-full lg:w-64 flex-shrink-0 rounded-2xl bg-white border border-slate-200 p-5 h-fit">
          <div className="flex items-center gap-2 font-bold text-lg border-b border-slate-100 pb-4 mb-4">
            <Filter size={20} className="text-red-600" /> Filters
          </div>
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-slate-700">Content type</h3>
            <div className="flex flex-col gap-3">
              {contentFilters.map((filter) => (
                <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-600" key={filter.label}>
                  <input type="radio" name="type" checked={contentFilter === filter.label} onChange={() => setContentFilter(filter.label)} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                  {filter.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-slate-700">Sort by</h3>
            <div className="flex flex-col gap-3">
              {["Most Relevant", "Latest"].map((sort) => (
                <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-600" key={sort}>
                  <input type="radio" name="sort" checked={sortBy === sort} onChange={() => setSortBy(sort)} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                  {sort}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <form onSubmit={handleSearch} className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border mb-5 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
            <Search size={20} className="text-slate-400 ml-2 shrink-0" />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} aria-label="Search" className="flex-1 min-w-0 outline-none bg-transparent" placeholder="Search GospelTube..." />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors">Search</button>
          </form>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 text-xs font-bold"><ShieldCheck size={15} /> Gospel & Christian results only</span>
            {!loading && !error && <span className="text-sm text-slate-500">{visibleResults.length} result{visibleResults.length === 1 ? "" : "s"}</span>}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Loader2 size={48} className="animate-spin mb-4 text-red-600" /><p>Searching YouTube for “{query}”...</p></div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200 text-red-600"><p>{error}</p></div>
          ) : (
            <>
              {visibleResults.length > 0 && <h2 className="text-xl font-extrabold mb-4 text-slate-900">Gospel videos matching “{query}”</h2>}
              <div className="flex flex-col gap-5">
                {visibleResults.map((video) => (
                  <article className="flex flex-col sm:flex-row gap-4 group cursor-pointer bg-white p-2 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all" key={video.id} onClick={() => setSelectedVideo(video)}>
                    <div className="relative flex-shrink-0 sm:w-80 rounded-xl overflow-hidden aspect-video bg-slate-100">
                      <img src={video.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364758b' font-family='Arial' font-size='24'%3EGospelTube%3C/text%3E%3C/svg%3E"; }} />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><div className="bg-red-600 rounded-full p-3 text-white"><Play size={24} fill="currentColor" className="ml-1" /></div></div>
                    </div>
                    <div className="flex-1 py-2 pr-2"><h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-red-600 transition-colors">{video.title}</h3><p className="text-slate-600 mb-1 font-semibold">{video.author}</p><p className="text-sm text-slate-500 mb-3">{video.timeAgo} • YouTube</p><p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{video.description}</p></div>
                  </article>
                ))}
              </div>
              {!visibleResults.length && <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300"><p className="text-slate-700 text-lg font-semibold">No {contentFilter === "All" ? "gospel" : contentFilter.toLowerCase()} results found for “{query}”.</p><p className="text-slate-500 text-sm mt-2">Try a different search or choose another content type.</p></div>}
            </>
          )}
        </section>
      </div>

      {selectedVideo && (
        <VideoModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          relatedVideos={visibleResults.filter(v => v.id !== selectedVideo.id)} 
          onSelectRelated={setSelectedVideo} 
        />
      )}
    </PageShell>
  );
}

export default SearchResults;