
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import SignInModal from "../components/SignInModal";
import {
  Home as HomeIcon,
  Compass,
  Users,
  Tv,
  ListVideo,
  Heart,
  Clock,
  Search,
  Bell,
  Play,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Sparkles,
  Flame,
  Menu,
  X
} from "lucide-react";

// Mock Data
const categories = [
  "All",
  "Worship Music",
  "Bible Teachings",
  "Sermons",
  "Testimonies",
  "Deliverance",
  "Youth Fellowship",
];

const featuredApostles = [
  { name: "Apostle Ezekiel Guti", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80" },
  { name: "Apostle Paul", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
  { name: "Apostle Peter", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" },
  { name: "Apostle John", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
  { name: "Apostle James", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80" },
  { name: "Apostle Chiwenga", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80" },
];

const latestSermons = [
  {
    id: 1,
    title: "Walking in the Power of the Holy Spirit",
    author: "Apostle Ezekiel Guti",
    duration: "48:21",
    timeAgo: "2 hours ago",
    views: "12K views",
    thumbnail: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    title: "Faith That Moves Mountains & Overcomes Fear",
    author: "Apostle Paul",
    duration: "52:10",
    timeAgo: "5 hours ago",
    views: "8.4K views",
    thumbnail: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    title: "The Power of Persistent Prayer & Intercession",
    author: "Apostle Peter",
    duration: "48:33",
    timeAgo: "1 day ago",
    views: "24K views",
    thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    title: "God's Divine Plan & Purpose For Your Life",
    author: "Apostle John",
    duration: "50:12",
    timeAgo: "1 day ago",
    views: "19K views",
    thumbnail: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  },
];

const sidebarItems = [
  { name: "Home", icon: HomeIcon, path: "/", active: true },
  { name: "Explore", icon: Compass, path: "/explore" },
  { name: "Apostles", icon: Users, path: "/apostles" },
  { name: "Live", icon: Tv, path: "/live", badge: "LIVE" },
  { name: "Playlists", icon: ListVideo, path: "/playlists" },
  { name: "Liked Videos", icon: Heart, path: "/liked-videos" },
  { name: "History", icon: Clock, path: "/history" },
];

function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signinOpen, setSigninOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 lg:px-8 h-16 flex items-center justify-between shadow-xs">
        {/* Left: Menu Toggle + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/30">
              <Play size={16} className="fill-white translate-x-0.5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              GOSPEL<span className="text-red-600">TUBE</span>
            </span>
          </a>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden sm:flex items-center flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search apostles, sermons, topics..."
              className="w-full bg-slate-100 border border-slate-200 text-slate-800 rounded-full py-2.5 pl-5 pr-12 text-sm outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-500 hover:text-red-600">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Right: Notifications & Sign In */}
        <div className="flex items-center gap-3">
          <button className="relative p-2.5 rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white animate-pulse" />
          </button>

          <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-md shadow-red-600/20 active:scale-95">
            {user ? user.name || "Sign Out" : "Sign In"}
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-md shadow-red-600/20 active:scale-95"
            onClick={user ? signOut : () => setSigninOpen(true)}
          >
            {user ? "Sign Out" : "Sign In"}
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT (Sidebar + Main Content) */}
      <div className="flex flex-1">
        {/* LEFT SIDEBAR */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-30 w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  item.active
                    ? "bg-red-50 text-red-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon size={20} className={item.active ? "text-red-600" : "text-slate-500"} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Sign In Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center mt-6">
            <p className="text-xs font-semibold text-slate-800 mb-1">Sign In</p>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Sign in to follow apostles, save sermons, and take notes.
            </p>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-sm">
              Sign In Now
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto overflow-hidden">
          {/* Categories Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* HERO BANNER CAROUSEL */}
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-xl text-white mb-10 group">
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=1200&auto=format&fit=crop&q=80"
              alt="Hero Sermon"
              className="w-full h-80 lg:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />

            <div className="absolute inset-0 z-20 p-8 lg:p-12 flex flex-col justify-center max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600/90 text-white w-fit mb-4 uppercase tracking-wider backdrop-blur-md">
                <Flame size={14} /> Featured Sermon
              </span>

              <h1 className="text-2xl lg:text-4xl font-extrabold leading-tight tracking-tight mb-3">
                Walking in the Power of the Holy Spirit
              </h1>

              <p className="text-slate-300 text-sm lg:text-base font-medium mb-6 line-clamp-2">
                Join Apostle Ezekiel Guti as he reveals foundational biblical truths on empowering your daily Christian walk.
              </p>

              <div className="flex items-center gap-4">
                <button className="bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/40 transition-all active:scale-95">
                  <Play size={18} className="fill-white" />
                  Watch Now
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-semibold text-sm transition-all">
                  Save to Playlist
                </button>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* FEATURED APOSTLES ROW */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg lg:text-xl font-bold text-slate-900">Featured Apostles</h2>
              <a href="/" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </a>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {featuredApostles.map((apostle) => (
                <div
                  key={apostle.name}
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

          {/* LATEST SERMONS GRID */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg lg:text-xl font-bold text-slate-900">Latest Sermons</h2>
              <a href="/" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </a>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestSermons.map((video) => (
                <motion.div
                  key={video.id}
                  whileHover={{ y: -4 }}
                  className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Box */}
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transform scale-90 group-hover:scale-100 transition-transform">
                          <Play size={20} className="fill-white translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {video.duration}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex gap-3">
                      <img
                        src={video.avatar}
                        alt={video.author}
                        className="w-9 h-9 rounded-full object-cover mt-0.5 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500">{video.author}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {video.views} • {video.timeAgo}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* DAILY BIBLE VERSE CARD */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
              <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles size={16} /> Daily Scripture
                </div>
                <blockquote className="text-lg lg:text-2xl font-serif italic font-medium leading-relaxed mb-4 text-slate-100">
                  "For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life."
                </blockquote>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-red-400">— John 3:16</span>
                  <div className="flex items-center gap-3">
                    <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                      <Bookmark size={16} />
                    </button>
                    <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* COMMUNITY CTA BANNER */}
          <section className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-xs">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Join Our Gospel Community</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Stay connected with inspiring Christian sermons, live worship music, and daily Bible teachings.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded-2xl font-bold text-sm shadow-md shadow-red-600/30 transition-all active:scale-95">
                Subscribe Now
              </button>
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-semibold text-sm transition-all">
                Learn More
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
    <SignInModal open={signinOpen} onClose={() => setSigninOpen(false)} />
  );
}

export default Home;
