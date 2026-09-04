import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { isSupabaseConfigured, listApostles } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const initialApostles = [
  { name: "Apostle Ezekiel Guti", role: "Senior Apostle", note: "Teaching faith, prayer, and spiritual growth.", image: "https://ui-avatars.com/api/?name=Ezekiel+Guti&background=0D8ABC&color=fff&size=400" },
  { name: "Prophet Emmanuel Makandiwa", role: "Prophet & Teacher", note: "Deep prophetic insights, healing, and teachings on wealth creation.", image: "https://ui-avatars.com/api/?name=Emmanuel+Makandiwa&background=8B0000&color=fff&size=400" },
  { name: "Apostle Joshua Selman", role: "Apostle & Teacher", note: "Founder of Koinonia. Emphasizes intimacy with the Holy Spirit and kingdom principles.", image: "https://ui-avatars.com/api/?name=Joshua+Selman&background=2E8B57&color=fff&size=400" },
  { name: "Apostle Michael Orokpo", role: "Apostle", note: "Known for fiery, passionate preaching and deep spiritual encounters.", image: "https://ui-avatars.com/api/?name=Michael+Orokpo&background=B8860B&color=fff&size=400" },
  { name: "Apostle Arome Osayi", role: "Apostolic Leader", note: "Focuses on revival, building believers, and the apostolic mandate.", image: "https://ui-avatars.com/api/?name=Arome+Osayi&background=483D8B&color=fff&size=400" },
  { name: "Prophet Uebert Angel", role: "Prophet", note: "Founder of Spirit Embassy, known for deep prophetic revelations.", image: "https://ui-avatars.com/api/?name=Uebert+Angel&background=800080&color=fff&size=400" },
  { name: "Pastor Chris Oyakhilome", role: "Pastor & Teacher", note: "President of LoveWorld Inc., known for healing ministry and Rhapsody of Realities.", image: "https://ui-avatars.com/api/?name=Chris+Oyakhilome&background=008080&color=fff&size=400" },
  { name: "Bishop David Oyedepo", role: "Bishop", note: "Founder of Winners' Chapel, renowned for teachings on faith and prosperity.", image: "https://ui-avatars.com/api/?name=David+Oyedepo&background=DC143C&color=fff&size=400" },
];

function Apostles() {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialApostles);
  
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    listApostles().then((data) => { 
      if (active && data.length) setItems(data); 
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <PageShell
      title="Apostles"
      description="Browse featured apostles and their latest teachings."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {items.map((apostle) => (
          <article 
            className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col" 
            key={apostle.name}
            onClick={() => navigate(`/apostles/${encodeURIComponent(apostle.name)}`)}
          >
            <div className="aspect-square bg-slate-100 overflow-hidden relative">
              <img 
                src={apostle.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"} 
                alt={apostle.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col text-center">
              <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">{apostle.name}</h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">
                {apostle.role || "Apostle"}
              </p>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                {apostle.note || apostle.bio || "No biography available."}
              </p>
              <div className="mt-auto pt-4">
                <button className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full w-full transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export default Apostles;
