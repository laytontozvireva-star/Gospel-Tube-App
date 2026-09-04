import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import "./NotificationBell.css";

const initialNotifications = [
  { id: 1, title: "New sermon from Apostle Ezekiel Guti", meta: "Walking in the Power of the Holy Spirit • 2h ago" },
  { id: 2, title: "Your playlist was updated", meta: "Faith Teachings has 3 new videos • 5h ago" },
  { id: 3, title: "Live stream starting soon", meta: "Sunday Service begins tomorrow at 09:00" },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

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
        {notifications.length > 0 && <span className="notification-dot" />}
      </button>

      {open && (
        <div className="notification-popover" role="dialog" aria-label="Notifications">
          <div className="notification-head">
            <strong>Notifications</strong>
            <button type="button" aria-label="Close notifications" onClick={() => setOpen(false)}><X size={15} /></button>
          </div>
          {notifications.length ? (
            <div className="notification-list">
              {notifications.map((notification) => (
                <button type="button" className="notification-item" key={notification.id} onClick={() => setNotifications((items) => items.filter((item) => item.id !== notification.id))}>
                  <span className="notification-check"><Check size={13} /></span>
                  <span><strong>{notification.title}</strong><small>{notification.meta}</small></span>
                </button>
              ))}
            </div>
          ) : (
            <p className="notification-empty">You’re all caught up.</p>
          )}
          {notifications.length > 0 && <button type="button" className="notification-clear" onClick={() => setNotifications([])}>Mark all as read</button>}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
