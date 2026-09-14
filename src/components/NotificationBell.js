import { useState, useEffect, useCallback } from "react";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { isSupabaseConfigured, getNotifications, markNotificationRead, markAllNotificationsRead } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import "./NotificationBell.css";

function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleDismiss = async (notification) => {
    try {
      if (isSupabaseConfigured) {
        await markNotificationRead(notification.id);
      }
      setNotifications((items) => items.filter((item) => item.id !== notification.id));
    } catch (err) {
      console.error("Failed to dismiss notification", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (isSupabaseConfigured) {
        await markAllNotificationsRead();
      }
      setNotifications([]);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="notification-wrap">
      <button
        type="button"
        className="notification-trigger"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notification-dot" />}
      </button>

      {open && (
        <div className="notification-popover" role="dialog" aria-label="Notifications">
          <div className="notification-head">
            <strong>Notifications</strong>
            <button type="button" aria-label="Close notifications" onClick={() => setOpen(false)}><X size={15} /></button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : notifications.length ? (
            <div className="notification-list">
              {notifications.map((notification) => (
                <button type="button" className="notification-item" key={notification.id} onClick={() => handleDismiss(notification)}>
                  <span className="notification-check"><Check size={13} /></span>
                  <span>
                    <strong>{notification.title}</strong>
                    <small>{notification.body || ""} {notification.created_at ? `• ${formatTime(notification.created_at)}` : ""}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="notification-empty">You're all caught up.</p>
          )}
          {notifications.length > 0 && <button type="button" className="notification-clear" onClick={handleMarkAllRead}>Mark all as read</button>}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
