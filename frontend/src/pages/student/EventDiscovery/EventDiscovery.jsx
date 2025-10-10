import { useEffect, useState } from "react";
import "./EventDiscovery.css";
import GetTogether from "../../../assets/getTogether.jpg";

function EventDiscovery() {
  const [events, setEvents] = useState([]);

/* To fetch data from backend*/
  useEffect(() => {
    fetch("http://localhost:8080/events")
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch events");
        return response.json();
      })
      .then(data => setEvents(data))
      .catch(error => console.error("Error fetching events:", error));
  }, []);

  return (
    <div className="event-discovery p-6">
      <h1 className="event-Title">Event Discovery</h1>
      <div className="events-row">
        {events.length === 0 ? (
          <p>No events available.</p>
        ) : (
            /* Map event fields from database to frontend card  */
          events.map(event => (
            <div key={event.eventId} className="event-card">
              <img
                src={event.imageUrl ? event.imageUrl : GetTogether}
                alt={event.eventTitle}
                className="event-card-image"
              />
              <div className="event-card-info">
                <h2>{event.eventTitle}</h2>
                <p className="event-card-desc">{event.eventDescription}</p>
                <p className="event-card-date">{event.eventDate}</p>
                <p className="event-card-location">{event.eventLocation}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EventDiscovery;
