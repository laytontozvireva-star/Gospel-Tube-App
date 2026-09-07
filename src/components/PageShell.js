import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  Play,
  Search,
  X,
  Home as HomeIcon,
  Compass,
  Users,
  Tv,
  ListVideo,
  Heart,
  Clock,
  Upload,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SignInModal from "./SignInModal";
import NotificationBell from "./NotificationBell";

const navItems = [
  { name: "Home", icon: HomeIcon, path: "/" },
  { name: "Explore", icon: Compass, path: "/explore" },
  { name: "Apostles", icon: Users, path: "/apostles" },
  { name: "Live", icon: Tv, path: "/live", badge: "LIVE" },
  { name: "Playlists", icon: ListVideo, path: "/playlists" },
  { name: "Liked Videos", icon: Heart, path: "/liked-videos" },
  { name: "History", icon: Clock, path: "/history" },
  { name: "Upload Video", icon: Upload, path: "/upload" },
];

function PageShell({ title, description, children }) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signinOpen, setSigninOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Search History State
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gt_search_history") || "[]"); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch YouTube suggestions after the visitor pauses typing.
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
        const data = response.ok ? await response.json() : [];
        if (active) setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        if (active) setSuggestions([]);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  // Auto-focus mobile search when opened
  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  const handleSearch = (queryToSearch) => {
    const q = queryToSearch || searchQuery;
    if (!q.trim()) return;
    
    const newHistory = [q, ...searchHistory.filter(item => item !== q)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("gt_search_history", JSON.stringify(newHistory));
    
    setShowHistory(false);
    setMobileSearchOpen(false);
    setSelectedIndex(-1);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e) => {
    if (!showHistory || dropdownItems.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < matchingHistory.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        setSearchQuery(searchHistory[selectedIndex]);
        handleSearch(searchHistory[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowHistory(false);
      setSelectedIndex(-1);
    }
  };

  const matchingHistory = searchHistory.filter((item) =>
    item.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const suggestionItems = suggestions.filter((item) =>
    !searchHistory.some((historyItem) => historyItem.toLowerCase() === item.toLowerCase())
  );
  const dropdownItems = [...matchingHistory, ...suggestionItems];

  const SearchBar = ({ isMobile }) => (
    <div className={`relative w-full ${isMobile ? "" : "max-w-xl mx-8"}`} ref={isMobile ? null : searchContainerRef}>
      <div className="relative w-full">
        {isMobile && (
          <button 
            type="button" 
            onClick={() => setMobileSearchOpen(false)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        
        <input
          ref={isMobile ? mobileSearchInputRef : inputRef}
          type="text"
          placeholder="Search apostles, sermons, topics..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowHistory(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowHistory(true)}
          onKeyDown={handleKeyDown}
          className={`w-full bg-slate-100 border border-slate-200 text-slate-800 rounded-full py-2.5 ${isMobile ? "pl-11" : "pl-5"} pr-16 text-sm outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner`}
        />
        
        <button 
          type="button" 
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setSearchQuery("");
            if (!isMobile && searchContainerRef.current) {
              searchContainerRef.current.querySelector("input").focus();
            }
          }}
          className="absolute right-10 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X size={14} />
        </button>

        <button 
          type="button" 
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleSearch()} 
          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-500 rounded-r-full hover:text-red-600 transition-colors"
        >
          <Search size={18} />
        </button>
      </div>
      
      {/* Search History Dropdown */}
      {showHistory && dropdownItems.length > 0 && (
        <div className={`absolute left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 ${isMobile ? "top-14" : "top-12"}`}>
          {matchingHistory.length > 0 &&           <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Searches</span>
            <button 
              onClick={() => { setSearchHistory([]); localStorage.removeItem("gt_search_history"); }}
              className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
            >
              Clear
            </button>
          </div>}
          <ul className="py-2" onMouseDown={(e) => e.preventDefault()}>
            {matchingHistory.map((historyItem, idx) => (
              <li key={idx}>
                <button
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    setSearchQuery(historyItem);
                    handleSearch(historyItem);
                  }}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                    selectedIndex === idx ? "bg-red-50 text-red-700" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Clock size={16} className={selectedIndex === idx ? "text-red-400" : "text-slate-400"} />
                  {historyItem}
                </button>
              </li>
            ))}
            {suggestionItems.length > 0 && (
              <>
                <li className="px-4 pt-3 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Suggestions</li>
                {suggestionItems.map((suggestion, idx) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setSelectedIndex(matchingHistory.length + idx)}
                      onClick={() => { setSearchQuery(suggestion); handleSearch(suggestion); }}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                        selectedIndex === matchingHistory.length + idx ? "bg-red-50 text-red-700" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Search size={16} className={selectedIndex === matchingHistory.length + idx ? "text-red-400" : "text-slate-400"} />
                      {suggestion}
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 lg:px-8 h-16 flex items-center justify-between shadow-xs">
        
        {/* Mobile Search Overlay */}
        {mobileSearchOpen ? (
          <div className="w-full h-full flex items-center bg-white absolute inset-0 px-4 z-50">
            {SearchBar({ isMobile: true })}
          </div>
        ) : (
          <>
            {/* Left: Menu Toggle + Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/30 group-hover:bg-red-700 transition-colors">
                  <Play size={16} className="fill-white translate-x-0.5" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 hidden sm:inline">
                  GOSPEL<span className="text-red-600">TUBE</span>
                </span>
              </Link>
            </div>

            {/* Center: Desktop Search Bar */}
            <div className="hidden md:flex flex-col flex-1">
              {SearchBar({ isMobile: false })}
            </div>

            {/* Right: Notifications & Sign In & Mobile Search Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Button */}
              <button 
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                onClick={() => setMobileSearchOpen(true)}
              >
                <Search size={20} />
              </button>

              <NotificationBell />
              
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-md shadow-red-600/20 active:scale-95 whitespace-nowrap"
                onClick={user ? signOut : () => setSigninOpen(true)}
              >
                {user ? "Sign Out" : "Sign In"}
              </button>
            </div>
          </>
        )}
      </header>

      {/* 2. BODY LAYOUT (Sidebar + Main Content) */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside
          className={`fixed lg:sticky top-16 left-0 z-30 w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-1 overflow-y-auto overflow-x-hidden scrollbar-none pr-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5">
                      <item.icon size={20} className={isActive ? "text-red-600" : "text-slate-500"} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Sign In Card */}
          {!user && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center mt-6 shrink-0 hidden lg:block">
              <p className="text-xs font-semibold text-slate-800 mb-1">Sign In</p>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Sign in to follow apostles, save sermons, and take notes.
              </p>
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-sm"
                onClick={() => setSigninOpen(true)}
              >
                Sign In Now
              </button>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] bg-slate-50">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {(title || description) && (
              <section className="mb-6 lg:mb-8">
                {title && <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{title}</h1>}
                {description && <p className="text-slate-500 text-sm lg:text-base leading-relaxed max-w-3xl">{description}</p>}
              </section>
            )}
            {children}
          </div>
        </main>
      </div>

      <SignInModal open={signinOpen} onClose={() => setSigninOpen(false)} />
    </div>
  );
}

export default PageShell;

