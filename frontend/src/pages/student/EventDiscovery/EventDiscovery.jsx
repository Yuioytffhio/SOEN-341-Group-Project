import { useEffect, useState } from "react";
import "./EventDiscovery.css";
import GetTogether from "../../../assets/getTogether.jpg";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

function EventDiscovery() {
  const [events, setEvents] = useState([]);

  const [filters, setFilters] = useState({
    category: "",
    organization: "",
    date: ""
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            eventDate: data.eventDate
              ? (data.eventDate.seconds !== undefined
                  ? new Date(data.eventDate.seconds * 1000)
                  : new Date(data.eventDate))
              : null
          };
        });
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchCategory =
      !filters.category || event.eventCategory === filters.category;
    const matchOrg =
      !filters.organization || event.eventOrganization === filters.organization;
    const matchDate =
      !filters.date || (event.eventDate && event.eventDate.toISOString().slice(0,10) === filters.date);
    return matchCategory && matchOrg && matchDate;
  });

  return (
    <div className="event-discovery p-6">
      <h1 className="event-Title">Event Discovery</h1>

      {/* Filter bar */}
      <div className="filter-bar">
        <select
          value={filters.category}
          onChange={e => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Sports">Sports</option>
          <option value="Arts">Arts</option>
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
          filteredEvents.map(event => {
            const formattedDate = event.eventDate
              ? event.eventDate.toISOString().slice(0,10)
              : "Date TBD";

            return (
              <div key={event.id} className="event-card">
                <img
                  src={event.imageUrl ? event.imageUrl : GetTogether}
                  alt={event.eventTitle}
                  className="event-card-image"
                />
                <div className="event-card-info">
                  <h2>{event.eventTitle}</h2>
                  <p className="event-card-desc">{event.eventDescription}</p>
                  <p className="event-card-date">{formattedDate}</p>
                  <p className="event-card-location">{event.eventLocation}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default EventDiscovery;
