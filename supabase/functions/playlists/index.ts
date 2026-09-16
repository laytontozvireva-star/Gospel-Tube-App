import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getUser, getUserClient, getAdminClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split("/").filter(Boolean);
    // /playlists/:id/videos
    const playlistId = pathParts[1] !== "videos" ? pathParts[1] : undefined;
    const isVideosRoute = pathParts[2] === "videos";

    // GET /playlists — list public + user playlists
    if (method === "GET" && !playlistId) {
      const user = await getUser(req);
      const supabase = getAdminClient();
      let query = supabase.from("playlists").select("*, playlist_videos(count)");
      if (user) {
        query = query.or(`owner_id.eq.${user.id},is_public.eq.true`);
      } else {
        query = query.eq("is_public", true);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse({ results: data, total: data?.length ?? 0 });
    }

    // GET /playlists/:id/videos
    if (method === "GET" && playlistId && isVideosRoute) {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from("playlist_videos")
        .select("*, videos(*)")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: true });
      if (error) throw error;
      return jsonResponse({ results: data, total: data?.length ?? 0 });
    }

    // POST /playlists — create (auth required)
    if (method === "POST" && !playlistId) {
      const user = await getUser(req);
      if (!user) return errorResponse("Unauthorized", 401);
      const { name, description, isPublic = true } = await req.json();
      if (!name) return errorResponse("name is required");
      const supabase = getUserClient(req);
      const { data, error } = await supabase
        .from("playlists")
        .insert({ owner_id: user.id, name, description, is_public: isPublic })
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(data, 201);
    }

    // POST /playlists/:id/videos — add video (auth required)
    if (method === "POST" && playlistId && isVideosRoute) {
      const user = await getUser(req);
      if (!user) return errorResponse("Unauthorized", 401);
      const { videoId } = await req.json();
      if (!videoId) return errorResponse("videoId is required");
      const supabase = getUserClient(req);
      const { data: current } = await supabase
        .from("playlist_videos")
        .select("position")
        .eq("playlist_id", playlistId)
        .order("position", { ascending: false })
        .limit(1);
      const position = current?.[0]?.position ? current[0].position + 1 : 1;
      const { data, error } = await supabase
        .from("playlist_videos")
        .insert({ playlist_id: playlistId, video_id: videoId, position })
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(data, 201);
    }

    // DELETE /playlists/:id
    if (method === "DELETE" && playlistId && !isVideosRoute) {
      const user = await getUser(req);
      if (!user) return errorResponse("Unauthorized", 401);
      const supabase = getUserClient(req);
      const { error } = await supabase.from("playlists").delete().eq("id", playlistId).eq("owner_id", user.id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    return errorResponse("Not found", 404);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
