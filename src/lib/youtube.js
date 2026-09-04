export async function searchYouTubeVideos(query, maxResults = 10) {
  const apiKey = process.env.REACT_APP_API_KEY;
  if (!apiKey) {
    console.error("YouTube API key is missing. Please check your .env file.");
    return [];
  }

  try {
    // 1. Force YouTube to look for gospel specifically by appending it strongly
    const isGospelContext = /gospel|christian|sermon|worship|jesus|church|apostle|prophet|pastor/i.test(query);
    const strictQuery = isGospelContext ? query : `${query} gospel sermon worship`;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(strictQuery)}&type=video&safeSearch=strict&maxResults=${maxResults * 2}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 2. Strict Local Filter: Check if the returned video actually contains gospel-related terms in title, channel, or description.
    // This prevents secular artists (like Zimdancehall singers) from slipping through just because they were searched.
    const gospelKeywords = ["gospel", "christian", "sermon", "pastor", "apostle", "prophet", "worship", "praise", "church", "jesus", "christ", "god", "bible", "ministry", "preaching", "faith", "holy", "bishop", "reverend"];
    
    const validItems = data.items.filter(item => {
      const textToCheck = `${item.snippet.title} ${item.snippet.description} ${item.snippet.channelTitle}`.toLowerCase();
      // If the original query already contained a gospel word, we are slightly more lenient, 
      // but otherwise, the RESULT must explicitly mention a gospel keyword.
      return gospelKeywords.some(kw => textToCheck.includes(kw));
    });

    // Take only the requested amount after filtering
    const finalItems = validItems.slice(0, maxResults);

    return finalItems.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      author: item.snippet.channelTitle,
      views: "YouTube Video", 
      timeAgo: new Date(item.snippet.publishedAt).toLocaleDateString(),
      image: item.snippet.thumbnails.high.url,
      thumbnail: item.snippet.thumbnails.high.url,
      description: item.snippet.description,
      duration: "Video", 
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (error) {
    console.error("Failed to fetch YouTube videos:", error);
    return [];
  }
}
