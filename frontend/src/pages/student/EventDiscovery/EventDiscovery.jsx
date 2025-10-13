import { useEffect, useState } from "react";
import "./EventDiscovery.css";
import GetTogether from "../../../assets/getTogether.jpg";
import { auth, db } from "../../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";


function EventDiscovery() {
  const [events, setEvents] = useState([]);

  // ADDED FOR FILTERS - filter state
  const [filters, setFilters] = useState({
    category: "",
    organization: "",
    date: ""
  });

  /* To fetch data from backend */
  useEffect(() => {
    fetch("http://localhost:8080/events")
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch events");
        return response.json();
      })
      .then(data => setEvents(data))
      .catch(error => console.error("Error fetching events:", error));
  }, []);
// To save event to Firestore
const handleBook = async (event) => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to save events.");
    return;
  }

  const eventId = event.eventId || event.id || crypto.randomUUID();

  try {
    await setDoc(
      doc(db, "users", user.uid, "savedEvents", eventId.toString()),
      {
        eventId: eventId,
        eventTitle: event.eventTitle,
        eventDescription: event.eventDescription,
        eventDate: event.eventDate,
        eventLocation: event.eventLocation,
        imageUrl: event.imageUrl || "",
        savedAt: new Date().toISOString(),
      }
    );
    alert("✅ Event saved to My Events!");
  } catch (error) {
    console.error("Error saving event:", error);
    alert("❌ Could not save event. Try again.");
  }
};

  // Apply filters
  const filteredEvents = events.filter(event => {
    const matchCategory =
      !filters.category || event.eventCategory === filters.category;
    const matchOrg =
      !filters.organization || event.eventOrganization === filters.organization;
    const matchDate =
      !filters.date || event.eventDate?.slice(0, 10) === filters.date;

    return matchCategory && matchOrg && matchDate;
  });

  return (
    <div className="event-discovery p-6">
      <h1 className="event-Title">Event Discovery</h1>

      {/* Added filters */}
      <div className="filter-bar">
        <select
          value={filters.category}
          onChange={e => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Sports">Sports</option>
          <option value="Arts">Arts</option>
          <option value="Sports">Sports</option>
          <option value="Anthropology">Anthropology</option>
        </select>

        <select
          value={filters.organization}
          onChange={e => setFilters({ ...filters, organization: e.target.value })}
        >
          <option value="">All Organizations</option>
          <option value="Computer Science Department">Computer Science Department</option>
          <option value="Space Concordia">Space Concordia</option>
          <option value="Concordia Rugby">Concordia Rugby</option>
          <option value="Fine Arts Department">Fine Arts Department</option>
          <option value="F1 Club">F1 Club</option>
          <option value="Anthropology Club">Anthropology Club</option>
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={e => setFilters({ ...filters, date: e.target.value })}
        />
      </div>

      {/* Events list */}
      <div className="events-row">
        {filteredEvents.length === 0 ? (
          <p>No events available.</p>
        ) : (
          filteredEvents.map(event => (
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
              <button className="save-btn" onClick={() => handleBook(event)}>
                Save Event
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EventDiscovery;
