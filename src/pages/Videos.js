import { useEffect, useState } from "react";
import { Play, Search, X, MessageSquare, ListVideo } from "lucide-react";
import CommentSection from "../components/CommentSection";
import PageShell from "../components/PageShell";
import { isSupabaseConfigured, listVideos } from "../lib/supabase";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { builtInVideos } from "../data/builtInVideos";

function Videos() {
  const [query, setQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState("playlist");
  const navigate = useNavigate();

  const [videos, setVideos] = useState(() => {
    try {
      return [...JSON.parse(localStorage.getItem("gospelTubeVideos") || "[]"), ...builtInVideos];
    } catch {
      return builtInVideos;
    }
  });

  const [loadingRemote, setLoadingRemote] = useState(isSupabaseConfigured);
  const [remoteError, setRemoteError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    listVideos()
      .then((remoteVideos) => {
        if (!active || !remoteVideos.length) return;
        const mapped = remoteVideos.map((video) => ({
          id: video.id,
          title: video.title,
          speaker: video.apostles?.name || video.profiles?.display_name || "GospelTube",
          duration: video.duration_seconds
            ? `${Math.floor(video.duration_seconds / 60)}:${String(video.duration_seconds % 60).padStart(2, "0")}`
            : "New",
          category: video.category,
          thumbnail: video.thumbnail_url || "https://images.unsplash.com/photo-1544427920-c49cbfb85579?w=800&auto=format&fit=crop&q=80",
          description: video.description,
          videoUrl: video.video_url,
        }));
        setVideos(mapped);
      })
      .catch((error) => {
        if (active) setRemoteError(error.message || "Unable to load Supabase videos.");
      })
      .finally(() => {
        if (active) setLoadingRemote(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = ["All", "Sermon", "Worship", "Teaching", "Bible Study", "Music"];
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    setSelectedVideo(null);
  }, [location.search]);

  const filteredVideos = videos.filter((video) => {
    const matchesQuery = `${video.title} ${video.speaker} ${video.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === "All" || video.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <PageShell
      title="Gospel Videos"
      description="Discover inspiring sermons, worship songs, Bible studies, and Christian testimonies."
    >
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            placeholder="Search videos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-800 rounded-full py-2.5 pl-11 pr-4 text-sm outline-none focus:border-red-500 transition-all shadow-sm"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                navigate(`?category=${cat}`);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loadingRemote && <p className="text-slate-500 text-sm py-4">Loading videos from database...</p>}
      {remoteError && <p className="text-red-500 text-sm py-4">{remoteError}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video, idx) => (
          <motion.div
            key={video.id || idx}
            whileHover={{ y: -4 }}
            className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative aspect-video bg-slate-900 overflow-hidden">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transform scale-90 group-hover:scale-100 transition-transform">
                  <Play size={20} className="fill-white translate-x-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                {video.duration}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                {video.title}
              </h3>
              <p className="text-xs font-semibold text-slate-500">{video.speaker}</p>
              <p className="text-[11px] text-slate-400 mt-1">{video.category}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredVideos.length === 0 && !loadingRemote && (
        <div className="text-center py-12">
          <p className="text-slate-500">No videos found matching your search.</p>
        </div>
      )}

      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Playing ${selectedVideo.title}`}
          onClick={() => setSelectedVideo(null)}
        >
          <div className="w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col lg:flex-row" onClick={(event) => event.stopPropagation()}>
            
            {/* Left side: Video & Metadata */}
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50">
              {/* Mobile header */}
              <div className="flex lg:hidden items-center justify-between border-b border-slate-200 px-4 py-3 bg-white sticky top-0 z-10">
                <div className="min-w-0 pr-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">Now playing</p>
                  <p className="truncate text-sm font-semibold text-slate-700">{selectedVideo.speaker}</p>
                </div>
                <button type="button" onClick={() => setSelectedVideo(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900" aria-label="Close player">
                  <X size={21} />
                </button>
              </div>

              <div className="aspect-video bg-black sticky top-0 z-0">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <div className="p-5 sm:p-7 bg-white">
                <h2 className="text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">{selectedVideo.title}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-bold text-slate-700">{selectedVideo.speaker}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{selectedVideo.duration}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">GospelTube</span>
                </div>
                {selectedVideo.description && (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{selectedVideo.description}</p>
                )}
              </div>
            </div>

            {/* Right side: Tabs Sidebar */}
            <div className="w-full lg:w-[400px] xl:w-[450px] border-l border-slate-200 bg-white flex flex-col h-full lg:max-h-[95vh] shrink-0">
              {/* Desktop header with close button */}
              <div className="hidden lg:flex items-center justify-between border-b border-slate-100 p-4 sticky top-0 bg-white z-10 shadow-sm">
                <div className="flex bg-slate-100 rounded-lg p-1 space-x-1">
                  <button
                    onClick={() => setActiveTab("playlist")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                      activeTab === "playlist" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <ListVideo size={16} />
                    <span>Up Next</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                      activeTab === "comments" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <MessageSquare size={16} />
                    <span>Comments</span>
                  </button>
                </div>
                <button type="button" onClick={() => setSelectedVideo(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-200">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-0 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50">
                {activeTab === "comments" ? (
                  <div className="p-5">
                    {selectedVideo.id && <CommentSection videoId={selectedVideo.id} />}
                  </div>
                ) : (
                  <div className="flex flex-col p-3 gap-3">
                    {filteredVideos.filter(v => v.id !== selectedVideo.id).map((video, idx) => (
                      <div
                        key={video.id || idx}
                        onClick={() => setSelectedVideo(video)}
                        className="flex gap-3 group cursor-pointer bg-white p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 shadow-sm"
                      >
                        <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-900">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                            {video.duration}
                          </span>
                        </div>
                        <div className="flex flex-col py-1 overflow-hidden">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
                            {video.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 truncate">{video.speaker}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default Videos;
