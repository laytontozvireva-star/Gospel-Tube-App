import PageShell from "../components/PageShell";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Play } from "lucide-react";

const historyItems = [
  {
    title: "The Power of Prayer",
    meta: "Watched yesterday • 18:34",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=400&auto=format&fit=crop&q=80"
  },
  {
    title: "Faith Over Fear",
    meta: "Watched 2 days ago • 22:11",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format&fit=crop&q=80"
  },
  {
    title: "Walking with Christ",
    meta: "Watched last week • 16:45",
    image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&auto=format&fit=crop&q=80"
  },
];

function History() {
  const navigate = useNavigate();
  return (
    <PageShell
      title="Watch History"
      description="Pick up where you left off and revisit sermons you want to hear again."
    >
      <div className="flex flex-col gap-4 mt-6 max-w-4xl">
        {historyItems.map((item) => (
          <article 
            className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group cursor-pointer" 
            key={item.title}
            onClick={() => navigate("/videos")}
          >
            <div className="w-40 aspect-video rounded-xl overflow-hidden relative shrink-0">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={24} className="fill-white text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">{item.title}</h2>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                <Clock size={14} />
                {item.meta}
              </p>
            </div>
            
            <div className="shrink-0">
              <Link to="/videos" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                <Play size={16} />
                <span className="hidden sm:inline">Watch Again</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export default History;
