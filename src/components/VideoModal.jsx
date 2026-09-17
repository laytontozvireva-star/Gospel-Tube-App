import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ReactPlayer from "react-player";
import { X, MessageSquare, ListVideo, Minimize2 } from "lucide-react";
import CommentSection from "./CommentSection";
import { useVideoPlayer } from "../context/VideoPlayerContext";
import { isSupabaseConfigured, upsertWatchProgress, incrementViewCount } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

// Track which videos have been view-counted this session to avoid double-counting
const viewedThisSession = new Set();

const AUTO_NEXT_DELAY = 5; // seconds before auto-playing next video

export default function VideoModal({ video, onClose, allVideos = [], onSelectRelated, startTime = 0 }) {
  const relatedVideos = useMemo(() => {
    if (!video || !Array.isArray(allVideos)) return [];
    return allVideos.filter((v) => v.id !== video.id);
  }, [video, allVideos]);

  const [activeTab, setActiveTab] = useState("playlist");
  const { minimize, setProgress } = useVideoPlayer();
  const { user } = useAuth();
  const recordedRef = useRef(false);
  const playerRef = useRef(null);
  const hasResumedRef = useRef(false);
  const countdownRef = useRef(null);
  const currentTimeRef = useRef(0);

  // Auto-next countdown state
  const [autoNextCountdown, setAutoNextCountdown] = useState(null); // null = not counting down
  const autoNextVideo = relatedVideos[0] || null;

  // Called when the video ends – start the YouTube-style countdown
  const handleVideoEnded = useCallback(() => {
    if (autoNextVideo && onSelectRelated) {
      setAutoNextCountdown(AUTO_NEXT_DELAY);
    }
  }, [autoNextVideo, onSelectRelated]);

  // Cancel countdown
  const cancelAutoNext = useCallback(() => {
    setAutoNextCountdown(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  // Tick the countdown
  useEffect(() => {
    if (autoNextCountdown === null) return;
    if (autoNextCountdown <= 0) {
      // Play next video
      onSelectRelated(autoNextVideo);
      setAutoNextCountdown(null);
      return;
    }
    countdownRef.current = setInterval(() => {
      setAutoNextCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoNextCountdown]);

  // Reset countdown when video changes
  useEffect(() => {
    setAutoNextCountdown(null);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, [video?.id]);


  useEffect(() => {
    hasResumedRef.current = false;
  }, [video?.id, startTime]);

  const resumeFromStartTime = () => {
    if (hasResumedRef.current || !startTime || !playerRef.current) return;

    playerRef.current.seekTo(startTime, "seconds");
    hasResumedRef.current = true;
  };

  // Record watch history and increment view count when video opens
  useEffect(() => {
    if (!video || recordedRef.current) return;
    recordedRef.current = true;

    if (isSupabaseConfigured && user && video.id) {
      // Record watch history
      upsertWatchProgress(video.id, 0).catch((err) =>
        console.error("Failed to record watch history", err)
      );

      // Increment view count (once per session per video)
      if (!viewedThisSession.has(video.id)) {
        viewedThisSession.add(video.id);
        incrementViewCount(video.id).catch((err) =>
          console.error("Failed to increment view count", err)
        );
      }
    }

    // Also save to localStorage for fallback
    try {
      const history = JSON.parse(localStorage.getItem("gt_watch_history") || "[]");
      const entry = { ...video, watchedAt: new Date().toISOString() };
      const updated = [entry, ...history.filter((v) => v.id !== video.id)].slice(0, 50);
      localStorage.setItem("gt_watch_history", JSON.stringify(updated));
    } catch {}
  }, [video, user]);

  // Reset ref when video changes
  useEffect(() => {
    recordedRef.current = false;
  }, [video?.id]);

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
        className="w-full h-full sm:h-auto sm:max-w-7xl sm:max-h-[95vh] overflow-hidden sm:rounded-2xl bg-white shadow-lg flex flex-col lg:flex-row relative" 
        onClick={(event) => event.stopPropagation()}
      >
        {/* Mobile close/minimize floating buttons (over video) */}
        <div className="lg:hidden absolute top-3 right-3 z-50 flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => { minimize(video, currentTimeRef.current); onClose(); }} 
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
          
          <div className="aspect-video bg-black sticky top-0 z-40 lg:z-0 shrink-0 shadow-xs relative">
            {console.log("VideoModal rendering video:", video)}
            {video.source === "spotify" ? (
              <iframe
                title={video.title}
                src={`https://open.spotify.com/embed/${video.type === "podcast" ? "show" : "track"}/${video.id}?utm_source=generator&theme=0`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            ) : video.source === "apple_podcasts" ? (
              <iframe
                title={video.title}
                src={`https://embed.podcasts.apple.com/us/podcast/id${video.id}`}
                width="100%"
                height="100%"
                frameBorder="0"
                sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                allow="autoplay *; encrypted-media *;"
              />
            ) : (
              (() => {
                // Recover the correct YouTube ID, even if cached url is broken with [object Object]
                let ytId = typeof video.id === 'object' ? video.id.videoId : video.id;
                
                let rawUrl = video.videoUrl || video.url;
                let isYouTube = false;
                if (rawUrl && (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be'))) {
                  isYouTube = true;
                } else if (typeof ytId === 'string' && ytId.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(ytId)) {
                  isYouTube = true;
                }
                
                // Only rebuild YouTube URL if it's actually a YouTube video, else use the raw URL
                let cleanUrl = (isYouTube && ytId) ? `https://www.youtube.com/watch?v=${ytId}` : rawUrl;

                return (
                  <ReactPlayer
                    ref={playerRef}
                    url={cleanUrl}
                    width="100%"
                    height="100%"
                    playing={true}
                    controls={true}
                    onReady={resumeFromStartTime}
                    onEnded={handleVideoEnded}
                    onProgress={(state) => {
                      currentTimeRef.current = state.playedSeconds;
                      setProgress(state.playedSeconds);
                    }}
                    progressInterval={500}
                    config={{
                      youtube: {
                        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 }
                      }
                    }}
                  />
                );
              })()
            )}

            {/* Auto-next countdown overlay */}
            {autoNextCountdown !== null && autoNextVideo && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 text-white text-center px-6 max-w-sm w-full">
                  {/* Next video thumbnail preview */}
                  <div className="w-full rounded-xl overflow-hidden shadow-lg border border-white/10">
                    <img
                      src={autoNextVideo.thumbnail || autoNextVideo.image}
                      alt={autoNextVideo.title}
                      className="w-full object-cover"
                      style={{ maxHeight: "110px", objectFit: "cover" }}
                    />
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Up Next</p>
                  <p className="text-sm font-bold leading-tight line-clamp-2">{autoNextVideo.title}</p>

                  {/* SVG circular countdown ring */}
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                      <circle
                        cx="32" cy="32" r="28"
                        fill="none"
                        stroke="white"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - autoNextCountdown / AUTO_NEXT_DELAY)}
                        style={{ transition: "stroke-dashoffset 0.9s linear" }}
                      />
                    </svg>
                    <span className="text-xl font-extrabold">{autoNextCountdown}</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={cancelAutoNext}
                      className="flex-1 py-2.5 rounded-xl border border-white/30 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { cancelAutoNext(); onSelectRelated(autoNextVideo); }}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-bold text-white transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                {relatedVideos.length > 0 ? relatedVideos.map((relVideo, idx) => {
                  const isPlaying = relVideo.id === video.id;
                  return (
                  <div
                    key={relVideo.id || idx}
                    onClick={() => {
                       if (!isPlaying && onSelectRelated) onSelectRelated(relVideo);
                       // Scroll to top on mobile when selecting related video
                       if (!isPlaying) document.querySelector('.custom-scrollbar')?.scrollTo({top: 0, behavior: 'smooth'});
                    }}
                    className={`flex gap-3 group p-2.5 rounded-xl transition-colors border shadow-sm ${
                      isPlaying
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white active:bg-slate-100 border-transparent'
                    } ${onSelectRelated && !isPlaying ? 'cursor-pointer' : ''}`}
                  >
                    <div className="relative w-36 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-900">
                      <img src={relVideo.thumbnail || relVideo.image} alt={relVideo.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {relVideo.duration || relVideo.timeAgo}
                      </span>
                      {isPlaying && (
                        <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                          <div className="flex gap-1">
                            <span className="w-1 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1 h-4 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden justify-center">
                      <h4 className={`text-sm font-bold leading-tight line-clamp-2 transition-colors ${
                        isPlaying ? 'text-red-700' : 'text-slate-900'
                      }`}>
                        {relVideo.title}
                      </h4>
                      <p className={`text-xs mt-1 truncate ${isPlaying ? 'text-red-600/70' : 'text-slate-500'}`}>
                        {relVideo.speaker || relVideo.author}
                      </p>
                    </div>
                  </div>
                )}) : (
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
                  minimize(video, currentTimeRef.current);
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
                {relatedVideos.length > 0 ? relatedVideos.map((relVideo, idx) => {
                  const isPlaying = relVideo.id === video.id;
                  return (
                  <div
                    key={relVideo.id || idx}
                    onClick={() => {
                       if (!isPlaying && onSelectRelated) onSelectRelated(relVideo);
                    }}
                    className={`flex gap-3 group p-2 rounded-xl transition-colors border shadow-sm ${
                      isPlaying 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200'
                    } ${onSelectRelated && !isPlaying ? 'cursor-pointer' : ''}`}
                  >
                    <div className="relative w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-900">
                      <img src={relVideo.thumbnail || relVideo.image} alt={relVideo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {relVideo.duration || relVideo.timeAgo}
                      </span>
                      {isPlaying && (
                        <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                          <div className="flex gap-1">
                            <span className="w-1 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1 h-4 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col py-1 overflow-hidden">
                      <h4 className={`text-sm font-bold leading-tight line-clamp-2 transition-colors ${
                        isPlaying ? 'text-red-700' : 'text-slate-900 group-hover:text-red-600'
                      }`}>
                        {relVideo.title}
                      </h4>
                      <p className={`text-xs mt-1 truncate ${isPlaying ? 'text-red-600/70' : 'text-slate-500'}`}>
                        {relVideo.speaker || relVideo.author}
                      </p>
                    </div>
                  </div>
                )}) : (
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
