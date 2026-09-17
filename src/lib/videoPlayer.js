const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function getYouTubeIdFromUrl(rawUrl) {
  if (typeof rawUrl !== "string") return null;

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");
    let candidate = null;

    if (host === "youtu.be") {
      candidate = url.pathname.split("/").filter(Boolean)[0];
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      candidate = url.searchParams.get("v");
      if (!candidate) {
        const segments = url.pathname.split("/").filter(Boolean);
        const markerIndex = segments.findIndex((segment) => ["embed", "v", "shorts", "live"].includes(segment));
        candidate = markerIndex >= 0 ? segments[markerIndex + 1] : null;
      }
    }

    return YOUTUBE_ID_PATTERN.test(candidate || "") ? candidate : null;
  } catch {
    return null;
  }
}

export function getVideoPlayerUrl(video) {
  const rawUrl = typeof video?.videoUrl === "string"
    ? video.videoUrl
    : typeof video?.url === "string"
      ? video.url
      : null;
  const idFromUrl = getYouTubeIdFromUrl(rawUrl);
  const idFromVideo = typeof video?.id === "object" ? video.id?.videoId : video?.id;
  const youtubeId = idFromUrl || (YOUTUBE_ID_PATTERN.test(idFromVideo || "") ? idFromVideo : null);

  // Keep embeds independent of Google sign-in/consent redirects.
  return youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`
    : rawUrl;
}