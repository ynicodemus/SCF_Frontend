import { useState } from "react";
import "../css/Documents.css";
import api from "../.././axios";


const sampleNotifications = [
  {
    id: 1,
    message: "New membership request from Juan Dela Cruz.",
    date: "2025-06-01 09:24 AM"
  },
  {
    id: 2,
    message: "Event 'General Assembly' scheduled for June 10.",
    date: "2025-05-30 03:12 PM"
  },
  {
    id: 3,
    message: "Damayan payment recorded for Maria Santos.",
    date: "2025-05-29 10:18 AM"
  }
];

const ANotification = () => {
  const [notifications] = useState(sampleNotifications);

  return (
    <div className="AdminNotifCont">
      <div className="NotifHeader">
        <span role="img" aria-label="bell" style={{ fontSize: "22px", marginRight: "8px", color: "#1976d2" }}>
          🔔
        </span>
        <h3>Admin Notifications</h3>
      </div>
      {notifications.length === 0 ? (
        <div className="NotifEmpty">No new notifications.</div>
      ) : (
        <ul className="NotifList">
          {notifications.map(notif => (
            <li className="NotifItem" key={notif.id}>
              <div className="NotifMsg">{notif.message}</div>
              <div className="NotifDate">{notif.date}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ANotification;
