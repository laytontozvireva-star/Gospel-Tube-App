import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getUser, getUserClient, getAdminClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const url = new URL(req.url);
    const method = req.method;

    // GET /comments?videoId=xxx
    if (method === "GET") {
      const videoId = url.searchParams.get("videoId");
      if (!videoId) return errorResponse("videoId is required");
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from("comments")
        .select("id, content, created_at, user_id, profiles:user_id(display_name, avatar_url)")
        .eq("video_id", videoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse({ results: data, total: data?.length ?? 0 });
    }

    // POST /comments — add comment (auth required)
    if (method === "POST") {
      const user = await getUser(req);
      if (!user) return errorResponse("Unauthorized", 401);
      const body = await req.json();
      const { videoId, content } = body;
      if (!videoId || !content) return errorResponse("videoId and content are required");
      const supabase = getUserClient(req);
      const { data, error } = await supabase
        .from("comments")
        .insert({ video_id: videoId, user_id: user.id, content })
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(data, 201);
    }

    // DELETE /comments/:id
    if (method === "DELETE") {
      const user = await getUser(req);
      if (!user) return errorResponse("Unauthorized", 401);
      const pathParts = url.pathname.split("/").filter(Boolean);
      const commentId = pathParts[pathParts.length - 1];
      if (!commentId || commentId === "comments") return errorResponse("Comment ID required");
      const supabase = getUserClient(req);
      const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user.id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    return errorResponse("Method not allowed", 405);
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
