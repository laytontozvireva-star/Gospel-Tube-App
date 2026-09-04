import PageShell from "../components/PageShell";
import { Radio, Users } from "lucide-react";

function Live() {
  return (
    <PageShell
      title="Live Events"
      description="Join live worship and preaching events as they happen."
    >
      <div className="grid md:grid-cols-2 gap-6 mt-6 max-w-5xl">
        <article className="bg-white border border-red-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600"></span> LIVE
          </div>
          
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Radio size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Live Worship Service</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">Now streaming with praise, prayer, and ministry. Join the congregation from anywhere in the world.</p>
          
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl w-full sm:w-auto shadow-md shadow-red-600/20 transition-all">
            Join Stream
          </button>
        </article>

        <article className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Users size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Prayer Line</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">Connect with believers for live prayer and encouragement in our interactive prayer rooms.</p>
          
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl w-full sm:w-auto transition-all">
            Join Prayer Room
          </button>
        </article>
      </div>
    </PageShell>
  );
}

export default Live;
