import React, { useEffect, useState } from "react";
import axiosSC from "../../../axiosSC";

function CNotification() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
  
    const fetchNotif = () => {
      axiosSC
        .get("SeniorConnect/citizen-notifications/", {
          headers: { Authorization: `Token ${token}` } ,
        })
        .then((res) => setNotifications(res.data))
        .catch((err) => console.error("❌ Error fetching citizen notifications:", err));
    };
  
    fetchNotif();
    const interval = setInterval(fetchNotif, 10000);
    return () => clearInterval(interval);
  }, [token]);
  

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="notif-bell" style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} className="notif-button">
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          {notifications.length === 0 ? (
            <p className="empty">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.is_read ? "" : "unread"}`}
              >
                <p>{n.message}</p>
                <small>{new Date(n.timestamp).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CNotification;
