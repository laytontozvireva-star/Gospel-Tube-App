import PageShell from "../components/PageShell";
import { Sparkles, Music, BookOpen, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { builtInVideos } from "../data/builtInVideos";

const exploreItems = [
  {
    title: "Trending Sermons",
    description: "Catch the latest messages drawing believers closer to the Word.",
    icon: Sparkles,
    color: "bg-amber-100 text-amber-600",
    categoryKey: "Sermon",
  },
  {
    title: "Worship Sessions",
    description: "Browse praise and worship moments that help set the atmosphere.",
    icon: Music,
    color: "bg-blue-100 text-blue-600",
    categoryKey: "Worship",
  },
  {
    title: "Bible Teachings",
    description: "Dig into practical teaching for daily Christian growth.",
    icon: BookOpen,
    color: "bg-green-100 text-green-600",
    categoryKey: "Teaching",
  },
  {
    title: "Testimonies",
    description: "Hear real stories of faith, healing, and transformation.",
    icon: Heart,
    color: "bg-rose-100 text-rose-600",
    categoryKey: "Music",
  },
];

function Explore() {
  const navigate = useNavigate();
  return (
    <PageShell
      title="Explore Gospel Tube"
      description="Find sermons, worship, teachings, and testimonies that match what you want to watch next."
    >
      <div className="flex overflow-x-auto gap-4 pb-4">
        {exploreItems.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(`/videos?category=${item.categoryKey}`)}
            className={`flex flex-col items-center p-2 rounded-lg ${item.color} hover:scale-105 transition-transform`}
          >
            <item.icon size={24} />
            <span className="mt-1 text-sm font-medium">{item.title}</span>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {builtInVideos.map((video) => (
          <div
            key={video.id}
            className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/videos?category=${video.category}`)}
          >
            <div className="relative aspect-video bg-slate-900 overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                {video.duration}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                {video.title}
              </h3>
              <p className="text-xs font-semibold text-slate-500">{video.speaker}</p>
              <p className="text-[11px] text-slate-400 mt-1">{video.category}</p>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export default Explore;
