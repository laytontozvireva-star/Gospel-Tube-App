import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { listComments, addComment, deleteComment } from "../lib/supabase";

export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(false);


  const fetchComments = useCallback(async () => {
    try {
      const data = await listComments(videoId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments', err);
      setComments([]);
    }
  }, [videoId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setLoading(true);
    try {
      await addComment(videoId, newText.trim());
      setNewText("");
      await fetchComments();
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (commentId) => {
    await deleteComment(commentId);
    await fetchComments();
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      {user && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a comment…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
          >
            Post
          </button>
        </form>
      )}
      {comments.length === 0 ? (
        <p className="text-slate-500">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-3">
              <img
                src={c.users?.avatar_url || "https://ui-avatars.com/api/?name=User&background=CCCCCC&color=000000"}
                alt={c.users?.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.users?.name || "Anonymous"}</span>
                  <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm">{c.content}</p>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="mt-1 text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
