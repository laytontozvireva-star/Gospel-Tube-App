import { useState } from "react";
import { Check, ImagePlus, UploadCloud, Video } from "lucide-react";
import PageShell from "../components/PageShell";
import { createVideo, isSupabaseConfigured, uploadMedia } from "../lib/supabase";

function UploadVideo() {
  const [form, setForm] = useState({ title: "", description: "", apostle: "Apostle Ezekiel Guti", playlist: "", tags: "" });
  const [videoName, setVideoName] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isSupabaseConfigured) {
        const [videoUrl, thumbnailUrl] = await Promise.all([
          videoFile ? uploadMedia(videoFile, "videos") : null, 
          thumbnailFile ? uploadMedia(thumbnailFile, "thumbnails") : null
        ]);
        await createVideo({ 
          title: form.title, 
          description: form.description, 
          category: "Sermon", 
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean), 
          video_url: videoUrl, 
          thumbnail_url: thumbnailUrl, 
          status: "published" 
        });
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to save this video.");
      setSaving(false);
      return;
    }
    const saved = JSON.parse(localStorage.getItem("gospelTubeVideos") || "[]");
    saved.unshift({
      id: `uploaded-${Date.now()}`,
      title: form.title,
      speaker: form.apostle,
      duration: "New",
      category: "Sermon",
      thumbnail: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&auto=format&fit=crop&q=80",
      description: form.description,
      tags: form.tags,
      videoName,
      thumbnailName,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("gospelTubeVideos", JSON.stringify(saved));
    setPublished(true);
    setSaving(false);
  };

  const saveDraft = () => {
    localStorage.setItem("gospelTubeDraft", JSON.stringify({ ...form, videoName, thumbnailName, savedAt: new Date().toISOString() }));
    setPublished(true);
  };

  return (
    <PageShell title="Upload New Sermon" description="Share an encouraging message with the GospelTube community.">
      <div className="max-w-3xl">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
          
          <div className="flex flex-col items-center gap-2 bg-slate-50 px-2">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-md">1</div>
            <span className="text-xs font-bold text-slate-900">Details</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm">2</div>
            <span className="text-xs font-bold text-slate-500">Video</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm">3</div>
            <span className="text-xs font-bold text-slate-500">Thumbnail</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm">4</div>
            <span className="text-xs font-bold text-slate-500">Publish</span>
          </div>
        </div>

        {published ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your sermon is ready to publish</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              “{form.title || "Untitled sermon"}” has been saved as a draft. You can publish it from your dashboard.
            </p>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm" 
              onClick={() => { setPublished(false); setForm({ title: "", description: "", apostle: "Apostle Ezekiel Guti", playlist: "", tags: "" }); setVideoName(""); setThumbnailName(""); }}
            >
              Upload another sermon
            </button>
          </div>
        ) : (
          <form className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm" onSubmit={submit}>
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Video details</h2>
                <p className="text-sm text-slate-500">Add the information viewers will see alongside your sermon.</p>
              </div>
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-md">* Required</span>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={update} 
                  required 
                  placeholder="Enter sermon title" 
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={update} 
                  required 
                  placeholder="Tell us about this sermon..." 
                  rows="5"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Apostle</label>
                  <select 
                    name="apostle" 
                    value={form.apostle} 
                    onChange={update}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-white"
                  >
                    <option>Apostle Ezekiel Guti</option>
                    <option>Apostle Paul</option>
                    <option>Apostle Peter</option>
                    <option>Apostle John</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Playlist</label>
                  <select 
                    name="playlist" 
                    value={form.playlist} 
                    onChange={update}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all bg-white"
                  >
                    <option value="">Select playlist</option>
                    <option>Faith Teachings</option>
                    <option>Prayer Teachings</option>
                    <option>Holy Spirit Series</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tags</label>
                <input 
                  name="tags" 
                  value={form.tags} 
                  onChange={update} 
                  placeholder="Add tags (e.g. faith, prayer, healing)" 
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-red-500 hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-3 group-hover:text-red-600 group-hover:bg-red-50 transition-colors">
                    <Video size={24} />
                  </div>
                  <strong className="text-sm font-bold text-slate-900 block mb-1">Video file</strong>
                  <small className="text-xs text-slate-500 block mb-4">{videoName || "MP4, MOV or WebM up to 2GB"}</small>
                  <input type="file" accept="video/*" className="hidden" onChange={(event) => { setVideoFile(event.target.files[0] || null); setVideoName(event.target.files[0]?.name || ""); }} />
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <UploadCloud size={14} /> Choose video
                  </span>
                </label>
                
                <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-red-500 hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-3 group-hover:text-red-600 group-hover:bg-red-50 transition-colors">
                    <ImagePlus size={24} />
                  </div>
                  <strong className="text-sm font-bold text-slate-900 block mb-1">Thumbnail</strong>
                  <small className="text-xs text-slate-500 block mb-4">{thumbnailName || "JPG or PNG, 1280 × 720 recommended"}</small>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => { setThumbnailFile(event.target.files[0] || null); setThumbnailName(event.target.files[0]?.name || ""); }} />
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <ImagePlus size={14} /> Choose image
                  </span>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm mt-4">
                  {error}
                </div>
              )}
              
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                <button type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors" onClick={saveDraft} disabled={saving}>
                  Save draft
                </button>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2" disabled={saving}>
                  {saving ? "Saving…" : "Next: Publish"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </PageShell>
  );
}

export default UploadVideo;
