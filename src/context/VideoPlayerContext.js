import { createContext, useContext, useState, useMemo, useCallback, useRef } from "react";

const VideoPlayerContext = createContext(null);

export function VideoPlayerProvider({ children }) {
  // The video currently playing in the mini player
  const [miniVideo, setMiniVideo] = useState(null);
  // Track playback progress so we can resume
  const progressRef = useRef(0);

  // Minimize: send a video to the mini player, remembering where it was
  const minimize = useCallback((video, currentTime = 0) => {
    progressRef.current = currentTime;
    setMiniVideo(video);
  }, []);

  // Update progress (called by whichever player is active)
  const setProgress = useCallback((seconds) => {
    progressRef.current = seconds;
  }, []);

  // Get current progress
  const getProgress = useCallback(() => progressRef.current, []);

  // Expand: return the mini player video + its current time
  const expand = useCallback(() => {
    const video = miniVideo;
    const time = progressRef.current;
    setMiniVideo(null);
    return { video, startTime: time };
  }, [miniVideo]);

  // Close the mini player completely
  const closeMini = useCallback(() => {
    setMiniVideo(null);
    progressRef.current = 0;
  }, []);

  const value = useMemo(
    () => ({ miniVideo, minimize, expand, closeMini, setProgress, getProgress }),
    [miniVideo, minimize, expand, closeMini, setProgress, getProgress]
  );

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
  }
  return context;
}
