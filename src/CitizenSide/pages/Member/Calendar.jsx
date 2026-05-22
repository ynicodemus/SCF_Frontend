import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../css/Calendar.css";
import axiosSC from "../../../axiosSC";
import moment from "moment";

function EventCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch events
  useEffect(() => {
    axiosSC
      .get("/SeniorConnect/citizen-events/")
      .then((res) => {
        setEvents(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load events.");
        setLoading(false);
      });
  }, []);

  // Events matching date
  const getEventsForDate = (date) => {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    return events.filter(
      (ev) => moment(ev.event_date).format("YYYY-MM-DD") === formattedDate
    );
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const evts = getEventsForDate(date);
    setSelectedEvent(evts.length > 0 ? evts : null);
  };

  // Filter upcoming events
  const upcomingEvents = [...events]
    .filter((ev) => moment(ev.event_date).isSameOrAfter(moment(), "day"))
    .sort((a, b) => moment(a.event_date) - moment(b.event_date))
    .slice(0, 5);

  return (
    <div className="sc-calendar-bg">
      <div className="sc-calendar-container">

        {/* TITLE */}
        <h2 className="sc-calendar-title">Event Calendar</h2>

        {/* 📌 LEFT SIDE (moves when panel opens) */}
          {loading ? (
            <div className="sc-calendar-message">Loading events...</div>
          ) : error ? (
            <div className="sc-calendar-message sc-calendar-error">{error}</div>
          ) : (
            <>
              {/* CALENDAR */}
              <div className="sc-calendar-box">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  locale="en-US"
                  className="sc-calendar"
                  tileContent={({ date, view }) => {
                    if (view !== "month") return null;
                    const evts = getEventsForDate(date);
                    return evts.length > 0 ? <div className="sc-event-mark"></div> : null;
                  }}
                />
              </div>

              {/* SELECTED DATE DISPLAY */}
              <p className="sc-calendar-selected">
                <strong>Selected Date:</strong> {selectedDate.toDateString()}
              </p>

              {/* UPCOMING EVENTS */}
              <h3 className="sc-upcoming-title">Upcoming Events</h3>

              {upcomingEvents.length === 0 ? (
                <p className="sc-no-upcoming">No upcoming events.</p>
              ) : (
                <div className="sc-upcoming-list">
                  {upcomingEvents.map((ev) => (
                    <div className="sc-upcoming-card" key={ev.id}>
                      <p className="sc-upcoming-date">
                        {moment(ev.event_date).format("MMMM D, YYYY")}
                      </p>
                      <p className="sc-upcoming-title-text">{ev.title}</p>
                      {ev.where && <p className="sc-upcoming-where">📍 {ev.where}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        {/* 📌 SIDE PANEL */}
        <div className={`sc-sidepanel ${selectedEvent ? "open" : ""}`}>

          {/* BANNER IMAGE */}
          <div className="sc-sidepanel-banner">
            <img
              src={
                selectedEvent?.[0]?.image
                  ? selectedEvent[0].image
                  : "/banners/event.jpg"
              }
              alt="Event Banner"
              className="sc-sidepanel-banner-img"
            />
          </div>

          {/* PANEL HEADER */}
          <div className="sc-sidepanel-header">
            <h3 className="sc-sidepanel-title">Events this day</h3>
            <button
              className="sc-sidepanel-close"
              onClick={() => setSelectedEvent(null)}
            >
              ✖
            </button>
          </div>

          {/* PANEL CONTENT */}
          <div className="sc-sidepanel-content">
            {selectedEvent?.map((event) => (
              <div key={event.id} className="sc-sidepanel-item">
                <p><strong>Date:</strong> {moment(event.event_date).format("MMMM D, YYYY")}</p>

                {event.event_time && (
                  <p><strong>Time:</strong> {moment(event.event_time, "HH:mm:ss").format("h:mm A")}</p>
                )}

                {event.where && <p><strong>Where:</strong> {event.where}</p>}
                {event.who && <p><strong>Who:</strong> {event.who}</p>}
                {event.promotion && <p><strong>Promotion:</strong> {event.promotion}</p>}

                {event.description && (
                  <p className="sc-event-desc">
                    <strong>Description:</strong> {event.description}
                  </p>
                )}

                <hr />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default EventCalendar;
