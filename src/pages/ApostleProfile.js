import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, ArrowLeft, Loader2 } from "lucide-react";
import PageShell from "../components/PageShell";
import { searchYouTubeVideos } from "../lib/youtube";
import { motion } from "framer-motion";

function ApostleProfile() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Decoding the name from URL
  const apostleName = decodeURIComponent(name || "");

  useEffect(() => {
    let active = true;
    setLoading(true);

    // Search YouTube specifically for this apostle's sermons
    searchYouTubeVideos(`${apostleName} sermons`, 12)
      .then((data) => {
        if (active) {
          setVideos(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, [apostleName]);

  return (
    <PageShell title={`${apostleName}'s Profile`} description={`Watch sermons and teachings by ${apostleName}.`}>
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
        <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full overflow-hidden ring-4 ring-slate-50 shadow-md">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(apostleName)}&background=random&color=fff&size=400`}
            alt={apostleName} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{apostleName}</h1>
          <p className="text-red-600 font-bold uppercase tracking-wider text-sm mb-4">Featured Apostle</p>
          <p className="text-slate-600 leading-relaxed max-w-2xl">
            Join {apostleName} for powerful teachings, deep biblical insights, and inspiring sermons designed to strengthen your faith and daily walk.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-md shadow-red-600/20">
              Subscribe
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-2.5 rounded-xl font-bold transition-colors">
              Share Profile
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-6">Sermons by {apostleName}</h2>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={48} className="animate-spin mb-4 text-brand-red" />
          <p>Fetching real videos for {apostleName}...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed mt-8">
          <p className="text-gray-500 text-lg">No videos found for {apostleName}.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video, idx) => (
            <motion.div
              key={video.id || idx}
              whileHover={{ y: -4 }}
              className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={video.image}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
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
                <p className="text-xs text-slate-500">{video.author}</p>
                <p className="text-[11px] text-slate-400 mt-1">{video.views} • {video.timeAgo}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Modal Player — Embedded YouTube */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
              onClick={() => setSelectedVideo(null)}
            >
              ×
            </button>
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedVideo.title}</h2>
              <p className="text-sm text-slate-500 mb-3">{selectedVideo.author} • {selectedVideo.timeAgo}</p>
              {selectedVideo.description && (
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{selectedVideo.description}</p>
              )}
              <a 
                href={selectedVideo.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                Watch on YouTube →
              </a>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default ApostleProfile;
