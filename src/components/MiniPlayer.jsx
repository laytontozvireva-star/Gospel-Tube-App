import { useState } from "react";
import { X, Maximize2, Minimize2, Play } from "lucide-react";
import { useVideoPlayer } from "../context/VideoPlayerContext";

export default function MiniPlayer({ onExpand }) {
  const { miniVideo, closeMini } = useVideoPlayer();
  const [collapsed, setCollapsed] = useState(false);

  if (!miniVideo) return null;

  // Fully collapsed: just a tiny bar
  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] sm:w-auto bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3 max-w-xs cursor-pointer group hover:bg-slate-800 transition-colors border border-slate-700"
        onClick={() => setCollapsed(false)}
      >
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0">
          <Play size={14} className="fill-white translate-x-0.5" />
        </div>
        <p className="text-sm font-semibold truncate flex-1">{miniVideo.title}</p>
        <button
          onClick={(e) => { e.stopPropagation(); closeMini(); }}
          className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close player"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] sm:w-[360px] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 group">
      {/* Mini video */}
      <div className="relative aspect-video bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${miniVideo.id}?autoplay=1&rel=0&modestbranding=1`}
          title={miniVideo.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

        {/* Hover controls overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Top controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onExpand && onExpand()}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors backdrop-blur-sm"
            title="Expand"
            aria-label="Expand to full player"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors backdrop-blur-sm"
            title="Minimize"
            aria-label="Minimize player"
          >
            <Minimize2 size={14} />
          </button>
          <button
            onClick={closeMini}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors backdrop-blur-sm"
            title="Close"
            aria-label="Close player"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="px-3 py-2.5 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold truncate leading-tight">{miniVideo.title}</p>
          <p className="text-slate-400 text-[11px] truncate">{miniVideo.speaker || miniVideo.author}</p>
        </div>
        <button
          onClick={() => onExpand && onExpand()}
          className="shrink-0 text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
        >
          Expand
        </button>
      </div>
    </div>
  );
}
