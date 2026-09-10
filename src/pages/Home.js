import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Sparkles,
  Flame,
  Loader2,
  Music,
  TrendingUp,
  Clock,
  Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import VideoModal from "../components/VideoModal";
import { searchYouTubeVideos } from "../lib/youtube";

// ── Categories for YouTube search filtering ─────────────────────────
const categories = [
  { label: "All", query: "gospel sermon preaching" },
  { label: "Worship Music", query: "gospel worship music praise" },
  { label: "Bible Teachings", query: "bible teaching sermon" },
  { label: "Sermons", query: "powerful gospel sermon preaching" },
  { label: "Testimonies", query: "christian testimony gospel" },
  { label: "Deliverance", query: "deliverance prayer sermon" },
  { label: "Youth Fellowship", query: "youth fellowship gospel christian" },
];

// ── Featured Apostles ───────────────────────────────────────────────
const featuredApostles = [
  { name: "Apostle Ezekiel Guti", image: "https://ui-avatars.com/api/?name=Ezekiel+Guti&background=0D8ABC&color=fff&size=400" },
  { name: "Prophet Emmanuel Makandiwa", image: "https://ui-avatars.com/api/?name=Emmanuel+Makandiwa&background=8B0000&color=fff&size=400" },
  { name: "Apostle Joshua Selman", image: "https://ui-avatars.com/api/?name=Joshua+Selman&background=2E8B57&color=fff&size=400" },
  { name: "Apostle Michael Orokpo", image: "https://ui-avatars.com/api/?name=Michael+Orokpo&background=B8860B&color=fff&size=400" },
  { name: "Prophet Uebert Angel", image: "https://ui-avatars.com/api/?name=Uebert+Angel&background=800080&color=fff&size=400" },
  { name: "Pastor Chris Oyakhilome", image: "https://ui-avatars.com/api/?name=Chris+Oyakhilome&background=008080&color=fff&size=400" },
];

// ── 365 Daily Bible Verses (rotates by day of year) ─────────────────
const bibleVerses = [
  { text: "For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life.", ref: "John 3:16" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "The LORD is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "Trust in the LORD with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", ref: "Joshua 1:9" },
  { text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "The LORD is my light and my salvation — whom shall I fear?", ref: "Psalm 27:1" },
  { text: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31" },
  { text: "And we know that in all things God works for the good of those who love Him.", ref: "Romans 8:28" },
  { text: "The name of the LORD is a fortified tower; the righteous run to it and are safe.", ref: "Proverbs 18:10" },
  { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", ref: "Philippians 4:6" },
  { text: "He heals the brokenhearted and binds up their wounds.", ref: "Psalm 147:3" },
  { text: "No weapon formed against you shall prosper.", ref: "Isaiah 54:17" },
  { text: "Delight yourself in the LORD, and He will give you the desires of your heart.", ref: "Psalm 37:4" },
  { text: "The joy of the LORD is your strength.", ref: "Nehemiah 8:10" },
  { text: "Cast all your anxiety on Him because He cares for you.", ref: "1 Peter 5:7" },
  { text: "God is our refuge and strength, an ever-present help in trouble.", ref: "Psalm 46:1" },
  { text: "If God is for us, who can be against us?", ref: "Romans 8:31" },
  { text: "Create in me a pure heart, O God, and renew a steadfast spirit within me.", ref: "Psalm 51:10" },
  { text: "Come to me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28" },
  { text: "The Lord will fight for you; you need only to be still.", ref: "Exodus 14:14" },
  { text: "But seek first His kingdom and His righteousness, and all these things will be given to you as well.", ref: "Matthew 6:33" },
  { text: "I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.", ref: "John 16:33" },
  { text: "The grass withers and the flowers fall, but the word of our God endures forever.", ref: "Isaiah 40:8" },
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "For where two or three gather in my name, there am I with them.", ref: "Matthew 18:20" },
  { text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", ref: "2 Corinthians 5:17" },
  { text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
  { text: "Your word is a lamp for my feet, a light on my path.", ref: "Psalm 119:105" },
  { text: "The LORD bless you and keep you; the LORD make His face shine on you and be gracious to you.", ref: "Numbers 6:24-25" },
  { text: "I have been crucified with Christ and I no longer live, but Christ lives in me.", ref: "Galatians 2:20" },
];

function getDailyVerse() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return bibleVerses[dayOfYear % bibleVerses.length];
}

// ── Skeleton Loader Component ───────────────────────────────────────
function VideoSkeleton({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-slate-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
    </div>
  ));
}

// ── Reusable Video Card ─────────────────────────────────────────────
function VideoCard({ video, onClick, isNew }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => onClick(video)}
    >
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        <img
          src={video.image || video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play size={20} className="fill-white translate-x-0.5" />
          </div>
        </div>
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
          {video.duration}
        </span>
        {isNew && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
            New
          </span>
        )}
      </div>
      <div className="p-4 flex-1">
        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
          {video.title}
        </h3>
        <p className="text-xs font-semibold text-slate-500">{video.author}</p>
        <p className="text-[11px] text-slate-400 mt-1">
          {video.views} • {video.timeAgo}
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Home Component ─────────────────────────────────────────────
function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [subscribed, setSubscribed] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Video states
  const [latestVideos, setLatestVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [worshipVideos, setWorshipVideos] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingWorship, setLoadingWorship] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  // Hero carousel state
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimerRef = useRef(null);

  // Video player modal
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Daily Bible verse
  const dailyVerse = getDailyVerse();

  // Liked videos (localStorage)
  const [likedIds, setLikedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gt_liked") || "[]"); } catch { return []; }
  });
  const toggleLike = (videoId) => {
    setLikedIds((prev) => {
      const next = prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId];
      localStorage.setItem("gt_liked", JSON.stringify(next));
      return next;
    });
  };

  // ── Fetch real YouTube videos ───────────────────────────────────
  const fetchVideos = useCallback(async () => {
    const cat = categories.find((c) => c.label === selectedCategory) || categories[0];

    // Latest sermons — use category-specific search
    setLoadingLatest(true);
    searchYouTubeVideos(`${cat.query} ${new Date().getFullYear()}`, 8)
      .then((data) => { setLatestVideos(data); setLoadingLatest(false); })
      .catch(() => setLoadingLatest(false));

    // Trending sermons
    setLoadingTrending(true);
    searchYouTubeVideos(`trending ${cat.query}`, 8)
      .then((data) => { setTrendingVideos(data); setLoadingTrending(false); })
      .catch(() => setLoadingTrending(false));

    // Worship music (always fetch)
    if (selectedCategory === "All") {
      setLoadingWorship(true);
      searchYouTubeVideos("gospel worship music praise 2025", 6)
        .then((data) => { setWorshipVideos(data); setLoadingWorship(false); })
        .catch(() => setLoadingWorship(false));

      setLoadingRecommended(true);
      searchYouTubeVideos("powerful prophetic sermon today", 4)
        .then((data) => { setRecommendedVideos(data); setLoadingRecommended(false); })
        .catch(() => setLoadingRecommended(false));
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // ── Hero carousel auto-rotation ─────────────────────────────────
  const heroVideos = trendingVideos.slice(0, 4);
  const heroVideo = heroVideos[heroIndex] || null;

  useEffect(() => {
    if (heroVideos.length <= 1) return;
    heroTimerRef.current = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroVideos.length);
    }, 6000);
    return () => clearInterval(heroTimerRef.current);
  }, [heroVideos.length]);

  const goHero = (dir) => {
    clearInterval(heroTimerRef.current);
    setHeroIndex((prev) => (prev + dir + heroVideos.length) % heroVideos.length);
  };

  return (
    <PageShell>
      {/* Categories Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setSelectedCategory(cat.label)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.label
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ══════════ HERO BANNER CAROUSEL ══════════ */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-xl text-white mb-10 group min-h-[320px] lg:min-h-[384px]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />

        <AnimatePresence mode="wait">
          {heroVideo ? (
            <motion.img
              key={heroVideo.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              src={heroVideo.image || heroVideo.thumbnail}
              alt={heroVideo.title}
              className="w-full h-80 lg:h-96 object-cover object-center absolute inset-0"
            />
          ) : (
            <div className="w-full h-80 lg:h-96 bg-slate-800 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-slate-500" />
            </div>
          )}
        </AnimatePresence>

        {heroVideo && (
          <div className="absolute inset-0 z-20 p-8 lg:p-12 flex flex-col justify-center max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600/90 text-white w-fit mb-4 uppercase tracking-wider backdrop-blur-md">
              <Flame size={14} /> Featured Today
            </span>

            <h1 className="text-2xl lg:text-4xl font-extrabold leading-tight tracking-tight mb-2 line-clamp-2">
              {heroVideo.title}
            </h1>

            <p className="text-slate-300 text-sm lg:text-base font-medium mb-2">
              {heroVideo.author}
            </p>
            <p className="text-slate-400 text-xs mb-6">
              {heroVideo.views} • {heroVideo.timeAgo}
            </p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSelectedVideo(heroVideo)}
                className="bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/40 transition-all active:scale-95"
              >
                <Play size={18} className="fill-white" />
                Watch Now
              </button>
              <button
                type="button"
                onClick={() => toggleLike(heroVideo.id)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-semibold text-sm transition-all flex items-center gap-2"
              >
                <Heart size={16} className={likedIds.includes(heroVideo.id) ? "fill-red-500 text-red-500" : ""} />
                {likedIds.includes(heroVideo.id) ? "Liked" : "Like"}
              </button>
            </div>
          </div>
        )}

        {/* Carousel Controls */}
        {heroVideos.length > 1 && (
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
            {/* Dots */}
            <div className="flex items-center gap-1.5 mr-2">
              {heroVideos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { clearInterval(heroTimerRef.current); setHeroIndex(i); }}
                  className={`h-1.5 rounded-full transition-all ${i === heroIndex ? "w-6 bg-red-500" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
                />
              ))}
            </div>
            <button onClick={() => goHero(-1)} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => goHero(1)} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* ══════════ FEATURED APOSTLES ROW ══════════ */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg lg:text-xl font-bold text-slate-900">Featured Apostles</h2>
          <Link to="/apostles" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {featuredApostles.map((apostle) => (
            <div
              key={apostle.name}
              onClick={() => navigate(`/apostles/${encodeURIComponent(apostle.name)}`)}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full p-1 ring-2 ring-slate-200 group-hover:ring-red-600 transition-all duration-300 mb-2 overflow-hidden shadow-sm">
                <img
                  src={apostle.image}
                  alt={apostle.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-red-600 line-clamp-1">
                {apostle.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ TRENDING SERMONS (Real) ══════════ */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-red-500" /> Trending Sermons
          </h2>
          <Link to="/videos" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingTrending ? (
            <VideoSkeleton count={4} />
          ) : trendingVideos.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 col-span-full">No trending sermons found.</p>
          ) : (
            trendingVideos.slice(0, 4).map((video, idx) => (
              <VideoCard key={video.id || idx} video={video} onClick={setSelectedVideo} isNew={idx === 0} />
            ))
          )}
        </div>
      </section>

      {/* ══════════ LATEST SERMONS (Real — updates daily) ══════════ */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock size={20} className="text-blue-500" /> Latest Sermons
          </h2>
          <Link to="/videos" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingLatest ? (
            <VideoSkeleton count={8} />
          ) : latestVideos.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 col-span-full">No latest sermons found.</p>
          ) : (
            latestVideos.map((video, idx) => (
              <VideoCard key={video.id || idx} video={video} onClick={setSelectedVideo} isNew={idx < 2} />
            ))
          )}
        </div>
      </section>

      {/* ══════════ WORSHIP MUSIC SECTION (New!) ══════════ */}
      {selectedCategory === "All" && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Music size={20} className="text-purple-500" /> Worship Music
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingWorship ? (
              <VideoSkeleton count={3} />
            ) : worshipVideos.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 col-span-full">No worship music found.</p>
            ) : (
              worshipVideos.slice(0, 6).map((video, idx) => (
                <VideoCard key={video.id || idx} video={video} onClick={setSelectedVideo} />
              ))
            )}
          </div>
        </section>
      )}

      {/* ══════════ DAILY BIBLE VERSE CARD (Rotates Daily) ══════════ */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={16} /> Daily Scripture — {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <blockquote className="text-lg lg:text-2xl font-serif italic font-medium leading-relaxed mb-4 text-slate-100">
              "{dailyVerse.text}"
            </blockquote>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-red-400">— {dailyVerse.ref}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`"${dailyVerse.text}" — ${dailyVerse.ref}`);
                    alert("Verse copied to clipboard!");
                  }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Copy verse"
                >
                  <Bookmark size={16} />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: dailyVerse.ref, text: `"${dailyVerse.text}" — ${dailyVerse.ref}` });
                    } else {
                      navigator.clipboard.writeText(`"${dailyVerse.text}" — ${dailyVerse.ref}`);
                      alert("Verse copied!");
                    }
                  }}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Share verse"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ RECOMMENDED FOR YOU (New!) ══════════ */}
      {selectedCategory === "All" && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" /> Recommended For You
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingRecommended ? (
              <VideoSkeleton count={4} />
            ) : recommendedVideos.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 col-span-full">No recommendations yet.</p>
            ) : (
              recommendedVideos.map((video, idx) => (
                <VideoCard key={video.id || idx} video={video} onClick={setSelectedVideo} />
              ))
            )}
          </div>
        </section>
      )}

      {/* ══════════ COMMUNITY CTA BANNER ══════════ */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-xs">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Join Our Gospel Community</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
          Stay connected with inspiring Christian sermons, live worship music, and daily Bible teachings.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded-2xl font-bold text-sm shadow-md shadow-red-600/30 transition-all active:scale-95"
            onClick={() => {
              if (!user) {
                alert("Please sign in");
                return;
              }
              setSubscribed((value) => !value);
            }}
          >
            {subscribed ? "Subscribed ✓" : "Subscribe Now"}
          </button>
          <Link to="/about" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-semibold text-sm transition-all">
            Learn More
          </Link>
        </div>
      </section>

      {selectedVideo && (
        <VideoModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          relatedVideos={latestVideos.filter(v => v.id !== selectedVideo.id)} 
          onSelectRelated={setSelectedVideo} 
        />
      )}
    </PageShell>
  );
}

export default Home;
