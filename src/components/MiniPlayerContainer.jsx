import { useState } from "react";
import MiniPlayer from "./MiniPlayer";
import VideoModal from "./VideoModal";
import { useVideoPlayer } from "../context/VideoPlayerContext";

export default function MiniPlayerContainer() {
  const { expand, miniVideo } = useVideoPlayer();
  const [expandedVideo, setExpandedVideo] = useState(null);

  const handleExpand = () => {
    const video = expand();
    setExpandedVideo(video);
  };

  return (
    <>
      {miniVideo && <MiniPlayer onExpand={handleExpand} />}
      
      {expandedVideo && (
        <VideoModal 
          video={expandedVideo} 
          onClose={() => setExpandedVideo(null)} 
          relatedVideos={[]} // Currently we don't have related videos when expanded from global state, but it plays!
          onSelectRelated={setExpandedVideo} 
        />
      )}
    </>
  );
}
