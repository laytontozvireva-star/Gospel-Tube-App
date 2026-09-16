import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getUser, getUserClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const user = await getUser(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const supabase = getUserClient(req);
    const url = new URL(req.url);
    const method = req.method;

    // GET /likes — list user liked videos
    if (method === "GET") {
      const { data, error } = await supabase
        .from("likes")
        .select("*, videos(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse({ results: data, total: data?.length ?? 0 });
    }

    // POST /likes/:videoId — toggle like
    if (method === "POST") {
      const pathParts = url.pathname.split("/").filter(Boolean);
      const videoId = pathParts[pathParts.length - 1];
      if (!videoId || videoId === "likes") return errorResponse("Video ID required");

      const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .maybeSingle();

      if (existing) {
        await supabase.from("likes").delete().eq("id", existing.id);
        return jsonResponse({ liked: false, videoId });
      } else {
        await supabase.from("likes").insert({ user_id: user.id, video_id: videoId });
        return jsonResponse({ liked: true, videoId });
      }
    }

    return errorResponse("Method not allowed", 405);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
