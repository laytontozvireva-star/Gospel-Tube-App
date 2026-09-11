import { useState } from "react";
import { X, MessageSquare, ListVideo, Minimize2 } from "lucide-react";
import CommentSection from "./CommentSection";
import { useVideoPlayer } from "../context/VideoPlayerContext";

export default function VideoModal({ video, onClose, relatedVideos = [], onSelectRelated }) {
  const [activeTab, setActiveTab] = useState("playlist");
  const { minimize } = useVideoPlayer();

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 sm:p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Playing ${video.title}`}
      onClick={onClose}
    >
      <div 
        className="w-full h-full sm:h-auto sm:max-w-7xl sm:max-h-[95vh] overflow-hidden sm:rounded-2xl bg-white shadow-2xl flex flex-col lg:flex-row relative" 
        onClick={(event) => event.stopPropagation()}
      >
        {/* Mobile close/minimize floating buttons (over video) */}
        <div className="lg:hidden absolute top-3 right-3 z-50 flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => { minimize(video); onClose(); }} 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70"
            aria-label="Minimize player"
          >
            <Minimize2 size={20} />
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70"
            aria-label="Close player"
          >
            <X size={20} />
          </button>
        </div>

        {/* Left side: Video & Metadata */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50 relative">
          
          <div className="aspect-video bg-black sticky top-0 z-40 lg:z-0 shrink-0 shadow-sm">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="p-5 sm:p-7 bg-white shrink-0">
            <h2 className="text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">{video.title}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-bold text-slate-700">{video.speaker || video.author}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{video.duration || video.timeAgo || "New"}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">GospelTube</span>
            </div>
            {video.description && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{video.description}</p>
            )}
          </div>
          
          {/* Mobile Tabs (Rendered in the scroll flow on mobile) */}
          <div className="lg:hidden flex items-center border-b border-t border-slate-200 bg-slate-50 sticky top-[56.25vw] z-30 px-2 py-2 shrink-0">
             <div className="flex bg-slate-200/50 rounded-lg p-1 w-full space-x-1">
              <button
                onClick={() => setActiveTab("playlist")}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                  activeTab === "playlist" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ListVideo size={18} />
                <span>Up Next</span>
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                  activeTab === "comments" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <MessageSquare size={18} />
                <span>Comments</span>
              </button>
            </div>
          </div>

          {/* Mobile Content (Up next or Comments) */}
          <div className="lg:hidden bg-slate-50 flex-1">
             {activeTab === "comments" ? (
              <div className="p-4">
                {video.id && <CommentSection videoId={video.id} />}
              </div>
            ) : (
              <div className="flex flex-col p-3 gap-3">
                {relatedVideos.length > 0 ? relatedVideos.map((relVideo, idx) => (
                  <div
                    key={relVideo.id || idx}
                    onClick={() => {
                       if (onSelectRelated) onSelectRelated(relVideo);
                       // Scroll to top on mobile when selecting related video
                       document.querySelector('.custom-scrollbar').scrollTo({top: 0, behavior: 'smooth'});
                    }}
                    className={`flex gap-3 group bg-white p-2.5 rounded-xl active:bg-slate-100 transition-colors border border-transparent shadow-sm ${onSelectRelated ? 'cursor-pointer' : ''}`}
                  >
                    <div className="relative w-36 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-900">
                      <img src={relVideo.thumbnail || relVideo.image} alt={relVideo.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {relVideo.duration || relVideo.timeAgo}
                      </span>
                    </div>
                    <div className="flex flex-col overflow-hidden justify-center">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">
                        {relVideo.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 truncate">{relVideo.speaker || relVideo.author}</p>
                    </div>
                  </div>
                )) : (
                   <p className="text-slate-500 text-sm p-4 text-center">No related videos.</p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right side: Desktop Sidebar (Hidden on mobile) */}
        <div className="hidden lg:flex w-[400px] xl:w-[450px] border-l border-slate-200 bg-white flex-col h-full max-h-[95vh] shrink-0">
          {/* Desktop header with close button */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 sticky top-0 bg-white z-10 shadow-sm">
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
            <div className="flex items-center gap-1">
              <button 
                type="button" 
                onClick={() => {
                  minimize(video);
                  onClose();
                }} 
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-200"
                aria-label="Minimize player"
              >
                <Minimize2 size={20} />
              </button>
              <button type="button" onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-200">
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-0 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50">
            {activeTab === "comments" ? (
              <div className="p-5">
                {video.id && <CommentSection videoId={video.id} />}
              </div>
            ) : (
              <div className="flex flex-col p-3 gap-3">
                {relatedVideos.length > 0 ? relatedVideos.map((relVideo, idx) => (
                  <div
                    key={relVideo.id || idx}
                    onClick={() => {
                       if (onSelectRelated) onSelectRelated(relVideo);
                    }}
                    className={`flex gap-3 group bg-white p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 shadow-sm ${onSelectRelated ? 'cursor-pointer' : ''}`}
                  >
                    <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-900">
                      <img src={relVideo.thumbnail || relVideo.image} alt={relVideo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {relVideo.duration || relVideo.timeAgo}
                      </span>
                    </div>
                    <div className="flex flex-col py-1 overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
                        {relVideo.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 truncate">{relVideo.speaker || relVideo.author}</p>
                    </div>
                  </div>
                )) : (
                   <p className="text-slate-500 text-sm p-4 text-center">No related videos.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
