import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/Event.css";
import api from "../../axios"; // ✅ use pre-configured axios instance

function AdminEvent() {
  const [date, setDate] = useState(new Date());
  const [eventText, setEventText] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventWho, setEventWho] = useState("");
  const [eventWhere, setEventWhere] = useState("");
  const [eventPromotion, setEventPromotion] = useState("");
  const [events, setEvents] = useState([]);

  const backendUrl = "/SeniorConnect/events/";

  // Load events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await api.get(backendUrl, {
          headers: { Authorization: `Token ${token}` },
        });
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchEvents();
  }, []);

  // Add new event
  const handleAddEvent = async () => {
    if (!eventText.trim() || !eventTime) {
      alert("Please enter both event description and time.");
      return;
    }

    const eventDate = date.toLocaleDateString("en-CA");
    const newEvent = {
      title: eventText,
      description: eventText,
      event_time: eventTime,
      event_date: eventDate,
      who: eventWho,
      where: eventWhere,
      promotion: eventPromotion,
    };

    try {
      const token = localStorage.getItem("adminToken");
      const response = await api.post(backendUrl, newEvent, {
        headers: { Authorization: `Token ${token}` },
      });
      setEvents([...events, response.data]);
      setEventText("");
      setEventTime("");
      setEventWho("");
      setEventWhere("");
      setEventPromotion("");
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  // Clear all events for selected date
  const handleClearEvents = async () => {
    try {
      const formattedDate = date.toLocaleDateString("en-CA");
      const token = localStorage.getItem("adminToken");

      await api.delete(`/SeniorConnect/events/delete-by-date/?date=${formattedDate}`, {
        headers: { Authorization: `Token ${token}` },
      });

      setEvents(events.filter((event) => event.event_date !== formattedDate));
    } catch (error) {
      console.error("Failed to clear events:", error);
      alert("Failed to clear events.");
    }
  };

  const selectedDateEvents = events.filter(
    (event) => event.event_date === date.toLocaleDateString("en-CA")
  );

  const tileClassName = ({ date }) => {
    const dateKey = date.toLocaleDateString("en-CA");
    return events.some((event) => event.event_date === dateKey)
      ? "calen-calendar-marked"
      : "";
  };

  return (
    <div className="calen-main-container">
      {/* 🗓️ LEFT SIDE: Calendar + Upcoming Events */}
      <div className="calen-left-section">
        <h2 className="calen-header-title">Admin Event Calendar</h2>

        <Calendar
          onChange={setDate}
          value={date}
          tileClassName={tileClassName}
          className="calen-calendar"
        />

        <p className="calen-selected-date">
          <strong>Selected Date:</strong> {date.toDateString()}
        </p>

        <div className="calen-upcoming-section">
          <h3 className="calen-upcoming-title">Upcoming Events</h3>

          {events.length > 0 ? (
            <ul className="calen-upcoming-list">
              {events
                .filter((event) => new Date(event.event_date) >= new Date())
                .sort(
                  (a, b) =>
                    new Date(a.event_date + " " + a.event_time) -
                    new Date(b.event_date + " " + b.event_time)
                )
                .slice(0, 5)
                .map((event, idx) => (
                  <li key={idx} className="calen-event-card">
                    <div className="calen-event-info">
                      <div>
                        <strong>Event:</strong> {event.description}
                      </div>
                      <div>
                        <strong>Who:</strong> {event.who || "—"}
                      </div>
                      <div>
                        <strong>Where:</strong> {event.where || "—"}
                      </div>
                      <div>
                        <strong>Notes:</strong> {event.promotion || "—"}
                      </div>
                      <div>
                        <strong>Date & Time:</strong> {event.event_date} at{" "}
                        {event.event_time}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="calen-no-upcoming">No upcoming events.</p>
          )}
        </div>
      </div>

      {/* 📝 RIGHT SIDE: Event Form + Events for Selected Date */}
      <div className="calen-right-section">
        <div className="calen-form">
          <div className="calen-form-group">
            <label>Event Time:</label>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="calen-form-input"
            />
          </div>

          <div className="calen-form-group">
            <label>Event Description:</label>
            <input
              type="text"
              value={eventText}
              onChange={(e) => setEventText(e.target.value)}
              placeholder="Enter event description"
              className="calen-form-input"
            />
          </div>

          <div className="calen-form-group">
            <label>Who:</label>
            <input
              type="text"
              value={eventWho}
              onChange={(e) => setEventWho(e.target.value)}
              placeholder="Responsible person/group"
              className="calen-form-input"
            />
          </div>

          <div className="calen-form-group">
            <label>Where:</label>
            <input
              type="text"
              value={eventWhere}
              onChange={(e) => setEventWhere(e.target.value)}
              placeholder="Location"
              className="calen-form-input"
            />
          </div>

          <div className="calen-form-group">
            <label>Promotion / Notes:</label>
            <input
              type="text"
              value={eventPromotion}
              onChange={(e) => setEventPromotion(e.target.value)}
              placeholder="Promotion or extra notes"
              className="calen-form-input"
            />
          </div>

          <button className="calen-btn-add" onClick={handleAddEvent}>
            Add Event
          </button>
        </div>

        <div className="calen-day-events">
          <h3 className="calen-day-title">
            Events on {date.toDateString()}:
          </h3>

          {selectedDateEvents.length > 0 ? (
            <ul className="calen-day-list">
              {selectedDateEvents.map((event, idx) => (
                <li key={idx} className="calen-day-card">
                  <div className="calen-day-desc">{event.description}</div>
                  <div className="calen-day-time">{event.event_time}</div>

                  <div className="calen-day-badges">
                    {event.who && (
                      <span className="calen-badge calen-badge-who">
                        Who: {event.who}
                      </span>
                    )}
                    {event.where && (
                      <span className="calen-badge calen-badge-where">
                        Where: {event.where}
                      </span>
                    )}
                    {event.promotion && (
                      <span className="calen-badge calen-badge-promo">
                        Promo: {event.promotion}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="calen-no-events">No events for this date.</p>
          )}

          {selectedDateEvents.length > 0 && (
            <button
              className="calen-btn-clear"
              onClick={handleClearEvents}
            >
              Clear All Events
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminEvent;
