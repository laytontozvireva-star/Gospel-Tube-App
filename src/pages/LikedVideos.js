import { useState, useEffect, useCallback } from "react";
import PageShell from "../components/PageShell";

import { Heart, Play, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured, listLikes, toggleLike } from "../lib/supabase";
import VideoModal from "../components/VideoModal";
import { motion } from "framer-motion";

function LikedVideos() {
  const { user } = useAuth();
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchLikes = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && user) {
        const data = await listLikes();
        // data is array of { user_id, video_id, created_at, videos: { ...videoFields } }
        setLikedVideos(data.map((row) => ({
          ...row.videos,
          likedAt: row.created_at,
        })));
      } else {
        // localStorage fallback
        const stored = JSON.parse(localStorage.getItem("gt_liked_videos") || "[]");
        setLikedVideos(stored);
      }
    } catch (err) {
      console.error("Failed to load liked videos", err);
      setLikedVideos([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const handleUnlike = async (videoId) => {
    try {
      if (isSupabaseConfigured && user) {
        await toggleLike(videoId);
      } else {
        const stored = JSON.parse(localStorage.getItem("gt_liked_videos") || "[]");
        localStorage.setItem("gt_liked_videos", JSON.stringify(stored.filter((v) => v.id !== videoId)));
      }
      setLikedVideos((prev) => prev.filter((v) => v.id !== videoId));
    } catch (err) {
      console.error("Failed to unlike video", err);
    }
  };

  return (
    <PageShell
      title="Liked Videos"
      description="Revisit the sermons and worship videos you saved."
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={40} className="animate-spin mb-3" />
          <p className="text-sm">Loading your liked videos...</p>
        </div>
      ) : likedVideos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 mt-6">
          <Heart size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No liked videos yet</h3>
          <p className="text-sm text-slate-500">Videos you like will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-6 max-w-4xl">
          <p className="text-sm text-slate-500 mb-2">{likedVideos.length} video{likedVideos.length !== 1 ? "s" : ""}</p>
          {likedVideos.map((video) => (
            <motion.article
              key={video.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="w-40 aspect-video rounded-xl overflow-hidden relative shrink-0">
                <img src={video.thumbnail_url || video.image || video.thumbnail || `https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&auto=format&fit=crop&q=80`} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play size={24} className="fill-white text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">{video.title}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {video.category || "Sermon"} • {video.likedAt ? new Date(video.likedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently"}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); handleUnlike(video.id); }}
                  className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                  title="Unlike"
                >
                  <Heart size={20} className="fill-red-600" />
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
          relatedVideos={likedVideos.filter((v) => v.id !== selectedVideo.id)}
          onSelectRelated={setSelectedVideo}
        />
      )}
    </PageShell>
  );
}

export default LikedVideos;
