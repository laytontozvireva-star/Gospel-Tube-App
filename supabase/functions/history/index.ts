import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getUser, getUserClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const user = await getUser(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const supabase = getUserClient(req);
    const method = req.method;

    // GET /history
    if (method === "GET") {
      const { data, error } = await supabase
        .from("watch_history")
        .select("*, videos(*)")
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return jsonResponse({ results: data, total: data?.length ?? 0 });
    }

    // POST /history — upsert watch progress
    if (method === "POST") {
      const { videoId, progressSeconds } = await req.json();
      if (!videoId) return errorResponse("videoId is required");
      const { data, error } = await supabase
        .from("watch_history")
        .upsert({
          user_id: user.id,
          video_id: videoId,
          progress_seconds: progressSeconds ?? 0,
          watched_at: new Date().toISOString(),
        }, { onConflict: "user_id,video_id" })
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(data);
    }

    // DELETE /history — clear all
    if (method === "DELETE") {
      const { error } = await supabase
        .from("watch_history")
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    return errorResponse("Method not allowed", 405);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
