import { createContext, useContext, useState, useMemo, useCallback } from "react";

const VideoPlayerContext = createContext(null);

export function VideoPlayerProvider({ children }) {
  // The video currently playing in the mini player
  const [miniVideo, setMiniVideo] = useState(null);

  // Minimize: send a video to the mini player
  const minimize = useCallback((video) => {
    setMiniVideo(video);
  }, []);

  // Expand: return the mini player video (caller will open it in modal)
  const expand = useCallback(() => {
    const video = miniVideo;
    setMiniVideo(null);
    return video;
  }, [miniVideo]);

  // Close the mini player completely
  const closeMini = useCallback(() => {
    setMiniVideo(null);
  }, []);

  const value = useMemo(
    () => ({ miniVideo, minimize, expand, closeMini }),
    [miniVideo, minimize, expand, closeMini]
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
