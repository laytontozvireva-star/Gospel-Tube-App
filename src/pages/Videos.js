import { useEffect, useState } from "react";
import { Play, Search, X } from "lucide-react";
import PageShell from "../components/PageShell";
import { isSupabaseConfigured, listVideos } from "../lib/supabase";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { builtInVideos } from "../data/builtInVideos";

function Videos() {
  const [query, setQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col max-h-screen">
            <button
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
              onClick={() => setSelectedVideo(null)}
            >
              <X size={18} />
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
              <p className="text-slate-600">{selectedVideo.speaker} • {selectedVideo.duration}</p>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default Videos;
