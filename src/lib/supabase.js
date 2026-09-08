import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// The app keeps its local demo mode when env vars are absent, so the UI remains usable
// before a Supabase project is connected.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function listVideos({ search = "", category = "All" } = {}) {
  if (!supabase) return [];
  let query = supabase.from("videos").select("*, apostles(name), profiles(display_name)").eq("status", "published").order("created_at", { ascending: false });
  if (search) query = query.ilike("title", `%${search}%`);
  if (category && category !== "All") query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listApostles() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("apostles").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function createVideo(video) {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to upload a video.");
  const { data, error } = await supabase.from("videos").insert({ ...video, owner_id: user.id }).select().single();
  if (error) throw error;
  return data;
}

export async function uploadMedia(file, bucket) {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to upload media.");
  const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function listComments(videoId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, users(name, avatar_url)')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addComment(videoId, content) {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to comment.');
  const { data, error } = await supabase.from('comments').insert({
    video_id: videoId,
    user_id: user.id,
    content,
  }).single();
  if (error) throw error;
  return data;
}

export async function deleteComment(commentId) {
  if (!supabase) return null;
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
  return true;
}

export async function getNotifications() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data;
}
