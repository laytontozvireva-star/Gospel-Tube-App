import PageShell from "../components/PageShell";
import { Sparkles, Music, BookOpen, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const exploreItems = [
  {
    title: "Trending Sermons",
    description: "Catch the latest messages drawing believers closer to the Word.",
    icon: Sparkles,
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Worship Sessions",
    description: "Browse praise and worship moments that help set the atmosphere.",
    icon: Music,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Bible Teachings",
    description: "Dig into practical teaching for daily Christian growth.",
    icon: BookOpen,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Testimonies",
    description: "Hear real stories of faith, healing, and transformation.",
    icon: Heart,
    color: "bg-rose-100 text-rose-600",
  },
];

function Explore() {
  const navigate = useNavigate();
  return (
    <PageShell
      title="Explore Gospel Tube"
      description="Find sermons, worship, teachings, and testimonies that match what you want to watch next."
    >
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {exploreItems.map((item) => (
          <article 
            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex gap-5 group" 
            key={item.title}
            onClick={() => navigate("/videos")}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">{item.title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export default Explore;
