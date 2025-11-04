import { useEffect, useState } from "react";
import "./EventDiscovery.css";
import GetTogether from "../../../assets/getTogether.jpg";
import { auth, db } from "../../../firebaseConfig";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

function EventDiscovery() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    organization: "",
    date: "",
    ticketType: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsList = querySnapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            eventDate: data.eventDate?.seconds
              ? new Date(data.eventDate.seconds * 1000)
              : data.eventDate
              ? new Date(data.eventDate)
              : null,
          };
        });
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const handleBook = async (event) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to save events.");
      return;
    }

    try {
      const savedRef = collection(db, "users", user.uid, "savedEvents");
      const savedSnapshot = await getDocs(savedRef);

      // Check if this event is already saved
      const alreadySaved = savedSnapshot.docs.some(
        (doc) => doc.data().eventId === event.id
      );

      if (alreadySaved) {
        alert("✅ You already saved this event!");
        return;
      }

      // Save event if not already saved
      await addDoc(savedRef, {
        eventId: event.id,
        eventTitle: event.eventTitle,
        eventDescription: event.eventDescription,
        eventDate: event.eventDate || null,
        eventLocation: event.eventLocation,
        imageUrl: event.imageUrl || "",
        savedAt: new Date(),
      });

      alert("Event is saved to My Events!");
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Could not save the event. Please try again.");
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchCategory = !filters.category || event.eventCategory === filters.category;
    const matchOrg = !filters.organization || event.eventOrganization === filters.organization;
    const matchDate =
      !filters.date ||
      (event.eventDate && event.eventDate.toISOString().slice(0, 10) === filters.date);

      const matchTicket = !filters.ticketType || (filters.ticketType === "free" &&
        (!event.ticketType || event.ticketType.toLowerCase() === "free")) ||
        (filters.ticketType === "paid" && event.ticketType && event.ticketType.toLowerCase() === "paid");

    return matchCategory && matchOrg && matchDate && matchTicket;
  });

  return (
    <div className="event-discovery p-6">
      <h1 className="event-Title">Event Discovery</h1>

      {/* Filter bar */}
      <div className="filter-bar">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Sports">Sports</option>
          <option value="Arts">Arts</option>
          <option value="Anthropology">Anthropology</option>
        </select>

        <select
          value={filters.organization}
          onChange={(e) => setFilters({ ...filters, organization: e.target.value })}
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
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

        <select
          value={filters.ticketType}
          onChange={(e) => setFilters({ ...filters, ticketType: e.target.value })}
        >
          <option value="">All Ticket Types</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>

      </div>

      {/* Events list */}
      <div className="events-row">
        {filteredEvents.length === 0 ? (
          <p>No events available.</p>
        ) : (
          filteredEvents.map((event) => {
            const formattedDate = event.eventDate
              ? event.eventDate.toISOString().slice(0, 10)
              : "Date TBD";

            return (
              <div key={event.id} className="event-card">
                <img
                  src={event.imageUrl || GetTogether}
                  alt={event.eventTitle}
                  className="event-card-image"
                />
                <div className="event-card-info">
                  <h2>{event.eventTitle}</h2>
                  <p className="event-card-desc">{event.eventDescription}</p>
                  <p className="event-card-date">{formattedDate}</p>
                  <p className="event-card-location">{event.eventLocation}</p>
                  <p className="event-card-ticketType" data-type={event.ticketType?.toLowerCase() || "free"} >
              {event.ticketType ? event.ticketType.charAt(0).toUpperCase() + event.ticketType.slice(1): "Free"} </p>
                </div>

                <button className="save-btn" onClick={() => handleBook(event)}>
                  Save Event
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default EventDiscovery;