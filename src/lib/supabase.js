import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// The app keeps its local demo mode when env vars are absent, so the UI remains usable
// before a Supabase project is connected.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ── Existing ──
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
    .select('id, content, created_at, user_id, profiles:user_id(display_name, avatar_url)')
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
  }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteComment(commentId) {
  if (!supabase) return null;
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
  return true;
}

// ── Likes ──
export async function listLikes() {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");
  
  const { data, error } = await supabase
    .from('likes')
    .select('*, videos(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function toggleLike(videoId) {
  if (!supabase) return { liked: false };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data: existing, error: checkError } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('id', existing.id);
    if (deleteError) throw deleteError;
    return { liked: false };
  } else {
    const { error: insertError } = await supabase
      .from('likes')
      .insert({ user_id: user.id, video_id: videoId });
    if (insertError) throw insertError;
    return { liked: true };
  }
}

export async function isVideoLiked(videoId) {
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

// ── Watch History ──
export async function getWatchHistory() {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from('watch_history')
    .select('*, videos(*)')
    .eq('user_id', user.id)
    .order('watched_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function upsertWatchProgress(videoId, progressSeconds) {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from('watch_history')
    .upsert({
      user_id: user.id,
      video_id: videoId,
      progress_seconds: progressSeconds,
      watched_at: new Date().toISOString()
    }, { onConflict: 'user_id,video_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function clearWatchHistory() {
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { error } = await supabase
    .from('watch_history')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
}

// ── Playlists ──
export async function listPlaylists() {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_videos(count)')
    .or(`owner_id.eq.${user.id},is_public.eq.true`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPlaylistVideos(playlistId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('playlist_videos')
    .select('*, videos(*)')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createPlaylist(name, description, isPublic = true) {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from('playlists')
    .insert({ owner_id: user.id, name, description, is_public: isPublic })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePlaylist(playlistId) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId);

  if (error) throw error;
  return true;
}

export async function addVideoToPlaylist(playlistId, videoId) {
  if (!supabase) return null;
  
  const { data: currentVideos, error: fetchError } = await supabase
    .from('playlist_videos')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1);
    
  if (fetchError) throw fetchError;
  
  const position = (currentVideos && currentVideos.length > 0) ? currentVideos[0].position + 1 : 1;

  const { data, error } = await supabase
    .from('playlist_videos')
    .insert({ playlist_id: playlistId, video_id: videoId, position })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeVideoFromPlaylist(playlistId, videoId) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('playlist_videos')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('video_id', videoId);

  if (error) throw error;
  return true;
}

// ── Subscriptions ──
export async function subscribeToApostle(apostleId) {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({ user_id: user.id, apostle_id: apostleId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unsubscribeFromApostle(apostleId) {
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('apostle_id', apostleId);

  if (error) throw error;
  return true;
}

export async function isSubscribed(apostleId) {
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('apostle_id', apostleId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function getSubscriptionCount(apostleId) {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('apostle_id', apostleId);

  if (error) throw error;
  return count || 0;
}

export async function getUserSubscriptions() {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, apostles(*)')
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
}

// ── Notifications ──
export async function getNotifications() {
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq('user_id', user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

export async function markNotificationRead(notificationId) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) throw error;
  return true;
}

export async function markAllNotificationsRead() {
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not found");

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) throw error;
  return true;
}

// ── Views ──
export async function incrementViewCount(videoId) {
  if (!supabase) return false;
  const { error } = await supabase.rpc('increment_view_count', { video_uuid: videoId });
  if (error) throw error;
  return true;
}
