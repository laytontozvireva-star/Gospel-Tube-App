import { handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAdminClient } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const supabase = getAdminClient();
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const apostleId = pathParts[pathParts.length - 1];

    // GET /apostles/:id — single apostle + their videos
    if (apostleId && apostleId !== "apostles") {
      const { data: apostle, error } = await supabase
        .from("apostles")
        .select("*")
        .eq("id", apostleId)
        .single();
      if (error) return errorResponse("Apostle not found", 404);

      const { data: videos } = await supabase
        .from("videos")
        .select("*")
        .eq("apostle_id", apostleId)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      return jsonResponse({ ...apostle, videos: videos ?? [] });
    }

    // GET /apostles — list all
    const { data, error } = await supabase
      .from("apostles")
      .select("*")
      .order("name");
    if (error) throw error;

    return jsonResponse({ results: data, total: data.length });
  } catch (err) {
    return errorResponse(String(err), 500);
  }
});
