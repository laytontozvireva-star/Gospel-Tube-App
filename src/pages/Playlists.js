import PageShell from "../components/PageShell";
import { ListVideo, Play } from "lucide-react";

const playlists = [
  { title: "Morning Devotions", count: "12 videos", color: "bg-orange-100 text-orange-600" },
  { title: "Faith Builders", count: "8 videos", color: "bg-blue-100 text-blue-600" },
  { title: "Worship Nights", count: "15 videos", color: "bg-purple-100 text-purple-600" },
  { title: "Prayer & Intercession", count: "9 videos", color: "bg-emerald-100 text-emerald-600" },
];

function Playlists() {
  return (
    <PageShell
      title="Playlists"
      description="Organized video collections for devotion, worship, and teaching."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {playlists.map((playlist) => (
          <article className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" key={playlist.title}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${playlist.color} group-hover:scale-110 transition-transform`}>
              <ListVideo size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">{playlist.title}</h2>
            <p className="text-sm font-medium text-slate-500 mb-4">{playlist.count}</p>
            <button className="flex items-center gap-2 text-sm font-bold text-red-600">
              <Play size={16} className="fill-red-600" />
              Play All
            </button>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export default Playlists;
