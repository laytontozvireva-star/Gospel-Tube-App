import { useState, useEffect, useCallback } from "react";
import PageShell from "../components/PageShell";
import { Clock, Play, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured, getWatchHistory, clearWatchHistory } from "../lib/supabase";
import VideoModal from "../components/VideoModal";
import { motion } from "framer-motion";

function History() {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && user) {
        const data = await getWatchHistory();
        setHistoryItems(data.map((row) => ({
          ...row.videos,
          watchedAt: row.watched_at,
          progressSeconds: row.progress_seconds,
        })));
      } else {
        const stored = JSON.parse(localStorage.getItem("gt_watch_history") || "[]");
        setHistoryItems(stored);
      }
    } catch (err) {
      console.error("Failed to load watch history", err);
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleClear = async () => {
    try {
      if (isSupabaseConfigured && user) {
        await clearWatchHistory();
      } else {
        localStorage.removeItem("gt_watch_history");
      }
      setHistoryItems([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  return (
    <PageShell
      title="Watch History"
      description="Pick up where you left off and revisit sermons you want to hear again."
    >
      {!loading && historyItems.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 size={14} /> Clear History
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={40} className="animate-spin mb-3" />
          <p className="text-sm">Loading your watch history...</p>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 mt-6">
          <Clock size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No watch history</h3>
          <p className="text-sm text-slate-500">Videos you watch will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4 max-w-4xl">
          {historyItems.map((item, idx) => (
            <motion.article
              key={item.id || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group cursor-pointer"
              onClick={() => setSelectedVideo(item)}
            >
              <div className="w-40 aspect-video rounded-xl overflow-hidden relative shrink-0">
                <img src={item.thumbnail_url || item.image || item.thumbnail || `https://images.unsplash.com/photo-1519817650390-64a93db51149?w=400&auto=format&fit=crop&q=80`} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play size={24} className="fill-white text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">{item.title}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                  <Clock size={14} />
                  Watched {item.watchedAt ? new Date(item.watchedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "recently"}
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedVideo(item); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <Play size={16} />
                  <span className="hidden sm:inline">Watch Again</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          allVideos={historyItems}
          onSelectRelated={setSelectedVideo}
        />
      )}
    </PageShell>
  );
}

export default History;
