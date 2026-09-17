import { useState } from "react";
import MiniPlayer from "./MiniPlayer";
import VideoModal from "./VideoModal";
import { useVideoPlayer } from "../context/VideoPlayerContext";

export default function MiniPlayerContainer() {
  const { expand, miniVideo } = useVideoPlayer();
  const [expandedVideo, setExpandedVideo] = useState(null);

  const handleExpand = (video, startTime) => {
    const expanded = expand();
    setExpandedVideo(expanded.video ? { video: expanded.video, startTime: expanded.startTime || startTime || 0 } : null);
  };

  return (
    <>
      {miniVideo && <MiniPlayer onExpand={handleExpand} />}
      
      {expandedVideo && (
        <VideoModal 
          video={expandedVideo.video}
          startTime={expandedVideo.startTime}
          onClose={() => setExpandedVideo(null)} 
          allVideos={[]}
          onSelectRelated={(video) => setExpandedVideo({ video, startTime: 0 })}
        />
      )}
    </>
  );
}
