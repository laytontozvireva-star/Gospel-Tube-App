import { useAuth } from "../context/AuthContext";


export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listComments(videoId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setSubmitting(true);

    // Optimistic update: show the comment immediately
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: newText.trim(),
      created_at: new Date().toISOString(),
      user_id: user?.id,
      profiles: {
        display_name: user?.user_metadata?.display_name || user?.name || user?.email || "You",
        avatar_url: user?.user_metadata?.avatar_url || null,
      },
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setNewText("");

    try {
      await addComment(videoId, optimisticComment.content);
      // Re-fetch to get the real data from server
      await fetchComments();
    } catch (err) {
      console.error('Failed to add comment', err);
      // Rollback optimistic update on error
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setNewText(optimisticComment.content);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    // Optimistic removal
    const prev = comments;
    setComments((c) => c.filter((item) => item.id !== commentId));
    try {
      await deleteComment(commentId);
    } catch (err) {
      console.error('Failed to delete comment', err);
      setComments(prev); // rollback
    }
  };

  // Helper to extract display name and avatar from the profiles join
  const getAuthorName = (comment) => comment.profiles?.display_name || "Anonymous";
  const getAuthorAvatar = (comment) =>
    comment.profiles?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(getAuthorName(comment))}&background=CCCCCC&color=000000`;

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
            disabled={submitting}
            className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
          >
            {submitting ? "..." : "Post"}
          </button>
        </form>
      )}
      {loading ? (
        <p className="text-slate-400 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-slate-500">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-3">
              <img
                src={getAuthorAvatar(c)}
                alt={getAuthorName(c)}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{getAuthorName(c)}</span>
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
