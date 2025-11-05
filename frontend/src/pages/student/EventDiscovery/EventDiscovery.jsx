import { useEffect, useState } from "react";
import "./EventDiscovery.css";
import GetTogether from "../../../assets/getTogether.jpg";
import { auth, db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  increment,
  query,
  where,
} from "firebase/firestore";
import QRCode from "qrcode";

function EventDiscovery() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    organization: "",
    date: "",
    ticketType: "",
  });

  const [categories, setCategories] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);

  // 🔹 Fetch events and populate filter lists dynamically
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

        const uniqueCategories = [
          ...new Set(eventsList.map((e) => e.eventCategory).filter(Boolean)),
        ];
        const uniqueOrganizations = [
          ...new Set(
            eventsList.map((e) => e.eventOrganization).filter(Boolean)
          ),
        ];
        const uniqueTicketTypes = [
          ...new Set(eventsList.map((e) => e.ticketType).filter(Boolean)),
        ];

        setCategories(uniqueCategories);
        setOrganizations(uniqueOrganizations);
        setTicketTypes(uniqueTicketTypes);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const getNextTicketId = () => {
    const now = Date.now(); 
    const uniquePart = (now % 1000000).toString().padStart(6, "0");
    return `tk_${uniquePart}`;
  };


  const getStudentId = async (user) => {
    if (!user || !user.uid) return null;
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", user.uid));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) return querySnap.docs[0].id;
      alert("User not found in database. Please contact support.");
      return null;
    } catch (err) {
      console.error("Error fetching student:", err);
      return null;
    }
  };

  const handleBook = async (event) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to save an event.");
      return;
    }

    try {
      const studentID = await getStudentId(user);
      if (!studentID) return;

      const eventRef = doc(db, "events", event.id);
      const eventSnap = await getDoc(eventRef);
      if (!eventSnap.exists()) {
        alert("Event not found.");
        return;
      }

      const currentCapacity = eventSnap.data().eventCapacity;
      if (currentCapacity <= 0) {
        alert("Sorry, this event is full!");
        return;
      }

      await updateDoc(eventRef, { eventCapacity: increment(-1) });

      const newTicketId = getNextTicketId(); 
      const qrValue = `${newTicketId}_${studentID}_${event.id}`; 

      const qrCodeImage = await QRCode.toDataURL(qrValue);

      await setDoc(doc(db, "tickets", newTicketId), {
        ticketId: newTicketId,
        eventId: event.id,
        eventTitle: event.eventTitle,
        studentID,
        status: "confirmed",
        ticketDate: new Date(),
        qrCodeValue: qrValue,  
        qrCodeImage: qrCodeImage,
      });

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, eventCapacity: e.eventCapacity - 1 }
            : e
        )
      );

      alert(`New ticket created successfully: ${newTicketId}`);
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchCategory =
      !filters.category || event.eventCategory === filters.category;
    const matchOrg =
      !filters.organization ||
      event.eventOrganization === filters.organization;
    const matchDate =
      !filters.date ||
      (event.eventDate &&
        event.eventDate.toISOString().slice(0, 10) === filters.date);
    const matchTicket =
      !filters.ticketType ||
      (event.ticketType &&
        event.ticketType.toLowerCase() === filters.ticketType.toLowerCase());

    return matchCategory && matchOrg && matchDate && matchTicket;
  });

  return (
    <div className="event-discovery p-6">
      <h1 className="event-Title">Event Discovery</h1>

      {/* Dynamic Filter Bar */}
      <div className="filter-bar">
        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Organization */}
        <select
          value={filters.organization}
          onChange={(e) =>
            setFilters({ ...filters, organization: e.target.value })
          }
        >
          <option value="">All Organizations</option>
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />

        <select
          value={filters.ticketType}
          onChange={(e) =>
            setFilters({ ...filters, ticketType: e.target.value })
          }
        >
          <option value="">All Ticket Types</option>
          {ticketTypes.map((type) => (
            <option key={type} value={type.toLowerCase()}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

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
                  <p
                    className="event-card-ticketType"
                    data-type={event.ticketType?.toLowerCase() || "free"}
                  >
                    {event.ticketType
                      ? event.ticketType.charAt(0).toUpperCase() +
                        event.ticketType.slice(1)
                      : "Free"}
                  </p>
                  <p
                    className={`event-capacity ${
                      event.eventCapacity <= 0 ? "sold-out" : ""
                    }`}
                  >
                    {`${Math.max(event.eventCapacity, 0)} spot${
                      event.eventCapacity === 1 ? "" : "s"
                    } left`}
                  </p>
                </div>

                {event.eventCapacity > 0 ? (
                  <button
                    className="save-btn"
                    onClick={() => handleBook(event)}
                  >
                    Save Event
                  </button>
                ) : (
                  <button className="save-btn soldout-btn" disabled>
                    Sold Out
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default EventDiscovery;
