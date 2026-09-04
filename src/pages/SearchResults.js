import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Filter, Search, Play, Loader2 } from "lucide-react";
import PageShell from "../components/PageShell";
import { searchYouTubeVideos } from "../lib/youtube";

function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get query directly from URL params on each render
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q") || "";
  
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    let active = true;
    if (!query) return;
    
    setLoading(true);
    setError(null);
    
    searchYouTubeVideos(query, 12)
      .then((data) => {
        if (active) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError("Failed to fetch search results.");
          setLoading(false);
        }
      });
      
    return () => { active = false; };
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Save to history
      try {
        const currentHistory = JSON.parse(localStorage.getItem("gt_search_history") || "[]");
        const newHistory = [searchInput, ...currentHistory.filter(q => q !== searchInput)].slice(0, 5);
        localStorage.setItem("gt_search_history", JSON.stringify(newHistory));
      } catch (err) {}
      navigate(`/search?q=${encodeURIComponent(searchInput)}`, { replace: true });
    }
  };

  return (
    <PageShell title={`Results for “${query}”`} description="Search sermons, apostles, playlists, and channels across GospelTube.">
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto py-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="flex items-center gap-2 font-semibold text-lg border-b pb-4 mb-4">
            <Filter size={20} /> 
            Filters
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-3 text-gray-700">Type</h3>
            <div className="flex flex-col gap-3">
              {["All", "Apostles", "Sermons", "Playlists", "Channels"].map((type, i) => (
                <label className="flex items-center gap-3 cursor-pointer text-sm" key={type}>
                  <input type="radio" name="type" defaultChecked={i === 0} className="w-4 h-4 text-brand-red focus:ring-brand-red" /> 
                  {type}
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-gray-700">Sort by</h3>
            <div className="flex flex-col gap-3">
              {["Most Relevant", "Latest", "Most Viewed"].map((sort, i) => (
                <label className="flex items-center gap-3 cursor-pointer text-sm" key={sort}>
                  <input type="radio" name="sort" defaultChecked={i === 0} className="w-4 h-4 text-brand-red focus:ring-brand-red" /> 
                  {sort}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1">
          <form onSubmit={handleSearch} className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border mb-8 focus-within:border-brand-red focus-within:ring-1 focus-within:ring-brand-red transition-all">
            <Search size={20} className="text-gray-400 ml-2" />
            <input 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)} 
              aria-label="Search" 
              className="flex-1 outline-none bg-transparent"
              placeholder="Search GospelTube or YouTube..."
            />
            <button type="submit" className="bg-brand-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Search
            </button>
          </form>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 size={48} className="animate-spin mb-4 text-brand-red" />
              <p>Searching YouTube for "{query}"...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200 mt-8 text-red-600">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {results.length > 0 && <h2 className="text-xl font-bold mb-4">Sermons & Videos</h2>}
              <div className="flex flex-col gap-6">
                {results.map((video) => (
                  <article 
                    className="flex flex-col sm:flex-row gap-4 group cursor-pointer bg-white p-2 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all" 
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative flex-shrink-0 sm:w-80 rounded-xl overflow-hidden aspect-video bg-gray-100">
                      <img src={video.image} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-brand-red rounded-full p-3 text-white">
                          <Play size={24} fill="currentColor" className="ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 py-1">
                      <h3 
                        className="text-lg font-semibold leading-tight mb-2 group-hover:text-brand-red transition-colors"
                        dangerouslySetInnerHTML={{ __html: video.title }}
                      ></h3>
                      <p className="text-gray-600 mb-1 font-medium">{video.author}</p>
                      <p className="text-sm text-gray-500 mb-3">{video.timeAgo} • YouTube</p>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{video.description}</p>
                    </div>
                  </article>
                ))}
              </div>
              
              {!results.length && !loading && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed mt-8">
                  <p className="text-gray-500 text-lg">No results found for “{query}”.</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* YouTube Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative flex flex-col">
            <button 
              className="absolute -top-12 right-0 z-50 w-10 h-10 flex items-center justify-center text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors md:top-4 md:right-4"
              onClick={(e) => { e.stopPropagation(); setSelectedVideo(null); }}
            >
              ×
            </button>
            <div className="aspect-video bg-black flex items-center justify-center relative w-full">
              <iframe
                className="w-full h-full absolute inset-0"
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto max-h-48">
              <h2 
                className="text-2xl font-bold text-slate-900 mb-2"
                dangerouslySetInnerHTML={{ __html: selectedVideo.title }}
              ></h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-slate-700">{selectedVideo.author}</span>
                <span className="text-slate-300">•</span>
                <span className="text-sm text-slate-500">YouTube</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default SearchResults;
