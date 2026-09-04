import PageShell from "../components/PageShell";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Play } from "lucide-react";

const likedVideos = [
  { title: "Walking in the Power of the Holy Spirit", meta: "Liked today • 48:21", image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&auto=format&fit=crop&q=80" },
  { title: "The Power of Prayer", meta: "Liked yesterday • 18:34", image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=400&auto=format&fit=crop&q=80" },
  { title: "Faith Over Fear", meta: "Liked this week • 22:11", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format&fit=crop&q=80" },
];

function LikedVideos() {
  const navigate = useNavigate();
  return (
    <PageShell
      title="Liked Videos"
      description="Revisit the sermons and worship videos you saved."
    >
      <div className="flex flex-col gap-4 mt-6 max-w-4xl">
        {likedVideos.map((video) => (
          <article 
            className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group cursor-pointer" 
            key={video.title}
            onClick={() => navigate("/videos")}
          >
            <div className="w-40 aspect-video rounded-xl overflow-hidden relative shrink-0">
              <img src={video.image} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={24} className="fill-white text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">{video.title}</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">{video.meta}</p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">
                <Heart size={20} className="fill-red-600" />
              </button>
              <Link to="/videos" className="hidden sm:flex bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl font-bold text-sm transition-colors">
                Open
              </Link>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export default LikedVideos;
