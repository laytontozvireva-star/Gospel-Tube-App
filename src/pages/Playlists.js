import { useState, useEffect, useCallback } from "react";
import PageShell from "../components/PageShell";
import { ListVideo, Play, Plus, Loader2, Trash2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured, listPlaylists, createPlaylist, deletePlaylist, getPlaylistVideos } from "../lib/supabase";
import VideoModal from "../components/VideoModal";
import { motion, AnimatePresence } from "framer-motion";

const colorPalette = [
  "bg-orange-100 text-orange-600",
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-emerald-100 text-emerald-600",
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
  "bg-cyan-100 text-cyan-600",
  "bg-indigo-100 text-indigo-600",
];

const fallbackPlaylists = [
  { id: "fp-1", name: "Morning Devotions", description: "Start your day with God", videoCount: 12 },
  { id: "fp-2", name: "Faith Builders", description: "Grow in faith", videoCount: 8 },
  { id: "fp-3", name: "Worship Nights", description: "Evening worship sessions", videoCount: 15 },
  { id: "fp-4", name: "Prayer & Intercession", description: "Prayer teachings", videoCount: 9 },
];

function Playlists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && user) {
        const data = await listPlaylists();
        setPlaylists(data.map((p) => ({
          ...p,
          videoCount: p.playlist_videos?.[0]?.count || 0,
        })));
      } else {
        setPlaylists(fallbackPlaylists);
      }
    } catch (err) {
      console.error("Failed to load playlists", err);
      setPlaylists(fallbackPlaylists);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      if (isSupabaseConfigured) {
        await createPlaylist(newName.trim(), newDesc.trim());
      }
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      await fetchPlaylists();
    } catch (err) {
      console.error("Failed to create playlist", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (playlistId) => {
    if (!window.confirm("Delete this playlist?")) return;
    try {
      if (isSupabaseConfigured) {
        await deletePlaylist(playlistId);
      }
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    } catch (err) {
      console.error("Failed to delete playlist", err);
    }
  };

  const handlePlayAll = async (playlist) => {
    try {
      if (isSupabaseConfigured) {
        const videos = await getPlaylistVideos(playlist.id);
        const mapped = videos.map((pv) => pv.videos);
        setPlaylistVideos(mapped);
        if (mapped.length > 0) setSelectedVideo(mapped[0]);
      }
    } catch (err) {
      console.error("Failed to load playlist videos", err);
    }
  };

  return (
    <PageShell
      title="Playlists"
      description="Organized video collections for devotion, worship, and teaching."
    >
      {/* Create Playlist Button */}
      {user && isSupabaseConfigured && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            <Plus size={18} /> New Playlist
          </button>
        </div>
      )}

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleCreate}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Create Playlist</h3>
                <button type="button" onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Playlist name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm mb-3 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
              <textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm mb-4 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={40} className="animate-spin mb-3" />
          <p className="text-sm">Loading playlists...</p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 mt-6">
          <ListVideo size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No playlists yet</h3>
          <p className="text-sm text-slate-500">Create your first playlist to organize your favorite sermons.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {playlists.map((playlist, idx) => (
            <motion.article
              key={playlist.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group relative"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorPalette[idx % colorPalette.length]} group-hover:scale-110 transition-transform`}>
                <ListVideo size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">{playlist.name}</h2>
              {playlist.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{playlist.description}</p>}
              <p className="text-sm font-medium text-slate-500 mb-4">{playlist.videoCount || 0} video{(playlist.videoCount || 0) !== 1 ? "s" : ""}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePlayAll(playlist)}
                  className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
                >
                  <Play size={16} className="fill-red-600" />
                  Play All
                </button>
                {user && isSupabaseConfigured && playlist.owner_id && (
                  <button
                    onClick={() => handleDelete(playlist.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete playlist"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => { setSelectedVideo(null); setPlaylistVideos([]); }}
          allVideos={playlistVideos}
          onSelectRelated={setSelectedVideo}
        />
      )}
    </PageShell>
  );
}

export default Playlists;
