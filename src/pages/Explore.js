import PageShell from "../components/PageShell";
import { Sparkles, Music, BookOpen, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    </PageShell>
  );
}

export default Explore;
